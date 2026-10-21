import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Stay Standards & House Policies | Baltimore Harbor Properties',
  description: 'Detailed check-in procedures, quiet hours, cancellation terms, pet guidelines, and hospital-grade sanitization standards for Baltimore Harbor Properties.',
};

export default function PoliciesPage() {
  return (
    <>
      <main id="main">
        {/* Page Hero */}
        <section className="page-hero">
          <div className="page-hero__inner">
            <div className="breadcrumbs">
              <Link href="/">Home</Link>
              <span className="sep">/</span>
              <span>Stay Policies & Standards</span>
            </div>
            <h1>Clear Standards.<br /><em>Considered Hospitality.</em></h1>
            <p className="lead">
              To preserve the tranquil, immaculate atmosphere our residents and property owners rely on, all Baltimore Harbor Properties residences operate under consistent, transparent standards.
            </p>
            <div className="page-hero__meta">
              <div><span>Check-in:</span> <strong>3:00 PM (Keyless PIN)</strong></div>
              <div><span>Check-out:</span> <strong>11:00 AM</strong></div>
              <div><span>Quiet Hours:</span> <strong>10:00 PM – 7:00 AM</strong></div>
              <div><span>Sanitization:</span> <strong>Hospital-Grade Clean</strong></div>
            </div>
          </div>
        </section>

        {/* Policies Content */}
        <section className="section-pad" style={{ paddingTop: 80, paddingBottom: 100, maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {/* Section 1 */}
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 36, boxShadow: '0 8px 24px rgba(23,35,31,0.03)' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                Access & Arrival
              </span>
              <h2 style={{ font: '400 1.8rem var(--serif)', margin: '6px 0 16px', color: 'var(--forest)' }}>
                1. 24/7 Keyless Self Check-in & Departure
              </h2>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--ink-soft)' }}>
                <p>
                  <strong>Standard Check-in Time:</strong> 3:00 PM EST. Early check-in requests are accommodated whenever previous turnover schedules permit.
                </p>
                <p>
                  <strong>Standard Check-out Time:</strong> 11:00 AM EST. Late check-out requests must be coordinated via the Portals Hub or by contacting your host at least 24 hours prior.
                </p>
                <p>
                  <strong>Digital Keypad PIN:</strong> Every guest receives a unique 4-digit PIN code dispatched via email, SMS, and accessible via the Resident Portal upon reservation confirmation. Codes activate precisely at 3:00 PM on arrival day and expire automatically at 11:00 AM on departure day.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 36, boxShadow: '0 8px 24px rgba(23,35,31,0.03)' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                Living Standards
              </span>
              <h2 style={{ font: '400 1.8rem var(--serif)', margin: '6px 0 16px', color: 'var(--forest)' }}>
                2. Non-Smoking Guarantee & Quiet Neighborhood Hours
              </h2>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--ink-soft)' }}>
                <p>
                  <strong>100% Smoke-Free Environment:</strong> Smoking, vaping, or using cannabis inside any part of the residence, hallways, or enclosed balconies is strictly prohibited. Violations trigger an automatic $500 EPA ozone remediation fee.
                </p>
                <p>
                  <strong>Quiet Hours (10:00 PM – 7:00 AM):</strong> Our residences reside within historic, close-knit residential neighborhoods (Canton, Fells Point, Harbor East). Parties, unauthorized events, or loud gatherings are strictly forbidden. Sound levels must remain respectful of residential neighbors at all times.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 36, boxShadow: '0 8px 24px rgba(23,35,31,0.03)' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                Financial & Flexibility
              </span>
              <h2 style={{ font: '400 1.8rem var(--serif)', margin: '6px 0 16px', color: 'var(--forest)' }}>
                3. Cancellation, Rescheduling & Refund Terms
              </h2>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--ink-soft)' }}>
                <p>
                  <strong>Full Refund (100%):</strong> Cancellations made up to <strong>7 full days prior</strong> to local check-in time receive a 100% refund of all accommodation charges and cleaning fees.
                </p>
                <p>
                  <strong>Moderate Refund (50%):</strong> Cancellations made between 7 days and 48 hours prior to check-in receive a 50% refund of the room subtotal, plus 100% of the cleaning fee.
                </p>
                <p>
                  <strong>Medical Rotation / Clinical Emergency Extensions:</strong> We understand medical schedules fluctuate. Visiting fellows and travelling physicians can extend or adjust stay dates through their concierge desk with zero change penalty fees subject to calendar availability.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 36, boxShadow: '0 8px 24px rgba(23,35,31,0.03)' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                Health & Wellness
              </span>
              <h2 style={{ font: '400 1.8rem var(--serif)', margin: '6px 0 16px', color: 'var(--forest)' }}>
                4. EPA Hospital-Grade Sanitization Standard
              </h2>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--ink-soft)' }}>
                <p>
                  Between every stay, our licensed turnover specialists execute a rigorous 60-point hospital-grade disinfection protocol:
                </p>
                <ul style={{ paddingLeft: 20, marginTop: 10, lineHeight: 1.7 }}>
                  <li>All high-touch surfaces (door levers, remotes, keypads, faucets, thermostats) disinfected with EPA-registered botanical biocides.</li>
                  <li>Linen laundering in high-temperature thermal sanitizing wash cycles.</li>
                  <li>HVAC HEPA filter inspections and fresh air ventilation cycles.</li>
                  <li>Complimentary mid-stay refresh cleaning available on demand via the Resident Portal.</li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 36, boxShadow: '0 8px 24px rgba(23,35,31,0.03)' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                Four-Legged Friends
              </span>
              <h2 style={{ font: '400 1.8rem var(--serif)', margin: '6px 0 16px', color: 'var(--forest)' }}>
                5. Pet Guidelines
              </h2>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--ink-soft)' }}>
                <p>
                  Well-behaved dogs are warmly welcomed in designated pet-friendly residences with prior management authorization. A one-time pet sanitation fee ($50) applies. Canton Waterfront Park and Patterson Park offer dedicated off-leash dog recreation areas just moments away.
                </p>
              </div>
            </div>

            {/* Host Contact Box */}
            <div style={{ background: 'var(--forest)', color: '#fff', borderRadius: 8, padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--sand)', letterSpacing: '0.12em', fontWeight: 600 }}>
                  24/7 Host Concierge & Safety
                </span>
                <h3 style={{ font: '400 1.7rem var(--serif)', margin: '4px 0 8px', color: '#fff' }}>
                  Have a Question About Your Stay?
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#cbd3ce', margin: 0 }}>
                  Contact Gonzalo Jouan or our Baltimore operations team directly anytime.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href="tel:+14102188462" className="btn-book" style={{ background: 'var(--copper)', color: '#fff', textDecoration: 'none', padding: '12px 24px' }}>
                  📞 +1 (410) 218-8462
                </a>
                <Link href="/contact" className="btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', padding: '12px 20px' }}>
                  Inquire Online ↗
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer showTopCta={false} />
    </>
  );
}
