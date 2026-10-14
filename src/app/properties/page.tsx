'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PROPERTIES as SEED_PROPERTIES } from '@/data/properties';
import { Property } from '@/types';
import { usePropertyStore } from '@/utils/usePropertyStore';
import PropertyCard from '@/components/PropertyCard';
import QuickViewModal from '@/components/QuickViewModal';
import Footer from '@/components/Footer';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const initialNeighborhood = searchParams.get('neighborhood') || 'all';
  const initialGuests = searchParams.get('guests');

  const { activeProperties, isLoaded } = usePropertyStore();
  const sourceProperties = isLoaded && activeProperties.length > 0 ? activeProperties : SEED_PROPERTIES;

  const [activeNeighborhood, setActiveNeighborhood] = useState(initialNeighborhood);
  const [activeSearch, setActiveSearch] = useState('');
  const [activeBedrooms, setActiveBedrooms] = useState('all');
  const [activeSort, setActiveSort] = useState('featured');
  const [quickViewProp, setQuickViewProp] = useState<Property | null>(null);

  const neighborhoods = [
    { label: 'All Neighborhoods', value: 'all' },
    { label: 'Canton', value: 'Canton' },
    { label: 'Fells Point', value: 'Fells Point' },
    { label: 'Inner Harbor', value: 'Inner Harbor' },
    { label: 'Harbor East', value: 'Harbor East' },
    { label: 'Mount Vernon', value: 'Mount Vernon' },
  ];

  const filteredProperties = useMemo(() => {
    return sourceProperties.filter((p) => {
      // Neighborhood
      if (activeNeighborhood !== 'all' && p.neighborhood.toLowerCase() !== activeNeighborhood.toLowerCase()) {
        return false;
      }

      // Bedrooms
      if (activeBedrooms !== 'all') {
        const beds = parseInt(activeBedrooms, 10);
        if (beds === 3 && p.bedrooms < 3) return false;
        if (beds < 3 && p.bedrooms !== beds) return false;
      }

      // Guests query parameter
      if (initialGuests && p.guests < parseInt(initialGuests, 10)) {
        return false;
      }

      // Search Query
      if (activeSearch.trim()) {
        const query = activeSearch.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchNeigh = p.neighborhood.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchAmenity = p.amenities.some((a) => a.name.toLowerCase().includes(query));
        if (!matchTitle && !matchNeigh && !matchDesc && !matchAmenity) return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeSort === 'price-asc') return a.price - b.price;
      if (activeSort === 'price-desc') return b.price - a.price;
      if (activeSort === 'rating') return b.rating - a.rating;
      return a.id - b.id;
    });
  }, [sourceProperties, activeNeighborhood, activeSearch, activeBedrooms, activeSort, initialGuests]);

  const handleReset = () => {
    setActiveNeighborhood('all');
    setActiveSearch('');
    setActiveBedrooms('all');
    setActiveSort('featured');
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
              <span>The Residences</span>
            </div>
            <h1>Considered homes.<br /><em>Curated for your stay.</em></h1>
            <p className="lead">
              Explore our handpicked collection of fully furnished Baltimore residences. Move-in ready with gigabit fiber WiFi, dedicated workspaces, and frictionless self check-in across Canton, Fells Point, Harbor East, and Inner Harbor.
            </p>
            <div className="page-hero__meta">
              <div><span>Portfolio:</span> <strong>40+ Furnished Units</strong></div>
              <div><span>Minimum Stay:</span> <strong>3 Nights</strong></div>
              <div><span>Locations:</span> <strong>Waterfront & Medical Hubs</strong></div>
              <div><span>Support:</span> <strong>24/7 Local Concierge</strong></div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="filter-section" aria-label="Filter residences">
          <div className="filter-bar">
            <div className="filter-bar__group">
              {neighborhoods.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  className={`filter-chip ${activeNeighborhood === n.value ? 'is-active' : ''}`}
                  onClick={() => setActiveNeighborhood(n.value)}
                >
                  {n.label}
                </button>
              ))}
            </div>

            <div className="filter-bar__group">
              <div className="search-box">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  placeholder="Search by name or amenity..."
                  value={activeSearch}
                  onChange={(e) => setActiveSearch(e.target.value)}
                  aria-label="Search stays"
                />
              </div>

              <select
                className="filter-select"
                value={activeBedrooms}
                onChange={(e) => setActiveBedrooms(e.target.value)}
                aria-label="Filter by bedrooms"
              >
                <option value="all">Any Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
              </select>

              <select
                className="filter-select"
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                aria-label="Sort stays"
              >
                <option value="featured">Featured Stays</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Grid */}
        <section className="properties-container">
          <div className="results-header">
            <div className="results-count">
              Showing <strong>{filteredProperties.length}</strong> available {filteredProperties.length === 1 ? 'residence' : 'residences'} in Baltimore
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Direct Booking Guaranteed Best Rate
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 20px', background: '#fff', border: '1px solid var(--line)', borderRadius: 4 }}>
              <p style={{ font: '2.2rem var(--serif)', margin: '0 0 10px' }}>No residences match your criteria.</p>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: 24 }}>Try clearing filters or selecting another neighborhood.</p>
              <button type="button" className="btn-book" onClick={handleReset} style={{ margin: '0 auto' }}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="properties-grid">
              {filteredProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onQuickView={(prop) => setQuickViewProp(prop)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <QuickViewModal
        property={quickViewProp}
        onClose={() => setQuickViewProp(null)}
      />

      <Footer showTopCta={false} />
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '150px 20px', textAlign: 'center' }}>Loading residences...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
