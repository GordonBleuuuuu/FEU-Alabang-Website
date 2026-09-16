-- SCC Executives may manage events for every recognized organization.
insert into public.organization_members (organization_id, user_id, member_role)
select organization.id, app_user.id, 'manager'
from public.organizations as organization
cross join public.users as app_user
where organization.is_active
  and app_user.role = 'SCC Executive'::public.app_role
on conflict (organization_id, user_id) do update
  set member_role = 'manager';

create or replace function public.add_scc_executive_organization_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = 'SCC Executive'::public.app_role then
    insert into public.organization_members (organization_id, user_id, member_role)
    select id, new.id, 'manager'
    from public.organizations
    where is_active
    on conflict (organization_id, user_id) do update
      set member_role = 'manager';
  end if;
  return new;
end;
$$;

create trigger users_grant_scc_organization_access
  after insert or update of role on public.users
  for each row execute procedure public.add_scc_executive_organization_access();

create or replace function public.add_new_organization_to_scc_executives()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_active then
    insert into public.organization_members (organization_id, user_id, member_role)
    select new.id, app_user.id, 'manager'
    from public.users as app_user
    where app_user.role = 'SCC Executive'::public.app_role
    on conflict (organization_id, user_id) do update
      set member_role = 'manager';
  end if;
  return new;
end;
$$;

create trigger organizations_grant_scc_access
  after insert on public.organizations
  for each row execute procedure public.add_new_organization_to_scc_executives();
