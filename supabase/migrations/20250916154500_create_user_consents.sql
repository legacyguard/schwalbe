-- Create user_consents table for MVP consent tracking
-- Note: we use Supabase auth.uid() identity. RLS enabled with owner-only policies.

create table if not exists public.user_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  cookies_version text not null,
  consented_at timestamptz not null default now()
);

alter table public.user_consents enable row level security;

-- Allow user to read their own consent row
create policy "can select own user_consents" on public.user_consents
  for select using (auth.uid() = user_id);

-- Allow user to insert their own consent row
create policy "can insert own user_consents" on public.user_consents
  for insert with check (auth.uid() = user_id);

-- Allow user to update their own consent row
create policy "can update own user_consents" on public.user_consents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
