create type public.inventory_adjustment_reason as enum ('restock', 'issue', 'return', 'correction', 'donation');
create type public.equipment_request_status as enum ('pending', 'approved', 'fulfilled', 'rejected', 'cancelled');

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 2 and 120),
  category text not null default 'General',
  unit text not null default 'piece',
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  reorder_level integer not null default 0 check (reorder_level >= 0),
  storage_location text,
  notes text not null default '',
  created_by uuid not null default auth.uid() references public.users (id),
  updated_by uuid not null default auth.uid() references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_transactions (
  id bigint generated always as identity primary key,
  inventory_item_id uuid not null references public.inventory_items (id) on delete restrict,
  quantity_change integer not null check (quantity_change <> 0),
  reason public.inventory_adjustment_reason not null,
  organization_id uuid references public.organizations (id) on delete set null,
  notes text,
  created_by uuid not null default auth.uid() references public.users (id),
  created_at timestamptz not null default now()
);

create table public.equipment_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  inventory_item_id uuid not null references public.inventory_items (id) on delete restrict,
  quantity_requested integer not null check (quantity_requested > 0),
  needed_at timestamptz,
  status public.equipment_request_status not null default 'pending',
  notes text not null default '',
  requested_by uuid not null default auth.uid() references public.users (id),
  reviewed_by uuid references public.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inventory_transactions_item_idx on public.inventory_transactions (inventory_item_id, created_at desc);
create index equipment_requests_status_idx on public.equipment_requests (status, needed_at);
create index equipment_requests_organization_idx on public.equipment_requests (organization_id, created_at desc);

create trigger inventory_items_set_updated_at
  before update on public.inventory_items
  for each row execute procedure public.set_updated_at();
create trigger equipment_requests_set_updated_at
  before update on public.equipment_requests
  for each row execute procedure public.set_updated_at();

create or replace function public.protect_inventory_audit_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = auth.uid();
  else
    new.created_by = old.created_by;
  end if;
  new.updated_by = auth.uid();
  return new;
end;
$$;

create trigger inventory_items_protect_audit_fields
  before insert or update on public.inventory_items
  for each row execute procedure public.protect_inventory_audit_fields();

create or replace function public.record_inventory_adjustment(
  target_item_id uuid,
  adjustment integer,
  adjustment_reason public.inventory_adjustment_reason,
  target_organization_id uuid default null,
  adjustment_notes text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  resulting_quantity integer;
begin
  if not public.is_internal_user() then
    raise exception 'Internal access required' using errcode = '42501';
  end if;
  if adjustment = 0 then
    raise exception 'An adjustment must change the quantity' using errcode = '22023';
  end if;

  select quantity_on_hand into resulting_quantity
  from public.inventory_items
  where id = target_item_id
  for update;
  if not found then
    raise exception 'Inventory item not found' using errcode = 'P0002';
  end if;
  if resulting_quantity + adjustment < 0 then
    raise exception 'Insufficient inventory for this adjustment' using errcode = '22023';
  end if;

  update public.inventory_items
  set quantity_on_hand = quantity_on_hand + adjustment
  where id = target_item_id
  returning quantity_on_hand into resulting_quantity;

  insert into public.inventory_transactions (inventory_item_id, quantity_change, reason, organization_id, notes)
  values (target_item_id, adjustment, adjustment_reason, target_organization_id, nullif(trim(adjustment_notes), ''));

  return resulting_quantity;
end;
$$;

create or replace function public.update_equipment_request_status(
  target_request_id uuid,
  next_status public.equipment_request_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_internal_user() then
    raise exception 'Internal access required' using errcode = '42501';
  end if;
  if next_status = 'fulfilled'::public.equipment_request_status then
    raise exception 'Use fulfill_equipment_request to issue inventory' using errcode = '22023';
  end if;
  update public.equipment_requests
  set status = next_status, reviewed_by = auth.uid(), reviewed_at = now()
  where id = target_request_id;
  if not found then
    raise exception 'Equipment request not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.fulfill_equipment_request(target_request_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.equipment_requests%rowtype;
  resulting_quantity integer;
begin
  if not public.is_internal_user() then
    raise exception 'Internal access required' using errcode = '42501';
  end if;
  select * into request_row from public.equipment_requests where id = target_request_id for update;
  if not found then
    raise exception 'Equipment request not found' using errcode = 'P0002';
  end if;
  if request_row.status not in ('pending'::public.equipment_request_status, 'approved'::public.equipment_request_status) then
    raise exception 'Only pending or approved requests may be fulfilled' using errcode = '22023';
  end if;

  resulting_quantity := public.record_inventory_adjustment(
    request_row.inventory_item_id,
    -request_row.quantity_requested,
    'issue'::public.inventory_adjustment_reason,
    request_row.organization_id,
    'Fulfilled equipment request ' || request_row.id::text
  );

  update public.equipment_requests
  set status = 'fulfilled'::public.equipment_request_status,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = request_row.id;
  return resulting_quantity;
end;
$$;

alter table public.inventory_items enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.equipment_requests enable row level security;

create policy "inventory_items_internal_read" on public.inventory_items for select to authenticated using (public.is_internal_user());
create policy "inventory_items_internal_insert" on public.inventory_items for insert to authenticated with check (public.is_internal_user());
create policy "inventory_items_internal_update" on public.inventory_items for update to authenticated using (public.is_internal_user()) with check (public.is_internal_user());
create policy "inventory_items_sadu_delete" on public.inventory_items for delete to authenticated using (public.is_sadu());
create policy "inventory_transactions_internal_read" on public.inventory_transactions for select to authenticated using (public.is_internal_user());
create policy "equipment_requests_internal_read" on public.equipment_requests for select to authenticated using (public.is_internal_user());
create policy "equipment_requests_internal_insert" on public.equipment_requests for insert to authenticated with check (public.is_internal_user() and requested_by = auth.uid());

revoke all on public.inventory_items, public.inventory_transactions, public.equipment_requests from anon, authenticated;
grant select, insert on public.inventory_items to authenticated;
grant update (name, category, unit, reorder_level, storage_location, notes) on public.inventory_items to authenticated;
grant select on public.inventory_transactions to authenticated;
grant select, insert on public.equipment_requests to authenticated;
grant usage, select on sequence public.inventory_transactions_id_seq to authenticated;

revoke all on function public.record_inventory_adjustment(uuid, integer, public.inventory_adjustment_reason, uuid, text) from public;
revoke all on function public.update_equipment_request_status(uuid, public.equipment_request_status) from public;
revoke all on function public.fulfill_equipment_request(uuid) from public;
grant execute on function public.record_inventory_adjustment(uuid, integer, public.inventory_adjustment_reason, uuid, text) to authenticated;
grant execute on function public.update_equipment_request_status(uuid, public.equipment_request_status) to authenticated;
grant execute on function public.fulfill_equipment_request(uuid) to authenticated;
