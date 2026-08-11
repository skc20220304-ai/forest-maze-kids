create table if not exists public.game_progress(user_id uuid primary key references auth.users(id) on delete cascade,highest_stage smallint not null default 1 check(highest_stage between 1 and 5),updated_at timestamptz not null default now());
alter table public.game_progress enable row level security;
create policy "read own progress" on public.game_progress for select using(auth.uid()=user_id);
create policy "insert own progress" on public.game_progress for insert with check(auth.uid()=user_id);
create policy "update own progress" on public.game_progress for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
