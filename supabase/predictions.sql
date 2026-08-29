-- Run this once in the Supabase SQL editor. Safe to re-run.
-- It does two things: creates the betting-line table, and drops the now-unused
-- waters column.

-- 1. Betting line: what does the group think he actually finishes on?
--
-- Deliberately append-only, exactly like posts: every vote is a row, and the
-- line is derived by taking each voter's most recent row. That means anon
-- needs only select and insert - no update policy, so nobody can rewrite
-- somebody else's vote.
create table if not exists predictions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  voter       text not null,
  beers       int not null check (beers >= 0 and beers <= 9),
  dogs        int not null check (dogs >= 0 and dogs <= 9)
);

-- The line reads "latest row per voter", so index that access pattern.
create index if not exists predictions_voter_created_idx
  on predictions (voter, created_at desc);

alter table predictions enable row level security;

drop policy if exists "anyone can read predictions" on predictions;
create policy "anyone can read predictions"
  on predictions for select to anon using (true);

drop policy if exists "anyone can vote" on predictions;
create policy "anyone can vote"
  on predictions for insert to anon with check (true);

-- Live line updates on every phone.
do $$
begin
  alter publication supabase_realtime add table predictions;
exception
  when duplicate_object then null;
end $$;

-- 2. Water counts were removed from the app, so drop the column.
--    The posts table is currently empty, so this loses nothing.
alter table posts drop column if exists waters;
