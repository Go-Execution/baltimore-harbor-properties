-- Route public forms through validated server endpoints instead of direct anonymous writes.
alter table public.property_inquiries add column if not exists source text not null default 'website';
alter table public.property_inquiries add column if not exists metadata jsonb not null default '{}'::jsonb;
create index if not exists property_inquiries_email_created_idx on public.property_inquiries (email, created_at desc);
create index if not exists property_reviews_email_created_idx on public.property_reviews (email, created_at desc);
create index if not exists reservations_email_created_idx on public.reservations (guest_email, created_at desc);

alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check
  check (status in ('Pending', 'In-Stay', 'Arriving Today', 'Confirmed', 'Completed', 'Cancelled'));

drop policy if exists "Anyone can insert reservation" on public.reservations;
drop policy if exists "Anyone can submit review" on public.property_reviews;
drop policy if exists "Anyone can submit inquiry" on public.property_inquiries;
drop policy if exists "Anyone authenticated can create ticket" on public.maintenance_tickets;

create policy "Authenticated guests can create own tickets" on public.maintenance_tickets
  for insert to authenticated
  with check (auth.uid() = user_id);
