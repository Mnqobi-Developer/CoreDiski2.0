# Supabase migrations (CoreDiski)

## 1) Set project in `.env` for local app
Create `CoreDiski2.0/.env` with:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 2) Run migrations in Supabase

### Option A: Supabase Dashboard (fastest)
1. Open Supabase project → **SQL Editor**.
2. Run both migration files in order:
   - `supabase/migrations/20260317000000_create_shirts_table.sql`
   - `supabase/migrations/20260317000001_enable_admin_policies.sql`
3. Run them.

### Option B: Supabase CLI
From repo root (`CoreDiski2.0/`):

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

`supabase db push` applies SQL files in `supabase/migrations`.

## 3) Verify table + API
Run this in SQL editor:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'shirts'
order by ordinal_position;
```

Then verify the app can read/write shirts from admin page.

## Security note
Current setup keeps `shirts` readable publicly, but write/delete is restricted to authenticated users listed in `public.admin_users`.


## 4) Grant admin access to a Supabase Auth user
After creating/signing up the user in Supabase Auth, run:

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('Mnqobintereke2000@gmail.com')
on conflict (user_id) do nothing;
```

This marks that authenticated user as admin for shirts write access policies.
