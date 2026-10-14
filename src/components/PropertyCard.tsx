import React from 'react';
import Link from 'next/link';
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  onQuickView?: (property: Property) => void;
}

export default function PropertyCard({ property, onQuickView }: PropertyCardProps) {
  return (
    <article className="p-card" data-id={property.id}>
      <div className="p-card__media">
        <img src={property.coverImage} alt={property.title} loading="lazy" />
        <div className="p-card__badge-row">
          <span className="p-badge p-badge--copper">{property.neighborhood}</span>
          <div>
            {property.badges.map((badge, idx) => (
              <span key={idx} className="p-badge" style={{ marginLeft: 4 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-card__content">
        <div className="p-card__location">{property.address}</div>
        <h3 className="p-card__title">
          <Link href={`/properties/${property.id}`}>{property.title}</Link>
        </h3>
        <p className="p-card__desc">{property.subtitle || property.description}</p>

        <div className="p-card__specs">
          <span>👥 {property.guests} Guests</span>
          <span>🛏️ {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          <span>🚿 {property.bathrooms} Bath</span>
          <span>📐 {property.sqft} sq ft</span>
        </div>

        <div className="p-card__amenities-tags">
          {property.amenities.slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="amenity-tag">
              {amenity.name}
            </span>
          ))}
        </div>

        <div className="p-card__footer">
          <div className="p-card__rate">
            From <strong>${property.price}</strong> / night
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {onQuickView && (
              <button
                type="button"
                className="btn-outline"
                onClick={() => onQuickView(property)}
              >
                Quick View
              </button>
            )}
            <Link href={`/properties/${property.id}`} className="btn-book">
              Details ↗
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
