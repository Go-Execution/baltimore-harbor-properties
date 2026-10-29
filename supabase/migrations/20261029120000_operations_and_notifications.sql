create extension if not exists btree_gist;

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
    and status in ('Pending', 'Confirmed', 'Arriving Today', 'In-Stay')
  );

drop policy if exists "Admins can update inquiries" on public.property_inquiries;
create policy "Admins can update inquiries" on public.property_inquiries
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all reviews" on public.property_reviews;
create policy "Admins can view all reviews" on public.property_reviews
  for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can moderate reviews" on public.property_reviews;
create policy "Admins can moderate reviews" on public.property_reviews
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete reviews" on public.property_reviews;
create policy "Admins can delete reviews" on public.property_reviews
  for delete to authenticated
  using (public.is_admin());

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  recipient text not null,
  subject text not null,
  html_body text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Sent', 'Failed')),
  provider_message_id text,
  attempts integer not null default 0,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.notification_outbox enable row level security;
create index if not exists notification_outbox_status_created_idx on public.notification_outbox (status, created_at desc);

drop policy if exists "Admins can view notification outbox" on public.notification_outbox;
create policy "Admins can view notification outbox" on public.notification_outbox
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can update notification outbox" on public.notification_outbox;
create policy "Admins can update notification outbox" on public.notification_outbox
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
