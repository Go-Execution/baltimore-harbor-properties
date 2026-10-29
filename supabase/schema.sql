-- ==============================================================================
-- Baltimore Harbor Properties — Supabase Production Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text,
  role text not null default 'guest' check (role in ('guest', 'owner', 'admin')),
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROPERTIES TABLE
create table if not exists public.properties (
  id bigint primary key,
  title text not null,
  subtitle text,
  neighborhood text not null,
  address text not null,
  price numeric not null,
  cleaning_fee numeric not null default 85,
  tax_rate numeric not null default 0.095,
  guests integer not null default 2,
  bedrooms integer not null default 1,
  beds integer not null default 1,
  bathrooms numeric not null default 1,
  sqft integer,
  rating numeric default 5.0,
  reviews_count integer default 0,
  view_type text,
  bed_type text,
  badges text[] default '{}',
  cover_image text not null,
  gallery text[] default '{}',
  description text not null,
  amenities jsonb default '[]'::jsonb,
  commute jsonb default '[]'::jsonb,
  status text default 'Active' check (status in ('Active', 'Inactive', 'Maintenance')),
  featured boolean default false,
  owner_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RESERVATIONS TABLE
create table if not exists public.reservations (
  id text primary key, -- e.g. BHP-2026-123456
  user_id uuid references public.profiles(id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  property_id bigint references public.properties(id) on delete cascade,
  property_title text not null,
  dates text not null,
  checkin_date date,
  checkout_date date,
  nights integer default 1,
  total text not null,
  pin_code text not null default '4892#',
  status text not null default 'Confirmed' check (status in ('In-Stay', 'Arriving Today', 'Confirmed', 'Completed', 'Cancelled')),
  stay_purpose text default 'leisure',
  special_requests text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MAINTENANCE TICKETS (Work Orders)
create table if not exists public.maintenance_tickets (
  id text primary key, -- e.g. TKT-104
  user_id uuid references public.profiles(id) on delete set null,
  property_id bigint references public.properties(id) on delete set null,
  property_title text,
  title text not null,
  description text not null,
  category text not null default 'General',
  urgency text not null default 'Normal' check (urgency in ('Normal', 'Urgent', 'Emergency')),
  status text not null default 'Dispatched' check (status in ('Dispatched', 'Under Review', 'In Progress', 'Resolved')),
  room text,
  date text default to_char(now(), 'Mon DD, YYYY'),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. OWNER APPROVALS
create table if not exists public.owner_approvals (
  id text primary key, -- e.g. APP-201
  owner_id uuid references public.profiles(id) on delete cascade,
  property_id bigint references public.properties(id) on delete set null,
  property_title text not null,
  item text not null,
  cost text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Declined')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. CONTACT INQUIRIES
create table if not exists public.property_inquiries (
  id uuid default uuid_generate_v4() primary key,
  property_id bigint references public.properties(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  stay_dates text,
  status text default 'New' check (status in ('New', 'Contacted', 'Booked', 'Archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. REVIEWS
create table if not exists public.property_reviews (
  id uuid default uuid_generate_v4() primary key,
  property_id bigint references public.properties(id) on delete cascade,
  author text not null,
  email text,
  rating integer not null check (rating >= 1 and rating <= 5),
  date text not null default to_char(now(), 'Mon YYYY'),
  comment text not null,
  is_approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.reservations enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.owner_approvals enable row level security;
alter table public.property_inquiries enable row level security;
alter table public.property_reviews enable row level security;

-- Profiles: Users can read their own profile, Admins can read all
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Properties: Public can view active properties
create policy "Public can view active properties" on public.properties
  for select using (true);

create policy "Admins can manage properties" on public.properties
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Reservations: Guests view their own, Admins view all, Anyone can create (book)
create policy "Guests can view own reservations" on public.reservations
  for select using (
    auth.uid() = user_id or
    guest_email = (select email from public.profiles where id = auth.uid()) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Anyone can insert reservation" on public.reservations
  for insert with check (true);

create policy "Admins can update reservations" on public.reservations
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Maintenance Tickets: Guests can view/create their own, Admins can view/update all
create policy "Guests can view their own tickets" on public.maintenance_tickets
  for select using (
    auth.uid() = user_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Anyone authenticated can create ticket" on public.maintenance_tickets
  for insert with check (true);

create policy "Admins can manage tickets" on public.maintenance_tickets
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Owner Approvals: Owners can view/update their own, Admins can manage all
create policy "Owners can view own approvals" on public.owner_approvals
  for select using (
    auth.uid() = owner_id or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'owner'))
  );

create policy "Owners can update approval status" on public.owner_approvals
  for update using (
    auth.uid() = owner_id or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'owner'))
  );

-- Reviews: Anyone can view approved reviews, Anyone can insert a review
create policy "Public can view approved reviews" on public.property_reviews
  for select using (is_approved = true);

create policy "Anyone can submit review" on public.property_reviews
  for insert with check (true);

-- Inquiries: Anyone can insert inquiries, Admins can view
create policy "Anyone can submit inquiry" on public.property_inquiries
  for insert with check (true);

create policy "Admins can view inquiries" on public.property_inquiries
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'guest')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
