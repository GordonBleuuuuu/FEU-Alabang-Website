-- SCC IDs for Batch 6 executives and approved committee members.
-- QR links contain only an unguessable token; members' details stay behind staff sign-in.
create sequence public.scc_id_code_seq;

create table public.scc_ids (
  id uuid primary key default gen_random_uuid(),
  pass_code text not null unique default ('SCC-ID-B6-' || lpad(nextval('public.scc_id_code_seq')::text, 3, '0')),
  verification_token uuid not null unique default gen_random_uuid(),
  holder_name text not null check (char_length(btrim(holder_name)) between 2 and 160),
  holder_role text not null check (char_length(btrim(holder_role)) between 2 and 160),
  membership_group text not null check (membership_group in ('Executive', 'Committee')),
  photo_url text,
  term_label text not null default 'S.Y. 2026–2027' check (char_length(btrim(term_label)) between 2 and 80),
  status text not null default 'active' check (status in ('active', 'revoked')),
  expires_at timestamptz,
  created_by uuid default auth.uid() references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scc_ids_group_idx on public.scc_ids (membership_group, created_at desc);

create trigger scc_ids_set_updated_at
  before update on public.scc_ids
  for each row execute procedure public.set_updated_at();

alter table public.scc_ids enable row level security;

create policy "scc_ids_internal_read"
  on public.scc_ids for select to authenticated
  using (public.is_internal_user());

create policy "scc_ids_internal_insert"
  on public.scc_ids for insert to authenticated
  with check (public.is_internal_user() and created_by = auth.uid());

create policy "scc_ids_internal_update"
  on public.scc_ids for update to authenticated
  using (public.is_internal_user())
  with check (public.is_internal_user());

revoke all on public.scc_ids from anon, authenticated;
grant select on public.scc_ids to authenticated;
grant insert (holder_name, holder_role, membership_group, photo_url, term_label, expires_at)
  on public.scc_ids to authenticated;
grant update (holder_name, holder_role, membership_group, photo_url, term_label, status, expires_at)
  on public.scc_ids to authenticated;
grant usage on sequence public.scc_id_code_seq to authenticated;

-- Approved roster snapshot: 8 executives + 19 committee members.
-- Review the source files and any disputed titles before applying this migration.
insert into public.scc_ids (pass_code, holder_name, holder_role, membership_group, photo_url) values
  ('SCC-ID-B6-001', 'Yensid Ritchy A. Mimay', 'President', 'Executive', '/officers/Yensid.jpg'),
  ('SCC-ID-B6-002', 'Vonn Kendrick C. Pedrena', 'Vice President — Internal', 'Executive', '/officers/Kendrick.jpg'),
  ('SCC-ID-B6-003', 'Mariel Daniella P. Riquero', 'Vice President — External', 'Executive', '/officers/Mariel.jpg'),
  ('SCC-ID-B6-004', 'Justin Emmanuel J. Janda', 'Secretary', 'Executive', '/officers/Justin.jpg'),
  ('SCC-ID-B6-005', 'Gabriel Montales', 'Assistant Secretary', 'Executive', '/officers/Gab.jpg'),
  ('SCC-ID-B6-006', 'Allan Matthew C. Callao', 'Treasurer', 'Executive', '/officers/Matthew.jpg'),
  ('SCC-ID-B6-007', 'Nathalie H. Colico', 'Auditor', 'Executive', '/officers/Thalia.jpg'),
  ('SCC-ID-B6-008', 'Nathanael Gerard V. Ragasa', 'Public Relations Officer', 'Executive', '/officers/Nigel.jpg'),
  ('SCC-ID-B6-009', 'Charice Lei Patanao', 'Creatives Committee Member', 'Committee', null),
  ('SCC-ID-B6-010', 'Princess Nicole Villacampa', 'Creatives Committee Member', 'Committee', null),
  ('SCC-ID-B6-011', 'Paulina Beatrix Atienza', 'Creatives Committee Member', 'Committee', null),
  ('SCC-ID-B6-012', 'Diane Lumba', 'Creatives Committee Member', 'Committee', null),
  ('SCC-ID-B6-013', 'Fatima Andrea Claire Naynes Capistrano', 'Documentations Committee Member', 'Committee', null),
  ('SCC-ID-B6-014', 'Matthew Jonathan Eduarte', 'Documentations Committee Member', 'Committee', null),
  ('SCC-ID-B6-015', 'Sean Terrence Mallari', 'Documentations Committee Member', 'Committee', null),
  ('SCC-ID-B6-016', 'Sophia Ann Celestino Geronimo', 'Documentations Committee Member', 'Committee', null),
  ('SCC-ID-B6-017', 'Christian Jay Flores', 'Documentations Committee Member', 'Committee', null),
  ('SCC-ID-B6-018', 'Daniel Iñigo Sarmiento', 'Documentations Committee Member', 'Committee', null),
  ('SCC-ID-B6-019', 'AJ Aldaya', 'Documentations Committee Member', 'Committee', null),
  ('SCC-ID-B6-020', 'Natalee Mora', 'Documentations Committee Member', 'Committee', null),
  ('SCC-ID-B6-021', 'Carlos James Prepuse', 'Finance Committee Member', 'Committee', null),
  ('SCC-ID-B6-022', 'Patricia Mae Bucao', 'Finance Committee Member', 'Committee', null),
  ('SCC-ID-B6-023', 'Gae-A Charm Tangson', 'Logistics Committee Member', 'Committee', null),
  ('SCC-ID-B6-024', 'John Nicolas Gameng', 'Programs Committee Member', 'Committee', null),
  ('SCC-ID-B6-025', 'Kyle Bodoso De Jesus', 'Technicals Committee Member', 'Committee', null),
  ('SCC-ID-B6-026', 'Hannah Claire Orgeta', 'Programs Director', 'Committee', null),
  ('SCC-ID-B6-027', 'Faridah Ashley Lhyanne Padua', 'Communications Director', 'Committee', null);

select setval('public.scc_id_code_seq', 27, true);
