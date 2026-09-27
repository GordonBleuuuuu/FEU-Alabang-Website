-- SCC financial ledger and room inventory details. Run after inventory_reference_fields.
create table public.finance_events (
  id uuid primary key default gen_random_uuid(),
  portal_event_id uuid unique references public.events (id) on delete set null,
  event_code text not null unique check (char_length(trim(event_code)) between 2 and 40),
  event_name text not null check (char_length(trim(event_name)) between 3 and 160),
  event_date date not null,
  person_in_charge text not null check (char_length(trim(person_in_charge)) between 2 and 160),
  approved_budget numeric(14,2) not null default 0 check (approved_budget >= 0),
  status text not null default 'Upcoming' check (status in ('Upcoming', 'Ongoing', 'Completed')),
  created_by uuid not null default auth.uid() references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.finance_expenses (
  id uuid primary key default gen_random_uuid(),
  finance_event_id uuid not null references public.finance_events (id) on delete restrict,
  expense_date date not null,
  item_code text,
  item_name text not null check (char_length(trim(item_name)) between 2 and 160),
  category text not null default 'General',
  description text not null default '',
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  total_amount numeric(16,2) generated always as (round(quantity * unit_price, 2)) stored,
  supplier text,
  requested_by text not null check (char_length(trim(requested_by)) between 2 and 160),
  payment_method text,
  proof_path text,
  status text not null default 'Requested' check (status in ('Requested', 'Approved', 'Purchased', 'Reimbursed')),
  created_by uuid not null default auth.uid() references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint paid_expense_requires_proof check (status not in ('Purchased', 'Reimbursed') or proof_path is not null)
);

create table public.finance_revenue (
  id uuid primary key default gen_random_uuid(),
  finance_event_id uuid not null references public.finance_events (id) on delete restrict,
  received_date date not null,
  source text not null check (char_length(trim(source)) between 2 and 100),
  description text not null default '',
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  amount_per_unit numeric(14,2) not null check (amount_per_unit >= 0),
  total_amount numeric(16,2) generated always as (round(quantity * amount_per_unit, 2)) stored,
  collected_by text not null check (char_length(trim(collected_by)) between 2 and 160),
  payment_method text not null check (payment_method in ('Cash', 'GCash', 'Bank Transfer', 'Other')),
  proof_path text,
  status text not null default 'Pending' check (status in ('Pending', 'Collected', 'Deposited')),
  created_by uuid not null default auth.uid() references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index finance_expenses_event_date_idx on public.finance_expenses (finance_event_id, expense_date desc);
create index finance_revenue_event_date_idx on public.finance_revenue (finance_event_id, received_date desc);
create trigger finance_events_set_updated_at before update on public.finance_events for each row execute procedure public.set_updated_at();
create trigger finance_expenses_set_updated_at before update on public.finance_expenses for each row execute procedure public.set_updated_at();
create trigger finance_revenue_set_updated_at before update on public.finance_revenue for each row execute procedure public.set_updated_at();

-- Keep a history of corrections and workflow changes; browser users cannot edit it.
create table public.finance_activity (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid not null,
  action text not null,
  actor_id uuid default auth.uid() references public.users (id) on delete set null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index finance_activity_record_idx on public.finance_activity (table_name, record_id, created_at desc);
create or replace function public.protect_finance_creation_fields() returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  return new;
end;
$$;
create or replace function public.audit_finance_change() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.finance_activity (table_name, record_id, action, new_data)
    values (tg_table_name, new.id, 'created', to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    insert into public.finance_activity (table_name, record_id, action, old_data, new_data)
    values (tg_table_name, new.id, 'updated', to_jsonb(old), to_jsonb(new));
  end if;
  return new;
end;
$$;
create trigger finance_events_protect before update on public.finance_events for each row execute procedure public.protect_finance_creation_fields();
create trigger finance_expenses_protect before update on public.finance_expenses for each row execute procedure public.protect_finance_creation_fields();
create trigger finance_revenue_protect before update on public.finance_revenue for each row execute procedure public.protect_finance_creation_fields();
create trigger finance_events_audit after insert or update on public.finance_events for each row execute procedure public.audit_finance_change();
create trigger finance_expenses_audit after insert or update on public.finance_expenses for each row execute procedure public.audit_finance_change();
create trigger finance_revenue_audit after insert or update on public.finance_revenue for each row execute procedure public.audit_finance_change();

alter table public.finance_events enable row level security;
alter table public.finance_expenses enable row level security;
alter table public.finance_revenue enable row level security;
alter table public.finance_activity enable row level security;
create policy finance_events_read on public.finance_events for select to authenticated using (public.is_internal_user());
create policy finance_events_insert on public.finance_events for insert to authenticated with check (public.is_internal_user() and created_by = auth.uid());
create policy finance_events_update on public.finance_events for update to authenticated using (public.is_internal_user()) with check (public.is_internal_user());
create policy finance_expenses_read on public.finance_expenses for select to authenticated using (public.is_internal_user());
create policy finance_expenses_insert on public.finance_expenses for insert to authenticated with check (public.is_internal_user() and created_by = auth.uid());
create policy finance_expenses_update on public.finance_expenses for update to authenticated using (public.is_internal_user()) with check (public.is_internal_user());
create policy finance_revenue_read on public.finance_revenue for select to authenticated using (public.is_internal_user());
create policy finance_revenue_insert on public.finance_revenue for insert to authenticated with check (public.is_internal_user() and created_by = auth.uid());
create policy finance_revenue_update on public.finance_revenue for update to authenticated using (public.is_internal_user()) with check (public.is_internal_user());
create policy finance_activity_read on public.finance_activity for select to authenticated using (public.is_internal_user());
revoke all on public.finance_events, public.finance_expenses, public.finance_revenue, public.finance_activity from anon, authenticated;
grant select, insert, update on public.finance_events, public.finance_expenses, public.finance_revenue to authenticated;
grant select on public.finance_activity to authenticated;
grant usage, select on sequence public.finance_activity_id_seq to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('finance-proofs', 'finance-proofs', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy finance_proofs_read on storage.objects for select to authenticated using (bucket_id = 'finance-proofs' and public.is_internal_user());
create policy finance_proofs_insert on storage.objects for insert to authenticated with check (bucket_id = 'finance-proofs' and public.is_internal_user());
create policy finance_proofs_delete on storage.objects for delete to authenticated using (bucket_id = 'finance-proofs' and public.is_internal_user());

alter table public.inventory_items
  add column item_condition text not null default 'Good' check (item_condition in ('Good','Fair','Damaged','For Repair','Lost')),
  add column intended_use text,
  add column purchased_for_finance_event_id uuid references public.finance_events (id) on delete set null;
alter table public.inventory_loans
  add column borrowing_group text,
  add column purpose text,
  add column finance_event_id uuid references public.finance_events (id) on delete set null,
  add column condition_before text,
  add column condition_after text,
  add column received_by uuid references public.users (id) on delete set null;
grant update (item_condition, intended_use, purchased_for_finance_event_id) on public.inventory_items to authenticated;

create or replace function public.return_scc_room_loan(target_loan_id uuid, return_condition text, return_notes text)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  loan_row public.inventory_loans%rowtype;
  resulting_quantity integer;
begin
  if not public.is_internal_user() then raise exception 'Internal access required' using errcode = '42501'; end if;
  if return_condition is null or return_condition not in ('Good', 'Fair', 'Damaged', 'For Repair', 'Lost') then raise exception 'Select a valid return condition' using errcode = '22023'; end if;
  select * into loan_row from public.inventory_loans where id = target_loan_id for update;
  if not found then raise exception 'Borrowing record not found' using errcode = 'P0002'; end if;
  if loan_row.status <> 'borrowed'::public.inventory_loan_status then raise exception 'Only active loans may be returned' using errcode = '22023'; end if;
  if return_condition in ('Good', 'Fair') then
    resulting_quantity := public.return_inventory_loan(target_loan_id, return_condition, return_notes);
  else
    update public.inventory_items
    set total_quantity = case when return_condition = 'Lost' then greatest(quantity_on_hand, total_quantity - loan_row.quantity_borrowed) else total_quantity end,
        item_condition = case when total_quantity <= loan_row.quantity_borrowed then return_condition else item_condition end
    where id = loan_row.inventory_item_id
    returning quantity_on_hand into resulting_quantity;
    update public.inventory_loans
    set status = 'returned'::public.inventory_loan_status,
        returned_at = now(), item_condition = return_condition
    where id = target_loan_id;
  end if;
  update public.inventory_loans
  set condition_after = nullif(trim(return_condition), ''), received_by = auth.uid(),
      notes = concat_ws(E'\n', nullif(notes, ''), nullif(trim(return_notes), ''))
  where id = target_loan_id;
  return resulting_quantity;
end;
$$;
revoke all on function public.return_scc_room_loan(uuid, text, text) from public;
grant execute on function public.return_scc_room_loan(uuid, text, text) to authenticated;
