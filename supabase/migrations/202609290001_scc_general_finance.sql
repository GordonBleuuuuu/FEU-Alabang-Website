-- Separate SCC operating budget from event budgets while retaining the
-- existing expense review, receipt, and audit workflow.
create table public.finance_general_budgets (
  id uuid primary key default gen_random_uuid(),
  term_label text not null unique check (char_length(trim(term_label)) between 3 and 80),
  approved_budget numeric(14,2) not null default 0 check (approved_budget >= 0),
  notes text not null default '',
  created_by uuid not null default auth.uid() references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger finance_general_budgets_set_updated_at before update on public.finance_general_budgets
  for each row execute procedure public.set_updated_at();
create trigger finance_general_budgets_protect before update on public.finance_general_budgets
  for each row execute procedure public.protect_finance_creation_fields();
create trigger finance_general_budgets_audit after insert or update on public.finance_general_budgets
  for each row execute procedure public.audit_finance_change();

alter table public.finance_general_budgets enable row level security;
create policy finance_general_budgets_read on public.finance_general_budgets
  for select to authenticated using (public.is_internal_user());
create policy finance_general_budgets_insert on public.finance_general_budgets
  for insert to authenticated with check (public.is_internal_user() and created_by = auth.uid());
create policy finance_general_budgets_update on public.finance_general_budgets
  for update to authenticated using (public.is_internal_user()) with check (public.is_internal_user());
revoke all on public.finance_general_budgets from anon, authenticated;
grant select, insert, update on public.finance_general_budgets to authenticated;

alter table public.finance_expenses
  alter column finance_event_id drop not null,
  add column general_budget_id uuid references public.finance_general_budgets (id) on delete restrict,
  add constraint finance_expense_single_budget_check
    check ((finance_event_id is not null) <> (general_budget_id is not null));
create index finance_expenses_general_budget_date_idx
  on public.finance_expenses (general_budget_id, expense_date desc);

-- Preserve the separate SCC Finance Officer review gate for both expense types.
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

  if row(new.finance_event_id, new.general_budget_id, new.expense_date, new.item_code,
         new.item_name, new.category, new.description, new.quantity, new.unit_price,
         new.supplier, new.requested_by, new.payment_method)
     is distinct from
     row(old.finance_event_id, old.general_budget_id, old.expense_date, old.item_code,
         old.item_name, old.category, old.description, old.quantity, old.unit_price,
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
