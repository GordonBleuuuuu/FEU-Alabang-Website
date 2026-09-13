create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  acronym text not null,
  slug text not null unique,
  description text not null default '',
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  member_role text not null default 'manager' check (member_role in ('manager', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

insert into public.organizations (name, acronym, slug, description)
values (
  'FEU Alabang Student Coordinating Council',
  'FEUASCC',
  'feuascc',
  'The official Student Coordinating Council of FEU Alabang.'
)
on conflict (slug) do nothing;

insert into public.organization_members (organization_id, user_id, member_role)
select organization.id, app_user.id, 'manager'
from public.organizations as organization
cross join public.users as app_user
where organization.slug = 'feuascc'
  and app_user.role = 'SCC Executive'
on conflict do nothing;

alter table public.events
  add column organization_id uuid references public.organizations (id),
  add column category text not null default 'organization' check (
    category in ('academic', 'advocacy', 'arts', 'community', 'organization', 'sports', 'wellness', 'other')
  ),
  add column contact_name text,
  add column contact_email text,
  add column capacity integer check (capacity is null or capacity > 0),
  add column submitted_at timestamptz,
  add column submitted_by uuid references public.users (id) on delete set null,
  add column approved_at timestamptz,
  add column approved_by uuid references public.users (id) on delete set null,
  add column published_at timestamptz,
  add column review_notes text;

-- Preserve the original audit owners while this migration backfills legacy rows.
alter table public.events disable trigger events_protect_audit_fields;
update public.events
set organization_id = (select id from public.organizations where slug = 'feuascc')
where organization_id is null;
alter table public.events enable trigger events_protect_audit_fields;

alter table public.events
  alter column organization_id set not null;

create table public.event_attachments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  kind text not null check (kind in ('poster', 'permit', 'proposal', 'budget', 'other')),
  file_name text not null,
  storage_bucket text not null check (storage_bucket in ('event-posters', 'event-documents')),
  storage_path text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_by uuid not null default auth.uid() references public.users (id),
  created_at timestamptz not null default now()
);

create table public.event_activity (
  id bigint generated always as identity primary key,
  event_id uuid not null references public.events (id) on delete cascade,
  actor_id uuid references public.users (id) on delete set null,
  action text not null,
  from_status public.event_status,
  to_status public.event_status,
  old_data jsonb,
  new_data jsonb,
  comment text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index organization_members_user_idx on public.organization_members (user_id);
create index events_organization_idx on public.events (organization_id, starts_at);
create index event_activity_event_idx on public.event_activity (event_id, created_at desc);
create index event_attachments_event_idx on public.event_attachments (event_id, created_at);
create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute procedure public.set_updated_at();

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members as membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_sadu() or exists (
    select 1
    from public.events as event
    join public.organization_members as membership
      on membership.organization_id = event.organization_id
    where event.id = target_event_id
      and membership.user_id = auth.uid()
      and public.current_user_role() = 'SCC Executive'::public.app_role
  );
$$;

create or replace function public.validate_event_workflow()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actor_role public.app_role := public.current_user_role();
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if actor_role = 'SCC Executive'::public.app_role then
    if not public.is_organization_member(new.organization_id) then
      raise exception 'You do not manage this organization' using errcode = '42501';
    end if;

    if tg_op = 'INSERT' and new.status <> 'draft'::public.event_status then
      raise exception 'SCC Executives must create events as drafts' using errcode = '42501';
    end if;

    if tg_op = 'UPDATE' then
      if new.organization_id is distinct from old.organization_id then
        raise exception 'Only SADU may transfer an event to another organization' using errcode = '42501';
      end if;
      if new.review_notes is distinct from old.review_notes then
        raise exception 'Only SADU may change review notes' using errcode = '42501';
      end if;
      if old.status not in ('draft'::public.event_status, 'needs_changes'::public.event_status)
         or new.status not in ('draft'::public.event_status, 'submitted'::public.event_status) then
        raise exception 'SCC Executives may only edit drafts and submit them to SADU' using errcode = '42501';
      end if;
    end if;
  elsif actor_role <> 'SADU'::public.app_role then
    raise exception 'Internal event access is required' using errcode = '42501';
  end if;

  if new.status = 'submitted'::public.event_status
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    new.submitted_at = now();
    new.submitted_by = auth.uid();
  end if;

  if new.status = 'approved'::public.event_status
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    if actor_role <> 'SADU'::public.app_role then
      raise exception 'Only SADU may approve events' using errcode = '42501';
    end if;
    new.approved_at = now();
    new.approved_by = auth.uid();
  end if;

  if new.status = 'published'::public.event_status
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    if actor_role <> 'SADU'::public.app_role then
      raise exception 'Only SADU may publish events' using errcode = '42501';
    end if;
    new.published_at = now();
  end if;

  return new;
end;
$$;

create trigger events_validate_workflow
  before insert or update on public.events
  for each row execute procedure public.validate_event_workflow();

create or replace function public.audit_event_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.event_activity (event_id, actor_id, action, to_status, new_data)
    values (new.id, auth.uid(), 'created', new.status, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.event_activity (
      event_id, actor_id, action, from_status, to_status, old_data, new_data
    ) values (
      new.id,
      auth.uid(),
      case when old.status is distinct from new.status then 'status_changed' else 'updated' end,
      old.status,
      new.status,
      to_jsonb(old),
      to_jsonb(new)
    );
    return new;
  else
    return old;
  end if;
end;
$$;

create trigger events_audit_change
  after insert or update on public.events
  for each row execute procedure public.audit_event_change();

create or replace function public.notify_event_workflow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  if new.status = 'submitted'::public.event_status then
    insert into public.notifications (user_id, event_id, title, message)
    select app_user.id, new.id, 'Event submitted for review', new.title || ' is ready for SADU review.'
    from public.users as app_user
    where app_user.role = 'SADU'::public.app_role;
  elsif new.status in (
    'needs_changes'::public.event_status,
    'approved'::public.event_status,
    'published'::public.event_status
  ) then
    insert into public.notifications (user_id, event_id, title, message)
    select membership.user_id, new.id,
      case new.status
        when 'needs_changes'::public.event_status then 'Event changes requested'
        when 'approved'::public.event_status then 'Event approved'
        else 'Event published'
      end,
      new.title || ' is now ' || replace(new.status::text, '_', ' ') || '.'
    from public.organization_members as membership
    where membership.organization_id = new.organization_id;
  end if;

  return new;
end;
$$;

create trigger events_notify_workflow
  after update of status on public.events
  for each row execute procedure public.notify_event_workflow();

create or replace function public.find_event_conflicts(
  candidate_starts_at timestamptz,
  candidate_ends_at timestamptz,
  candidate_venue text,
  excluded_event_id uuid default null
)
returns table (
  event_id uuid,
  event_title text,
  event_venue text,
  event_starts_at timestamptz,
  event_ends_at timestamptz,
  conflict_type text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_internal_user() then
    raise exception 'Internal access required' using errcode = '42501';
  end if;

  return query
  select
    event.id,
    event.title,
    event.venue,
    event.starts_at,
    event.ends_at,
    case
      when nullif(trim(candidate_venue), '') is not null
        and nullif(trim(event.venue), '') is not null
        and lower(trim(event.venue)) = lower(trim(candidate_venue))
      then 'venue'
      else 'schedule'
    end
  from public.events as event
  where event.id is distinct from excluded_event_id
    and event.status not in ('draft'::public.event_status, 'cancelled'::public.event_status)
    and tstzrange(event.starts_at, event.ends_at, '[)')
        && tstzrange(candidate_starts_at, candidate_ends_at, '[)')
  order by event.starts_at;
end;
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.event_attachments enable row level security;
alter table public.event_activity enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "events_internal_read" on public.events;
drop policy if exists "events_internal_insert" on public.events;
drop policy if exists "events_internal_update" on public.events;
drop policy if exists "events_internal_delete" on public.events;

create policy "organizations_public_read"
  on public.organizations for select to anon, authenticated
  using (is_active or public.is_internal_user());
create policy "organizations_sadu_insert"
  on public.organizations for insert to authenticated
  with check (public.is_sadu());
create policy "organizations_sadu_update"
  on public.organizations for update to authenticated
  using (public.is_sadu()) with check (public.is_sadu());

create policy "organization_members_internal_read"
  on public.organization_members for select to authenticated
  using (public.is_internal_user());
create policy "organization_members_sadu_insert"
  on public.organization_members for insert to authenticated
  with check (public.is_sadu());
create policy "organization_members_sadu_update"
  on public.organization_members for update to authenticated
  using (public.is_sadu()) with check (public.is_sadu());
create policy "organization_members_sadu_delete"
  on public.organization_members for delete to authenticated
  using (public.is_sadu());

create policy "events_sadu_read"
  on public.events for select to authenticated
  using (public.is_sadu());
create policy "events_scc_organization_read"
  on public.events for select to authenticated
  using (
    public.current_user_role() = 'SCC Executive'::public.app_role
    and public.is_organization_member(organization_id)
  );
create policy "events_sadu_insert"
  on public.events for insert to authenticated
  with check (public.is_sadu());
create policy "events_scc_draft_insert"
  on public.events for insert to authenticated
  with check (
    public.current_user_role() = 'SCC Executive'::public.app_role
    and public.is_organization_member(organization_id)
    and status = 'draft'::public.event_status
  );
create policy "events_sadu_update"
  on public.events for update to authenticated
  using (public.is_sadu()) with check (public.is_sadu());
create policy "events_scc_draft_update"
  on public.events for update to authenticated
  using (
    public.current_user_role() = 'SCC Executive'::public.app_role
    and public.is_organization_member(organization_id)
    and status in ('draft'::public.event_status, 'needs_changes'::public.event_status)
  )
  with check (
    public.current_user_role() = 'SCC Executive'::public.app_role
    and public.is_organization_member(organization_id)
    and status in ('draft'::public.event_status, 'submitted'::public.event_status)
  );
create policy "events_sadu_delete"
  on public.events for delete to authenticated
  using (public.is_sadu());
create policy "events_scc_draft_delete"
  on public.events for delete to authenticated
  using (
    public.current_user_role() = 'SCC Executive'::public.app_role
    and public.is_organization_member(organization_id)
    and status = 'draft'::public.event_status
  );

create policy "event_attachments_internal_read"
  on public.event_attachments for select to authenticated
  using (public.can_manage_event(event_id));
create policy "event_attachments_internal_insert"
  on public.event_attachments for insert to authenticated
  with check (public.can_manage_event(event_id) and uploaded_by = auth.uid());
create policy "event_attachments_internal_delete"
  on public.event_attachments for delete to authenticated
  using (public.can_manage_event(event_id));

create policy "event_activity_internal_read"
  on public.event_activity for select to authenticated
  using (public.can_manage_event(event_id));

create policy "notifications_read_own"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy "notifications_update_own"
  on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on public.organizations, public.organization_members, public.event_attachments,
  public.event_activity, public.notifications from anon, authenticated;
grant select on public.organizations to anon, authenticated;
grant insert, update on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, delete on public.event_attachments to authenticated;
grant select on public.event_activity to authenticated;
grant select, update on public.notifications to authenticated;
grant usage, select on sequence public.event_activity_id_seq to authenticated;

revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.can_manage_event(uuid) from public;
revoke all on function public.find_event_conflicts(timestamptz, timestamptz, text, uuid) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.can_manage_event(uuid) to authenticated;
grant execute on function public.find_event_conflicts(timestamptz, timestamptz, text, uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('event-posters', 'event-posters', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('event-documents', 'event-documents', false, 26214400, array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

create policy "event_posters_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'event-posters');
create policy "event_files_internal_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('event-posters', 'event-documents') and public.is_internal_user());
create policy "event_files_internal_update"
  on storage.objects for update to authenticated
  using (bucket_id in ('event-posters', 'event-documents') and public.is_internal_user());
create policy "event_files_internal_delete"
  on storage.objects for delete to authenticated
  using (bucket_id in ('event-posters', 'event-documents') and public.is_internal_user());
create policy "event_documents_internal_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'event-documents' and public.is_internal_user());
