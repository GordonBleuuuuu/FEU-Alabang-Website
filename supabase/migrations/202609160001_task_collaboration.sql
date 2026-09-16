-- Collaboration data for the internal SCC/SADU project board.

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_by uuid not null default auth.uid() references public.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.task_activity (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  actor_id uuid references public.users (id) on delete set null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index task_comments_task_idx on public.task_comments (task_id, created_at);
create index task_attachments_task_idx on public.task_attachments (task_id, created_at);
create index task_activity_task_idx on public.task_activity (task_id, created_at desc);

create trigger task_comments_set_updated_at
  before update on public.task_comments
  for each row execute procedure public.set_updated_at();

create or replace function public.audit_task_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.task_activity (task_id, actor_id, action, new_data)
    values (new.id, auth.uid(), 'created', to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.task_activity (task_id, actor_id, action, old_data, new_data)
    values (
      new.id,
      auth.uid(),
      case when old.status is distinct from new.status then 'status_changed' else 'updated' end,
      to_jsonb(old),
      to_jsonb(new)
    );
    return new;
  else
    return old;
  end if;
end;
$$;

create trigger tasks_audit_change
  after insert or update on public.tasks
  for each row execute procedure public.audit_task_change();

alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.task_activity enable row level security;

create policy "task_comments_internal_read"
  on public.task_comments for select to authenticated
  using (public.is_internal_user());
create policy "task_comments_internal_insert"
  on public.task_comments for insert to authenticated
  with check (public.is_internal_user() and author_id = auth.uid());
create policy "task_comments_author_or_sadu_update"
  on public.task_comments for update to authenticated
  using (author_id = auth.uid() or public.is_sadu())
  with check (author_id = auth.uid() or public.is_sadu());
create policy "task_comments_author_or_sadu_delete"
  on public.task_comments for delete to authenticated
  using (author_id = auth.uid() or public.is_sadu());

create policy "task_attachments_internal_read"
  on public.task_attachments for select to authenticated
  using (public.is_internal_user());
create policy "task_attachments_internal_insert"
  on public.task_attachments for insert to authenticated
  with check (public.is_internal_user() and uploaded_by = auth.uid());
create policy "task_attachments_uploader_or_sadu_delete"
  on public.task_attachments for delete to authenticated
  using (uploaded_by = auth.uid() or public.is_sadu());

create policy "task_activity_internal_read"
  on public.task_activity for select to authenticated
  using (public.is_internal_user());

revoke all on public.task_comments, public.task_attachments, public.task_activity from anon, authenticated;
grant select, insert, update, delete on public.task_comments to authenticated;
grant select, insert, delete on public.task_attachments to authenticated;
grant select on public.task_activity to authenticated;
grant usage, select on sequence public.task_activity_id_seq to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('task-documents', 'task-documents', false, 26214400, array[
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
])
on conflict (id) do nothing;

create policy "task_documents_internal_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'task-documents' and public.is_internal_user());
create policy "task_documents_internal_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'task-documents' and public.is_internal_user());
create policy "task_documents_internal_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'task-documents' and public.is_internal_user());
