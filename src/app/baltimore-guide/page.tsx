import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Baltimore Neighborhood & Medical Housing Guide',
  description: "Discover Baltimore's most walkable waterfront neighborhoods. Canton, Fells Point, Harbor East, and Mount Vernon guide for medical fellows, corporate travelers, and visitors.",
};

export default function BaltimoreGuidePage() {
  return (
    <>
      <main id="main">
        {/* Page Hero */}
        <section className="page-hero">
          <div className="page-hero__inner">
            <div className="breadcrumbs">
              <Link href="/">Home</Link>
              <span className="sep">/</span>
              <span>Baltimore Guide</span>
            </div>
            <h1>The Charm is in the Details.<br /><em>Curated for your stay.</em></h1>
            <p className="lead">
              Baltimore rewards those who get close enough to know it. From the cobblestones of Fells Point and the leafy tranquility of Canton Waterfront to world-class medical institutions like Johns Hopkins, here is your insider guide to the city.
            </p>
            <div className="page-hero__meta">
              <div><span>Waterfront Promenade:</span> <strong>7 Continuous Miles</strong></div>
              <div><span>Hopkins Commute:</span> <strong>5–9 Minutes</strong></div>
              <div><span>Water Taxi:</span> <strong>Frequent Harbor Stops</strong></div>
              <div><span>Transit:</span> <strong>Penn Station Amtrak to DC / NYC</strong></div>
            </div>
          </div>
        </section>

        {/* Neighborhood Explorer */}
        <section className="section-pad" style={{ paddingTop: 80, paddingBottom: 90, maxWidth: 1380, margin: '0 auto' }}>
          <div className="panel-header" style={{ marginBottom: 40 }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                Walkable Quarters
              </span>
              <h2 style={{ font: '400 clamp(2.4rem, 4vw, 3.8rem)/1.1 var(--serif)', margin: '6px 0' }}>
                Where to Live in Baltimore
              </h2>
              <p>Explore our premier neighborhood hubs and find the address that matches your daily rhythm.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 32 }}>
            {/* Canton */}
            <article className="p-card">
              <div className="p-card__media">
                <img src="https://www.chasestreetproperties.net/images/bg.webp" alt="Canton waterfront Baltimore" loading="lazy" />
                <div className="p-card__badge-row">
                  <span className="p-badge p-badge--copper">Canton</span>
                  <span className="p-badge">Hopkins Bayview: 5 min</span>
                </div>
              </div>
              <div className="p-card__content">
                <h3 className="p-card__title">Canton & O'Donnell Square</h3>
                <p className="p-card__desc">
                  A vibrant, safe waterfront enclave featuring historic brick rowhomes, lively neighborhood squares, and Canton Waterfront Park. Stroll to independent coffee roasters, craft taprooms, and seaside promenades.
                </p>
                <div style={{ margin: '14px 0', fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                  <div><strong>Favorite Spots:</strong> Canton Coffee Roasters, raw oysters at Mama's on the Half Shell, Patterson Park Pagoda.</div>
                  <div><strong>Vibe:</strong> Community-centered, dogs in parks, runners along the harbor.</div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--copper)', fontWeight: 600 }}>12+ Available Residences</span>
                  <Link href="/properties?neighborhood=Canton" className="btn-book">View Canton Stays ↗</Link>
                </div>
              </div>
            </article>

            {/* Fells Point */}
            <article className="p-card">
              <div className="p-card__media">
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80" alt="Historic Fells Point Baltimore cobblestones" loading="lazy" />
                <div className="p-card__badge-row">
                  <span className="p-badge p-badge--copper">Fells Point</span>
                  <span className="p-badge">Water Taxi Hub</span>
                </div>
              </div>
              <div className="p-card__content">
                <h3 className="p-card__title">Historic Fells Point</h3>
                <p className="p-card__desc">
                  Founded in 1763, Fells Point is famous for authentic Belgian cobblestone streets, storied maritime taverns, and waterfront dining. Catch the Baltimore Water Taxi right off Thames Street.
                </p>
                <div style={{ margin: '14px 0', fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                  <div><strong>Favorite Spots:</strong> Thames Street Oyster House, Pitango Gelato & Espresso, Broadway Market.</div>
                  <div><strong>Vibe:</strong> Historic charm, live acoustic music, maritime sea breeze.</div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--copper)', fontWeight: 600 }}>8+ Available Residences</span>
                  <Link href="/properties?neighborhood=Fells%20Point" className="btn-book">View Fells Stays ↗</Link>
                </div>
              </div>
            </article>

            {/* Inner Harbor & Harbor East */}
            <article className="p-card">
              <div className="p-card__media">
                <img src="https://www.chasestreetproperties.net/uploads/things_to_do/1/usa-maryland-baltimore-inner-harbor_1691259038.jpg" alt="Baltimore Inner Harbor skyline" loading="lazy" />
                <div className="p-card__badge-row">
                  <span className="p-badge p-badge--copper">Inner Harbor</span>
                  <span className="p-badge">Downtown Center</span>
                </div>
              </div>
              <div className="p-card__content">
                <h3 className="p-card__title">Inner Harbor & Harbor East</h3>
                <p className="p-card__desc">
                  The gleaming commercial and cultural heart of Baltimore. High-rise skyline luxury, Whole Foods, fine dining, the National Aquarium, and easy access to the Baltimore Convention Center.
                </p>
                <div style={{ margin: '14px 0', fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                  <div><strong>Favorite Spots:</strong> Ouzo Bay, The Charleston, National Aquarium, harbor running path.</div>
                  <div><strong>Vibe:</strong> Cosmopolitan, upscale retail, scenic evening skyline views.</div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--copper)', fontWeight: 600 }}>10+ Available Residences</span>
                  <Link href="/properties?neighborhood=Inner%20Harbor" className="btn-book">View Harbor Stays ↗</Link>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Clinical & Academic Housing */}
        <section style={{ background: 'var(--forest)', color: '#f7f1e8', padding: '100px var(--gutter)' }}>
          <div style={{ maxWidth: 1380, margin: '0 auto' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--sand)', fontWeight: 600 }}>
              Clinical & Academic Housing
            </span>
            <h2 style={{ font: '400 clamp(2.4rem, 4.5vw, 4.4rem)/1 var(--serif)', margin: '10px 0 24px', color: '#fff' }}>
              The Medical Professional's<br /><em>Preferred Baltimore Address.</em>
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#d1cdc4', maxWidth: 720, marginBottom: 50 }}>
              Baltimore is home to some of the world's finest medical complexes. We specialize in providing turnkey, serene, per-diem-compliant executive housing for traveling nurses, clinical fellows, visiting surgeons, and medical researchers.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: 28 }}>
                <strong style={{ display: 'block', font: '400 1.6rem var(--serif)', color: '#fff', marginBottom: 6 }}>Johns Hopkins Hospital</strong>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--sand)' }}>Main East Baltimore Campus</span>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: '#c8cbc5', marginTop: 14 }}>
                  Only 7–9 minutes drive or shuttle from our Canton and Fells Point properties. Rest peacefully away from hospital sirens in calm waterfront rowhomes.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: 28 }}>
                <strong style={{ display: 'block', font: '400 1.6rem var(--serif)', color: '#fff', marginBottom: 6 }}>Johns Hopkins Bayview</strong>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--sand)' }}>Eastern Ave / Canton Corridor</span>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: '#c8cbc5', marginTop: 14 }}>
                  Only 5 minutes straight drive down Eastern Avenue from our Hudson Street and O'Donnell Street properties. Reserved off-street parking available.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: 28 }}>
                <strong style={{ display: 'block', font: '400 1.6rem var(--serif)', color: '#fff', marginBottom: 6 }}>UMMC & Biopark</strong>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--sand)' }}>University of Maryland Medical Center</span>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: '#c8cbc5', marginTop: 14 }}>
                  6 minutes drive or direct transit from our Inner Harbor and Mount Vernon properties. Corporate direct billing & travel nurse per-diem invoicing supported.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 40 }}>
              <Link href="/contact" className="btn-book" style={{ background: 'var(--copper)', color: '#fff', padding: '14px 28px' }}>
                Inquire for Medical Rotation Housing ↗
              </Link>
            </div>
          </div>
        </section>

        {/* Culture, Art & History */}
        <section className="section-pad" style={{ paddingTop: 90, paddingBottom: 110, maxWidth: 1380, margin: '0 auto' }}>
          <div className="panel-header" style={{ marginBottom: 30 }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                Baltimore Icons
              </span>
              <h2 style={{ font: '400 clamp(2.4rem, 4vw, 3.8rem)/1.1 var(--serif)', margin: '6px 0' }}>Culture, Art & History</h2>
            </div>
          </div>

          <div className="places">
            <a className="place place--harbor image-reveal is-visible" href="https://baltimore.org/what-to-do/baltimore-inner-harbor/" target="_blank" rel="noreferrer">
              <img src="https://www.chasestreetproperties.net/uploads/things_to_do/1/usa-maryland-baltimore-inner-harbor_1691259038.jpg" alt="Baltimore Inner Harbor" />
              <span>01</span><h3>Inner Harbor</h3><p>Waterfront Promenade · 8 min</p>
            </a>
            <a className="place place--walters image-reveal is-visible" href="https://thewalters.org/" target="_blank" rel="noreferrer">
              <img src="https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-walters-art-museum-staircase.jpg" alt="Walters Art Museum Grand Staircase" />
              <span>02</span><h3>The Walters Art Museum</h3><p>Mount Vernon · 12 min</p>
            </a>
            <a className="place place--fort image-reveal is-visible" href="https://www.nps.gov/fomc/index.htm" target="_blank" rel="noreferrer">
              <img src="https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-fort-mchenry-national-monument.jpg" alt="Fort McHenry Monument" />
              <span>03</span><h3>Fort McHenry</h3><p>Historic Harbor Fortress · 10 min</p>
            </a>
          </div>
        </section>
      </main>

      <Footer showTopCta={true} />
    </>
  );
}
