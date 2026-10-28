'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { dbSubmitInquiry } from '@/lib/supabase/database';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('corporate');
  const [dates, setDates] = useState('');
  const [guests, setGuests] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const result = await dbSubmitInquiry({
      name: fullName,
      email,
      phone,
      stayDates: dates,
      source: 'contact-page',
      message: `Inquiry type: ${inquiryType}\nGuests: ${guests || 'Not specified'}\n\n${message}`,
      metadata: { inquiryType, guests },
    });
    setSubmitting(false);
    if (!result.success) return setSubmitError(result.error || 'Your message could not be sent.');
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
              <span>Contact Us</span>
            </div>
            <h1>Make Baltimore Feel Like Home.<br /><em>Start a Conversation.</em></h1>
            <p className="lead">
              Tell us what brings you to Baltimore. Whether you require a month-long corporate relocation, medical fellowship housing, or full-service property management for your home, our team responds promptly.
            </p>
            <div className="page-hero__meta">
              <div><span>Phone / Text:</span> <strong>+1 (410) 218-8462</strong></div>
              <div><span>Direct Email:</span> <strong>info@chasestreetproperties.net</strong></div>
              <div><span>Headquarters:</span> <strong>3037 Hudson St, Baltimore</strong></div>
              <div><span>Response Time:</span> <strong>Under 1 Hour</strong></div>
            </div>
          </div>
        </section>

        {/* Contact Form & Office Section */}
        <section className="section-pad" style={{ paddingTop: 80, paddingBottom: 90, maxWidth: 1380, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 70, alignItems: 'start' }}>
            {/* Contact Form */}
            <div className="portal-card" style={{ boxShadow: '0 16px 36px rgba(23,35,31,0.08)' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                Direct Inquiry
              </span>
              <h2 style={{ font: '400 2.2rem var(--serif)', margin: '6px 0 20px', color: 'var(--ink)' }}>
                How Can We Help You?
              </h2>

              {!submitted ? (
                <form className="ticket-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="ticket-form-grid">
                    <div>
                      <label htmlFor="c-name">Full Name *</label>
                      <input
                        type="text"
                        id="c-name"
                        placeholder="e.g. Dr. Julian Hayes"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="c-email">Email Address *</label>
                      <input
                        type="email"
                        id="c-email"
                        placeholder="julian@hopkinsmedicine.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="ticket-form-grid">
                    <div>
                      <label htmlFor="c-phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="c-phone"
                        placeholder="+1 (410) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="c-type">Nature of Inquiry *</label>
                      <select
                        id="c-type"
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                      >
                        <option value="corporate">Executive Corporate Relocation (30+ Days)</option>
                        <option value="medical">Healthcare / Fellow Rotation (Hopkins / UMMC)</option>
                        <option value="booking">General Stay Reservation Assistance</option>
                        <option value="owner">Property Owner Management Inquiry</option>
                        <option value="support">Active Guest Support Request</option>
                      </select>
                    </div>
                  </div>

                  <div className="ticket-form-grid">
                    <div>
                      <label htmlFor="c-dates">Target Move-in Date / Stay Window</label>
                      <input
                        type="text"
                        id="c-dates"
                        placeholder="e.g. Nov 1, 2026 – Dec 15, 2026"
                        value={dates}
                        onChange={(e) => setDates(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="c-guests">Number of Guests</label>
                      <input
                        type="number"
                        id="c-guests"
                        min="1"
                        max="10"
                        placeholder="e.g. 2"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group-full">
                    <label htmlFor="c-message">Tell us about your requirements *</label>
                    <textarea
                      id="c-message"
                      placeholder="Please mention preferred neighborhoods, workspace needs, parking, or pet accommodation..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 12 }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
                      🔒 We never share your contact information.
                    </span>
                    <button type="submit" disabled={submitting} className="btn-book" style={{ padding: '14px 28px', fontSize: '0.75rem', opacity: submitting ? .65 : 1 }}>
                      {submitting ? 'Sending…' : 'Send Message to Concierge ↗'}
                    </button>
                  </div>
                  {submitError && <div role="alert" style={{ color: '#b42318', background: '#fef3f2', border: '1px solid #fecdca', padding: 10, borderRadius: 6, fontSize: '.78rem' }}>{submitError}</div>}
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'grid', placeItems: 'center', fontSize: '1.8rem', margin: '0 auto 18px' }}>
                    ✓
                  </div>
                  <h3 style={{ font: '400 2rem var(--serif)', margin: '0 0 10px', color: 'var(--ink)' }}>
                    Message Received
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.6 }}>
                    Thank you, <strong>{fullName}</strong>! Your inquiry has been routed to our Baltimore concierge team. We will contact you at <strong>{email}</strong> shortly.
                  </p>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              )}
            </div>

            {/* Office & Portal Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: 'var(--forest)', color: '#fff', padding: 36, borderRadius: 6, boxShadow: '0 16px 36px rgba(23,35,31,0.12)' }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--sand)', fontWeight: 600 }}>
                  Baltimore Harbor Headquarters
                </span>
                <h3 style={{ font: '400 2rem var(--serif)', margin: '8px 0 16px', color: '#fff' }}>
                  Baltimore Office
                </h3>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#c9cecb', marginBottom: 24 }}>
                  Located on historic Hudson Street in the heart of Canton, just blocks from O'Donnell Square and Canton Waterfront Park.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.82rem', borderTop: '1px solid rgba(255,255,255,0.16)', paddingTop: 20 }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--sand)' }}>Visit In Person</span>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>3037 Hudson Street, Baltimore, MD 21224</strong>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--sand)' }}>Direct Phone & SMS</span>
                    <a href="tel:+14102188462" style={{ color: '#fff', fontWeight: 500, fontSize: '0.95rem' }}>+1 (410) 218-8462</a>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--sand)' }}>Email Concierge & Host</span>
                    <a href="mailto:gonzalojouan@hotmail.com" style={{ color: '#fff', fontWeight: 500, fontSize: '0.95rem' }}>gonzalojouan@hotmail.com</a>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#c9cecb' }}>Alt: info@chasestreetproperties.net</span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--sand)' }}>Concierge Hours</span>
                    <span style={{ color: '#c9cecb' }}>Daily 8:00 AM – 8:00 PM EST (24/7 on-call emergency support)</span>
                  </div>
                </div>
              </div>

              {/* Portal Quick Card */}
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: 28 }}>
                <h4 style={{ font: '400 1.4rem var(--serif)', margin: '0 0 8px', color: 'var(--ink)' }}>
                  Resident, Owner, or Host?
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 18px' }}>
                  Access your digital keycode, submit maintenance work orders, view owner financial statements, or manage listings via our portals.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link href="/portal" className="btn-book" style={{ flex: 1, textAlign: 'center', justifyContent: 'center', padding: 12 }}>
                    Portals Hub ↗
                  </Link>
                  <Link href="/admin" className="btn-outline" style={{ padding: '12px 16px', fontSize: '0.72rem', fontWeight: 600 }}>
                    Admin Hub ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ background: '#fdfbf7', padding: '90px var(--gutter)', borderTop: '1px solid var(--line)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                Answers & Clarifications
              </span>
              <h2 style={{ font: '400 clamp(2.4rem, 4vw, 3.8rem)/1.1 var(--serif)', margin: '8px 0', color: 'var(--ink)' }}>
                Frequently Asked Questions
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <details style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: '20px 24px', cursor: 'pointer' }}>
                <summary style={{ font: '500 1.05rem var(--serif)', color: 'var(--ink)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>What is the minimum stay requirement at Baltimore Harbor Properties?</span>
                  <span style={{ color: 'var(--copper)', fontSize: '1.3rem' }}>+</span>
                </summary>
                <p style={{ margin: '14px 0 0', fontSize: '0.86rem', lineHeight: 1.7, color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  Our minimum stay is 3 nights for short-term visits, though the majority of our guests stay between 2 weeks to 6 months for medical rotations, corporate assignments, and home transitions. Generous weekly and monthly tiered discounts apply automatically.
                </p>
              </details>

              <details style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: '20px 24px', cursor: 'pointer' }}>
                <summary style={{ font: '500 1.05rem var(--serif)', color: 'var(--ink)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>How does check-in work? Can I arrive late at night?</span>
                  <span style={{ color: 'var(--copper)', fontSize: '1.3rem' }}>+</span>
                </summary>
                <p style={{ margin: '14px 0 0', fontSize: '0.86rem', lineHeight: 1.7, color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  All residences feature commercial-grade keyless smart locks. Prior to arrival, you receive a unique, encrypted 4-digit PIN code via email and SMS (also accessible anytime on your Resident Portal). Check in 24/7 at your convenience after 3:00 PM without waiting for anyone.
                </p>
              </details>

              <details style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: '20px 24px', cursor: 'pointer' }}>
                <summary style={{ font: '500 1.05rem var(--serif)', color: 'var(--ink)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Are utilities, high-speed WiFi, and housekeeping included?</span>
                  <span style={{ color: 'var(--copper)', fontSize: '1.3rem' }}>+</span>
                </summary>
                <p style={{ margin: '14px 0 0', fontSize: '0.86rem', lineHeight: 1.7, color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  Yes! Everything is 100% turnkey. Central heating/cooling, electricity, gas, water, and dedicated gigabit fiber internet (600–1000 Mbps) are covered in your rate. Mid-stay deep cleaning is easily scheduled on-demand via the Resident Portal for $75.
                </p>
              </details>

              <details style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: '20px 24px', cursor: 'pointer' }}>
                <summary style={{ font: '500 1.05rem var(--serif)', color: 'var(--ink)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Can you bill directly to my hospital, university, or corporate employer?</span>
                  <span style={{ color: 'var(--copper)', fontSize: '1.3rem' }}>+</span>
                </summary>
                <p style={{ margin: '14px 0 0', fontSize: '0.86rem', lineHeight: 1.7, color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  Absolutely. We routinely manage direct billing, purchase orders, and corporate master agreements for Johns Hopkins Health System, University of Maryland, military contractors, and national healthcare staffing agencies. Contact our desk for automated ACH/invoice billing.
                </p>
              </details>

              <details style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: '20px 24px', cursor: 'pointer' }}>
                <summary style={{ font: '500 1.05rem var(--serif)', color: 'var(--ink)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>What is the pet policy?</span>
                  <span style={{ color: 'var(--copper)', fontSize: '1.3rem' }}>+</span>
                </summary>
                <p style={{ margin: '14px 0 0', fontSize: '0.86rem', lineHeight: 1.7, color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  Many of our Canton and Fells Point properties feature private fenced courtyards and are pet-friendly for well-trained dogs with prior approval ($50 one-time pet fee). Canton Waterfront Park and Patterson Park are wonderful destinations for dogs!
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <Footer showTopCta={false} />
    </>
  );
}
