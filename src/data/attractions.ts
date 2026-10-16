export interface BaltimoreAttraction {
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  commuteTime: string;
  address: string;
  hours: string;
  admission: string;
  heroImage: string;
  gallery: string[];
  summary: string;
  fullDescription: string[];
  visitorHighlights: string[];
  insiderTips: string[];
  nearbyNeighborhood: string;
  nearbyPropertyIds: number[];
}

export const ATTRACTIONS: BaltimoreAttraction[] = [
  {
    slug: 'inner-harbor',
    number: '01',
    title: 'Baltimore Inner Harbor & Waterfront Promenade',
    subtitle: '7 Miles of Brick Harbor Walkways · Historic Tall Ships · Waterfront Dining',
    category: 'Waterfront & Maritime',
    badge: 'Iconic Baltimore',
    commuteTime: '6–8 min drive or direct Water Taxi',
    address: 'Light St & Pratt St, Baltimore, MD 21202',
    hours: 'Open 24/7 · Retail & museums generally 10:00 AM – 6:00 PM',
    admission: 'Waterfront Promenade Free · Ship & museum passes vary ($12–$24)',
    heroImage: 'https://www.chasestreetproperties.net/uploads/things_to_do/1/usa-maryland-baltimore-inner-harbor_1691259038.jpg',
    gallery: [
      'https://www.chasestreetproperties.net/uploads/things_to_do/1/usa-maryland-baltimore-inner-harbor_1691259038.jpg',
      'https://www.chasestreetproperties.net/images/bg.webp',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    ],
    summary:
      "Baltimore's Inner Harbor is a world-famous cultural epicenter, filled with attractions, waterfront promenades, historic ships, and waterfront dining options.",
    fullDescription: [
      "Baltimore's Inner Harbor is a magnet for visitors and residents alike, filled with attractions, waterfront promenades, and world-class entertainment options. The whole area and the neighborhoods just back from the water have been beautifully developed with parks, hotels, restaurants, shops, and maritime museums.",
      'Foremost among the historic ships permanently docked here is the sloop-of-war USS Constellation, a storied three-masted sailing ship that saw action in the Civil War and intercepted slave ships off the African coast. Visitors can walk the ship decks and experience 19th-century naval history up close.',
      'The brick waterfront promenade extends continuously for 7 miles, connecting the Inner Harbor to Harbor East, historic Fells Point, and Canton Waterfront Park. It serves as Baltimore’s favorite scenic running, strolling, and biking path.',
    ],
    visitorHighlights: [
      'USS Constellation & Historic Ships in Baltimore (Lightship Chesapeake, Submarine Torsk)',
      'Scenic 7-mile brick promenade perfect for morning jogs and sunset walks',
      'Harborplace amphitheater with weekend outdoor acoustic concerts',
      'Baltimore Water Taxi terminal connecting to Fells Point and Fort McHenry',
      'Pratt Street dining corridor featuring prime seafood and craft oyster bars',
    ],
    insiderTips: [
      'Catch the Water Taxi at sunset from Pratt Street Pier for the finest panoramic views of the illuminated Baltimore skyline.',
      'Pick up fresh morning espresso and croissants from nearby Harbor East bakeries before taking an early morning harbor walk.',
      'Stay at our Pratt Street or Light Street residences to be within a 3-minute walk of the waterfront promenade.',
    ],
    nearbyNeighborhood: 'Inner Harbor',
    nearbyPropertyIds: [3, 7, 8, 9],
  },
  {
    slug: 'walters-art-museum',
    number: '02',
    title: 'The Walters Art Museum',
    subtitle: 'Mount Vernon Cultural District · 36,000 Works of World Art Across 7 Millennia',
    category: 'Art & Cultural Heritage',
    badge: 'Free Admission Daily',
    commuteTime: '10 min drive or direct Metro',
    address: '600 N Charles St, Baltimore, MD 21201',
    hours: 'Wednesday – Sunday: 10:00 AM – 5:00 PM (Thursdays open late until 8:00 PM)',
    admission: '100% Free General Admission for all visitors every day',
    heroImage: 'https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-walters-art-museum-staircase.jpg',
    gallery: [
      'https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-walters-art-museum-staircase.jpg',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    ],
    summary:
      'A globally acclaimed cultural landmark housing 36,000 treasures spanning ancient Egypt, Greek sculpture, medieval armor, and 19th-century masterworks with free daily admission.',
    fullDescription: [
      "In Baltimore’s Mount Vernon Cultural District, The Walters Art Museum is a unique cultural landmark and one of only a handful of institutions in the world that presents such a comprehensive history of world art. Covering all media of art from the third millennium B.C. through the early 20th century, the collections are best known for exceptional jewelry, enamels, ivories, and Roman bronzes.",
      'Housed within a series of interconnected historic structures, including an Italian Renaissance palazzo inspired by Genoa’s Palazzo Balbi, the museum features a breathtaking marble grand staircase and intimate skylit galleries.',
      'From Greek bronze helmets and Fabergé eggs to French impressionist oil paintings and illuminated medieval manuscripts, the Walters offers an unhurried, museum-quality encounter with human civilization.',
    ],
    visitorHighlights: [
      'Free general admission year-round—no ticket required',
      'World-famous medieval armor and weapons collection',
      'Exquisite 19th-century jewelry by René Lalique and Tiffany & Co.',
      'Magnificent Renaissance palazzo central courtyard and staircase',
      'Chamber of Art and Curiosities (Wunderkammer)',
    ],
    insiderTips: [
      'Visit on Thursday evenings when the museum stays open until 8:00 PM for peaceful, crowd-free gallery walks.',
      'Stroll across Mount Vernon Place to see the original Washington Monument, erected decades before DC’s obelisk.',
      'Our Cathedral Street loft is located just 2 blocks away in historic Mount Vernon.',
    ],
    nearbyNeighborhood: 'Mount Vernon',
    nearbyPropertyIds: [5, 7, 8],
  },
  {
    slug: 'fort-mchenry',
    number: '03',
    title: 'Fort McHenry National Monument & Historic Shrine',
    subtitle: 'Birthplace of The Star-Spangled Banner · Star-Shaped Harbor Ramparts',
    category: 'American History & Parks',
    badge: 'National Icon',
    commuteTime: '10 min drive or harbor water taxi',
    address: '2400 E Fort Ave, Baltimore, MD 21230',
    hours: 'Daily: 9:00 AM – 5:00 PM (Park grounds open until sunset)',
    admission: '$15 per adult (Ages 15 & under Free) · Park grounds free to walk',
    heroImage: 'https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-fort-mchenry-national-monument.jpg',
    gallery: [
      'https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-fort-mchenry-national-monument.jpg',
      'https://www.chasestreetproperties.net/uploads/things_to_do/1/usa-maryland-baltimore-inner-harbor_1691259038.jpg',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    summary:
      'The legendary pentagonal harbor fortress where American soldiers repelled British forces in 1814, inspiring Francis Scott Key to write the US National Anthem.',
    fullDescription: [
      "Completed in 1803 to guard the entrance to Baltimore’s busy harbor, Fort McHenry became a national icon after withstanding a fierce 24-hour bombardment by the British Royal Navy during the Battle of Baltimore in September 1814.",
      'The fort’s heroic defense saved Baltimore from foreign capture and inspired lawyer Francis Scott Key, who watched the bombardment from an enemy truce ship, to pen the immortal lines of The Star-Spangled Banner.',
      'Today, visitors can walk the star-shaped ramparts, inspect historic bronze cannons, tour authentic barracks and powder magazines, and witness flag change ceremonies with historical reenactors against the backdrop of Baltimore’s working harbor.',
    ],
    visitorHighlights: [
      'Star-shaped pentagonal masonry fortress with panoramic harbor views',
      'Daily ceremonial full-size 30x42-foot Garrison Flag raising',
      'Paved waterfront walking trail encircling Locust Point peninsula',
      'Visitor center film and original Battle of Baltimore artifacts',
      'Direct Water Taxi connection from Fells Point pier',
    ],
    insiderTips: [
      'Take the walking loop around the seawall early in the morning for uninterrupted sea breezes and watching container ships enter harbor.',
      'Hop on the Baltimore Water Taxi from Fells Point Thames Street directly to Fort McHenry for a scenic maritime transit.',
      'Our Thames Street and Canton residences provide rapid 7–10 minute access.',
    ],
    nearbyNeighborhood: 'Fells Point',
    nearbyPropertyIds: [2, 4, 1],
  },
  {
    slug: 'patterson-park',
    number: '04',
    title: 'Patterson Park & The Victorian Pagoda',
    subtitle: "Canton's 155-Acre Green Sanctuary · Jogging Loops · Sunday Farmers Market",
    category: 'Parks & Recreation',
    badge: "Canton's Heart",
    commuteTime: '3–5 min walk from Hudson & O\'Donnell Stays',
    address: '2601 E Baltimore St, Baltimore, MD 21224',
    hours: 'Open daily from sunrise to sunset (6:00 AM – 10:00 PM)',
    admission: '100% Free Public Access',
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://www.chasestreetproperties.net/uploads/property_list_img/hudsonliving_1661518528_1661532267.jpg',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    ],
    summary:
      "Known as 'Baltimore's Best Backyard', Patterson Park is a 155-acre Victorian green expanse featuring tree-lined paths, a tranquil boat lake, tennis courts, and the historic 1891 Pagoda observatory.",
    fullDescription: [
      'Patterson Park is the leafy soul of Southeast Baltimore, bordered by historic brick rowhomes in Canton, Highlandtown, and Butcher’s Hill. Acquired by the city in 1827, the park played a pivotal defense role in the War of 1812 at Hampstead Hill.',
      'The crown jewel of the park is the 1891 Victorian Pagoda, a four-story orientalist observatory designed by Charles H. Latrobe. Climbing to the top balcony provides an extraordinary 360-degree vista of the downtown skyline, Canton waterfront, and Patapsco River.',
      'The park serves as a community gathering space with tennis and pickleball courts, an ice skating rink in winter, swimming pool in summer, fenced dog park, and bustling Sunday morning farmers market.',
    ],
    visitorHighlights: [
      'Climb the 1891 Victorian Pagoda on open observatory Sundays',
      '2.5-mile perimeter loop ideal for running, jogging, and walking dogs',
      'Scenic waterfowl lake with willow trees and fountain',
      'Seasonal Sunday morning farmers market with local Maryland produce',
      'Immediate 3-minute walking distance from our Hudson and O’Donnell townhomes',
    ],
    insiderTips: [
      'Grab breakfast tacos or fresh bagels from Canton Square and enjoy a sunny morning picnic on the slopes near the Pagoda.',
      'The dog park at Patterson Park is one of the friendliest in Maryland—ideal for guests staying in our pet-friendly rowhomes.',
    ],
    nearbyNeighborhood: 'Canton',
    nearbyPropertyIds: [1, 2],
  },
  {
    slug: 'national-aquarium',
    number: '05',
    title: 'National Aquarium Baltimore',
    subtitle: 'World-Class Marine Sanctuary · 20,000 Animals · Open Ocean Shark Ring',
    category: 'Marine Science & Family',
    badge: 'Top 3 US Aquariums',
    commuteTime: '4 min walk from Pratt & Light St Stays',
    address: '501 E Pratt St, Baltimore, MD 21202',
    hours: 'Daily: 9:00 AM – 6:00 PM (Fridays open until 8:00 PM with half-price admission)',
    admission: 'General Admission: $39.95 adults / $29.95 children · Half-Price Friday Evenings',
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://www.chasestreetproperties.net/uploads/things_to_do/1/usa-maryland-baltimore-inner-harbor_1691259038.jpg',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    ],
    summary:
      'A world-renowned waterfront aquarium showcasing over 20,000 aquatic animals across multi-story habitats, including a rooftop rainforest and 225,000-gallon Atlantic coral reef.',
    fullDescription: [
      'Consistently ranked among the top three aquariums in the United States, the National Aquarium anchors Pier 3 and Pier 4 in the Inner Harbor with its dramatic glass architectural pyramid.',
      'Visitors journey through distinct global ecosystems: from an Australian river gorge and tropical rainforest to the spiraling walkways of the 225,000-gallon Atlantic Coral Reef and the heart-pounding Shark Alley, where sand tiger and nurse sharks glide overhead.',
      'The aquarium is also a leader in marine conservation, wetland restoration, and ocean rescue operations throughout the Chesapeake Bay watershed.',
    ],
    visitorHighlights: [
      'Atlantic Coral Reef circular tank with stingrays and green moray eels',
      'Shark Alley 360-degree descending underwater walkway',
      'Upland Tropical Rainforest under the top-floor glass pyramid',
      '4D Immersion Theater with sensory environmental effects',
      'Half-Price Friday nights sponsored by M&T Bank (after 5:00 PM)',
    ],
    insiderTips: [
      'Book tickets online in advance to skip the entry line, especially on weekend mornings.',
      'Take advantage of Half-Price Friday Nights (enter after 5:00 PM) for half-price admission and fewer crowds.',
      'Our Pratt Street and Charles Street residences are literally across the street.',
    ],
    nearbyNeighborhood: 'Inner Harbor',
    nearbyPropertyIds: [3, 7, 8, 9],
  },
  {
    slug: 'fells-point',
    number: '06',
    title: 'Historic Fells Point & Broadway Market',
    subtitle: 'Founded 1763 · Authentic Belgian Cobblestones · Live Acoustic Taverns',
    category: 'Historic Waterfront & Nightlife',
    badge: 'National Historic District',
    commuteTime: '3 min walk from Harbor East & Canton',
    address: 'Thames St & Broadway, Baltimore, MD 21231',
    hours: 'Open 24/7 · Dining & pubs open 11:00 AM – 2:00 AM',
    admission: 'Free Public Waterfront District',
    heroImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://www.chasestreetproperties.net/uploads/things_to_do/1/usa-maryland-baltimore-inner-harbor_1691259038.jpg',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    summary:
      'A preserved 18th-century maritime village with authentic Belgian block streets, waterfront seafood taverns, independent record shops, and the historic Broadway Market.',
    fullDescription: [
      'Founded in 1763, Fells Point is one of the oldest and most atmospheric waterfront enclaves in the United States. Renowned for its shipbuilding history—birthplace of the legendary Baltimore Clipper ships—the neighborhood retains more than 350 historic structures.',
      'Stroll along Belgian block cobblestone streets lined with historic taverns (including The Horse You Came In On, operating since 1775 and legendary last drinking spot of Edgar Allan Poe), world-class seafood oyster houses, artisan gelato, and indie boutiques.',
      'The restored Broadway Market at the center of the square offers craft food stalls, local beers, and patio seating right on the harbor.',
    ],
    visitorHighlights: [
      'Thames Street waterfront dining with raw bars and harbor sunset views',
      'The Horse You Came In On Saloon (America’s oldest continually operating tavern)',
      'Historic Broadway Market food hall and outdoor plaza',
      'Baltimore Water Taxi main terminal with direct lines across the harbor',
      'Eclectic antique shops, record stores, and local fashion boutiques',
    ],
    insiderTips: [
      'Order raw local Chesapeake oysters and lobster rolls at Thames Street Oyster House (reserve ahead or arrive right at 5:00 PM for walk-in bar seats).',
      'Enjoy an evening acoustic set at Cat’s Eye Pub for authentic Baltimore maritime energy.',
      'Our Thames Street Captain’s Loft sits directly above the cobblestones.',
    ],
    nearbyNeighborhood: 'Fells Point',
    nearbyPropertyIds: [4, 2, 6],
  },
];

export function getAttractionBySlug(slug: string): BaltimoreAttraction | undefined {
  return ATTRACTIONS.find((a) => a.slug === slug);
}
