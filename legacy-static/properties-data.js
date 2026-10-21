/**
 * Baltimore Harbor Properties — Centralized Properties Data
 * Baltimore Executive & Furnished Stays
 */

const CSP_PROPERTIES = [
  {
    id: 1,
    title: "Quiet Retreat at Canton Square",
    subtitle: "Calm, private garden sanctuary with seamless self check-in",
    neighborhood: "Canton",
    address: "2904 O'Donnell Street, Baltimore, MD 21224",
    price: 99,
    cleaningFee: 85,
    taxRate: 0.095, // 9.5% MD Hospitality & Lodging Tax
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    sqft: 820,
    rating: 4.96,
    reviewsCount: 42,
    badges: ["Hopkins Preferred", "Garden Patio"],
    coverImage: "/assets/media/chase/5eca3b19-9431-47d2-b928-0a6a2b1f671e_1660155115_1660170093_1660669083_16--734b20ec703a.jpg",
    gallery: [
      "/assets/media/chase/5eca3b19-9431-47d2-b928-0a6a2b1f671e_1660155115_1660170093_1660669083_16--734b20ec703a.jpg",
      "/assets/media/chase/about--672b543223da.webp",
      "/assets/media/chase/about2--4890844138d1.webp",
      "/assets/media/unsplash/photo-1502672260266-1c1ef2d93688--98f0ac0a96f8.jpg",
      "/assets/media/unsplash/photo-1556911220-e15b29be8c8f--b12742d8587d.jpg"
    ],
    description: "A calm, thoughtfully appointed sanctuary located in the heart of historic Canton. Crafted for travelling physicians, remote executives, and independent explorers, this light-flooded home provides whisper-quiet nights just steps from O'Donnell Square's finest bakeries and the harbor promenade.",
    amenities: [
      { name: "High-Speed Fiber WiFi (600 Mbps)", icon: "📶", category: "Connectivity" },
      { name: "Dedicated Ergonomic Desk", icon: "💻", category: "Workspace" },
      { name: "Keyless Smart Lock Access", icon: "🔐", category: "Access" },
      { name: "Chef's Kitchen & Nespresso Bar", icon: "☕", category: "Kitchen" },
      { name: "In-Unit Washer & Dryer", icon: "🧺", category: "Laundry" },
      { name: "Private Courtyard Garden", icon: "🌿", category: "Outdoor" },
      { name: "Smart 55\" 4K TV (Streaming)", icon: "📺", category: "Entertainment" },
      { name: "Organic Cotton Linens & Robes", icon: "🛏️", category: "Comfort" },
      { name: "Central Climate Control (Nest)", icon: "❄️", category: "HVAC" },
      { name: "Pet Friendly (Upon Request)", icon: "🐾", category: "Pets" }
    ],
    commute: [
      { destination: "Johns Hopkins Bayview", time: "5 min drive" },
      { destination: "Johns Hopkins Hospital", time: "8 min drive" },
      { destination: "Canton Waterfront Park", time: "3 min walk" },
      { destination: "Inner Harbor Promenade", time: "7 min drive" }
    ]
  },
  {
    id: 2,
    title: "The Townhouse at Hudson Street",
    subtitle: "Characterful brick rowhome with private courtyard near Johns Hopkins",
    neighborhood: "Canton",
    address: "3037 Hudson Street, Baltimore, MD 21224",
    price: 149,
    cleaningFee: 110,
    taxRate: 0.095,
    guests: 4,
    bedrooms: 2,
    beds: 3,
    bathrooms: 1.5,
    sqft: 1450,
    rating: 4.98,
    reviewsCount: 68,
    badges: ["Flagship Stay", "Hopkins Preferred", "Private Courtyard"],
    coverImage: "/assets/media/chase/hudsonliving_1661518528_1661532267--2efdc5522fd6.jpg",
    gallery: [
      "/assets/media/chase/hudsonliving_1661518528_1661532267--2efdc5522fd6.jpg",
      "/assets/media/chase/about--672b543223da.webp",
      "/assets/media/chase/about2--4890844138d1.webp",
      "/assets/media/unsplash/photo-1600585154340-be6161a56a0c--e705a536f2a6.jpg",
      "/assets/media/unsplash/photo-1584622650111-993a426fbf0a--4e3a48974b6c.jpg"
    ],
    description: "The signature flagship rowhome of Baltimore Harbor Properties. Beautifully restored with exposed red brick, rich hardwood floors, an expansive chef's kitchen, and a private brick patio for sunset dinners. Situated along vibrant Hudson Street, offering effortless proximity to Johns Hopkins medical campuses.",
    amenities: [
      { name: "Gigabit Fiber WiFi (1000 Mbps)", icon: "📶", category: "Connectivity" },
      { name: "Dedicated 32\" 4K Workspace", icon: "💻", category: "Workspace" },
      { name: "Smart Keyless Lock with Touchscreen", icon: "🔐", category: "Access" },
      { name: "Chef's Kitchen with Gas Range & Wine Cooler", icon: "🍷", category: "Kitchen" },
      { name: "High-Capacity In-Unit Laundry", icon: "🧺", category: "Laundry" },
      { name: "Private Fenced Brick Courtyard", icon: "🪴", category: "Outdoor" },
      { name: "Sonos Multi-Room Sound System", icon: "🎵", category: "Entertainment" },
      { name: "Plush King Bed & Goose Down Duvet", icon: "🛏️", category: "Comfort" },
      { name: "Reserved Dedicated Parking Pad", icon: "🚗", category: "Parking" },
      { name: "24/7 Local Concierge Support", icon: "🛎️", category: "Hospitality" }
    ],
    commute: [
      { destination: "Johns Hopkins Bayview", time: "6 min drive" },
      { destination: "Johns Hopkins Main Hospital", time: "9 min drive" },
      { destination: "Patterson Park", time: "4 min walk" },
      { destination: "O'Donnell Square Dining", time: "2 min walk" }
    ]
  },
  {
    id: 3,
    title: "Harbor House at Pratt",
    subtitle: "Spacious downtown residence close to Convention Center & stadiums",
    neighborhood: "Inner Harbor",
    address: "712 E Pratt Street, Baltimore, MD 21202",
    price: 189,
    cleaningFee: 135,
    taxRate: 0.095,
    guests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    sqft: 1950,
    rating: 4.95,
    reviewsCount: 54,
    badges: ["Rooftop Deck", "Waterfront Skyline"],
    coverImage: "/assets/media/chase/6acf57d7-4d5c-403c-ab68-fccffbd1828a_1660161150--9d11068f3b3e.webp",
    gallery: [
      "/assets/media/chase/6acf57d7-4d5c-403c-ab68-fccffbd1828a_1660161150--9d11068f3b3e.webp",
      "/assets/media/chase/usa-maryland-baltimore-inner-harbor_1691259038--957298fcc60f.jpg",
      "/assets/media/unsplash/photo-1512917774080-9991f1c4c750--25cc0a4415ec.jpg",
      "/assets/media/unsplash/photo-1616486338812-3dadae4b4ace--9c13e85423bf.jpg",
      "/assets/media/unsplash/photo-1507089947368-19c1da9775ae--44be73c146cf.jpg"
    ],
    description: "An expansive executive residence with a private rooftop deck offering sweeping vistas of the Baltimore Inner Harbor. Perfect for project teams, medical consultants, and discerning families desiring effortless walking access to the waterfront promenade, downtown businesses, and world-class dining.",
    amenities: [
      { name: "Private Rooftop Deck with Harbor View", icon: "🏙️", category: "Outdoor" },
      { name: "High-Speed Mesh WiFi (500 Mbps)", icon: "📶", category: "Connectivity" },
      { name: "Executive Dual-Monitor Workstation", icon: "💻", category: "Workspace" },
      { name: "Attached Private Garage Parking", icon: "🚗", category: "Parking" },
      { name: "Dual En-Suite Bathrooms", icon: "🚿", category: "Comfort" },
      { name: "Full Island Kitchen with Dishwasher", icon: "🍳", category: "Kitchen" },
      { name: "Full-Size Washer & Dryer", icon: "🧺", category: "Laundry" },
      { name: "Smart Keyless Keypad Lock", icon: "🔐", category: "Access" },
      { name: "65\" OLED TV with Cable & Apps", icon: "📺", category: "Entertainment" },
      { name: "Pet Friendly Accommodation", icon: "🐾", category: "Pets" }
    ],
    commute: [
      { destination: "Baltimore Convention Center", time: "5 min walk" },
      { destination: "National Aquarium", time: "3 min walk" },
      { destination: "University of MD Medical Center", time: "6 min drive" },
      { destination: "Camden Yards (Orioles Park)", time: "7 min drive" }
    ]
  },
  {
    id: 4,
    title: "The Captain's Loft on Thames",
    subtitle: "Historic cobblestone waterfront loft with timber beams & water taxi access",
    neighborhood: "Fells Point",
    address: "1618 Thames Street, Baltimore, MD 21231",
    price: 165,
    cleaningFee: 95,
    taxRate: 0.095,
    guests: 3,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    sqft: 1150,
    rating: 4.97,
    reviewsCount: 39,
    badges: ["Waterfront Historic", "Water Taxi Step-Out"],
    coverImage: "/assets/media/unsplash/photo-1560448204-e02f11c3d0e2--ef4b1c91720a.jpg",
    gallery: [
      "/assets/media/unsplash/photo-1560448204-e02f11c3d0e2--ef4b1c91720a.jpg",
      "/assets/media/unsplash/photo-1502672260266-1c1ef2d93688--98f0ac0a96f8.jpg",
      "/assets/media/chase/usa-maryland-baltimore-inner-harbor_1691259038--957298fcc60f.jpg",
      "/assets/media/unsplash/photo-1600585154340-be6161a56a0c--e705a536f2a6.jpg",
      "/assets/media/unsplash/photo-1556911220-e15b29be8c8f--b12742d8587d.jpg"
    ],
    description: "Perched above the historic cobblestones of Thames Street, this maritime loft pairs late-19th-century exposed wood and masonry with refined Danish modern interiors. Step out your door onto the waterfront promenade or catch the Baltimore Water Taxi across the harbor.",
    amenities: [
      { name: "Direct Cobblestone Harbor Views", icon: "⛵", category: "View" },
      { name: "Gigabit High-Speed Internet", icon: "📶", category: "Connectivity" },
      { name: "14-ft Vaulted Timber Ceilings", icon: "🏛️", category: "Architecture" },
      { name: "Acoustic Triple-Glazed Soundproof Glass", icon: "🔇", category: "Comfort" },
      { name: "Rainfall Shower & Soaking Tub", icon: "🛁", category: "Bath" },
      { name: "Espresso & Pour-Over Coffee Bar", icon: "☕", category: "Kitchen" },
      { name: "Water Taxi Pier at Doorstep", icon: "🚤", category: "Transit" },
      { name: "Keyless Touchscreen Entry", icon: "🔐", category: "Access" },
      { name: "Dedicated Laptop Workstation", icon: "💻", category: "Workspace" },
      { name: "In-Unit Washer & Dryer", icon: "🧺", category: "Laundry" }
    ],
    commute: [
      { destination: "Fells Point Water Taxi Stop", time: "1 min walk" },
      { destination: "Johns Hopkins Hospital", time: "7 min drive" },
      { destination: "Harbor East Luxury Boutiques", time: "4 min walk" },
      { destination: "Downtown Financial District", time: "8 min drive" }
    ]
  },
  {
    id: 5,
    title: "The Peabody Heritage Residence",
    subtitle: "Cultural district elegance with 14-foot ceilings near Penn Station",
    neighborhood: "Mount Vernon",
    address: "814 Cathedral Street, Baltimore, MD 21201",
    price: 135,
    cleaningFee: 90,
    taxRate: 0.095,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    sqft: 1020,
    rating: 4.99,
    reviewsCount: 48,
    badges: ["Cultural District", "Penn Station MARC/Amtrak"],
    coverImage: "/assets/media/unsplash/photo-1600210492486-724fe5c67fb0--6650d8d6a74e.jpg",
    gallery: [
      "/assets/media/unsplash/photo-1600210492486-724fe5c67fb0--6650d8d6a74e.jpg",
      "/assets/media/chase/maryland-top-attractions-walters-art-museum-staircase--95b6d790caea.jpg",
      "/assets/media/unsplash/photo-1584622650111-993a426fbf0a--4e3a48974b6c.jpg",
      "/assets/media/unsplash/photo-1512917774080-9991f1c4c750--25cc0a4415ec.jpg",
      "/assets/media/unsplash/photo-1616486338812-3dadae4b4ace--9c13e85423bf.jpg"
    ],
    description: "Located in Baltimore's historic Mount Vernon cultural quarter, this residence boasts majestic 14-foot ceilings, period molding, and museum-grade finishes. Only a short stroll to Penn Station for painless DC or NYC rail commutes.",
    amenities: [
      { name: "14ft Soaring Ceilings & Period Plaster", icon: "🏛️", category: "Architecture" },
      { name: "Quiet Library Study with Executive Desk", icon: "📚", category: "Workspace" },
      { name: "Ultra-Fast Fiber WiFi (800 Mbps)", icon: "📶", category: "Connectivity" },
      { name: "Sub-Zero Refrigerator & Induction Range", icon: "🍳", category: "Kitchen" },
      { name: "Carrara Marble Tiled Bath", icon: "🚿", category: "Bath" },
      { name: "Keyless Electronic PIN Entry", icon: "🔐", category: "Access" },
      { name: "European Percale Bedding & Down Pillows", icon: "🛏️", category: "Comfort" },
      { name: "In-Unit High-Efficiency Laundry", icon: "🧺", category: "Laundry" },
      { name: "Smart TV with Premium Soundbar", icon: "📺", category: "Entertainment" },
      { name: "Central Climate Control", icon: "❄️", category: "HVAC" }
    ],
    commute: [
      { destination: "Walters Art Museum", time: "2 min walk" },
      { destination: "Peabody Conservatory", time: "3 min walk" },
      { destination: "Penn Station (Amtrak / MARC)", time: "5 min walk" },
      { destination: "University of MD Medical Center", time: "7 min drive" }
    ]
  },
  {
    id: 6,
    title: "The Aliceanna Skyline Penthouse",
    subtitle: "Harbor East luxury penthouse with private terrace & 24/7 concierge",
    neighborhood: "Harbor East",
    address: "1000 Aliceanna Street, Baltimore, MD 21202",
    price: 245,
    cleaningFee: 150,
    taxRate: 0.095,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2.5,
    sqft: 1750,
    rating: 5.0,
    reviewsCount: 31,
    badges: ["Luxury Penthouse", "24/7 Doorman", "Private Terrace"],
    coverImage: "/assets/media/unsplash/photo-1545324418-cc1a3fa10c00--b7a3cd9e1695.jpg",
    gallery: [
      "/assets/media/unsplash/photo-1545324418-cc1a3fa10c00--b7a3cd9e1695.jpg",
      "/assets/media/unsplash/photo-1512917774080-9991f1c4c750--25cc0a4415ec.jpg",
      "/assets/media/chase/usa-maryland-baltimore-inner-harbor_1691259038--957298fcc60f.jpg",
      "/assets/media/unsplash/photo-1600585154340-be6161a56a0c--e705a536f2a6.jpg",
      "/assets/media/unsplash/photo-1584622650111-993a426fbf0a--4e3a48974b6c.jpg"
    ],
    description: "The pinnacle of Harbor East luxury. Floor-to-ceiling glass reveals breathtaking sunrises over the Patapsco River and sparkling night views of Baltimore's iconic skyline. Unmatched proximity to Michelin-caliber dining, Whole Foods, and premier corporate offices.",
    amenities: [
      { name: "Private Wrap-Around Panoramic Balcony", icon: "🌅", category: "View" },
      { name: "24/7 Front Desk Doorman & Security", icon: "👮", category: "Security" },
      { name: "Underground Reserved Stall with EV Charger", icon: "⚡", category: "Parking" },
      { name: "Wolf & Sub-Zero Gourmet Kitchen", icon: "🍷", category: "Kitchen" },
      { name: "Deep Soaking Tub with Water Views", icon: "🛁", category: "Bath" },
      { name: "In-Unit Peloton Stationary Bike", icon: "🚴", category: "Fitness" },
      { name: "Gigabit High-Speed Mesh WiFi", icon: "📶", category: "Connectivity" },
      { name: "Custom Dual Ergonomic Workspace", icon: "💻", category: "Workspace" },
      { name: "Dual King Suites with Walk-In Closets", icon: "🛏️", category: "Comfort" },
      { name: "Full Laundry Room in Suite", icon: "🧺", category: "Laundry" }
    ],
    commute: [
      { destination: "Whole Foods Market", time: "1 min walk" },
      { destination: "Harbor East Promenade & Dining", time: "1 min walk" },
      { destination: "Johns Hopkins Hospital", time: "6 min drive" },
      { destination: "Inner Harbor Waterfront", time: "4 min walk" }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSP_PROPERTIES;
}
