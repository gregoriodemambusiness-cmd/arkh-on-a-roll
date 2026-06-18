-- Migration: add invite_code + workspace_members
-- Apply in Supabase Dashboard → SQL Editor

-- 1. Extend workspaces table
alter table public.workspaces
  add column if not exists owner_id  uuid references auth.users(id) on delete cascade,
  add column if not exists invite_code char(6);

-- Backfill owner_id from user_id where missing
update public.workspaces set owner_id = user_id where owner_id is null;

-- Make invite_code unique (non-null enforced at app level on insert)
create unique index if not exists workspaces_invite_code_idx
  on public.workspaces(invite_code)
  where invite_code is not null;

-- 2. Create workspace_members table
create table if not exists public.workspace_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member' check (role in ('admin', 'member')),
  joined_at    timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- 3. Enable RLS on workspace_members
alter table public.workspace_members enable row level security;

-- Members can see all members of workspaces they belong to
create policy "members_select"
  on public.workspace_members for select
  using (
    user_id = auth.uid()
    or workspace_id in (
      select workspace_id from public.workspace_members where user_id = auth.uid()
    )
  );

-- Users can insert themselves (via join flow — application enforces code check)
create policy "members_insert_self"
  on public.workspace_members for insert
  with check (user_id = auth.uid());

-- Admins can delete members
create policy "members_delete_admin"
  on public.workspace_members for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- 4. Update workspaces RLS to also allow members to read
-- Drop old owner-only select policy if it exists
drop policy if exists "Users can read own workspaces" on public.workspaces;

create policy "workspace_select_member"
  on public.workspaces for select
  using (
    user_id = auth.uid()
    or id in (
      select workspace_id from public.workspace_members where user_id = auth.uid()
    )
  );

-- Anyone authenticated can read a workspace by invite_code (for join lookup)
create policy "workspace_select_by_invite"
  on public.workspaces for select
  using (invite_code is not null);

-- 5. Index for fast lookup by invite_code
create index if not exists workspace_members_user_idx
  on public.workspace_members(user_id);

create index if not exists workspace_members_ws_idx
  on public.workspace_members(workspace_id);
