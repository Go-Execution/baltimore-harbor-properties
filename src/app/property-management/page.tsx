'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { dbSubmitInquiry } from '@/lib/supabase/database';

export default function PropertyManagementPage() {
  // Calculator State
  const [rent, setRent] = useState(2200);
  const [beds, setBeds] = useState(2);
  const [neighborhood, setNeighborhood] = useState('canton');

  // Valuation Form State
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [propType, setPropType] = useState('rowhome');
  const [propFurnished, setPropFurnished] = useState('fully');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dynamic calculation
  let baseAdr = 115;
  if (beds === 2) baseAdr = 155;
  if (beds === 3) baseAdr = 210;

  if (neighborhood === 'harbor') baseAdr += 35;
  if (neighborhood === 'fells') baseAdr += 15;

  const occupancy = 0.92;
  const bookedNights = Math.round(30.5 * occupancy);
  const gross = bookedNights * baseAdr;
  const net = Math.round(gross * 0.80); // 20% mgmt fee
  const annualExtra = Math.max(0, (net - rent) * 12);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    const result = await dbSubmitInquiry({
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      source: 'property-management',
      message: `Property: ${ownerAddress}\nType: ${propType}\nFurnished: ${propFurnished}\n\n${ownerNotes || 'No additional notes.'}`,
      metadata: { ownerAddress, propType, propFurnished },
    });
    setFormSubmitting(false);
    if (!result.success) return setFormError(result.error || 'Your valuation request could not be sent.');
    setFormSubmitted(true);
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
              <span>Property Management</span>
            </div>
            <h1>Maximize your Baltimore property yield.<br /><em>Without the landlord headaches.</em></h1>
            <p className="lead">
              We transform premium Baltimore rowhomes and condos into high-performing executive residences. Enjoy 35% to 55% higher net income than traditional long-term leases, with rigorously vetted healthcare & corporate guests and end-to-end stewardship.
            </p>
            <div className="page-hero__meta">
              <div><span>Average Occupancy:</span> <strong>93.4% Year-Round</strong></div>
              <div><span>Revenue Lift:</span> <strong>+42% vs. Long-Term</strong></div>
              <div><span>Owner Portal:</span> <strong>Real-Time Financials</strong></div>
              <div><span>Protection:</span> <strong>$1M Damage Guarantee</strong></div>
            </div>
          </div>
        </section>

        {/* Interactive ROI & Yield Calculator */}
        <section className="section-pad" id="calculator" style={{ paddingTop: 80, paddingBottom: 90, maxWidth: 1380, margin: '0 auto' }}>
          <div className="panel-header" style={{ marginBottom: 30 }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                Interactive Estimator
              </span>
              <h2 style={{ font: '400 clamp(2.4rem, 4vw, 3.8rem)/1.1 var(--serif)', margin: '6px 0' }}>
                Baltimore Rental Yield Calculator
              </h2>
              <p>See how your property performs under Baltimore Harbor Properties executive furnished management.</p>
            </div>
          </div>

          <div className="calc-card">
            {/* Sliders */}
            <div className="calc-sliders">
              <div className="slider-group">
                <label htmlFor="calc-neigh">
                  <span>Target Neighborhood</span>
                  <strong style={{ color: 'var(--copper)' }}>
                    {neighborhood === 'canton' ? "Canton / O'Donnell" : neighborhood === 'fells' ? 'Historic Fells Point' : neighborhood === 'harbor' ? 'Harbor East / Inner Harbor' : neighborhood === 'vernon' ? 'Mount Vernon' : 'Federal Hill'}
                  </strong>
                </label>
                <select
                  id="calc-neigh"
                  className="filter-select"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  style={{ width: '100%', borderRadius: 4, padding: 12 }}
                >
                  <option value="canton">Canton / O'Donnell Square</option>
                  <option value="fells">Historic Fells Point</option>
                  <option value="harbor">Harbor East / Inner Harbor</option>
                  <option value="vernon">Mount Vernon / Mid-Town</option>
                  <option value="federal">Federal Hill / Locust Point</option>
                </select>
              </div>

              <div className="slider-group">
                <label htmlFor="calc-beds">
                  <span>Property Bedrooms</span>
                  <strong style={{ color: 'var(--copper)' }}>{beds} {beds === 1 ? 'Bedroom' : 'Bedrooms'}</strong>
                </label>
                <select
                  id="calc-beds"
                  className="filter-select"
                  value={beds}
                  onChange={(e) => setBeds(parseInt(e.target.value, 10))}
                  style={{ width: '100%', borderRadius: 4, padding: 12 }}
                >
                  <option value={1}>1 Bedroom / Studio</option>
                  <option value={2}>2 Bedrooms (Most Popular)</option>
                  <option value={3}>3+ Bedrooms Rowhome</option>
                </select>
              </div>

              <div className="slider-group">
                <label htmlFor="slider-rent">
                  <span>Current Traditional Monthly Rent</span>
                  <strong style={{ color: 'var(--ink)', fontSize: '1.1rem', fontFamily: 'var(--serif)' }}>
                    ${rent.toLocaleString()} / mo
                  </strong>
                </label>
                <input
                  type="range"
                  id="slider-rent"
                  min={1400}
                  max={4500}
                  step={50}
                  value={rent}
                  onChange={(e) => setRent(parseInt(e.target.value, 10))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                  <span>$1,400/mo</span>
                  <span>$4,500/mo</span>
                </div>
              </div>
            </div>

            {/* Live Results Box */}
            <div className="calc-results-box">
              <div>
                <div className="calc-yield-header">
                  <span>Projected Executive Monthly Gross</span>
                  <strong>${gross.toLocaleString()}</strong>
                </div>

                <div style={{ margin: '24px 0', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.18)', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                    <span>Estimated ADR (Avg Daily Rate):</span>
                    <strong>${baseAdr} / night</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Occupancy Rate (Annualized):</span>
                    <strong>92.5%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Baltimore Harbor Full Management Fee:</span>
                    <span>20% (all-inclusive)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sand)', fontWeight: 600 }}>
                    <span>Projected Net Monthly to Owner:</span>
                    <strong style={{ fontSize: '1.1rem' }}>${net.toLocaleString()} / mo</strong>
                  </div>
                </div>

                <div className="calc-diff-note">
                  🎉 <strong>+${(net - rent > 0 ? net - rent : 0).toLocaleString()}/month extra profit</strong> compared to traditional leasing (+${annualExtra.toLocaleString()}/year net increase) while eliminating tenant eviction risk and property neglect.
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <a href="#valuation-form" className="btn-book" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', padding: 14, background: 'var(--copper)', color: '#fff' }}>
                  Request Official Property Audit ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Way Model Comparison */}
        <section style={{ background: '#e8e1d6', padding: '90px var(--gutter)' }}>
          <div style={{ maxWidth: 1380, margin: '0 auto' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
              The Comparison
            </span>
            <h2 style={{ font: '400 clamp(2.4rem, 4vw, 3.8rem)/1.1 var(--serif)', margin: '8px 0 40px', color: 'var(--ink)' }}>
              Why Baltimore owners switch to Baltimore Harbor.
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              <div style={{ background: '#fff', padding: 32, border: '1px solid var(--line)', borderRadius: 4 }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#888' }}>Model A</span>
                <h3 style={{ font: '400 1.8rem var(--serif)', margin: '8px 0 16px', color: 'var(--ink)' }}>Traditional 12-Mo Lease</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', fontSize: '0.82rem', lineHeight: 2, color: 'var(--ink-soft)' }}>
                  <li>❌ Fixed below-market rent locked for 12 months</li>
                  <li>❌ Eviction vulnerability & tenant payment disputes</li>
                  <li>❌ Undetected wear & tear discovered only at lease end</li>
                  <li>❌ Zero personal use for the owner or family</li>
                  <li>❌ Agent placement fees (1 month rent every turnover)</li>
                </ul>
              </div>

              <div style={{ background: '#fff', padding: 32, border: '1px solid var(--line)', borderRadius: 4 }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#888' }}>Model B</span>
                <h3 style={{ font: '400 1.8rem var(--serif)', margin: '8px 0 16px', color: 'var(--ink)' }}>DIY Airbnb Management</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', fontSize: '0.82rem', lineHeight: 2, color: 'var(--ink-soft)' }}>
                  <li>❌ 24/7 guest messaging & midnight lockout calls</li>
                  <li>❌ Last-minute cleaner cancellations & laundry stress</li>
                  <li>❌ Unregulated party risk and neighbor friction</li>
                  <li>❌ Sub-optimal manual pricing losing thousands</li>
                  <li>❌ High platform service commissions</li>
                </ul>
              </div>

              <div style={{ background: 'var(--forest)', color: '#fff', padding: 32, borderRadius: 4, boxShadow: '0 16px 40px rgba(23,35,31,0.18)', position: 'relative', overflow: 'hidden' }}>
                <span className="p-badge p-badge--copper" style={{ position: 'absolute', top: 20, right: 20 }}>Top Choice</span>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--sand)' }}>Model C</span>
                <h3 style={{ font: '400 1.8rem var(--serif)', margin: '8px 0 16px', color: '#fff' }}>Baltimore Harbor Properties</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', fontSize: '0.82rem', lineHeight: 2, color: '#d6deda' }}>
                  <li>✓ <strong>+35% to +55% Net Revenue Premium</strong></li>
                  <li>✓ <strong>Vetted Healthcare, Corporate & Executive Guests</strong></li>
                  <li>✓ <strong>Weekly In-House Cleaning & Maintenance Checks</strong></li>
                  <li>✓ <strong>Dynamic Algorithmic Revenue Optimization</strong></li>
                  <li>✓ <strong>Transparent Owner Portal with Instant ACH Payouts</strong></li>
                  <li>✓ <strong>Personal Owner Stays with 1-Click Calendar Locks</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Free Valuation Form */}
        <section className="section-pad" id="valuation-form" style={{ paddingTop: 90, paddingBottom: 110, maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
              Get Started
            </span>
            <h2 style={{ font: '400 clamp(2.4rem, 4.5vw, 4rem)/1.1 var(--serif)', margin: '8px 0 14px', color: 'var(--ink)' }}>
              Request Your Free Property Assessment
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', maxWidth: 580, margin: '0 auto' }}>
              We will analyze your Baltimore address, evaluate local corporate & medical housing demand, and deliver an audited revenue projection within 24 hours.
            </p>
          </div>

          <div className="portal-card" style={{ boxShadow: '0 16px 36px rgba(23,35,31,0.08)' }}>
            {!formSubmitted ? (
              <form className="ticket-form" onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="ticket-form-grid">
                  <div>
                    <label htmlFor="owner-name">Owner Full Name *</label>
                    <input
                      type="text"
                      id="owner-name"
                      placeholder="e.g. Eleanor Vance"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="owner-email">Email Address *</label>
                    <input
                      type="email"
                      id="owner-email"
                      placeholder="eleanor@domain.com"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="ticket-form-grid">
                  <div>
                    <label htmlFor="owner-phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="owner-phone"
                      placeholder="+1 (410) 555-0199"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="owner-address">Property Street Address & Zip Code *</label>
                    <input
                      type="text"
                      id="owner-address"
                      placeholder="e.g. 2900 O'Donnell St, 21224"
                      value={ownerAddress}
                      onChange={(e) => setOwnerAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="ticket-form-grid">
                  <div>
                    <label htmlFor="prop-type">Property Configuration</label>
                    <select
                      id="prop-type"
                      value={propType}
                      onChange={(e) => setPropType(e.target.value)}
                    >
                      <option value="rowhome">Historic Rowhome (Canton / Fells Point)</option>
                      <option value="condo">Waterfront Condo / Loft (Inner Harbor / Harbor East)</option>
                      <option value="apartment">Multi-Family / Multi-Unit Building</option>
                      <option value="townhouse">Modern Townhouse</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="prop-furnished">Is the Property Currently Furnished?</label>
                    <select
                      id="prop-furnished"
                      value={propFurnished}
                      onChange={(e) => setPropFurnished(e.target.value)}
                    >
                      <option value="fully">Fully Furnished</option>
                      <option value="partial">Partially Furnished</option>
                      <option value="unfurnished">Unfurnished (Need Turnkey Staging)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-full">
                  <label htmlFor="owner-notes">Additional Details or Timelines</label>
                  <textarea
                    id="owner-notes"
                    placeholder="Tell us about the property, current lease status, parking spots, or any specific goals..."
                    value={ownerNotes}
                    onChange={(e) => setOwnerNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 12 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
                    🔒 No obligation · 100% confidential assessment
                  </span>
                  <button type="submit" disabled={formSubmitting} className="btn-book" style={{ padding: '14px 28px', fontSize: '0.75rem', opacity: formSubmitting ? .65 : 1 }}>
                    {formSubmitting ? 'Submitting…' : 'Submit for Revenue Assessment ↗'}
                  </button>
                </div>
                {formError && <div role="alert" style={{ color: '#b42318', background: '#fef3f2', border: '1px solid #fecdca', padding: 10, borderRadius: 6, fontSize: '.78rem' }}>{formError}</div>}
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'grid', placeItems: 'center', fontSize: '1.8rem', margin: '0 auto 18px' }}>
                  ✓
                </div>
                <h3 style={{ font: '400 2rem var(--serif)', margin: '0 0 10px', color: 'var(--ink)' }}>
                  Valuation Request Received
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.6 }}>
                  Thank you, <strong>{ownerName}</strong>! Our Baltimore acquisitions team is compiling a full comp analysis for <strong>{ownerAddress}</strong>. We will email your custom revenue yield projection within 24 hours.
                </p>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setFormSubmitted(false)}
                >
                  Submit Another Property
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer showTopCta={true} />
    </>
  );
}
