-- TKN KB Tracker — full step 2 schema.
-- Paste this whole file into the Supabase SQL editor and run it once.
-- Safe to re-run: every statement guards against already existing.

-- 1. The single table. Every row is a DELTA, never a running total.
--    Totals are derived by summing the feed (spec §4).
create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  author      text not null,
  inning      int,              -- 1..9, nullable
  beers       int default 0,    -- delta, usually 0 or 1
  dogs        int default 0,    -- delta
  waters      int default 0,    -- delta
  note        text,
  photo_url   text
);

-- Feed is always read newest-first; index that access pattern.
create index if not exists posts_created_at_idx on posts (created_at desc);

alter table posts enable row level security;

-- 2. RLS: anon may read and insert. There is deliberately NO update or
--    delete policy — their ABSENCE is what blocks those operations.
--    Deletes happen only through /api/delete using the service_role key.
drop policy if exists "anyone can read" on posts;
create policy "anyone can read"
  on posts for select to anon using (true);

drop policy if exists "anyone can post" on posts;
create policy "anyone can post"
  on posts for insert to anon with check (true);

-- 3. Realtime: add the table to the publication the client subscribes to.
do $$
begin
  alter publication supabase_realtime add table posts;
exception
  when duplicate_object then null;
end $$;

-- 4. Storage bucket for photos: public read, anon insert, no anon delete.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

drop policy if exists "anyone can view photos" on storage.objects;
create policy "anyone can view photos"
  on storage.objects for select to anon
  using (bucket_id = 'photos');

drop policy if exists "anyone can upload photos" on storage.objects;
create policy "anyone can upload photos"
  on storage.objects for insert to anon
  with check (bucket_id = 'photos');
