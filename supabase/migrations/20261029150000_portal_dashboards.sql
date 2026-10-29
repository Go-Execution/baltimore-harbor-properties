alter table public.maintenance_tickets add column if not exists reservation_id text references public.reservations(id) on delete set null;
create index if not exists maintenance_tickets_reservation_id_idx on public.maintenance_tickets (reservation_id);

create table if not exists public.property_owners (
  property_id bigint primary key references public.properties(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now()
);
alter table public.property_owners enable row level security;
create index if not exists property_owners_owner_id_idx on public.property_owners (owner_id);
create policy "Owners can view own assignments" on public.property_owners for select to authenticated using (auth.uid() = owner_id or public.is_admin());
create policy "Admins can manage owner assignments" on public.property_owners for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Owners can view own approvals" on public.owner_approvals;
create policy "Owners can view own approvals" on public.owner_approvals
  for select to authenticated using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "Owners can update approval status" on public.owner_approvals;
create policy "Owners can update approval status" on public.owner_approvals
  for update to authenticated using (auth.uid() = owner_id or public.is_admin())
  with check (auth.uid() = owner_id or public.is_admin());

drop policy if exists "Owners can view assigned reservations" on public.reservations;
create policy "Owners can view assigned reservations" on public.reservations
  for select to authenticated using (
    exists (select 1 from public.property_owners where property_owners.property_id = reservations.property_id and property_owners.owner_id = auth.uid())
  );

create table if not exists public.owner_blackouts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  property_id bigint not null references public.properties(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint owner_blackout_dates_valid check (end_date > start_date)
);

alter table public.owner_blackouts drop constraint if exists owner_blackouts_no_overlap;
alter table public.owner_blackouts add constraint owner_blackouts_no_overlap
  exclude using gist (property_id with =, daterange(start_date, end_date, '[)') with &&);

create or replace function public.prevent_reservation_blackout_conflict()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_table_name = 'reservations' then
    if new.status in ('Pending', 'Confirmed', 'Arriving Today', 'In-Stay')
      and new.property_id is not null and new.checkin_date is not null and new.checkout_date is not null
      and exists (select 1 from public.owner_blackouts b where b.property_id = new.property_id and daterange(b.start_date, b.end_date, '[)') && daterange(new.checkin_date, new.checkout_date, '[)'))
    then raise exception 'Reservation conflicts with owner blackout dates' using errcode = '23P01'; end if;
  else
    if exists (select 1 from public.reservations r where r.property_id = new.property_id and r.status in ('Pending', 'Confirmed', 'Arriving Today', 'In-Stay') and daterange(r.checkin_date, r.checkout_date, '[)') && daterange(new.start_date, new.end_date, '[)'))
    then raise exception 'Owner blackout conflicts with an active reservation' using errcode = '23P01'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists reservations_blackout_conflict on public.reservations;
create trigger reservations_blackout_conflict before insert or update of property_id, checkin_date, checkout_date, status on public.reservations
  for each row execute function public.prevent_reservation_blackout_conflict();
drop trigger if exists owner_blackout_reservation_conflict on public.owner_blackouts;
create trigger owner_blackout_reservation_conflict before insert or update of property_id, start_date, end_date on public.owner_blackouts
  for each row execute function public.prevent_reservation_blackout_conflict();

alter table public.owner_blackouts enable row level security;
create index if not exists owner_blackouts_owner_created_idx on public.owner_blackouts (owner_id, created_at desc);

drop policy if exists "Owners can view own blackouts" on public.owner_blackouts;
create policy "Owners can view own blackouts" on public.owner_blackouts
  for select to authenticated using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "Owners can create own blackouts" on public.owner_blackouts;
create policy "Owners can create own blackouts" on public.owner_blackouts
  for insert to authenticated with check (
    auth.uid() = owner_id and exists (select 1 from public.property_owners where property_owners.property_id = owner_blackouts.property_id and property_owners.owner_id = auth.uid())
  );

drop policy if exists "Owners can delete own blackouts" on public.owner_blackouts;
create policy "Owners can delete own blackouts" on public.owner_blackouts
  for delete to authenticated using (auth.uid() = owner_id or public.is_admin());
