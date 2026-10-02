-- Require a separately designated SCC Finance Officer before approval/payment.
-- Existing records keep their current status. Legacy Approved records without
-- reviewer details must be returned to Requested and reviewed before payment.
create table public.finance_reviewers (
  user_id uuid primary key references public.users (id) on delete cascade,
  assigned_by uuid default auth.uid() references public.users (id),
  assigned_at timestamptz not null default now()
);

alter table public.finance_reviewers enable row level security;
create policy finance_reviewers_read on public.finance_reviewers
  for select to authenticated using (public.is_internal_user());
create policy finance_reviewers_insert on public.finance_reviewers
  for insert to authenticated with check (
    public.current_user_role() = 'SADU'::public.app_role
    and assigned_by = auth.uid()
    and exists (
      select 1 from public.users as app_user
      where app_user.id = user_id and app_user.role = 'SCC Executive'::public.app_role
    )
  );
create policy finance_reviewers_delete on public.finance_reviewers
  for delete to authenticated using (public.current_user_role() = 'SADU'::public.app_role);
revoke all on public.finance_reviewers from anon, authenticated;
grant select, insert, delete on public.finance_reviewers to authenticated;

create or replace function public.is_finance_officer()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.finance_reviewers as reviewer
    join public.users as app_user on app_user.id = reviewer.user_id
    where reviewer.user_id = auth.uid()
      and app_user.role = 'SCC Executive'::public.app_role
  );
$$;
revoke all on function public.is_finance_officer() from public;
grant execute on function public.is_finance_officer() to authenticated;

-- The current SCC Treasurer is the initial designated finance verifier.
-- If his account is not present yet, SADU can designate him in the portal later.
insert into public.finance_reviewers (user_id)
select app_user.id from public.users as app_user
where lower(app_user.email) = 'accallao@feualabang.edu.ph'
  and app_user.role = 'SCC Executive'::public.app_role
on conflict (user_id) do nothing;

alter table public.finance_expenses
  add column approved_by uuid references public.users (id) on delete set null,
  add column approved_at timestamptz;

create or replace function public.validate_finance_expense_review()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'Requested' then
      raise exception 'New expenses must start as Requested' using errcode = '22023';
    end if;
    new.approved_by := null;
    new.approved_at := null;
    return new;
  end if;

  -- Approval must always refer to the same submitted amount and event.
  -- Receipt attachment and status changes are handled separately.
  if row(new.finance_event_id, new.expense_date, new.item_code, new.item_name,
         new.category, new.description, new.quantity, new.unit_price,
         new.supplier, new.requested_by, new.payment_method)
     is distinct from
     row(old.finance_event_id, old.expense_date, old.item_code, old.item_name,
         old.category, old.description, old.quantity, old.unit_price,
         old.supplier, old.requested_by, old.payment_method) then
    raise exception 'Expense details cannot be changed after submission' using errcode = '22023';
  end if;

  if new.status = old.status then
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
    return new;
  end if;

  if old.status = 'Requested' and new.status = 'Approved' then
    if not public.is_finance_officer() then
      raise exception 'Only designated SCC Finance Officers may approve expenses' using errcode = '42501';
    end if;
    if auth.uid() = old.created_by then
      raise exception 'The requester cannot approve their own expense' using errcode = '42501';
    end if;
    new.approved_by := auth.uid();
    new.approved_at := now();
  elsif old.status = 'Approved' and new.status = 'Requested' then
    new.approved_by := null;
    new.approved_at := null;
  elsif old.status = 'Approved' and new.status = 'Purchased' then
    if old.approved_by is null or old.approved_at is null then
      raise exception 'Return this legacy expense to Requested for review before payment' using errcode = '22023';
    end if;
    if new.proof_path is null then
      raise exception 'Attach a receipt before recording a purchase' using errcode = '22023';
    end if;
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  elsif old.status = 'Purchased' and new.status = 'Reimbursed' then
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  else
    raise exception 'Invalid expense status transition: % to %', old.status, new.status using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger finance_expenses_review
  before insert or update on public.finance_expenses
  for each row execute procedure public.validate_finance_expense_review();
