-- Defense-in-depth controls for public APIs, portals, and direct PostgREST access.

-- Public visitors should never enumerate inactive or maintenance inventory.
drop policy if exists "Public can view properties" on public.properties;
drop policy if exists "Public can view active properties" on public.properties;
create policy "Public can view active properties" on public.properties
  for select using (status = 'Active' or public.is_admin());

-- Owners may decide an approval, but cannot rewrite its owner, cost, item, or property.
revoke update on public.owner_approvals from authenticated;
grant update (status) on public.owner_approvals to authenticated;

-- Maintenance writes must pass through the server endpoint, which binds tickets to
-- an authenticated user or a verified reservation/PIN pair.
drop policy if exists "Authenticated guests can create own tickets" on public.maintenance_tickets;
revoke insert on public.maintenance_tickets from anon, authenticated;

-- Public form tables are service-route only. RLS already denies writes, and these
-- grants remove the capability as an additional boundary.
revoke insert on public.reservations from anon, authenticated;
revoke insert on public.property_inquiries from anon, authenticated;
revoke insert on public.property_reviews from anon, authenticated;

-- Door codes are no longer valid or retained after a stay ends.
update public.reservations
set pin_code = 'Expired'
where status in ('Completed', 'Cancelled') and pin_code <> 'Expired';

-- Atomic, private, database-backed throttling shared by all serverless instances.
create table if not exists public.request_rate_limits (
  rate_key text primary key,
  request_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.request_rate_limits enable row level security;
create index if not exists request_rate_limits_updated_idx on public.request_rate_limits (updated_at);
revoke all on public.request_rate_limits from anon, authenticated;
drop table if exists public.stay_access_attempts;

create or replace function public.consume_request_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after integer, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.request_rate_limits%rowtype;
  v_now timestamptz := now();
  elapsed_seconds integer;
begin
  if length(p_key) <> 64 or p_limit < 1 or p_limit > 10000
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit parameters';
  end if;

  if random() < 0.01 then
    delete from public.request_rate_limits where updated_at < v_now - interval '2 days';
  end if;

  insert into public.request_rate_limits (rate_key, request_count, window_started_at, updated_at)
  values (p_key, 0, v_now, v_now)
  on conflict (rate_key) do nothing;

  select * into current_row
  from public.request_rate_limits
  where rate_key = p_key
  for update;

  if current_row.window_started_at <= v_now - make_interval(secs => p_window_seconds) then
    update public.request_rate_limits
    set request_count = 1, window_started_at = v_now, updated_at = v_now
    where rate_key = p_key;
    return query select true, p_window_seconds, p_limit - 1;
    return;
  end if;

  elapsed_seconds := greatest(0, floor(extract(epoch from v_now - current_row.window_started_at))::integer);
  if current_row.request_count >= p_limit then
    update public.request_rate_limits set updated_at = v_now where rate_key = p_key;
    return query select false, greatest(1, p_window_seconds - elapsed_seconds), 0;
    return;
  end if;

  update public.request_rate_limits
  set request_count = request_count + 1, updated_at = v_now
  where rate_key = p_key;
  return query select true, greatest(1, p_window_seconds - elapsed_seconds), p_limit - current_row.request_count - 1;
end;
$$;

revoke all on function public.consume_request_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_request_rate_limit(text, integer, integer) to service_role;
