-- CoreDiski shirts table + starter RLS policies for anon REST access.
-- NOTE: These policies are intentionally permissive to match the current client-only auth model.
-- Tighten them once you migrate admin auth to Supabase Auth.

create extension if not exists pgcrypto;

create table if not exists public.shirts (
  id uuid primary key default gen_random_uuid(),
  club_or_nation text not null,
  title text not null,
  season text not null,
  variant text not null,
  price numeric(10, 2) not null check (price > 0),
  image_url text not null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shirts_set_updated_at on public.shirts;
create trigger shirts_set_updated_at
before update on public.shirts
for each row
execute function public.set_updated_at();

alter table public.shirts enable row level security;

-- Reset policies so migration is re-runnable.
drop policy if exists "shirts_select_anon" on public.shirts;
drop policy if exists "shirts_insert_anon" on public.shirts;
drop policy if exists "shirts_update_anon" on public.shirts;
drop policy if exists "shirts_delete_anon" on public.shirts;

create policy "shirts_select_anon"
on public.shirts
for select
to anon
using (true);

create policy "shirts_insert_anon"
on public.shirts
for insert
to anon
with check (true);

create policy "shirts_update_anon"
on public.shirts
for update
to anon
using (true)
with check (true);

create policy "shirts_delete_anon"
on public.shirts
for delete
to anon
using (true);
