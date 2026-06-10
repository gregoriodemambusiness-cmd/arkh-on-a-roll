-- Workspaces table
-- Run this in the Supabase SQL editor (or via supabase db push)

create table if not exists public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  project_data jsonb
);

-- RLS: users can only see / edit their own workspaces
alter table public.workspaces enable row level security;

create policy "Users can read own workspaces"
  on public.workspaces for select
  using (auth.uid() = user_id);

create policy "Users can insert own workspaces"
  on public.workspaces for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workspaces"
  on public.workspaces for update
  using (auth.uid() = user_id);

create policy "Users can delete own workspaces"
  on public.workspaces for delete
  using (auth.uid() = user_id);

-- Index for fast lookup by user
create index if not exists workspaces_user_id_idx on public.workspaces(user_id);
