-- Minimal schema for export request rate limiting and audit
create table if not exists public.export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null check (status in ('started','completed','failed'))
);

create index if not exists idx_export_requests_user_time on public.export_requests(user_id, requested_at desc);

-- Helper to ensure table exists when function is called (idempotent)
create or replace function public.ensure_export_tables()
returns void as $$
begin
  perform 1 from pg_tables where schemaname = 'public' and tablename = 'export_requests';
  -- No-op: table is created by migrations. This function is a placeholder for compatibility.
  return;
end;
$$ language plpgsql security definer set search_path = public;