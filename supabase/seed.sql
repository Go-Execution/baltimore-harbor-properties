-- ==============================================================================
-- Baltimore Harbor Properties — Supabase Initial Seed Data
-- ==============================================================================

-- Seed properties
insert into public.properties (id, title, subtitle, neighborhood, address, price, cleaning_fee, guests, bedrooms, beds, bathrooms, sqft, rating, reviews_count, view_type, bed_type, badges, cover_image, description, status, featured)
values
(
  1,
  'Cozy & quiet retreat, 24/7 self-check in.',
  'Calm, private sanctuary in a 3.5-acre wooded yard with keypad entry',
  'Catonsville',
  'Catonsville, Maryland, United States',
  99,
  85,
  2,
  1,
  1,
  1,
  850,
  5.0,
  28,
  'Garden view',
  'Queen bed',
  array['Hopkins Preferred', '24/7 Keypad', 'Free Parking'],
  'https://baltimore-harbor-properties.vercel.app/assets/media/chase/67074b93-cb25-4701-9d5d-6c370f42e34d_1660156994_1660241387--723b59f04d9d.webp',
  'Cozy & quiet retreat located in a 3.5 acres of beautiful wooded yard, 24/7 self-check in. House & all linens professionally cleaned and sanitized after each guest. Located few minutes from Old Town Ellicott City, restaurants, coffee shops, grocery store, and local artist craft shops.',
  'Active',
  true
),
(
  2,
  'Fantastic Canton Home/Johns Hopkins/Bay View.',
  'Large, sunny townhome 3 blocks from harbor waterfront & Patterson Park',
  'Canton',
  '3037 Hudson Street, Baltimore, MD 21224',
  149,
  110,
  4,
  2,
  3,
  1.5,
  1400,
  4.95,
  52,
  'Historic Canton Brick View',
  'King & Queen Beds',
  array['Superhost', 'Patterson Park', 'Hopkins Fellow Choice'],
  'https://baltimore-harbor-properties.vercel.app/assets/media/chase/3bf0ded7-d02e-4fcf-b7d8-55cba7fc04ec_1660160940_1660241856--35827b13aa3f.jpg',
  'Large, sunny town home in the most upscale Harbor neighborhood, Canton. Three blocks from the water front, steps from restaurants, shops, grocery store and Patterson Park. House & all linens professionally cleaned and sanitized after each guest.',
  'Active',
  true
),
(
  3,
  'Baltimore Convention Center/Harbor/ Johns Hopkins',
  'Spacious multi-bedroom harbor flat near Camden Yards & Convention Center',
  'Inner Harbor',
  '300 W Pratt Street, Baltimore, MD 21201',
  189,
  140,
  6,
  3,
  6,
  2,
  1850,
  4.92,
  38,
  'Downtown Harbor Skyline',
  '1 King, 2 Queens, 2 Twins',
  array['Convention Center', 'Waterfront', 'Group & Family Ready'],
  'https://baltimore-harbor-properties.vercel.app/assets/media/chase/1_1660242598--727f016a9fc9.jpg',
  'Very large, sunny and modern executive residence steps from the Convention Center, stadiums and Inner Harbor waterfront promenade. Easy walking distance to Camden Yards, M&T Bank Stadium, and light rail.',
  'Active',
  true
)
on conflict (id) do nothing;

-- Seed initial reservations
insert into public.reservations (id, guest_name, guest_email, guest_phone, property_id, property_title, dates, total, pin_code, status, nights)
values
('CSP-2026-8941', 'Aaron Miller (Johns Hopkins Fellow)', 'aaron.miller@jhmi.edu', '(410) 555-0192', 2, 'Fantastic Canton Home/Johns Hopkins/Bay View.', 'Oct 14 – Oct 28, 2026', '$3,440.00', '4892#', 'In-Stay', 14),
('CSP-2026-8955', 'Dr. Sarah Jenkins (Visiting Specialist)', 's.jenkins@umm.edu', '(443) 555-0144', 1, 'Cozy & quiet retreat, 24/7 self-check in.', 'Oct 15 – Oct 22, 2026', '$1,925.00', '3184#', 'Arriving Today', 7),
('CSP-2026-8970', 'Marcus Vance (T. Rowe Price Exec)', 'm.vance@troweprice-corp.com', '(202) 555-0118', 3, 'Baltimore Convention Center/Harbor/ Johns Hopkins', 'Oct 18 – Oct 25, 2026', '$3,185.00', '7721#', 'Confirmed', 7)
on conflict (id) do nothing;

-- Seed initial maintenance tickets
insert into public.maintenance_tickets (id, property_id, property_title, title, description, category, urgency, status, date)
values
('TKT-104', 2, 'Fantastic Canton Home', 'HVAC Filter & Thermostat Calibration', 'Routine filter replacement and Nest thermostat check', 'HVAC', 'Normal', 'Dispatched', 'Oct 13, 2026'),
('TKT-089', 2, 'Fantastic Canton Home', 'Additional Down Pillows Request', 'Two additional hypoallergenic down pillows for master bedroom', 'Housekeeping', 'Normal', 'Resolved', 'Oct 12, 2026')
on conflict (id) do nothing;

-- Seed initial owner approvals
insert into public.owner_approvals (id, property_title, item, cost, status)
values
('APP-201', '3037 Hudson St', 'Winter Furnace Inspection & Filter Replacement', '$180.00', 'Pending'),
('APP-198', '2904 O''Donnell St', 'Balcony Deck Sealant & Power Wash', '$240.00', 'Approved')
on conflict (id) do nothing;
