'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property } from '@/types';
import Footer from '@/components/Footer';
import { dbFetchApprovedReviews, dbSaveReservation, dbSubmitInquiry, dbSubmitReview } from '@/lib/supabase/database';
import { usePropertyStore } from '@/utils/usePropertyStore';

export default function PropertyDetailClient({
  property: initialProperty,
  propertyId,
}: {
  property: Property;
  propertyId?: number;
}) {
  const { properties } = usePropertyStore();
  const property = properties.find((item) => item.id === (propertyId || initialProperty.id)) || initialProperty;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [confirmedReservation, setConfirmedReservation] = useState<string | null>(null);
  const [assignedPin, setAssignedPin] = useState('Issued after approval');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Reviews state & modal
  const [reviewsList, setReviewsList] = useState(property.reviews || []);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [revName, setRevName] = useState('');
  const [revEmail, setRevEmail] = useState('');
  const [revStayDate, setRevStayDate] = useState('');
  const [revScore, setRevScore] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Property Inquiry Form state ("FEEL FREE TO CONTACT US")
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  // Booking calculator state
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [minDate, setMinDate] = useState('');

  // Form inputs for reservation & guest details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [stayPurpose, setStayPurpose] = useState('medical');
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment inputs
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'invoice'>('invoice');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardZip, setCardZip] = useState('');

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

  useEffect(() => {
    void dbFetchApprovedReviews(property.id).then((cloudReviews) => {
      if (!cloudReviews.length) return;
      setReviewsList((current) => {
        const existing = new Set(current.map((item) => `${item.author}|${item.date}|${item.text}`));
        return [...cloudReviews.filter((item) => !existing.has(`${item.author}|${item.date}|${item.text}`)), ...current];
      });
    });
  }, [property.id]);

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

  const handleOpenReserve = () => {
    setCheckoutStep(1);
    setConfirmedReservation(null);
    setReserveModalOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setBookingError(null);

    // Save to shared property & reservations store and Supabase
    const result = await dbSaveReservation({
      id: '',
      guest: guestName || 'Resident Guest',
      property: property.title,
      dates: `${checkin} – ${checkout}`,
      status: 'Pending',
      total: `$${total.toFixed(2)}`,
      guestEmail: guestEmail || 'direct-guest@example.invalid',
      guestPhone: guestPhone || '(410) 555-0199',
      pinCode: '',
      nights: diffDays,
      createdAt: new Date().toISOString(),
      propertyId: property.id,
      checkinDate: checkin,
      checkoutDate: checkout,
      stayPurpose,
      specialRequests,
    });

    setIsProcessingPayment(false);
    if (!result.success) {
      setBookingError(result.error || 'Your booking request could not be saved.');
      return;
    }
    setAssignedPin(result.pinCode || 'Pending');
    setConfirmedReservation(result.reservationId || 'Pending');
    setCheckoutStep(4);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName || !revComment) return;

    const newRev = {
      author: revName,
      date: revStayDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      text: revComment,
      rating: revScore,
    };

    setReviewError(null);
    const result = await dbSubmitReview({
      propertyId: property.id,
      author: revName,
      email: revEmail,
      rating: revScore,
      comment: revComment,
    });

    if (!result.success) {
      setReviewError(result.error || 'Your review could not be submitted.');
      return;
    }
    setReviewsList((prev) => [newRev, ...prev]);
    setReviewSuccess(true);

    setTimeout(() => {
      setReviewSuccess(false);
      setReviewModalOpen(false);
      setRevName('');
      setRevEmail('');
      setRevStayDate('');
      setRevComment('');
    }, 1200);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError(null);
    const result = await dbSubmitInquiry({
      name: inquiryName,
      email: inquiryEmail,
      phone: inquiryPhone,
      message: inquiryMessage,
      propertyId: property.id,
      source: 'property-detail',
    });
    if (!result.success) {
      setInquiryError(result.error || 'Your inquiry could not be sent.');
      return;
    }
    setInquirySubmitted(true);
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
            <div className="quick-stats-strip" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
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
              {property.viewType && (
                <div className="stat-item">
                  <span>View</span>
                  <strong>{property.viewType}</strong>
                </div>
              )}
              {property.bedType && (
                <div className="stat-item">
                  <span>Bed Type</span>
                  <strong>{property.bedType}</strong>
                </div>
              )}
              <div className="stat-item">
                <span>Check-in</span>
                <strong style={{ color: 'var(--copper)' }}>24/7 Keypad</strong>
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

            {/* Baltimore Icons & Cultural Proximity (SOW §3 & §9) */}
            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                    SOW §3 & §9 · Location & Attractions
                  </span>
                  <h2>Baltimore Landmarks & Local Proximity</h2>
                  <p style={{ margin: '4px 0 20px', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                    Centrally situated in {property.neighborhood} with rapid access to Baltimore's most iconic cultural and historical sites.
                  </p>
                </div>
                <Link href="/baltimore-guide" style={{ fontSize: '0.75rem', color: 'var(--copper)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  View Full City Guide ↗
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
                <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--forest)' }}>Baltimore Inner Harbor</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--copper)', fontWeight: 600 }}>7–8 min</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
                    National Aquarium, historic tall ships, and scenic waterfront promenade for morning runs or evening harbor dining.
                  </p>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--forest)' }}>The Walters Art Museum</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--copper)', fontWeight: 600 }}>10 min</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
                    Mount Vernon cultural centerpiece featuring 36,000 works of art spanning 7 millennia. Free admission every day.
                  </p>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--forest)' }}>Fort McHenry National Monument</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--copper)', fontWeight: 600 }}>10 min</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
                    Birthplace of the Star-Spangled Banner with panoramic harbor viewpoints and waterside park trails.
                  </p>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--forest)' }}>Patterson Park & Pagoda</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--copper)', fontWeight: 600 }}>4 min</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
                    155 leafy acres with tennis courts, dog runs, a Victorian observatory, and Sunday community farmers market.
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Reviews Section matching live site */}
            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0 }}>
                    Reviews <span style={{ color: '#d48806', fontSize: '1.2rem', marginLeft: 8 }}>★★★★★</span>
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                    Based on {reviewsList.length + 24} verified guest stays at this residence
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setReviewModalOpen(true)}
                  style={{ padding: '8px 18px', fontSize: '0.78rem' }}
                >
                  Write a review ↗
                </button>
              </div>

              {/* Rating Category Breakdown from live site */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 20px', marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>Comfort</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--forest)' }}>★ 5.0</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>Location</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--forest)' }}>★ 5.0</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>Service</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--forest)' }}>★ 5.0</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>Staff</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--forest)' }}>★ 5.0</strong>
                </div>
              </div>

              {/* Real Reviews Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {reviewsList.map((rev, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: 22, boxShadow: '0 4px 14px rgba(23,35,31,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--forest)', display: 'block' }}>{rev.author}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)' }}>{rev.date}</span>
                      </div>
                      <span style={{ color: '#d48806', fontSize: '0.85rem' }}>★★★★★</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.65, color: 'var(--ink)' }}>
                      "{rev.text.replace(/&rsquo;/g, "'")}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* "FEEL FREE TO CONTACT US" Property Inquiry Form from live site */}
            <div className="detail-section" style={{ borderBottom: 'none' }}>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                Direct Property Host
              </span>
              <h2>Feel Free to Contact Us</h2>
              <p style={{ margin: '4px 0 20px', fontSize: '0.86rem', color: 'var(--ink-soft)' }}>
                Have questions regarding availability, clinical rotations, corporate agreements, or pet accommodations for this specific residence? Message our Baltimore host team directly.
              </p>

              {inquirySubmitted ? (
                <div style={{ background: '#eef6f2', border: '1px solid #c2e2d0', borderRadius: 6, padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', color: '#107e4d', marginBottom: 8 }}>✓</div>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#107e4d', marginBottom: 4 }}>
                    Message Received
                  </strong>
                  <p style={{ fontSize: '0.84rem', color: '#2f5b44', margin: 0 }}>
                    Our local host team will reply to <strong>{inquiryEmail || 'your email'}</strong> within 2 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {inquiryError && <div role="alert" style={{ color: '#b42318', background: '#fef3f2', border: '1px solid #fecdca', padding: 10, borderRadius: 6, fontSize: '.78rem' }}>{inquiryError}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="email@example.com"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="(410) 555-0199"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Message *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tell us about your requested dates, stay purpose or questions regarding this residence..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                  <button type="submit" className="btn-book" style={{ alignSelf: 'flex-start', padding: '12px 28px', fontSize: '0.82rem' }}>
                    Send Inquiry ↗
                  </button>
                </form>
              )}
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

      {/* SOW §4: Comprehensive 4-Step Booking & Payment Checkout Modal */}
      {reserveModalOpen && (
        <div className="modal-backdrop is-open" onClick={() => setReserveModalOpen(false)}>
          <div
            className="modal-window"
            style={{ maxWidth: 660, padding: '32px 36px', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setReserveModalOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Stepper Indicator */}
            {checkoutStep < 4 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: checkoutStep >= 1 ? 'var(--forest)' : 'var(--line)',
                      color: checkoutStep >= 1 ? '#fff' : 'var(--ink-soft)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    1
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: checkoutStep === 1 ? 700 : 500, color: checkoutStep === 1 ? 'var(--forest)' : 'var(--ink-soft)' }}>
                    Stay & Rate
                  </span>
                </div>

                <span style={{ height: 1, width: 30, background: 'var(--line)' }}></span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: checkoutStep >= 2 ? 'var(--forest)' : 'var(--line)',
                      color: checkoutStep >= 2 ? '#fff' : 'var(--ink-soft)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    2
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: checkoutStep === 2 ? 700 : 500, color: checkoutStep === 2 ? 'var(--forest)' : 'var(--ink-soft)' }}>
                    Guest Details
                  </span>
                </div>

                <span style={{ height: 1, width: 30, background: 'var(--line)' }}></span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: checkoutStep >= 3 ? 'var(--copper)' : 'var(--line)',
                      color: checkoutStep >= 3 ? '#fff' : 'var(--ink-soft)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    3
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: checkoutStep === 3 ? 700 : 500, color: checkoutStep === 3 ? 'var(--copper)' : 'var(--ink-soft)' }}>
                    Submit Request
                  </span>
                </div>
              </div>
            )}

            {/* STEP 1: Stay & Rate Breakdown */}
            {checkoutStep === 1 && (
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                  Step 1 of 3 · Stay Parameters
                </span>
                <h2 style={{ font: '400 1.9rem var(--serif)', margin: '4px 0 14px', color: 'var(--forest)' }}>
                  Review Stay & Transparent Pricing
                </h2>

                <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 6, padding: 18, marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                    <img
                      src={property.coverImage}
                      alt={property.title}
                      style={{ width: 70, height: 52, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--line)' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--forest)' }}>{property.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>📍 {property.address}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '12px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: 'var(--ink-soft)', display: 'block', fontSize: '0.68rem' }}>Check-in</span>
                      <strong>{checkin}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--ink-soft)', display: 'block', fontSize: '0.68rem' }}>Check-out</span>
                      <strong>{checkout}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--ink-soft)', display: 'block', fontSize: '0.68rem' }}>Duration</span>
                      <strong>{diffDays} Nights ({guests} Guests)</strong>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div style={{ marginTop: 14, fontSize: '0.8rem', lineHeight: 1.8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>${property.price} × {diffDays} nights</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Turnover cleaning & hospital sanitization</span>
                      <span>${cleaning.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Maryland Lodging & Tourism Tax (9.5%)</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontSize: '0.74rem' }}>
                      <span>Refundable Security Deposit (Hold only)</span>
                      <span>$250.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--line)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest)' }}>
                      <span>Total Due Now</span>
                      <span>${total.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                    🔒 Direct Rate Guaranteed · No Third-Party Fees
                  </span>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(2)}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--copper)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Continue to Guest Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Guest Information */}
            {checkoutStep === 2 && (
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                  Step 2 of 3 · Resident Information
                </span>
                <h2 style={{ font: '400 1.9rem var(--serif)', margin: '4px 0 14px', color: 'var(--forest)' }}>
                  Who is staying at the residence?
                </h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!guestName || !guestEmail || !guestPhone) {
                      alert('Please complete all required fields.');
                      return;
                    }
                    setCheckoutStep(3);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      Primary Resident Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Julian Hayes"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', fontFamily: 'var(--sans)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                        Email Address (for keycode & receipt) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="julian@hospital.org"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', fontFamily: 'var(--sans)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                        Mobile Phone (for stay coordination) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(410) 555-0199"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', fontFamily: 'var(--sans)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      Purpose of Stay in Baltimore
                    </label>
                    <select
                      value={stayPurpose}
                      onChange={(e) => setStayPurpose(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', fontFamily: 'var(--sans)' }}
                    >
                      <option value="medical">Johns Hopkins / UMMC Clinical Rotation or Fellow</option>
                      <option value="corporate">Executive Business Travel / Corporate Relocation</option>
                      <option value="leisure">Leisure / Weekend Waterfront Stay</option>
                      <option value="family">Visiting Family / Hospital Patient Support</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      Special Arrival Notes / Parking Request (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arriving after 7 PM, need reserved garage parking"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', fontFamily: 'var(--sans)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '12px 24px',
                        background: 'var(--copper)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Review Booking Request →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: Booking request confirmation */}
            {checkoutStep === 3 && (
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                  Step 3 of 3 · Booking Request
                </span>
                <h2 style={{ font: '400 1.9rem var(--serif)', margin: '4px 0 14px', color: 'var(--forest)' }}>
                  Submit your booking request
                </h2>

                {/* Payment Method Switcher */}
                <div aria-hidden="true" style={{ display: 'none', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      padding: '10px',
                      borderRadius: 6,
                      border: paymentMethod === 'card' ? '2px solid var(--copper)' : '1px solid var(--line)',
                      background: paymentMethod === 'card' ? 'rgba(170,118,84,0.08)' : '#fff',
                      fontWeight: 600,
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>💳 Credit Card</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--ink-soft)' }}>Visa, MC, Amex</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('applepay')}
                    style={{
                      padding: '10px',
                      borderRadius: 6,
                      border: paymentMethod === 'applepay' ? '2px solid var(--copper)' : '1px solid var(--line)',
                      background: paymentMethod === 'applepay' ? 'rgba(170,118,84,0.08)' : '#fff',
                      fontWeight: 600,
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>📱 Apple / G-Pay</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--ink-soft)' }}>1-Click Checkout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('invoice')}
                    style={{
                      padding: '10px',
                      borderRadius: 6,
                      border: paymentMethod === 'invoice' ? '2px solid var(--copper)' : '1px solid var(--line)',
                      background: paymentMethod === 'invoice' ? 'rgba(170,118,84,0.08)' : '#fff',
                      fontWeight: 600,
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>🏥 Hospital Invoice</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--ink-soft)' }}>Hopkins / Corporate</span>
                  </button>
                </div>

                <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {bookingError && <div role="alert" style={{ color: '#b42318', background: '#fef3f2', border: '1px solid #fecdca', padding: 10, borderRadius: 6, fontSize: '.78rem' }}>{bookingError}</div>}
                  {paymentMethod === 'card' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                          Name on Card *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Julian Hayes"
                          value={cardName || guestName}
                          onChange={(e) => setCardName(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                          Card Number *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4532 •••• •••• 8821"
                          value={cardNumber}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            const matches = v.match(/\d{4,16}/g);
                            const match = (matches && matches[0]) || '';
                            const parts = [];
                            for (let i = 0, len = match.length; i < len; i += 4) {
                              parts.push(match.substring(i, i + 4));
                            }
                            setCardNumber(parts.length ? parts.join(' ') : v);
                          }}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', letterSpacing: '0.05em' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                            Expiration *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                            CVC *
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            placeholder="•••"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                            Billing ZIP *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            placeholder="21224"
                            value={cardZip}
                            onChange={(e) => setCardZip(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'applepay' && (
                    <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 6, padding: 20, textAlign: 'center' }}>
                      <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--ink)' }}>
                        Fast & biometric one-touch checkout via Apple Pay / Google Pay.
                      </p>
                      <button
                        type="submit"
                        disabled={isProcessingPayment}
                        style={{
                          background: '#000',
                          color: '#fff',
                          padding: '14px 28px',
                          borderRadius: 6,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                         Pay with Apple Pay (${total.toFixed(2)})
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'invoice' && (
                    <div style={{ background: 'rgba(170,118,84,0.08)', border: '1px solid var(--copper)', borderRadius: 6, padding: 18 }}>
                      <strong style={{ display: 'block', color: 'var(--forest)', fontSize: '0.85rem', marginBottom: 6 }}>
                        Availability and payment confirmation
                      </strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', margin: '0 0 12px', lineHeight: 1.6 }}>
                        No payment is collected on this page. Our team will confirm availability, review the total shown, and send you a secure payment link or approved institutional invoice.
                      </p>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 4 }}>
                          Department / Billing Code (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. JHMI-CARDIO-F26"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid var(--line)', fontSize: '0.78rem' }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ background: 'rgba(46, 125, 50, 0.08)', border: '1px solid rgba(46, 125, 50, 0.25)', borderRadius: 6, padding: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.74rem', color: '#166534' }}>
                    <span>✓</span>
                    <span>Your request is stored securely. Submitting it does not charge your card or guarantee availability.</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(2)}
                      style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      style={{
                        padding: '14px 28px',
                        background: 'var(--copper)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {isProcessingPayment ? (
                        <>
                          <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> Submitting Request...
                        </>
                      ) : (
                        `Submit Booking Request · $${total.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 4: Confirmation & Access Voucher */}
            {checkoutStep === 4 && confirmedReservation && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'grid', placeItems: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
                  ✓
                </div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--copper)', fontWeight: 700 }}>
                  Booking Request Received
                </span>
                <h2 style={{ font: '400 2.2rem var(--serif)', margin: '6px 0 10px', color: 'var(--forest)' }}>
                  We’ll confirm your stay shortly
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink-soft)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.6 }}>
                  Thank you, <strong>{guestName || 'Valued Resident'}</strong>. No payment has been taken. Our team will verify availability and email the next steps for your <strong>${total.toFixed(2)}</strong> request.
                </p>

                {/* Booking request summary */}
                <div
                  style={{
                    background: 'var(--forest)',
                    color: '#fff',
                    borderRadius: 8,
                    padding: 24,
                    textAlign: 'left',
                    marginBottom: 24,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '1px solid var(--copper)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 12, marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--sand)', letterSpacing: '0.1em' }}>
                        Reservation Reference
                      </span>
                      <strong style={{ display: 'block', fontSize: '1.2rem', fontFamily: 'monospace', color: '#fff' }}>
                        {confirmedReservation}
                      </strong>
                    </div>
                    <span style={{ background: 'rgba(46,125,50,0.3)', color: '#86efac', fontSize: '0.65rem', padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>
                      Pending Review
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: '#cbd3ce', textTransform: 'uppercase' }}>Door PIN</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--sand)', letterSpacing: '0.08em' }}>
                        {assignedPin}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#a0a6a2' }}>Released only after approval</span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.65rem', color: '#cbd3ce', textTransform: 'uppercase' }}>High-Speed WiFi</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginTop: 4 }}>
                        BHP-Gigabit-Fiber
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--sand)' }}>Password: waterfront2026</span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.65rem', color: '#cbd3ce', textTransform: 'uppercase' }}>Check-in & Location</span>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#fff', marginTop: 4 }}>
                        3:00 PM · {checkin}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#a0a6a2' }}>{property.address}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    href="/portal"
                    className="btn-book"
                    style={{ padding: '12px 28px', background: 'var(--copper)', color: '#fff', textDecoration: 'none' }}
                  >
                    Open Resident Portal ↗
                  </Link>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-outline"
                    style={{ padding: '12px 20px', cursor: 'pointer' }}
                  >
                    🖨️ Print Request Summary
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setReserveModalOpen(false)}
                    style={{ padding: '12px 20px', cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leave A Review Modal from live site */}
      {reviewModalOpen && (
        <div className="modal-backdrop is-open" onClick={() => setReviewModalOpen(false)}>
          <div
            className="modal-window"
            style={{ maxWidth: 540, padding: '32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setReviewModalOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
              Guest Feedback
            </span>
            <h3 style={{ font: '400 1.8rem var(--serif)', margin: '6px 0 16px', color: 'var(--forest)' }}>
              Leave A Review
            </h3>

            {reviewSuccess ? (
              <div style={{ background: '#eef6f2', border: '1px solid #c2e2d0', borderRadius: 6, padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', color: '#107e4d', marginBottom: 8 }}>✓</div>
                <strong style={{ display: 'block', fontSize: '1.05rem', color: '#107e4d' }}>
                  Thank You for Your Review!
                </strong>
                <p style={{ fontSize: '0.84rem', color: '#2f5b44', margin: '4px 0 0' }}>
                  Your review was received and is awaiting moderation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviewError && <div role="alert" style={{ color: '#b42318', background: '#fef3f2', border: '1px solid #fecdca', padding: 10, borderRadius: 6, fontSize: '.78rem' }}>{reviewError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Carmen"
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="carmen@example.com"
                      value={revEmail}
                      onChange={(e) => setRevEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Stay Date</label>
                    <input
                      type="date"
                      value={revStayDate}
                      onChange={(e) => setRevStayDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Rating *</label>
                    <select
                      value={revScore}
                      onChange={(e) => setRevScore(parseInt(e.target.value, 10))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    >
                      <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                      <option value={4}>★★★★☆ (4 Stars - Great)</option>
                      <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                      <option value={2}>★★☆☆☆ (2 Stars - Poor)</option>
                      <option value={1}>★☆☆☆☆ (1 Star - Terrible)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Review *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share your experience staying at this residence, the host communication, amenities, cleanliness..."
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                  />
                </div>

                <button type="submit" className="btn-book" style={{ padding: '12px 24px', fontSize: '0.82rem', marginTop: 6 }}>
                  Submit Review ↗
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer showTopCta={false} />
    </>
  );
}
