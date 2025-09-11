-- User profiles to complement Supabase Auth
create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  last_sign_in_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

-- Policies: users can manage own row
create policy "Users can view own profile" on user_profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert own profile" on user_profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" on user_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_user_profiles_email on user_profiles(email);

-- Trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_profiles_updated_at on user_profiles;
create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

