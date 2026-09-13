-- FEUASCC Events Calendar Management
-- Initial schema, RBAC helpers, audit triggers, and row-level security policies.

create extension if not exists pgcrypto;

create type public.app_role as enum ('Public', 'SCC Executive', 'SADU');
create type public.event_status as enum ('draft', 'published', 'cancelled');
create type public.task_status as enum ('backlog', 'todo', 'in_progress', 'review', 'done');
create type public.task_priority as enum ('lowest', 'low', 'medium', 'high', 'highest');

create table public.roles (
  name public.app_role primary key,
  description text not null,
  created_at timestamptz not null default now()
);

insert into public.roles (name, description) values
  ('Public', 'Student body and other public portal visitors.'),
  ('SCC Executive', 'Council executive with internal event and task access.'),
  ('SADU', 'Student Activities Development Unit administrator.');

-- Application profile. Authentication credentials remain in auth.users.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  role public.app_role not null default 'Public' references public.roles (name),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 160),
  slug text not null unique check (slug = lower(slug)),
  description text not null default '',
  organizer_name text not null,
  venue text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.event_status not null default 'draft',
  is_public boolean not null default true,
  registration_url text,
  image_url text,
  created_by uuid not null default auth.uid() references public.users (id),
  updated_by uuid not null default auth.uid() references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_valid_time_range check (ends_at > starts_at)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  task_key bigint generated always as identity unique,
  title text not null check (char_length(title) between 3 and 200),
  description text not null default '',
  status public.task_status not null default 'backlog',
  priority public.task_priority not null default 'medium',
  event_id uuid references public.events (id) on delete set null,
  assignee_id uuid references public.users (id) on delete set null,
  reporter_id uuid not null default auth.uid() references public.users (id),
  due_at timestamptz,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_public_calendar_idx
  on public.events (starts_at, ends_at)
  where status = 'published' and is_public = true;
create index tasks_board_idx on public.tasks (status, position, updated_at desc);
create index tasks_assignee_idx on public.tasks (assignee_id) where assignee_id is not null;

-- SECURITY DEFINER avoids recursive RLS when a policy needs the current profile.
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select u.role from public.users as u where u.id = auth.uid();
$$;

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    public.current_user_role() in ('SCC Executive'::public.app_role, 'SADU'::public.app_role),
    false
  );
$$;

create or replace function public.is_sadu()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'SADU'::public.app_role, false);
$$;

-- Every Auth user receives a non-privileged profile. Promote users explicitly.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    'Public'::public.app_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();
create trigger events_set_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create or replace function public.protect_event_audit_fields()
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

create trigger events_protect_audit_fields
  before insert or update on public.events
  for each row execute procedure public.protect_event_audit_fields();

create or replace function public.protect_task_reporter()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.reporter_id = auth.uid();
  else
    new.reporter_id = old.reporter_id;
  end if;
  return new;
end;
$$;

create trigger tasks_protect_reporter
  before insert or update on public.tasks
  for each row execute procedure public.protect_task_reporter();

-- Direct role-column updates are never exposed to browser roles. SADU uses this RPC.
create or replace function public.set_user_role(target_user_id uuid, new_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_sadu() then
    raise exception 'Only SADU may change user roles' using errcode = '42501';
  end if;

  update public.users set role = new_role where id = target_user_id;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
end;
$$;

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.tasks enable row level security;

-- Roles are reference data; only migrations/service-role code may change them.
create policy "roles_are_readable"
  on public.roles for select
  to anon, authenticated
  using (true);

create policy "users_read_self_or_internal"
  on public.users for select
  to authenticated
  using (id = auth.uid() or public.is_internal_user());

create policy "users_update_self_or_internal"
  on public.users for update
  to authenticated
  using (id = auth.uid() or public.is_internal_user())
  with check (id = auth.uid() or public.is_internal_user());

-- Public users see only explicitly published calendar entries.
create policy "events_public_read"
  on public.events for select
  to anon, authenticated
  using (status = 'published' and is_public = true);

create policy "events_internal_read"
  on public.events for select
  to authenticated
  using (public.is_internal_user());

create policy "events_internal_insert"
  on public.events for insert
  to authenticated
  with check (public.is_internal_user() and created_by = auth.uid() and updated_by = auth.uid());

create policy "events_internal_update"
  on public.events for update
  to authenticated
  using (public.is_internal_user())
  with check (public.is_internal_user());

create policy "events_internal_delete"
  on public.events for delete
  to authenticated
  using (public.is_internal_user());

-- There is deliberately no task policy for anon or Public application users.
create policy "tasks_internal_read"
  on public.tasks for select
  to authenticated
  using (public.is_internal_user());

create policy "tasks_internal_insert"
  on public.tasks for insert
  to authenticated
  with check (public.is_internal_user() and reporter_id = auth.uid());

create policy "tasks_internal_update"
  on public.tasks for update
  to authenticated
  using (public.is_internal_user())
  with check (public.is_internal_user());

create policy "tasks_internal_delete"
  on public.tasks for delete
  to authenticated
  using (public.is_internal_user());

-- Start from no browser-facing privileges, then expose only the intended surface.
revoke all on public.roles, public.users, public.events, public.tasks from anon, authenticated;
grant select on public.roles to anon, authenticated;
grant select on public.users to authenticated;
grant update (display_name, avatar_url) on public.users to authenticated;
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant usage, select on sequence public.tasks_task_key_seq to authenticated;

revoke all on function public.current_user_role() from public;
revoke all on function public.is_internal_user() from public;
revoke all on function public.is_sadu() from public;
revoke all on function public.set_user_role(uuid, public.app_role) from public;
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_internal_user() to anon, authenticated;
grant execute on function public.is_sadu() to authenticated;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;

comment on function public.set_user_role is
  'SADU-only RPC for promoting or demoting application users without exposing the role column.';
