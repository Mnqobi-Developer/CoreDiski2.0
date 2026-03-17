-- Create admin_users table and tighten shirts write access to authenticated admins.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

-- Replace permissive anon write policies on shirts with admin-only authenticated policies.
drop policy if exists "shirts_insert_anon" on public.shirts;
drop policy if exists "shirts_update_anon" on public.shirts;
drop policy if exists "shirts_delete_anon" on public.shirts;

drop policy if exists "shirts_select_anon" on public.shirts;
drop policy if exists "shirts_select_public" on public.shirts;
create policy "shirts_select_public"
on public.shirts
for select
to anon, authenticated
using (true);

create policy "shirts_insert_admin"
on public.shirts
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

create policy "shirts_update_admin"
on public.shirts
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

create policy "shirts_delete_admin"
on public.shirts
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);
