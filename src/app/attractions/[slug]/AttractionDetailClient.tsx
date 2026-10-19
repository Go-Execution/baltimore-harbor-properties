'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BaltimoreAttraction } from '@/data/attractions';
import { Property } from '@/types';
import Footer from '@/components/Footer';
import QuickViewModal from '@/components/QuickViewModal';
import { addReservation } from '@/utils/propertyStore';
import { dbSaveReservation } from '@/lib/supabase/database';

interface Props {
  attraction: BaltimoreAttraction;
  nearbyProperties: Property[];
  otherAttractions: BaltimoreAttraction[];
}

export default function AttractionDetailClient({
  attraction,
  nearbyProperties,
  otherAttractions,
}: Props) {
  // Modal states
  const [selectedQuickViewProp, setSelectedQuickViewProp] = useState<Property | null>(null);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Booking process states
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [confirmedReservation, setConfirmedReservation] = useState<string | null>(null);
  const [assignedPin, setAssignedPin] = useState('5129#');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Booking calculator state
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [minDate, setMinDate] = useState('');

  // Guest details state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [stayPurpose, setStayPurpose] = useState('vacation');
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'invoice'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardZip, setCardZip] = useState('');

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const localToday = today.toISOString().split('T')[0];
    setMinDate(localToday);

    const d1 = new Date(today);
    d1.setDate(today.getDate() + 3);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 7);

    setCheckin(d1.toISOString().split('T')[0]);
    setCheckout(d2.toISOString().split('T')[0]);
  }, []);

  // Set default booking property
  useEffect(() => {
    if (nearbyProperties.length > 0 && !bookingProperty) {
      setBookingProperty(nearbyProperties[0]);
    }
  }, [nearbyProperties, bookingProperty]);

  // Compute pricing
  const currentProp = bookingProperty || nearbyProperties[0];
  const pricePerNight = currentProp ? currentProp.price : 149;
  const d1 = checkin ? new Date(checkin) : new Date();
  const d2 = checkout ? new Date(checkout) : new Date();
  const diffTime = Math.max(0, d2.getTime() - d1.getTime());
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const subtotal = pricePerNight * diffDays;
  const cleaningFee = 120;
  const taxes = Math.round(subtotal * 0.095);
  const total = subtotal + cleaningFee + taxes;

  const handleOpenBooking = (prop: Property) => {
    setBookingProperty(prop);
    setCheckoutStep(1);
    setReserveModalOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    const code = 'CSP-2026-' + Math.floor(1000 + Math.random() * 9000);
    const pin = Math.floor(1000 + Math.random() * 9000) + '#';
    setAssignedPin(pin);
    setConfirmedReservation(code);

    // Save to store and Supabase so Admin and Portal see this immediately
    await dbSaveReservation({
      id: code,
      guest: guestName || 'Resident Guest',
      property: currentProp ? currentProp.title : attraction.title + ' Nearby Stay',
      dates: `${checkin} – ${checkout}`,
      status: 'Confirmed',
      total: `$${total.toFixed(2)}`,
      guestEmail: guestEmail || 'attraction-guest@chasestreetproperties.net',
      guestPhone: guestPhone || '(410) 555-0199',
      pinCode: pin,
      nights: diffDays,
      createdAt: new Date().toISOString(),
    });

    setIsProcessingPayment(false);
    setCheckoutStep(4);
  };

  return (
    <>
      <main id="main">
        {/* Page Hero */}
        <section className="page-hero" style={{ background: 'var(--forest)', color: '#fff' }}>
          <div className="page-hero__inner">
            <div className="breadcrumbs" style={{ color: 'var(--sand)' }}>
              <Link href="/" style={{ color: 'var(--sand)' }}>Home</Link>
              <span className="sep">/</span>
              <Link href="/attractions" style={{ color: 'var(--sand)' }}>Attractions</Link>
              <span className="sep">/</span>
              <span style={{ color: '#fff' }}>{attraction.title}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '14px 0' }}>
              <span className="p-badge p-badge--copper">{attraction.badge}</span>
              <span className="p-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                {attraction.category}
              </span>
              <span className="p-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                🚶 {attraction.commuteTime}
              </span>
            </div>

            <h1 style={{ font: '400 clamp(2.4rem, 4.5vw, 4.2rem)/1.08 var(--serif)', margin: '10px 0 16px', color: '#fff' }}>
              {attraction.title}
            </h1>
            <p className="lead" style={{ color: '#d0dad5', maxWidth: 840, fontSize: '1.05rem', lineHeight: 1.7 }}>
              {attraction.subtitle}
            </p>

            <div className="page-hero__meta" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              <div><span>Address:</span> <strong style={{ color: '#fff' }}>{attraction.address}</strong></div>
              <div><span>Visiting Hours:</span> <strong style={{ color: '#fff' }}>{attraction.hours}</strong></div>
              <div><span>Admission:</span> <strong style={{ color: '#fff' }}>{attraction.admission}</strong></div>
              <div><span>Neighborhood:</span> <strong style={{ color: '#fff' }}>{attraction.nearbyNeighborhood}</strong></div>
            </div>
          </div>
        </section>

        {/* Gallery Showcase */}
        <section style={{ maxWidth: 1380, margin: '40px auto 0', padding: '0 var(--gutter)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 20,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#000',
              boxShadow: '0 16px 40px rgba(23,35,31,0.08)',
            }}
          >
            {/* Primary Image */}
            <div
              style={{
                position: 'relative',
                minHeight: 460,
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={() => {
                setActiveGalleryIndex(0);
                setLightboxOpen(true);
              }}
            >
              <img
                src={attraction.gallery[0] || attraction.heroImage}
                alt={attraction.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  background: 'rgba(23,35,31,0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 4,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>🔍 Click to expand high-res photo</span>
              </div>
            </div>

            {/* Thumbnail Column */}
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 20 }}>
              {attraction.gallery.slice(1, 3).map((imgUrl, idx) => (
                <div
                  key={idx}
                  style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => {
                    setActiveGalleryIndex(idx + 1);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`${attraction.title} view ${idx + 2}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.15)',
                      transition: 'background 0.2s ease',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content & Practical Info Grid */}
        <section className="section-pad" style={{ maxWidth: 1380, margin: '60px auto 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
              gap: 60,
              alignItems: 'start',
            }}
          >
            {/* Left: Narrative Overview */}
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                Historical Overview & Experience
              </span>
              <h2 style={{ font: '400 clamp(2rem, 3.2vw, 2.8rem)/1.15 var(--serif)', margin: '8px 0 24px', color: 'var(--forest)' }}>
                About {attraction.title}
              </h2>

              <div style={{ fontSize: '0.98rem', lineHeight: 1.85, color: 'var(--ink)' }}>
                {attraction.fullDescription.map((paragraph, idx) => (
                  <p key={idx} style={{ marginBottom: 20 }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Highlights List */}
              <div
                style={{
                  marginTop: 40,
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  padding: '32px 36px',
                  boxShadow: '0 8px 24px rgba(23,35,31,0.03)',
                }}
              >
                <h3 style={{ font: '400 1.6rem var(--serif)', color: 'var(--forest)', margin: '0 0 16px' }}>
                  Visitor Highlights & Must-See Features
                </h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--ink)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {attraction.visitorHighlights.map((hl, idx) => (
                    <li key={idx}>
                      <strong>{hl.split('(')[0]}</strong>
                      {hl.includes('(') ? ` (${hl.split('(')[1]}` : ''}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Insider Tips Card */}
              <div
                style={{
                  marginTop: 30,
                  background: 'var(--paper)',
                  border: '1px solid rgba(170,118,84,0.3)',
                  borderLeft: '5px solid var(--copper)',
                  borderRadius: '0 8px 8px 0',
                  padding: '28px 32px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>💡</span>
                  <h4 style={{ margin: 0, font: '400 1.3rem var(--serif)', color: 'var(--forest)' }}>
                    Chase Street Local Concierge Tips
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--ink)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                  {attraction.insiderTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Fast Facts & Transit Sidebar */}
            <aside
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '32px 28px',
                boxShadow: '0 12px 32px rgba(23,35,31,0.05)',
                position: 'sticky',
                top: 100,
              }}
            >
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                Visitor Information
              </span>
              <h3 style={{ font: '400 1.7rem var(--serif)', margin: '8px 0 20px', color: 'var(--forest)' }}>
                Plan Your Visit
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, borderBottom: '1px solid var(--line)', paddingBottom: 24, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-soft)', marginBottom: 4 }}>
                    📍 Physical Address
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest)' }}>
                    {attraction.address}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-soft)', marginBottom: 4 }}>
                    ⏰ Operating Hours
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest)' }}>
                    {attraction.hours}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-soft)', marginBottom: 4 }}>
                    🎟️ Admission Rates
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest)' }}>
                    {attraction.admission}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-soft)', marginBottom: 4 }}>
                    🚶 Commute from Stays
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest)' }}>
                    {attraction.commuteTime}
                  </div>
                </div>
              </div>

              {/* Transit & Commute note */}
              <div style={{ background: '#f9f8f6', padding: '16px 18px', borderRadius: 6, marginBottom: 24, fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                <strong style={{ display: 'block', color: 'var(--forest)', marginBottom: 4 }}>
                  🚆 Transit & Parking
                </strong>
                Water Taxi terminals, Charm City Circulator (free city bus), and reserved resident parking are available directly adjacent to our Chase Street addresses.
              </div>

              <a
                href="#nearby-stays"
                className="btn-book"
                style={{ width: '100%', textAlign: 'center', padding: '14px 20px', fontSize: '0.82rem' }}
              >
                Browse Stays Near This Landmark ↓
              </a>
            </aside>
          </div>
        </section>

        {/* Dedicated Residences Section */}
        <section
          id="nearby-stays"
          className="section-pad"
          style={{
            background: '#faf8f5',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            marginTop: 70,
            paddingTop: 80,
            paddingBottom: 90,
          }}
        >
          <div style={{ maxWidth: 1380, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
              <div>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                  Immediate Doorstep Access
                </span>
                <h2 style={{ font: '400 clamp(2.2rem, 3.8vw, 3.2rem)/1.1 var(--serif)', margin: '8px 0 6px', color: 'var(--forest)' }}>
                  Chase Street Residences Near {attraction.title}
                </h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', maxWidth: 700 }}>
                  Avoid standard hotel surcharges. Stay in fully furnished, private executive apartments and historic brownstones featuring high-speed WiFi, dedicated workspaces, and private entrances.
                </p>
              </div>

              {/* Quick Date Calculator Banner */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ color: 'var(--ink-soft)', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600 }}>Your Selected Stay</div>
                  <strong>{diffDays} Nights</strong> ({checkin} to {checkout})
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenBooking(nearbyProperties[0])}
                  className="btn-book"
                  style={{ padding: '10px 20px', fontSize: '0.75rem' }}
                >
                  Book Online Direct ↗
                </button>
              </div>
            </div>

            {/* Property Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: 32,
              }}
            >
              {nearbyProperties.map((prop) => (
                <article
                  key={prop.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 24px rgba(23,35,31,0.04)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Property Image */}
                  <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                    <img
                      src={prop.coverImage}
                      alt={prop.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
                      <span className="p-badge p-badge--copper">{prop.neighborhood}</span>
                      <span className="p-badge" style={{ background: 'rgba(23,35,31,0.85)', color: '#fff', borderColor: 'transparent' }}>
                        {attraction.commuteTime}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginBottom: 6 }}>
                      📍 {prop.address}
                    </div>
                    <h3 style={{ font: '400 1.5rem/1.2 var(--serif)', margin: '0 0 10px', color: 'var(--forest)' }}>
                      <Link href={`/properties/${prop.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {prop.title}
                      </Link>
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 18px', flex: 1 }}>
                      {prop.subtitle || prop.description}
                    </p>

                    {/* Specs */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 8,
                        padding: '10px 12px',
                        background: '#faf8f5',
                        border: '1px solid var(--line)',
                        borderRadius: 6,
                        marginBottom: 20,
                        fontSize: '0.7rem',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        color: 'var(--ink-soft)',
                      }}
                    >
                      <div><strong style={{ display: 'block', color: 'var(--forest)', fontSize: '0.92rem' }}>{prop.guests}</strong>Guests</div>
                      <div><strong style={{ display: 'block', color: 'var(--forest)', fontSize: '0.92rem' }}>{prop.bedrooms}</strong>Beds</div>
                      <div><strong style={{ display: 'block', color: 'var(--forest)', fontSize: '0.92rem' }}>{prop.bathrooms}</strong>Bath</div>
                      <div><strong style={{ display: 'block', color: 'var(--forest)', fontSize: '0.92rem' }}>{prop.sqft}</strong>Sq Ft</div>
                    </div>

                    {/* Footer / Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Nightly Rate</div>
                        <div style={{ fontSize: '1.15rem', color: 'var(--forest)', fontWeight: 600 }}>
                          ${prop.price} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ink-soft)' }}>/ night</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn-outline"
                          style={{ padding: '8px 14px', fontSize: '0.72rem' }}
                          onClick={() => setSelectedQuickViewProp(prop)}
                        >
                          Quick View
                        </button>
                        <button
                          type="button"
                          className="btn-book"
                          style={{ padding: '8px 16px', fontSize: '0.72rem' }}
                          onClick={() => handleOpenBooking(prop)}
                        >
                          Book Stay ↗
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Other Baltimore Attractions Navigation */}
        <section className="section-pad" style={{ maxWidth: 1380, margin: '80px auto', padding: '0 var(--gutter)' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
              Continue Exploring
            </span>
            <h2 style={{ font: '400 clamp(2rem, 3.4vw, 2.8rem)/1.1 var(--serif)', margin: '8px 0', color: 'var(--forest)' }}>
              More Baltimore Cultural Landmarks
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
              Every neighborhood tells a different story. Discover what else is just around the corner.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {otherAttractions.map((other) => (
              <Link
                key={other.slug}
                href={`/attractions/${other.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 4px 14px rgba(23,35,31,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div style={{ height: 180, position: 'relative' }}>
                  <img
                    src={other.heroImage}
                    alt={other.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <span
                    className="p-badge p-badge--copper"
                    style={{ position: 'absolute', top: 10, left: 10, fontSize: '0.65rem' }}
                  >
                    {other.number} · {other.badge}
                  </span>
                </div>
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ font: '400 1.25rem/1.2 var(--serif)', margin: '0 0 6px', color: 'var(--forest)' }}>
                    {other.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', lineHeight: 1.5, margin: '0 0 12px', flex: 1 }}>
                    {other.subtitle}
                  </p>
                  <span style={{ fontSize: '0.74rem', color: 'var(--copper)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    View Landmark & Stays ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom Banner */}
        <section style={{ background: 'var(--forest)', color: '#fff', padding: '80px var(--gutter)', textAlign: 'center' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--sand)', fontWeight: 600 }}>
              Tailored Executive Hospitality
            </span>
            <h2 style={{ font: '400 clamp(2.2rem, 4vw, 3.4rem)/1.1 var(--serif)', margin: '10px 0 20px', color: '#fff' }}>
              Planning an extended stay or corporate relocation near {attraction.title}?
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#cbd3ce', lineHeight: 1.8, marginBottom: 32 }}>
              Our Baltimore team provides direct corporate billing, flexible 30+ day lease agreements, and per-diem matching for medical, government, and academic fellows.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn-book" style={{ padding: '14px 32px', background: 'var(--copper)', color: '#fff', fontSize: '0.82rem' }}>
                Contact Executive Concierge ↗
              </Link>
              <Link href="/properties" className="btn-outline" style={{ padding: '14px 28px', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
                Browse All 40+ Residences ↗
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        property={selectedQuickViewProp}
        onClose={() => setSelectedQuickViewProp(null)}
      />

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="modal-backdrop is-open"
          style={{ zIndex: 1000 }}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 1000,
              width: '90%',
              margin: 'auto',
              background: '#000',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#fff',
                fontSize: '1.2rem',
                width: 36,
                height: 36,
                borderRadius: '50%',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              ✕
            </button>
            <img
              src={attraction.gallery[activeGalleryIndex] || attraction.heroImage}
              alt={attraction.title}
              style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }}
            />
            <div style={{ padding: '16px 20px', background: '#111', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem' }}>
                Photo {activeGalleryIndex + 1} of {attraction.gallery.length} — {attraction.title}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {attraction.gallery.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveGalleryIndex(idx)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: idx === activeGalleryIndex ? '2px solid var(--copper)' : '1px solid #444',
                      background: idx === activeGalleryIndex ? 'var(--copper)' : 'transparent',
                      color: '#fff',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Booking Modal */}
      {reserveModalOpen && currentProp && (
        <div
          className="modal-backdrop is-open"
          style={{ zIndex: 900 }}
          onClick={() => setReserveModalOpen(false)}
        >
          <div
            className="modal-window"
            style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
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

            {/* Modal Steps Header */}
            <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                  Direct Chase Street Booking
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                  Step {checkoutStep} of 4
                </span>
              </div>
              <h2 style={{ font: '400 1.8rem var(--serif)', margin: 0, color: 'var(--forest)' }}>
                {checkoutStep === 4 ? 'Reservation Confirmed!' : `Reserve: ${currentProp.title}`}
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                📍 {currentProp.address} · Near {attraction.title} ({attraction.commuteTime})
              </div>
            </div>

            {/* STEP 1: Dates & Guests */}
            {checkoutStep === 1 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      min={minDate}
                      value={checkin}
                      onChange={(e) => setCheckin(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      min={checkin || minDate}
                      value={checkout}
                      onChange={(e) => setCheckout(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                  >
                    {[...Array(currentProp.guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'} (Max {currentProp.guests})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Breakdown */}
                <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 18px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                    <span>${pricePerNight} × {diffDays} nights</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                    <span>Professional Departure Cleaning</span>
                    <strong>${cleaningFee.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 12 }}>
                    <span>Baltimore City & MD Occupancy Tax</span>
                    <strong>${taxes.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', borderTop: '1px solid var(--line)', paddingTop: 10, color: 'var(--forest)' }}>
                    <strong>Total Stay Amount</strong>
                    <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--serif)' }}>${total.toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-book"
                  style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}
                  onClick={() => setCheckoutStep(2)}
                >
                  Continue to Guest Details →
                </button>
              </div>
            )}

            {/* STEP 2: Guest Details */}
            {checkoutStep === 2 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                      Primary Guest Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jordan Hayes"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jordan.hayes@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(410) 555-0144"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                      Purpose of Visit
                    </label>
                    <select
                      value={stayPurpose}
                      onChange={(e) => setStayPurpose(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                    >
                      <option value="vacation">Leisure / Visiting {attraction.title}</option>
                      <option value="medical">Medical / Clinical Rotation (Hopkins / UMMC)</option>
                      <option value="corporate">Corporate Relocation / Business Assignment</option>
                      <option value="academic">Academic Fellowship / University Guest</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Special Requests or Arrival Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Early drop-off of luggage, parking pass request, crib..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '12px 18px', fontSize: '0.85rem' }}
                    onClick={() => setCheckoutStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn-book"
                    style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                    onClick={() => setCheckoutStep(3)}
                  >
                    Proceed to Payment (${total.toFixed(2)}) →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {checkoutStep === 3 && (
              <form onSubmit={handleProcessPayment}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 4,
                      border: paymentMethod === 'card' ? '2px solid var(--copper)' : '1px solid var(--line)',
                      background: paymentMethod === 'card' ? '#faf8f5' : '#fff',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    💳 Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('applepay')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 4,
                      border: paymentMethod === 'applepay' ? '2px solid var(--copper)' : '1px solid var(--line)',
                      background: paymentMethod === 'applepay' ? '#faf8f5' : '#fff',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                     Pay / Google Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('invoice')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 4,
                      border: paymentMethod === 'invoice' ? '2px solid var(--copper)' : '1px solid var(--line)',
                      background: paymentMethod === 'invoice' ? '#faf8f5' : '#fff',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    🏢 Corporate Invoicing
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jordan Hayes"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="•••• •••• •••• 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="08/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                          CVC
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                          Postal Code
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="21202"
                          value={cardZip}
                          onChange={(e) => setCardZip(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#faf8f5', padding: '20px', borderRadius: 6, marginBottom: 20, fontSize: '0.85rem', color: 'var(--ink)' }}>
                    <strong>Direct Corporate & Institutional Billing Selected</strong>
                    <p style={{ margin: '8px 0 0', color: 'var(--ink-soft)' }}>
                      An itemized per-diem invoice matching Hopkins, UMMC, or corporate compliance guidelines will be generated and dispatched to your email address.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '12px 18px', fontSize: '0.85rem' }}
                    onClick={() => setCheckoutStep(2)}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="btn-book"
                    style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                  >
                    {isProcessingPayment ? 'Securing Residence...' : `Confirm & Authorize $${total.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Confirmation */}
            {checkoutStep === 4 && (
              <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eef6f2', color: '#107e4d', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  ✓
                </div>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                  Immediate Move-In Ready
                </span>
                <h3 style={{ font: '400 2rem var(--serif)', margin: '6px 0 10px', color: 'var(--forest)' }}>
                  You are all set in Baltimore!
                </h3>
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.88rem', maxWidth: 440, margin: '0 auto 20px' }}>
                  A confirmation receipt and detailed arrival packet have been routed to <strong>{guestEmail || 'your email'}</strong>.
                </p>

                <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 8, padding: '20px', maxWidth: 460, margin: '0 auto 24px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Confirmation Code:</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--forest)' }}>{confirmedReservation}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Digital Door PIN:</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--copper)', letterSpacing: '0.1em' }}>{assignedPin}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Dates:</span>
                    <strong style={{ fontSize: '0.82rem' }}>{checkin} to {checkout} ({diffDays} nights)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Check-in Window:</span>
                    <strong style={{ fontSize: '0.82rem' }}>3:00 PM onwards (Keyless Self Check-in)</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Link href="/portal" className="btn-book" style={{ padding: '12px 24px', fontSize: '0.82rem' }}>
                    Open Resident Portal ↗
                  </Link>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '12px 20px', fontSize: '0.82rem' }}
                    onClick={() => setReserveModalOpen(false)}
                  >
                    Done
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
