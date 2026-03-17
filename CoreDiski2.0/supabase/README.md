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
2. Copy/paste `supabase/migrations/20260317000000_create_shirts_table.sql`.
3. Run it.

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
Current policies allow `anon` read/write/delete for `shirts` because the current app still uses local/custom auth for admin checks.
After migrating to Supabase Auth, replace these with admin-only RLS policies.
