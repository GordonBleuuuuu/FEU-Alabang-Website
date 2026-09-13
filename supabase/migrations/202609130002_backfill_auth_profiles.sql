-- Profiles are normally created by the auth.users insert trigger. Backfill any
-- accounts that existed before the initial RBAC migration was installed.
insert into public.users (id, email, display_name, role)
select
  auth_user.id,
  auth_user.email,
  coalesce(
    auth_user.raw_user_meta_data ->> 'display_name',
    auth_user.raw_user_meta_data ->> 'full_name'
  ),
  'Public'::public.app_role
from auth.users as auth_user
where auth_user.email is not null
on conflict (id) do nothing;
