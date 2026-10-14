'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property } from '@/types';
import Footer from '@/components/Footer';

export default function PropertyDetailClient({ property }: { property: Property }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<string | null>(null);

  // Booking calculator state
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [minDate, setMinDate] = useState('');

  // Form inputs for reservation
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [stayPurpose, setStayPurpose] = useState('medical');

  useEffect(() => {
    const today = new Date();
    const localToday = today.toISOString().split('T')[0];
    setMinDate(localToday);

    const d1 = new Date(today);
    d1.setDate(today.getDate() + 2);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 6);

    setCheckin(d1.toISOString().split('T')[0]);
    setCheckout(d2.toISOString().split('T')[0]);
  }, []);

  const handleCheckinChange = (val: string) => {
    setCheckin(val);
    const d1 = new Date(val);
    const minOut = new Date(d1);
    minOut.setDate(d1.getDate() + 3); // 3 nights min
    const minOutIso = minOut.toISOString().split('T')[0];
    if (checkout && checkout <= val) {
      setCheckout(minOutIso);
    }
  };

  // Calculations
  const diffDays = (() => {
    if (!checkin || !checkout) return 4;
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return isNaN(diff) || diff < 1 ? 3 : diff;
  })();

  const subtotal = diffDays * property.price;
  const cleaning = property.cleaningFee;
  const taxes = Math.round((subtotal + cleaning) * property.taxRate * 100) / 100;
  const total = subtotal + cleaning + taxes;

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const code = 'CSP-' + Math.floor(100000 + Math.random() * 900000);
    setConfirmedReservation(code);
  };

  return (
    <>
      <main id="main">
        {/* Header Breadcrumbs */}
        <section className="detail-header">
          <div className="detail-header__inner">
            <div className="detail-header__main">
              <div className="breadcrumbs">
                <Link href="/">Home</Link>
                <span className="sep">/</span>
                <Link href="/properties">Residences</Link>
                <span className="sep">/</span>
                <Link href={`/properties?neighborhood=${encodeURIComponent(property.neighborhood)}`}>
                  {property.neighborhood}
                </Link>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {property.badges.map((b, idx) => (
                  <span key={idx} className="p-badge p-badge--copper">
                    {b}
                  </span>
                ))}
              </div>

              <h1 id="prop-title">{property.title}</h1>
              <div className="detail-header__address">
                📍 {property.address} · <span style={{ color: 'var(--copper)', fontWeight: 500 }}>{property.neighborhood}</span>
              </div>
            </div>

            <div className="detail-header__actions">
              <Link href="/properties" className="btn-outline">
                ← Back to All Stays
              </Link>
              <Link href="/portal" className="btn-outline">
                Resident Portal ↗
              </Link>
            </div>
          </div>
        </section>

        {/* 5-Photo Gallery Grid */}
        <section className="detail-gallery">
          <div className="gallery-grid">
            <div className="gallery-item gallery-item--main" onClick={() => setLightboxOpen(true)}>
              <img src={property.gallery[0] || property.coverImage} alt={`${property.title} main`} />
            </div>
            <div className="gallery-item" onClick={() => setLightboxOpen(true)}>
              <img src={property.gallery[1] || property.gallery[0]} alt={`${property.title} secondary`} />
            </div>
            <div className="gallery-item" onClick={() => setLightboxOpen(true)}>
              <img src={property.gallery[2] || property.gallery[0]} alt={`${property.title} kitchen`} />
            </div>
            <div className="gallery-item" onClick={() => setLightboxOpen(true)}>
              <img src={property.gallery[3] || property.gallery[0]} alt={`${property.title} detail`} />
            </div>
            <div className="gallery-item" onClick={() => setLightboxOpen(true)}>
              <img src={property.gallery[4] || property.gallery[0]} alt={`${property.title} exterior`} />
            </div>
            <button
              type="button"
              className="gallery-btn-all"
              onClick={() => setLightboxOpen(true)}
            >
              View all {property.gallery.length} photos ↗
            </button>
          </div>
        </section>

        {/* Two-Column Layout */}
        <section className="detail-layout">
          {/* Left Column */}
          <div className="detail-content">
            {/* Quick Stats Strip */}
            <div className="quick-stats-strip">
              <div className="stat-item">
                <span>Capacity</span>
                <strong>{property.guests} Guests</strong>
              </div>
              <div className="stat-item">
                <span>Bedrooms</span>
                <strong>{property.bedrooms} Bed ({property.beds} Beds)</strong>
              </div>
              <div className="stat-item">
                <span>Bathrooms</span>
                <strong>{property.bathrooms} Bath</strong>
              </div>
              <div className="stat-item">
                <span>Living Space</span>
                <strong>{property.sqft} sq ft</strong>
              </div>
            </div>

            {/* Overview */}
            <div className="detail-section">
              <h2>About this residence</h2>
              <p>{property.description}</p>
              <p>
                Whether you are on a temporary clinical rotation at Johns Hopkins, executing an executive relocation, or enjoying a restful waterfront retreat, this home is engineered for seamless daily living. Furnished with thoughtful restraint, premium memory foam mattresses, hotel-grade percale linens, and rapid gigabit fiber connectivity.
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="detail-section">
              <h2>Residence amenities</h2>
              <p>Everything you need for extended comfort, from high-pressure rainfall showers to executive dual-monitor workstations.</p>
              <div className="amenities-grid">
                {property.amenities.map((a, idx) => (
                  <div key={idx} className="amenity-row">
                    <div className="amenity-icon">{a.icon}</div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.84rem', color: 'var(--ink)' }}>{a.name}</strong>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>
                        {a.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commute Times */}
            <div className="detail-section">
              <h2>Baltimore proximity & commute</h2>
              <p>Carefully positioned in Baltimore's most walkable and secure neighborhoods with effortless access to medical complexes and transit.</p>
              <div className="commute-card">
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 600 }}>
                  Door-to-Destination Times
                </span>
                <div className="commute-list">
                  {property.commute.map((c, idx) => (
                    <div key={idx} className="commute-item">
                      <span className="place">{c.destination}</span>
                      <span className="duration">⏱️ {c.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stay Standards */}
            <div className="detail-section">
              <h2>Stay standards & house rules</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 16, fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                <div style={{ background: '#fff', padding: 20, border: '1px solid var(--line)', borderRadius: 4 }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>🕒 Check-in & Check-out</strong>
                  Check-in anytime after 3:00 PM via keypad PIN. Check-out is 11:00 AM. Early check-in or late checkout upon request.
                </div>
                <div style={{ background: '#fff', padding: 20, border: '1px solid var(--line)', borderRadius: 4 }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>🚭 Smoke-Free & Quiet Hours</strong>
                  100% non-smoking residence. Quiet neighborhood hours observed between 10:00 PM and 7:00 AM.
                </div>
                <div style={{ background: '#fff', padding: 20, border: '1px solid var(--line)', borderRadius: 4 }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>🐾 Pet Policy</strong>
                  Well-behaved dogs permitted with prior management approval ($50 one-time pet fee).
                </div>
                <div style={{ background: '#fff', padding: 20, border: '1px solid var(--line)', borderRadius: 4 }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>🛡️ Safe & Clean Guarantee</strong>
                  Professional turnover with EPA-registered hospital-grade sanitization between every guest.
                </div>
              </div>
            </div>

            {/* Verified Reviews */}
            <div className="detail-section" style={{ borderBottom: 'none' }}>
              <h2>Verified guest reviews</h2>
              <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', marginBottom: 24 }}>
                <div style={{ font: '400 3rem var(--serif)', color: 'var(--ink)' }}>{property.rating}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                  ★★★★★ · Based on {property.reviewsCount} verified executive & healthcare stays
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>Dr. Katherine R.</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--copper)' }}>Johns Hopkins Fellow</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--ink-soft)' }}>
                    "The quietest, most comfortable stay during my 3-month rotation. The fiber WiFi was flawless for telemedicine calls, and coming back to a warm, stylish home made long hospital shifts bearable."
                  </p>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>Michael S.</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--copper)' }}>Executive Relocation</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--ink-soft)' }}>
                    "Far superior to extended-stay hotels. Check-in was instant with the keypad code, the kitchen had high-end cookware, and the neighborhood feels safe and vibrant. Gonzalo's team is exceptional."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <aside>
            <div className="booking-widget-sticky">
              <div className="widget-price-bar">
                <div className="widget-rate">
                  <strong>${property.price}</strong> / night
                </div>
                <div className="widget-rating">
                  <span>★ {property.rating}</span>
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 300 }}>({property.reviewsCount})</span>
                </div>
              </div>

              <form className="widget-form" onSubmit={(e) => { e.preventDefault(); setReserveModalOpen(true); }}>
                <div className="date-pickers-row">
                  <div className="date-box">
                    <label htmlFor="calc-checkin">Check-in</label>
                    <input
                      type="date"
                      id="calc-checkin"
                      min={minDate}
                      value={checkin}
                      onChange={(e) => handleCheckinChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="date-box">
                    <label htmlFor="calc-checkout">Check-out</label>
                    <input
                      type="date"
                      id="calc-checkout"
                      min={checkin || minDate}
                      value={checkout}
                      onChange={(e) => setCheckout(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="guests-select-box">
                  <label htmlFor="calc-guests">Guests</label>
                  <select
                    id="calc-guests"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    aria-label="Guests count"
                  >
                    {Array.from({ length: property.guests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="price-breakdown">
                  <div className="breakdown-row">
                    <span>{diffDays} nights × ${property.price}</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Turnover & Cleaning Fee</span>
                    <span>${cleaning}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>MD Hospitality & Lodging Tax (9.5%)</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-row total-row">
                    <span>Total Due</span>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                </div>

                <button type="submit" className="widget-cta-btn">
                  Reserve This Residence <span>↗</span>
                </button>
                <div className="widget-guarantee">
                  🔒 Direct Booking Guaranteed · No Platform Markups
                </div>
              </form>

              {/* Corporate Billing Assistance */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--paper-deep)', display: 'grid', placeItems: 'center', fontSize: '1rem' }}>
                    🛎️
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--ink)' }}>Need 30+ Days or Direct Billing?</strong>
                    <span>We handle corporate invoicing & per-diem limits.</span>
                  </div>
                </div>
                <Link href="/contact" style={{ color: 'var(--copper)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                  Inquire for corporate rates ↗
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="modal-backdrop is-open" onClick={() => setLightboxOpen(false)}>
          <div className="modal-window" style={{ maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <h3 style={{ font: '400 1.8rem var(--serif)', margin: '0 0 16px' }}>
              {property.title} Photo Gallery
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {property.gallery.map((img, i) => (
                <div key={i}>
                  <img
                    src={img}
                    alt={`${property.title} ${i + 1}`}
                    style={{ width: '100%', borderRadius: 4, display: 'block' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reservation Checkout Modal */}
      {reserveModalOpen && (
        <div className="modal-backdrop is-open" onClick={() => setReserveModalOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setReserveModalOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            {!confirmedReservation ? (
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--copper)', fontWeight: 600 }}>
                  Instant Direct Booking
                </span>
                <h2 style={{ font: '400 2rem var(--serif)', margin: '6px 0 16px', color: 'var(--ink)' }}>
                  Confirm Your Stay
                </h2>

                <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, padding: 16, marginBottom: 20 }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--ink)', display: 'block', marginBottom: 6 }}>
                    {property.title}
                  </strong>
                  <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>📍 {property.address}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--copper)', fontWeight: 500 }}>
                    📅 {checkin} to {checkout} ({diffDays} Nights) · 👥 {guests} Guests
                  </p>
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--line)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>
                    Total: ${total.toFixed(2)} USD (includes cleaning & MD taxes)
                  </div>
                </div>

                <form className="ticket-form" onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label htmlFor="guest-name">Primary Guest Full Name *</label>
                    <input
                      type="text"
                      id="guest-name"
                      placeholder="e.g. Dr. Julian Hayes"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="ticket-form-grid">
                    <div>
                      <label htmlFor="guest-email">Email Address *</label>
                      <input
                        type="email"
                        id="guest-email"
                        placeholder="julian@hospital.org"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="guest-phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="guest-phone"
                        placeholder="+1 (410) 000-0000"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="stay-purpose">Purpose of Stay</label>
                    <select
                      id="stay-purpose"
                      value={stayPurpose}
                      onChange={(e) => setStayPurpose(e.target.value)}
                    >
                      <option value="medical">Healthcare / Medical Travel (Hopkins / Bayview / UMD)</option>
                      <option value="corporate">Executive Business / Corporate Project</option>
                      <option value="relocation">Relocation / Housing Transition</option>
                      <option value="leisure">Leisure / Weekend Waterfront Stay</option>
                    </select>
                  </div>

                  <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, padding: 14, fontSize: '0.74rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    💳 <strong>Payment Method:</strong> Secure Direct Authorization. Digital keycards and door PIN codes are dispatched to your Resident Portal immediately upon booking.
                  </div>

                  <button
                    type="submit"
                    className="btn-book"
                    style={{ padding: 16, fontSize: '0.75rem', textAlign: 'center', justifyContent: 'center', marginTop: 8 }}
                  >
                    Complete Reservation <span>↗</span>
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'grid', placeItems: 'center', fontSize: '1.8rem', margin: '0 auto 18px' }}>
                  ✓
                </div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 600 }}>
                  Reservation Confirmed
                </span>
                <h2 style={{ font: '400 2.2rem var(--serif)', margin: '6px 0 14px', color: 'var(--ink)' }}>
                  You're staying in Baltimore!
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
                  Thank you, <strong>{guestName || 'Valued Guest'}</strong>. Your confirmation code is{' '}
                  <strong style={{ color: 'var(--ink)', fontFamily: 'monospace' }}>{confirmedReservation}</strong>. A copy with check-in instructions and keycode has been issued.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                  <Link href="/portal" className="btn-book" style={{ padding: '12px 24px' }}>
                    Open Resident Portal ↗
                  </Link>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setReserveModalOpen(false)}
                    style={{ padding: '12px 24px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer showTopCta={false} />
    </>
  );
}
