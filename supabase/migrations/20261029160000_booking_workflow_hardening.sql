alter table public.reservations
  add column if not exists guest_count integer not null default 1;

alter table public.reservations
  drop constraint if exists reservations_guest_count_check;
alter table public.reservations
  add constraint reservations_guest_count_check check (guest_count between 1 and 32);

-- A request should not hold inventory before an administrator reviews it.
-- The exclusion constraint still prevents two confirmed/active stays from overlapping.
alter table public.reservations
  drop constraint if exists reservations_no_overlapping_active_stays;
alter table public.reservations
  add constraint reservations_no_overlapping_active_stays
  exclude using gist (
    property_id with =,
    daterange(checkin_date, checkout_date, '[)') with &&
  )
  where (
    property_id is not null
    and checkin_date is not null
    and checkout_date is not null
    and status in ('Confirmed', 'Arriving Today', 'In-Stay')
  );

create or replace function public.prevent_reservation_blackout_conflict()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_table_name = 'reservations' then
    if new.status in ('Confirmed', 'Arriving Today', 'In-Stay')
      and new.property_id is not null and new.checkin_date is not null and new.checkout_date is not null
      and exists (select 1 from public.owner_blackouts b where b.property_id = new.property_id and daterange(b.start_date, b.end_date, '[)') && daterange(new.checkin_date, new.checkout_date, '[)'))
    then raise exception 'Reservation conflicts with owner blackout dates' using errcode = '23P01'; end if;
  else
    if exists (select 1 from public.reservations r where r.property_id = new.property_id and r.status in ('Confirmed', 'Arriving Today', 'In-Stay') and daterange(r.checkin_date, r.checkout_date, '[)') && daterange(new.start_date, new.end_date, '[)'))
    then raise exception 'Owner blackout conflicts with an active reservation' using errcode = '23P01'; end if;
  end if;
  return new;
end;
$$;

-- Private rate-limit ledger. No RLS policies are intentionally granted; only the
-- service-role server endpoints can read or write these records.
create table if not exists public.stay_access_attempts (
  access_key text primary key,
  attempt_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.stay_access_attempts enable row level security;
create index if not exists stay_access_attempts_updated_idx on public.stay_access_attempts (updated_at);

