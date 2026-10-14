import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Our Story & Hospitality Standards',
  description: "Discover Chase Street Properties' story. Curated executive residences, historic Baltimore rowhomes, and authentic local hospitality in Canton, Fells Point, and Inner Harbor.",
};

export default function AboutPage() {
  return (
    <>
      <main id="main">
        {/* Page Hero */}
        <section className="page-hero">
          <div className="page-hero__inner">
            <div className="breadcrumbs">
              <Link href="/">Home</Link>
              <span className="sep">/</span>
              <span>Our Story</span>
            </div>
            <h1>A Different Way to Stay in Baltimore.<br /><em>Rooted in Character.</em></h1>
            <p className="lead">
              We began with a conviction: extended stays should never feel like a compromise between anonymous hotel corridors and inconsistent vacation rentals. We curate historic Baltimore spaces where you can genuinely unpack, exhale, and thrive.
            </p>
            <div className="page-hero__meta">
              <div><span>Founded In:</span> <strong>Baltimore, Maryland</strong></div>
              <div><span>Residences:</span> <strong>40+ Historic Units</strong></div>
              <div><span>Guest Satisfaction:</span> <strong>4.97 / 5.0 Rating</strong></div>
              <div><span>Specialty:</span> <strong>Executive & Healthcare Stays</strong></div>
            </div>
          </div>
        </section>

        {/* Narrative & Philosophy */}
        <section className="section-pad" style={{ paddingTop: 90, paddingBottom: 90, maxWidth: 1380, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 70, alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                The Philosophy
              </span>
              <h2 style={{ margin: '12px 0 24px', font: '400 clamp(2.5rem, 4.5vw, 4.2rem)/1.05 var(--serif)', letterSpacing: '-0.03em' }}>
                Preserving history.<br /><em>Elevating comfort.</em>
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--ink-soft)', marginBottom: 20 }}>
                Baltimore is a city of intricate brickwork, marble stoops, salty harbor breezes, and fierce neighborhood pride. When founder Gonzalo Jouan began restoring properties along Hudson Street in Canton, the goal was not to strip out history in pursuit of trendy uniformity, but to highlight original 19th-century pine joists, hand-laid brick fireplaces, and generous proportions—while outfitting them with 21st-century residential infrastructure.
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--ink-soft)', marginBottom: 30 }}>
                Today, Chase Street Properties manages more than 40 bespoke residences throughout Canton, Fells Point, Harbor East, and Inner Harbor. We cater especially to Johns Hopkins physicians, travelling clinical specialists, relocating executives, and corporate project directors who require peace of mind and pristine attention to detail.
              </p>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/properties" className="btn-book" style={{ padding: '14px 28px' }}>
                  Explore Our Stays ↗
                </Link>
                <Link href="/contact" className="btn-outline" style={{ padding: '13px 24px' }}>
                  Meet Our Team ↗
                </Link>
              </div>
            </div>

            <div>
              <div style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 45px rgba(23, 35, 31, 0.12)' }}>
                <img
                  src="https://www.chasestreetproperties.net/images/about.webp"
                  alt="Chase Street Properties historic Baltimore rowhome interior"
                  style={{ width: '100%', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, background: 'linear-gradient(0deg, rgba(23,35,31,0.9), transparent)', color: '#fff' }}>
                  <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--sand)' }}>Hudson Street, Canton</span>
                  <p style={{ margin: '4px 0 0', font: '1.3rem var(--serif)' }}>Where historic craftsmanship meets serene residential living.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The 4 Pillars */}
        <section style={{ background: 'var(--forest)', color: '#f7f1e8', padding: '110px var(--gutter)' }}>
          <div style={{ maxWidth: 1380, margin: '0 auto' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--sand)', fontWeight: 600 }}>The Four Pillars</span>
            <h2 style={{ margin: '12px 0 60px', font: '400 clamp(2.4rem, 4.5vw, 4.4rem)/1 var(--serif)', color: '#fff' }}>
              The Chase Street Standard.<br /><em>No compromises.</em>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: 24 }}>
                <span style={{ color: 'var(--copper)', fontSize: '1.2rem', fontFamily: 'var(--serif)' }}>01</span>
                <h3 style={{ font: '400 1.8rem var(--serif)', margin: '12px 0 10px', color: '#fff' }}>Acoustic Tranquility & Ergonomics</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#c8cbc5' }}>
                  Every stay is equipped with dedicated workspaces, ergonomic seating, multi-monitor ports, and gigabit fiber internet (minimum 600 Mbps up/down) to ensure seamless work days and peaceful nights.
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: 24 }}>
                <span style={{ color: 'var(--copper)', fontSize: '1.2rem', fontFamily: 'var(--serif)' }}>02</span>
                <h3 style={{ font: '400 1.8rem var(--serif)', margin: '12px 0 10px', color: '#fff' }}>Hotel-Grade Sleep Rigor</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#c8cbc5' }}>
                  Rest is non-negotiable. We supply breathable 400-thread-count organic cotton percale sheets, dual-density memory foam mattresses, blackout drapery, and white noise amenities in every bedroom.
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: 24 }}>
                <span style={{ color: 'var(--copper)', fontSize: '1.2rem', fontFamily: 'var(--serif)' }}>03</span>
                <h3 style={{ font: '400 1.8rem var(--serif)', margin: '12px 0 10px', color: '#fff' }}>Frictionless Keyless Arrival</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#c8cbc5' }}>
                  Arrive at 2:00 AM after an emergency flight or a grueling hospital shift—your personal encrypted door PIN is generated automatically and ready on your phone, with no front desk lines or key handoffs.
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: 24 }}>
                <span style={{ color: 'var(--copper)', fontSize: '1.2rem', fontFamily: 'var(--serif)' }}>04</span>
                <h3 style={{ font: '400 1.8rem var(--serif)', margin: '12px 0 10px', color: '#fff' }}>True Local Stewardship</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#c8cbc5' }}>
                  We don't use overseas call centers. If you need an extra set of keys, an extra duvet, or advice on the freshest crab cakes in Fells Point, our local Baltimore team is minutes away, 24/7.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Community First */}
        <section className="section-pad" style={{ paddingTop: 90, paddingBottom: 110, maxWidth: 1380, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 70, alignItems: 'center' }}>
            <div>
              <img
                src="https://www.chasestreetproperties.net/images/about2.webp"
                alt="Baltimore bedroom interior"
                style={{ width: '100%', borderRadius: 4, boxShadow: '0 16px 36px rgba(23,35,31,0.08)' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                Community First
              </span>
              <h2 style={{ margin: '12px 0 20px', font: '400 clamp(2.2rem, 3.8vw, 3.6rem)/1.1 var(--serif)', letterSpacing: '-0.02em' }}>
                Investing in the streets we call home.
              </h2>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'var(--ink-soft)', marginBottom: 16 }}>
                A neighborhood thrives when it is lived in with respect. We collaborate with Baltimore woodworkers, local roasters like Canton Coffee Roasters, and local cleaning specialists who receive living wages and full support.
              </p>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'var(--ink-soft)', marginBottom: 24 }}>
                Every guest receives our curated guide to independent Baltimore dining, waterfront running paths, and hidden historical architectural gems—ensuring your stay directly supports the city's independent economy.
              </p>
              <Link href="/baltimore-guide" className="btn-book" style={{ padding: '14px 28px' }}>
                Explore Our Baltimore Guide ↗
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer showTopCta={true} />
    </>
  );
}
