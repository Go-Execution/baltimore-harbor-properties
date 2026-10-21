import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ATTRACTIONS } from '@/data/attractions';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Baltimore Attractions & Points of Interest | Baltimore Harbor Properties',
  description:
    "Explore Baltimore's premier cultural landmarks and reserve nearby furnished executive residences: Inner Harbor, The Walters Art Museum, Fort McHenry, Patterson Park, National Aquarium, and Fells Point.",
};

export default function AttractionsPage() {
  return (
    <>
      <main id="main">
        {/* Page Hero */}
        <section className="page-hero">
          <div className="page-hero__inner">
            <div className="breadcrumbs">
              <Link href="/">Home</Link>
              <span className="sep">/</span>
              <span>Attractions & Visitor Guides</span>
            </div>
            <h1>
              Baltimore's Storied Landmarks.<br />
              <em>At Your Doorstep.</em>
            </h1>
            <p className="lead">
              From the historic ramparts of Fort McHenry to the world-renowned collections of The Walters Art Museum and the vibrant Inner Harbor promenade, our residences place you within minutes of Baltimore's finest cultural treasures. Explore each landmark guide and reserve nearby residences directly.
            </p>
            <div className="page-hero__meta">
              <div><span>Inner Harbor:</span> <strong>Waterfront Stays</strong></div>
              <div><span>Walters Art Museum:</span> <strong>Free Daily</strong></div>
              <div><span>Fort McHenry:</span> <strong>National Icon</strong></div>
              <div><span>Fells Point:</span> <strong>Cobblestone Charms</strong></div>
            </div>
          </div>
        </section>

        {/* Attractions Grid */}
        <section className="section-pad" style={{ paddingTop: 80, paddingBottom: 100, maxWidth: 1380, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 70 }}>
            {ATTRACTIONS.map((attr, index) => {
              const isEven = index % 2 === 1;
              return (
                <article
                  key={attr.slug}
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
                    <Link href={`/attractions/${attr.slug}`} style={{ display: 'block', height: '100%' }}>
                      <img
                        src={attr.heroImage}
                        alt={attr.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        loading="lazy"
                      />
                    </Link>
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
                      <span className="p-badge">{attr.commuteTime}</span>
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
                        font: '400 clamp(1.8rem, 3.2vw, 2.6rem)/1.15 var(--serif)',
                        margin: '8px 0 6px',
                        color: 'var(--forest)',
                      }}
                    >
                      <Link href={`/attractions/${attr.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {attr.title}
                      </Link>
                    </h2>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--ink-soft)',
                        marginBottom: 16,
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
                      {attr.summary}
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
                        Visitor Highlights & Features:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: 'var(--ink)', lineHeight: 1.7 }}>
                        {attr.visitorHighlights.slice(0, 3).map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginTop: 'auto' }}>
                      <Link
                        href={`/attractions/${attr.slug}`}
                        className="btn-book"
                        style={{ padding: '12px 24px', fontSize: '0.76rem' }}
                      >
                        Explore Guide & Book Stays ↗
                      </Link>

                      <Link
                        href={`/properties?neighborhood=${encodeURIComponent(attr.nearbyNeighborhood)}`}
                        className="btn-outline"
                        style={{ padding: '12px 20px', fontSize: '0.76rem' }}
                      >
                        Find {attr.nearbyNeighborhood} Stays ↗
                      </Link>
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
              Whether you are in town for a weekend of museum exploration, a medical rotation at Johns Hopkins, or a months-long fellowship, our curated residences provide effortless access to everything you came to experience.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/properties" className="btn-book" style={{ padding: '14px 32px', background: 'var(--copper)', color: '#fff', fontSize: '0.82rem' }}>
                Browse Available Residences ↗
              </Link>
              <Link href="/corporate-housing" className="btn-outline" style={{ padding: '14px 28px', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
                Corporate & Medical Housing ↗
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer showTopCta={false} />
    </>
  );
}
