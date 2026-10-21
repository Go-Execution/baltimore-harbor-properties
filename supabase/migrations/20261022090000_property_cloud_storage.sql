-- Baltimore Harbor Properties: cloud-backed inventory, settings, and image storage.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- The original profile policy queried profiles from inside a profiles policy,
-- causing PostgreSQL's "infinite recursion detected" error on public reads.
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Public can view active properties" on public.properties;
drop policy if exists "Admins can manage properties" on public.properties;
create policy "Public can view properties" on public.properties
  for select using (true);
create policy "Admins can create properties" on public.properties
  for insert to authenticated with check (public.is_admin());
create policy "Admins can update properties" on public.properties
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete properties" on public.properties
  for delete to authenticated using (public.is_admin());

create table if not exists public.site_settings (
  id text primary key default 'main',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_settings enable row level security;
drop policy if exists "Public can view site settings" on public.site_settings;
drop policy if exists "Admins can create site settings" on public.site_settings;
drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Public can view site settings" on public.site_settings
  for select using (true);
create policy "Admins can create site settings" on public.site_settings
  for insert to authenticated with check (public.is_admin());
create policy "Admins can update site settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (id, settings)
values (
  'main',
  '{"bannerEnabled":"true","bannerText":"Special Rates Available for 30+ Day Medical & Clinical Rotations — Inquire for Per-Diem Direct Invoicing.","contactPhone":"(410) 218-8462","contactEmail":"gonzalojouan@hotmail.com","agencyName":"Go Execution","agencyEmail":"info@goexecution.com","checkInTime":"3:00 PM","checkOutTime":"11:00 AM","quietHours":"10:00 PM - 8:00 AM"}'::jsonb
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  12582912,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view property images" on storage.objects;
drop policy if exists "Admins can upload property images" on storage.objects;
drop policy if exists "Admins can update property images" on storage.objects;
drop policy if exists "Admins can delete property images" on storage.objects;
create policy "Public can view property images" on storage.objects
  for select using (bucket_id = 'property-images');
create policy "Admins can upload property images" on storage.objects
  for insert to authenticated with check (bucket_id = 'property-images' and public.is_admin());
create policy "Admins can update property images" on storage.objects
  for update to authenticated using (bucket_id = 'property-images' and public.is_admin())
  with check (bucket_id = 'property-images' and public.is_admin());
create policy "Admins can delete property images" on storage.objects
  for delete to authenticated using (bucket_id = 'property-images' and public.is_admin());

-- Replace legacy remote covers with the self-hosted assets already shipped by the site.
update public.properties set cover_image = '/assets/media/chase/67074b93-cb25-4701-9d5d-6c370f42e34d_1660156994_1660241387--723b59f04d9d.webp' where id = 1;
update public.properties set cover_image = '/assets/media/chase/3bf0ded7-d02e-4fcf-b7d8-55cba7fc04ec_1660160940_1660241856--35827b13aa3f.jpg' where id = 2;
update public.properties set cover_image = '/assets/media/chase/1_1660242598--727f016a9fc9.jpg' where id = 3;

insert into public.properties (
  id, title, subtitle, neighborhood, address, price, cleaning_fee, tax_rate,
  guests, bedrooms, beds, bathrooms, sqft, rating, reviews_count, view_type,
  bed_type, cover_image, description, status, featured
)
values
  (4, 'Harbor Penthouse urban oasis. Convention center', 'Top-floor penthouse urban oasis with private terrace & free hospital shuttle', 'Fells Point', '812 S Thames Street, Baltimore, MD 21231', 165, 125, 0.095, 5, 2, 3, 2, 1350, 4.97, 64, 'Harbor & Cobblestone Vistas', 'King Master & Queen Guest', '/assets/media/chase/gonzalo-imgs_1660245425--ac06fdfbb5d3.jpg', 'Apt is an urban oasis located steps from the main Harbor, Convention Center, stadiums, hospitals, restaurants and grocery stores.', 'Active', false),
  (5, 'One bedroom in Baltimore harbor w/ indoor parking', 'Historic landmark residence with free hospital shuttle & reserved garage', 'Mount Vernon', '710 N Charles Street, Baltimore, MD 21201', 135, 95, 0.095, 3, 1, 2, 1, 900, 4.94, 31, 'Monument & Cultural District', 'Queen Bed & Sleeper Sofa', '/assets/media/chase/c591915f-4539-40f7-bc1e-5a03219a652e_1660166557_1660245566--b63f40871347.jpg', 'Beautiful newly renovated historic Baltimore landmark close to the harbor, museums, stadiums, hospitals, restaurants and shopping.', 'Active', false),
  (6, 'Magnificent Penthouse, Balto Harbor, Conv, Center', 'Ultra-luxury penthouse with 24/7 indoor garage, fitness gym & private lounge', 'Harbor East', '1000 Aliceanna Street, Baltimore, MD 21202', 245, 160, 0.095, 6, 2, 4, 2.5, 2100, 4.98, 72, 'Panoramic 180° Harbor Water View', '2 California Kings, 2 Twins', '/assets/media/chase/11_1660246603--c3fd203cda1f.jpg', 'Magnificent penthouse urban oasis located within steps of Baltimore Inner Harbor with secure parking and executive amenities.', 'Active', true),
  (7, 'Baltimore Harbor/ Conv. Center/Johns Hopkins/UMMC/', 'Spacious downtown residence with city skyline vistas & free hospital shuttle', 'Downtown', '201 N Charles Street, Baltimore, MD 21201', 169, 120, 0.095, 4, 2, 2, 2, 1250, 4.93, 46, 'Downtown Skyline Vistas', '2 Queen Beds', '/assets/media/chase/Untitled-1_1660248962--8e86a8458731.jpg', 'A spacious downtown Baltimore residence with beautiful city views and easy access to hospitals and the Convention Center.', 'Active', false),
  (8, 'Baltimore Harbor View Suite / Conv. Center / Hopkins', 'Sunlit harbor-view suite steps from Light Street & waterfront dining', 'Inner Harbor', '10 Light Street, Baltimore, MD 21202', 139, 95, 0.095, 3, 1, 2, 1, 920, 4.96, 39, 'Direct Harbor Water View', '1 Queen Bed, 1 Twin Daybed', '/assets/media/chase/fdb631fd-a9d3-4e17-ac9a-dabc665bc1f9_1660170329_1660256322--25bb5626ddcb.jpg', 'A spacious Inner Harbor suite with beautiful water views and convenient access to hospitals and the Convention Center.', 'Active', false),
  (9, 'Urban 1 bedroom in the heart of the Baltimore Harbor', 'Chic central harbor apartment within steps of Convention Center & stadiums', 'Inner Harbor', '100 S Charles Street, Baltimore, MD 21201', 139, 95, 0.095, 2, 1, 1, 1, 880, 4.91, 33, 'City Center Architecture', 'Queen Bed', '/assets/media/chase/3Cdinning2_1661521046--9b3b728be600.jpg', 'Urban one bedroom in the heart of Baltimore Harbor, ideal for medical rotations, corporate travelers and weekend getaways.', 'Active', false)
on conflict (id) do nothing;
