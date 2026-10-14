'use client';

import React from 'react';
import Link from 'next/link';
import { Property } from '@/types';

interface QuickViewModalProps {
  property: Property | null;
  onClose: () => void;
}

export default function QuickViewModal({ property, onClose }: QuickViewModalProps) {
  if (!property) return null;

  return (
    <div className="modal-backdrop is-open" aria-hidden="false" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
          <div style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: 4 }}>
            <img
              src={property.coverImage}
              alt={property.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--copper)', fontWeight: 600 }}>
              {property.neighborhood} · Baltimore, MD
            </span>
            <h2 style={{ font: '400 2.2rem var(--serif)', margin: '6px 0 12px', color: 'var(--ink)' }}>
              {property.title}
            </h2>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--ink-soft)', margin: '0 0 16px' }}>
              {property.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, padding: 14, marginBottom: 20, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
              <div><strong style={{ display: 'block', fontSize: '1.1rem', fontFamily: 'var(--serif)', color: 'var(--ink)' }}>{property.guests}</strong>Guests</div>
              <div><strong style={{ display: 'block', fontSize: '1.1rem', fontFamily: 'var(--serif)', color: 'var(--ink)' }}>{property.bedrooms}</strong>Bedrooms</div>
              <div><strong style={{ display: 'block', fontSize: '1.1rem', fontFamily: 'var(--serif)', color: 'var(--ink)' }}>{property.bathrooms}</strong>Baths</div>
              <div><strong style={{ display: 'block', fontSize: '1.1rem', fontFamily: 'var(--serif)', color: 'var(--ink)' }}>{property.sqft}</strong>Sq Ft</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-soft)', margin: '0 0 10px' }}>
                Top Amenities Included
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.82rem' }}>
                {property.amenities.slice(0, 6).map((a, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: '1px solid var(--line)' }}>
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>Nightly Rate</span>
                <div style={{ font: '400 2.2rem var(--serif)', color: 'var(--ink)' }}>
                  ${property.price} <small style={{ fontSize: '0.8rem', fontFamily: 'var(--sans)', color: 'var(--ink-soft)' }}>/ night</small>
                </div>
              </div>
              <Link
                href={`/properties/${property.id}`}
                className="btn-book"
                style={{ padding: '14px 28px', fontSize: '0.75rem' }}
                onClick={onClose}
              >
                View Full Details & Book ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
