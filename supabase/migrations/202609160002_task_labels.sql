create table public.task_labels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 2 and 40),
  color text not null default '#0F5257' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now()
);

create table public.task_label_links (
  task_id uuid not null references public.tasks (id) on delete cascade,
  label_id uuid not null references public.task_labels (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, label_id)
);

create index task_label_links_label_idx on public.task_label_links (label_id, task_id);

insert into public.task_labels (name, color) values
  ('Blocked', '#DC2626'),
  ('SADU Review', '#0F5257'),
  ('Logistics', '#2563EB'),
  ('Documentation', '#7C3AED'),
  ('Finance', '#B45309'),
  ('Design', '#DB2777')
on conflict (name) do nothing;

alter table public.task_labels enable row level security;
alter table public.task_label_links enable row level security;

create policy "task_labels_internal_read"
  on public.task_labels for select to authenticated
  using (public.is_internal_user());
create policy "task_labels_sadu_insert"
  on public.task_labels for insert to authenticated
  with check (public.is_sadu());
create policy "task_labels_sadu_update"
  on public.task_labels for update to authenticated
  using (public.is_sadu()) with check (public.is_sadu());
create policy "task_labels_sadu_delete"
  on public.task_labels for delete to authenticated
  using (public.is_sadu());

create policy "task_label_links_internal_read"
  on public.task_label_links for select to authenticated
  using (public.is_internal_user());
create policy "task_label_links_internal_insert"
  on public.task_label_links for insert to authenticated
  with check (public.is_internal_user());
create policy "task_label_links_internal_delete"
  on public.task_label_links for delete to authenticated
  using (public.is_internal_user());

revoke all on public.task_labels, public.task_label_links from anon, authenticated;
grant select, insert, update, delete on public.task_labels to authenticated;
grant select, insert, delete on public.task_label_links to authenticated;
