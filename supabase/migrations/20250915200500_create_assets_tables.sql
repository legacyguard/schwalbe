-- Phase 14: Asset Tracking Core
-- Create enum for asset categories
create type if not exists asset_category as enum ('property','vehicle','financial','business','personal');

-- Assets table
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category asset_category not null,
  name text,
  estimated_value numeric(18,2),
  currency text default 'USD',
  acquired_at date,
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_assets_user_id on public.assets(user_id);
create index if not exists idx_assets_category on public.assets(category);
create index if not exists idx_assets_updated_at on public.assets(updated_at desc);

-- RLS
alter table public.assets enable row level security;

-- Idempotent drop policies
drop policy if exists "assets_select_own" on public.assets;
drop policy if exists "assets_insert_own" on public.assets;
drop policy if exists "assets_update_own" on public.assets;
drop policy if exists "assets_delete_own" on public.assets;

-- Policies using auth.uid()
create policy "assets_select_own" on public.assets
  for select to authenticated
  using (user_id = auth.uid());

create policy "assets_insert_own" on public.assets
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "assets_update_own" on public.assets
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "assets_delete_own" on public.assets
  for delete to authenticated
  using (user_id = auth.uid());

-- updated_at trigger reuse
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_assets_updated_at on public.assets;
create trigger trg_assets_updated_at
  before update on public.assets
  for each row execute function public.handle_updated_at();
