'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function CorporateHousingPage() {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [duration, setDuration] = useState('30-90');
  const [unitsNeeded, setUnitsNeeded] = useState('1');
  const [billingType, setBillingType] = useState('direct-invoice');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <main id="main">
        {/* Page Hero */}
        <section className="page-hero">
          <div className="page-hero__inner">
            <div className="breadcrumbs">
              <Link href="/">Home</Link>
              <span className="sep">/</span>
              <span>Corporate & Healthcare Housing</span>
            </div>
            <h1>Reinventing Executive Housing.<br /><em>Turnkey Baltimore Residences.</em></h1>
            <p className="lead">
              A refined, hassle-free alternative to cramped extended-stay hotels. Expertly curated homes in Canton, Fells Point, Harbor East, and Inner Harbor—engineered for Johns Hopkins fellows, traveling clinicians, relocating executives, and corporate project teams.
            </p>
            <div className="page-hero__meta">
              <div><span>Portfolio:</span> <strong>40+ Furnished Homes</strong></div>
              <div><span>Stay Minimum:</span> <strong>3+ Days to Months</strong></div>
              <div><span>Hopkins / UMMC:</span> <strong>Direct Billing Compliant</strong></div>
              <div><span>Access:</span> <strong>24/7 Keyless PIN Entry</strong></div>
            </div>
          </div>
        </section>

        {/* Pillars of Corporate Housing */}
        <section className="section-pad" style={{ paddingTop: 80, paddingBottom: 80, maxWidth: 1380, margin: '0 auto' }}>
          <div className="panel-header" style={{ marginBottom: 40 }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                The Executive Standard
              </span>
              <h2 style={{ font: '400 clamp(2.2rem, 4vw, 3.6rem)/1.1 var(--serif)', margin: '6px 0' }}>
                Day-One Move-In Ready Comfort
              </h2>
              <p>Everything you need to live and work with focus, set up before your arrival.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 28, boxShadow: '0 8px 24px rgba(23,35,31,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>📶</div>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--forest)', marginBottom: 8 }}>Gigabit Fiber WiFi & Desks</strong>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--ink-soft)', margin: 0 }}>
                Private, enterprise-grade high-speed fiber internet with dedicated ergonomic workstations, dual-monitor setups, and whisper-quiet work environments.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 28, boxShadow: '0 8px 24px rgba(23,35,31,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🍳</div>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--forest)', marginBottom: 8 }}>Fully Equipped Chef Kitchens</strong>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--ink-soft)', margin: 0 }}>
                Granite/quartz countertops, full-size refrigerators, gas ranges, dishwashers, cookware, dinnerware, and complimentary Nespresso coffee stations.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 28, boxShadow: '0 8px 24px rgba(23,35,31,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>📑</div>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--forest)', marginBottom: 8 }}>GSA Per-Diem Direct Billing</strong>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--ink-soft)', margin: 0 }}>
                We work directly with hospital procurement, university departments, and corporate travel managers to handle monthly invoicing matching federal per-diem limits.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 28, boxShadow: '0 8px 24px rgba(23,35,31,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🚗</div>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--forest)', marginBottom: 8 }}>Reserved Parking & Keyless Entry</strong>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--ink-soft)', margin: 0 }}>
                Arrive late from hospital shifts with frictionless 24/7 keypad PIN access. Many residences feature private attached parking pads or indoor garage stalls.
              </p>
            </div>
          </div>
        </section>

        {/* Hotel vs Residence Comparison Table */}
        <section style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '90px var(--gutter)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                Value Comparison
              </span>
              <h2 style={{ font: '400 clamp(2.2rem, 4vw, 3.4rem)/1.1 var(--serif)', margin: '8px 0 14px', color: 'var(--forest)' }}>
                Extended-Stay Hotel vs. Chase Street Residence
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', maxWidth: 640, margin: '0 auto' }}>
                Why Baltimore's leading healthcare institutions and Fortune 500 firms choose our furnished private homes.
              </p>
            </div>

            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, border: '1px solid var(--line)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--forest)', color: '#fff' }}>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Feature</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Standard Extended-Stay Hotel</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--sand)' }}>Chase Street Properties</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>Living Space</td>
                    <td style={{ padding: '14px 20px', color: 'var(--ink-soft)' }}>320 – 450 sq ft (single room)</td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--forest)' }}>850 – 1,950 sq ft (full private home)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>Kitchen Facilities</td>
                    <td style={{ padding: '14px 20px', color: 'var(--ink-soft)' }}>Mini fridge, microwave, 2-burner cooktop</td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--forest)' }}>Full Gourmet Kitchen, oven, dishwasher, Nespresso</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>WiFi & Bandwidth</td>
                    <td style={{ padding: '14px 20px', color: 'var(--ink-soft)' }}>Shared throttle guest network (15–30 Mbps)</td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--forest)' }}>Private Gigabit Fiber (600–1000 Mbps)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>Laundry</td>
                    <td style={{ padding: '14px 20px', color: 'var(--ink-soft)' }}>Shared basement coin-operated machines</td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--forest)' }}>Private in-unit full-size washer & dryer</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>Outdoor Living</td>
                    <td style={{ padding: '14px 20px', color: 'var(--ink-soft)' }}>Lobby smoking area or parking lot</td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--forest)' }}>Private brick courtyards or rooftop harbor decks</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>Neighborhood Life</td>
                    <td style={{ padding: '14px 20px', color: 'var(--ink-soft)' }}>Commercial highway strip or downtown office core</td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--forest)' }}>Historic Canton, Fells Point, Harbor East promenades</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Corporate Inquiry Form */}
        <section className="section-pad" style={{ paddingTop: 80, paddingBottom: 100, maxWidth: 960, margin: '0 auto' }}>
          <div className="portal-card" style={{ padding: 40, boxShadow: '0 16px 40px rgba(23,35,31,0.08)' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
              Corporate & Institutional Desk
            </span>
            <h2 style={{ font: '400 2.2rem var(--serif)', margin: '6px 0 16px', color: 'var(--forest)' }}>
              Request a Corporate Allocation or Group Quote
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 28 }}>
              Complete the form below to receive customized availability, master service agreement terms, or medical per-diem packages within 1 hour.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      Company / Medical Center *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Johns Hopkins Medicine / T. Rowe Price"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      Coordinator / Resident Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Mitchell"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="smitchell@jhmi.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      Direct Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(410) 555-0182"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      Anticipated Stay Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                    >
                      <option value="14-30">14 – 30 Days (Short Rotation)</option>
                      <option value="30-90">30 – 90 Days (Clinical Fellow / Project)</option>
                      <option value="90-plus">90+ Days (Extended Relocation)</option>
                      <option value="ongoing">Year-Round Master Corporate Lease</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      Preferred Billing Method
                    </label>
                    <select
                      value={billingType}
                      onChange={(e) => setBillingType(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                    >
                      <option value="direct-invoice">Direct Institutional Invoicing (Net 30)</option>
                      <option value="corporate-card">Corporate Credit Card</option>
                      <option value="per-diem">Per-Diem Employee Reimbursement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Specific Neighborhood, Parking, or Accessibility Needs
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Please specify proximity preferences (Hopkins Bayview, UMMC, Harbor East), required bedroom counts, or pet accommodation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', fontFamily: 'var(--sans)' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 14 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                    🔒 We protect your corporate information with non-disclosure standards.
                  </span>
                  <button
                    type="submit"
                    style={{
                      padding: '14px 32px',
                      background: 'var(--copper)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Submit Corporate Inquiry ↗
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'grid', placeItems: 'center', fontSize: '1.8rem', margin: '0 auto 16px' }}>
                  ✓
                </div>
                <h3 style={{ font: '400 2rem var(--serif)', margin: '0 0 10px', color: 'var(--forest)' }}>
                  Corporate Inquiry Received
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.7 }}>
                  Thank you, <strong>{contactName}</strong> from <strong>{company}</strong>. Our corporate concierge desk has received your request and will provide tailored residence options and per-diem rates shortly.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Link href="/properties" className="btn-book" style={{ padding: '12px 24px' }}>
                    View Current Catalog ↗
                  </Link>
                  <Link href="/" className="btn-outline" style={{ padding: '12px 24px' }}>
                    Return Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer showTopCta={false} />
    </>
  );
}
