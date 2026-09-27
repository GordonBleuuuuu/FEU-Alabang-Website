-- A request does not reserve or deduct stock. Approval releases the item atomically.
alter table public.inventory_loans
  alter column approved_by drop not null,
  add column requested_by uuid default auth.uid() references public.users (id) on delete set null;

create or replace function public.request_scc_room_loan(
  target_item_id uuid, target_organization_id uuid, target_borrower_name text,
  target_quantity integer, target_borrowed_at timestamptz, target_due_at timestamptz,
  target_condition_before text, target_borrowing_group text, target_purpose text,
  target_finance_event_id uuid, target_notes text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare loan_id uuid;
begin
  if not public.is_internal_user() then raise exception 'Internal access required' using errcode = '42501'; end if;
  if target_quantity is null or target_quantity <= 0 or target_borrowed_at is null or target_due_at is null or target_due_at <= target_borrowed_at or target_due_at <= now() then
    raise exception 'Enter a valid quantity and future return time' using errcode = '22023';
  end if;
  if nullif(trim(target_borrower_name), '') is null or nullif(trim(target_purpose), '') is null then
    raise exception 'Borrower and purpose are required' using errcode = '22023';
  end if;
  if target_condition_before is null or target_condition_before not in ('Good', 'Fair') then raise exception 'Only items in good or fair condition may be requested' using errcode = '22023'; end if;
  perform 1 from public.inventory_items where id = target_item_id and item_condition in ('Good', 'Fair');
  if not found then raise exception 'Item unavailable for borrowing' using errcode = '22023'; end if;

  insert into public.inventory_loans (
    inventory_item_id, organization_id, borrower_name, quantity_borrowed, borrowed_at,
    due_at, item_condition, condition_before, borrowing_group, purpose, finance_event_id,
    notes, status, approved_by, requested_by
  ) values (
    target_item_id, target_organization_id, trim(target_borrower_name), target_quantity,
    target_borrowed_at, target_due_at, target_condition_before, target_condition_before,
    nullif(trim(target_borrowing_group), ''), trim(target_purpose), target_finance_event_id,
    coalesce(target_notes, ''), 'pending'::public.inventory_loan_status, null, auth.uid()
  ) returning id into loan_id;
  return loan_id;
end;
$$;

-- Preserve the legacy inventory RPC name, but make it request-only.
create or replace function public.create_inventory_loan(
  target_item_id uuid, target_organization_id uuid, target_borrower_name text,
  target_quantity integer, target_due_at timestamptz default null,
  target_condition text default null, target_notes text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
begin
  return public.request_scc_room_loan(
    target_item_id, target_organization_id, target_borrower_name, target_quantity,
    now(), target_due_at, coalesce(nullif(trim(target_condition), ''), 'Good'),
    null, coalesce(nullif(trim(target_notes), ''), 'Inventory borrowing request'),
    null, target_notes
  );
end;
$$;

create or replace function public.approve_scc_room_loan(target_loan_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  loan_row public.inventory_loans%rowtype;
  resulting_quantity integer;
begin
  if public.current_user_role() is distinct from 'SCC Executive'::public.app_role then raise exception 'Executive approval required' using errcode = '42501'; end if;
  select * into loan_row from public.inventory_loans where id = target_loan_id for update;
  if not found then raise exception 'Borrowing request not found' using errcode = 'P0002'; end if;
  if loan_row.status <> 'pending'::public.inventory_loan_status then raise exception 'Only pending requests may be approved' using errcode = '22023'; end if;
  if loan_row.due_at is null or loan_row.due_at <= now() then raise exception 'Return time has passed; create a new request' using errcode = '22023'; end if;
  select quantity_on_hand into resulting_quantity from public.inventory_items
    where id = loan_row.inventory_item_id and item_condition in ('Good', 'Fair') for update;
  if not found or resulting_quantity < loan_row.quantity_borrowed then
    raise exception 'Item unavailable or insufficient stock for approval' using errcode = '22023';
  end if;
  update public.inventory_items set quantity_on_hand = quantity_on_hand - loan_row.quantity_borrowed
    where id = loan_row.inventory_item_id returning quantity_on_hand into resulting_quantity;
  insert into public.inventory_transactions (inventory_item_id, quantity_change, reason, organization_id, notes)
    values (loan_row.inventory_item_id, -loan_row.quantity_borrowed, 'issue'::public.inventory_adjustment_reason,
      loan_row.organization_id, 'SCC room loan approved: ' || loan_row.id::text);
  update public.inventory_loans
    set status = 'borrowed'::public.inventory_loan_status, approved_by = auth.uid(), borrowed_at = now()
    where id = target_loan_id;
  return resulting_quantity;
end;
$$;

create or replace function public.reject_scc_room_loan(target_loan_id uuid, rejection_notes text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.current_user_role() is distinct from 'SCC Executive'::public.app_role then raise exception 'Executive review required' using errcode = '42501'; end if;
  update public.inventory_loans
    set status = 'cancelled'::public.inventory_loan_status,
        notes = concat_ws(E'\n', nullif(notes, ''), nullif(trim(rejection_notes), ''))
    where id = target_loan_id and status = 'pending'::public.inventory_loan_status;
  if not found then raise exception 'Only pending requests may be rejected' using errcode = '22023'; end if;
end;
$$;

revoke all on function public.request_scc_room_loan(uuid, uuid, text, integer, timestamptz, timestamptz, text, text, text, uuid, text) from public;
revoke all on function public.approve_scc_room_loan(uuid) from public;
revoke all on function public.reject_scc_room_loan(uuid, text) from public;
grant execute on function public.request_scc_room_loan(uuid, uuid, text, integer, timestamptz, timestamptz, text, text, text, uuid, text) to authenticated;
grant execute on function public.approve_scc_room_loan(uuid) to authenticated;
grant execute on function public.reject_scc_room_loan(uuid, text) to authenticated;
-- Returns must go through the condition-aware wrapper so damaged/lost units are not restocked.
revoke execute on function public.return_inventory_loan(uuid, text, text) from authenticated;
