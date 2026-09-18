create type public.inventory_item_type as enum ('material', 'equipment');
create type public.inventory_loan_status as enum ('borrowed', 'returned', 'cancelled');

alter table public.inventory_items
  add column item_code text,
  add column item_type public.inventory_item_type not null default 'material',
  add column description text not null default '',
  add column date_acquired date,
  add column unit_price numeric(12, 2),
  add column total_quantity integer;

alter table public.inventory_items disable trigger inventory_items_protect_audit_fields;
update public.inventory_items set total_quantity = quantity_on_hand where total_quantity is null;
alter table public.inventory_items enable trigger inventory_items_protect_audit_fields;

alter table public.inventory_items
  alter column total_quantity set not null,
  add constraint inventory_items_total_quantity_check check (total_quantity >= 0),
  add constraint inventory_items_unit_price_check check (unit_price is null or unit_price >= 0),
  add constraint inventory_items_item_code_format_check check (item_code is null or char_length(trim(item_code)) between 3 and 40);

create unique index inventory_items_item_code_unique on public.inventory_items (lower(item_code)) where item_code is not null;
create index inventory_items_type_name_idx on public.inventory_items (item_type, name);

create table public.inventory_loans (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items (id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete set null,
  borrower_name text not null check (char_length(trim(borrower_name)) between 2 and 160),
  quantity_borrowed integer not null check (quantity_borrowed > 0),
  borrowed_at timestamptz not null default now(),
  due_at timestamptz,
  returned_at timestamptz,
  item_condition text,
  notes text not null default '',
  status public.inventory_loan_status not null default 'borrowed',
  approved_by uuid not null default auth.uid() references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_loans_dates_check check (due_at is null or due_at >= borrowed_at),
  constraint inventory_loans_returned_check check ((status = 'returned') = (returned_at is not null))
);

create index inventory_loans_item_status_idx on public.inventory_loans (inventory_item_id, status);
create index inventory_loans_organization_idx on public.inventory_loans (organization_id, borrowed_at desc);

create trigger inventory_loans_set_updated_at
  before update on public.inventory_loans
  for each row execute procedure public.set_updated_at();

create or replace function public.create_inventory_loan(
  target_item_id uuid,
  target_organization_id uuid,
  target_borrower_name text,
  target_quantity integer,
  target_due_at timestamptz default null,
  target_condition text default null,
  target_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  resulting_quantity integer;
  loan_id uuid;
begin
  if not public.is_internal_user() then
    raise exception 'Internal access required' using errcode = '42501';
  end if;
  if target_quantity <= 0 then
    raise exception 'Borrowed quantity must be greater than zero' using errcode = '22023';
  end if;

  select quantity_on_hand into resulting_quantity
  from public.inventory_items
  where id = target_item_id
  for update;
  if not found then
    raise exception 'Inventory item not found' using errcode = 'P0002';
  end if;
  if resulting_quantity < target_quantity then
    raise exception 'Insufficient available quantity for this loan' using errcode = '22023';
  end if;

  update public.inventory_items
  set quantity_on_hand = quantity_on_hand - target_quantity
  where id = target_item_id;

  insert into public.inventory_transactions (inventory_item_id, quantity_change, reason, organization_id, notes)
  values (target_item_id, -target_quantity, 'issue'::public.inventory_adjustment_reason, target_organization_id, 'Borrowed: ' || trim(target_borrower_name));

  insert into public.inventory_loans (inventory_item_id, organization_id, borrower_name, quantity_borrowed, due_at, item_condition, notes)
  values (target_item_id, target_organization_id, trim(target_borrower_name), target_quantity, target_due_at, nullif(trim(target_condition), ''), coalesce(target_notes, ''))
  returning id into loan_id;

  return loan_id;
end;
$$;

create or replace function public.return_inventory_loan(
  target_loan_id uuid,
  return_condition text default null,
  return_notes text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  loan_row public.inventory_loans%rowtype;
  resulting_quantity integer;
begin
  if not public.is_internal_user() then
    raise exception 'Internal access required' using errcode = '42501';
  end if;

  select * into loan_row from public.inventory_loans where id = target_loan_id for update;
  if not found then
    raise exception 'Borrowing record not found' using errcode = 'P0002';
  end if;
  if loan_row.status <> 'borrowed'::public.inventory_loan_status then
    raise exception 'Only an active borrowing record may be returned' using errcode = '22023';
  end if;

  update public.inventory_items
  set quantity_on_hand = quantity_on_hand + loan_row.quantity_borrowed
  where id = loan_row.inventory_item_id
  returning quantity_on_hand into resulting_quantity;

  insert into public.inventory_transactions (inventory_item_id, quantity_change, reason, organization_id, notes)
  values (loan_row.inventory_item_id, loan_row.quantity_borrowed, 'return'::public.inventory_adjustment_reason, loan_row.organization_id, coalesce(nullif(trim(return_notes), ''), 'Loan returned: ' || loan_row.borrower_name));

  update public.inventory_loans
  set status = 'returned'::public.inventory_loan_status,
      returned_at = now(),
      item_condition = coalesce(nullif(trim(return_condition), ''), item_condition)
  where id = target_loan_id;

  return resulting_quantity;
end;
$$;

alter table public.inventory_loans enable row level security;

create policy "inventory_loans_internal_read" on public.inventory_loans for select to authenticated using (public.is_internal_user());

revoke all on public.inventory_loans from anon, authenticated;
grant select on public.inventory_loans to authenticated;
grant update (item_code, item_type, description, date_acquired, unit_price, total_quantity) on public.inventory_items to authenticated;

revoke all on function public.create_inventory_loan(uuid, uuid, text, integer, timestamptz, text, text) from public;
revoke all on function public.return_inventory_loan(uuid, text, text) from public;
grant execute on function public.create_inventory_loan(uuid, uuid, text, integer, timestamptz, text, text) to authenticated;
grant execute on function public.return_inventory_loan(uuid, text, text) to authenticated;
