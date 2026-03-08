-- ============================================================
-- ArthhSaathi – Supabase Database Setup
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- 1. GOALS
create table if not exists public.goals (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  target      numeric not null,
  saved       numeric not null default 0,
  target_date date not null,
  weeks_remaining int not null,
  history     jsonb not null default '[]',
  created_at  timestamptz not null default now()
);
alter table public.goals enable row level security;
create policy "Users manage own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. DAILY ENTRIES
create table if not exists public.daily_entries (
  id               bigint generated always as identity primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  entry_date       date not null,
  category         text not null,
  category_label   text not null,
  category_color   text not null default '#888',
  amount           numeric not null,
  description      text default '',
  goal_id          bigint references public.goals(id) on delete set null,
  created_at       timestamptz not null default now()
);
alter table public.daily_entries enable row level security;
create policy "Users manage own daily entries" on public.daily_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. CUSTOM CATEGORIES
create table if not exists public.custom_categories (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  cat_id     text not null,           -- e.g. "custom_pet_care_1234"
  label      text not null,
  color      text not null,
  created_at timestamptz not null default now(),
  unique (user_id, cat_id)
);
alter table public.custom_categories enable row level security;
create policy "Users manage own custom categories" on public.custom_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. HIDDEN BASE CATEGORIES  (tracks which built-in cats the user removed)
create table if not exists public.hidden_categories (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  cat_id     text not null,           -- e.g. "entertainment"
  created_at timestamptz not null default now(),
  unique (user_id, cat_id)
);
alter table public.hidden_categories enable row level security;
create policy "Users manage own hidden categories" on public.hidden_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. MONTHLY REPORTS  (stores the latest report data per user)
create table if not exists public.monthly_reports (
  id           bigint generated always as identity primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  income       numeric not null,
  expenses     jsonb not null default '{}',
  total_expenses numeric not null,
  generated_at timestamptz not null default now()
);
alter table public.monthly_reports enable row level security;
create policy "Users manage own reports" on public.monthly_reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
