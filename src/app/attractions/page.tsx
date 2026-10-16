import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Baltimore Attractions & Points of Interest | Chase Street Properties',
  description: "Explore Baltimore's premier attractions near our furnished executive residences: Inner Harbor, The Walters Art Museum, Fort McHenry, and Patterson Park.",
};

export default function AttractionsPage() {
  const attractions = [
    {
      id: 'inner-harbor',
      number: '01',
      title: 'Baltimore Inner Harbor',
      subtitle: 'Waterfront Promenade · Historic Ships · Dining',
      image: 'https://www.chasestreetproperties.net/uploads/things_to_do/1/usa-maryland-baltimore-inner-harbor_1691259038.jpg',
      badge: 'Iconic Baltimore',
      commute: '6–8 min drive or Water Taxi',
      address: 'Light St & Pratt St, Baltimore, MD 21202',
      description:
        "Baltimore's Inner Harbor is a magnet for visitors and residents alike, filled with attractions, waterfront promenades, and world-class entertainment options. The whole area and the neighborhoods just back from the water have been beautifully developed with parks, hotels, restaurants, shops, and maritime museums. Foremost among the historic ships is the sloop-of-war USS Constellation, a storied three-masted sailing ship that saw action in the Civil War.",
      highlights: [
        'USS Constellation & Historic Maritime Ships',
        'National Aquarium with 20,000+ aquatic creatures',
        'Seven continuous miles of brick waterfront promenade',
        'Baltimore Water Taxi stops connecting Fells Point & Canton',
      ],
      nearbyNeighborhood: 'Inner Harbor',
      filterParam: 'Inner%20Harbor',
      externalUrl: 'https://baltimore.org/what-to-do/baltimore-inner-harbor/',
    },
    {
      id: 'walters-museum',
      number: '02',
      title: 'The Walters Art Museum',
      subtitle: 'Mount Vernon Cultural District · 36,000 Works of World Art',
      image: 'https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-walters-art-museum-staircase.jpg',
      badge: 'Free Admission Daily',
      commute: '10–12 min drive',
      address: '600 N Charles St, Baltimore, MD 21201',
      description:
        'In Baltimore’s Mount Vernon Cultural District, The Walters Art Museum is a unique cultural landmark and one of only a handful of institutions in the world that presents such a comprehensive history of world art. Covering all media of art from the third millennium B.C. through the early 20th century, the collections—all beautifully displayed and interpreted—are best known for exceptional jewelry, enamels, ivories, and Roman bronzes.',
      highlights: [
        'Free general admission for all visitors year-round',
        'Rare illuminated medieval manuscripts and Byzantine treasures',
        'Grand marble Renaissance staircase & Italian palazzo architecture',
        'Steps from the Washington Monument and Mount Vernon bistros',
      ],
      nearbyNeighborhood: 'Mount Vernon',
      filterParam: 'Mount%20Vernon',
      externalUrl: 'https://thewalters.org/',
    },
    {
      id: 'fort-mchenry',
      number: '03',
      title: 'Fort McHenry National Monument',
      subtitle: 'Birthplace of The Star-Spangled Banner · Harbor Ramparts',
      image: 'https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-fort-mchenry-national-monument.jpg',
      badge: 'National Icon',
      commute: '10 min drive',
      address: '2400 E Fort Ave, Baltimore, MD 21230',
      description:
        'Completed in 1803 to guard the entrance to Baltimore’s busy harbor, Fort McHenry became a national icon after withstanding a fierce 24-hour bombardment by the British Royal Navy in 1814. The heroic defense saved Baltimore from foreign occupation and inspired Francis Scott Key to pen The Star-Spangled Banner. Today, visitors can walk the scenic ramparts, inspect historic cannons, and enjoy sweeping open-water vistas of Baltimore harbor.',
      highlights: [
        'Star-shaped pentagonal historic brick fortress',
        'Daily flag-change ceremonies with historical reenactors',
        'Walking paths bordering the open harbor with sea breezes',
        'Water Taxi connections from Fells Point & Locust Point',
      ],
      nearbyNeighborhood: 'Fells Point',
      filterParam: 'Fells%20Point',
      externalUrl: 'https://www.nps.gov/fomc/index.htm',
    },
    {
      id: 'patterson-park',
      number: '04',
      title: 'Patterson Park & Historic Pagoda',
      subtitle: "Canton's 155-Acre Green Haven · Victorian Conservatory",
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      badge: 'Canton Neighborhood Heart',
      commute: '3–5 min walk from Hudson & O\'Donnell Stays',
      address: '2601 E Baltimore St, Baltimore, MD 21224',
      description:
        "Often called 'Baltimore's Best Backyard', Patterson Park is a 155-acre oasis of rolling green hills, jogging trails, tennis courts, and a tranquil boat lake right at the border of Canton and Highlandtown. The iconic 1891 Victorian Pagoda offers panoramic 360-degree views of the downtown skyline and harbor.",
      highlights: [
        'Iconic 1891 Victorian Pagoda observatory',
        'Sunday morning community farmers market',
        'Dedicated dog park and lighted tennis courts',
        'Direct 5-minute walk from our Canton residences',
      ],
      nearbyNeighborhood: 'Canton',
      filterParam: 'Canton',
      externalUrl: 'https://pattersonpark.com/',
    },
  ];

  return (
    <>
      <main id="main">
        {/* Page Hero */}
        <section className="page-hero">
          <div className="page-hero__inner">
            <div className="breadcrumbs">
              <Link href="/">Home</Link>
              <span className="sep">/</span>
              <span>Attractions</span>
            </div>
            <h1>Baltimore's Storied Landmarks.<br /><em>At Your Doorstep.</em></h1>
            <p className="lead">
              From the historic ramparts of Fort McHenry to the world-renowned collections of The Walters Art Museum and the vibrant Inner Harbor promenade, our residences place you within minutes of Baltimore's finest cultural treasures.
            </p>
            <div className="page-hero__meta">
              <div><span>Inner Harbor:</span> <strong>7 Min</strong></div>
              <div><span>Walters Art Museum:</span> <strong>Free Daily</strong></div>
              <div><span>Fort McHenry:</span> <strong>Historic Icon</strong></div>
              <div><span>Water Taxi:</span> <strong>Direct Piers</strong></div>
            </div>
          </div>
        </section>

        {/* Attractions Grid */}
        <section className="section-pad" style={{ paddingTop: 80, paddingBottom: 100, maxWidth: 1380, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 70 }}>
            {attractions.map((attr, index) => {
              const isEven = index % 2 === 1;
              return (
                <article
                  key={attr.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: 50,
                    alignItems: 'center',
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: '0 12px 30px rgba(23,35,31,0.04)',
                  }}
                >
                  {/* Media Column */}
                  <div
                    style={{
                      position: 'relative',
                      minHeight: 380,
                      height: '100%',
                      order: isEven ? 2 : 1,
                    }}
                  >
                    <img
                      src={attr.image}
                      alt={attr.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        display: 'flex',
                        gap: 8,
                      }}
                    >
                      <span className="p-badge p-badge--copper">{attr.badge}</span>
                      <span className="p-badge">{attr.commute}</span>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div
                    style={{
                      padding: '40px 44px',
                      order: isEven ? 1 : 2,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        color: 'var(--copper)',
                        fontWeight: 700,
                      }}
                    >
                      Landmark {attr.number} · {attr.nearbyNeighborhood}
                    </span>
                    <h2
                      style={{
                        font: '400 clamp(2rem, 3.5vw, 2.8rem)/1.1 var(--serif)',
                        margin: '8px 0 6px',
                        color: 'var(--forest)',
                      }}
                    >
                      {attr.title}
                    </h2>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--ink-soft)',
                        marginBottom: 18,
                        fontWeight: 500,
                      }}
                    >
                      📍 {attr.address}
                    </p>

                    <p
                      style={{
                        fontSize: '0.88rem',
                        lineHeight: 1.8,
                        color: 'var(--ink-soft)',
                        marginBottom: 20,
                      }}
                    >
                      {attr.description}
                    </p>

                    {/* Highlights */}
                    <div
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        borderRadius: 6,
                        padding: '16px 20px',
                        marginBottom: 24,
                      }}
                    >
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: 'var(--forest)',
                          marginBottom: 8,
                        }}
                      >
                        Visitor Highlights & Tips:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: 'var(--ink)', lineHeight: 1.7 }}>
                        {attr.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginTop: 'auto' }}>
                      <Link
                        href={`/properties?neighborhood=${attr.filterParam}`}
                        className="btn-book"
                        style={{ padding: '12px 24px', fontSize: '0.76rem' }}
                      >
                        Find Stays in {attr.nearbyNeighborhood} ↗
                      </Link>

                      <a
                        href={attr.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline"
                        style={{ padding: '12px 20px', fontSize: '0.76rem' }}
                      >
                        Official Visitor Site ↗
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ background: 'var(--forest)', color: '#fff', padding: '80px var(--gutter)', textAlign: 'center' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--sand)', fontWeight: 600 }}>
              Live Like You Belong
            </span>
            <h2 style={{ font: '400 clamp(2.2rem, 4vw, 3.6rem)/1.1 var(--serif)', margin: '10px 0 20px', color: '#fff' }}>
              Experience Baltimore from the City's Most Coveted Addresses.
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#cbd3ce', lineHeight: 1.8, marginBottom: 32 }}>
              Whether you are in town for a weekend of museum exploration or a months-long fellowship, our curated residences provide effortless access to everything you came to experience.
            </p>
            <Link href="/properties" className="btn-book" style={{ padding: '14px 32px', background: 'var(--copper)', color: '#fff', fontSize: '0.82rem' }}>
              Browse Available Residences ↗
            </Link>
          </div>
        </section>
      </main>

      <Footer showTopCta={false} />
    </>
  );
}
