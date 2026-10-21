'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types';
import { usePropertyStore } from '@/utils/usePropertyStore';
import { FiHome, FiSliders, FiPlus, FiRefreshCw, FiEye, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

const NEIGHBORHOOD_OPTIONS = ['Canton', 'Fells Point', 'Inner Harbor', 'Harbor East', 'Mount Vernon', 'Federal Hill'];

const AVAILABLE_AMENITIES = [
  { name: 'Gigabit Fiber WiFi', icon: '📶', category: 'Connectivity' },
  { name: 'Dedicated Workspace', icon: '💼', category: 'Work' },
  { name: 'In-Unit Washer/Dryer', icon: '🧺', category: 'Convenience' },
  { name: 'Fully Equipped Kitchen', icon: '🍳', category: 'Kitchen' },
  { name: 'Keyless Smart Lock', icon: '🔒', category: 'Security' },
  { name: 'Reserved Parking Bay', icon: '🚗', category: 'Parking' },
  { name: 'Private Rooftop Deck', icon: '🌅', category: 'Outdoor' },
  { name: 'Harbor Water Views', icon: '⛵', category: 'Views' },
  { name: 'Pet Friendly', icon: '🐾', category: 'Pets' },
  { name: 'Nespresso Bar', icon: '☕', category: 'Kitchen' },
  { name: 'Curated Vinyl Collection', icon: '🎶', category: 'Living' },
];

export default function AdminPropertyManager() {
  const {
    properties,
    saveProperty,
    deleteProperty,
    togglePropertyStatus,
    resetToDefault,
    settings,
    saveSettings,
  } = usePropertyStore();

  const [activeTab, setActiveTab] = useState<'listings' | 'settings'>('listings');
  const [searchTerm, setSearchTerm] = useState('');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNeighborhood = neighborhoodFilter === 'all' || p.neighborhood === neighborhoodFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Active' && (!p.status || p.status === 'Active')) ||
      (statusFilter === 'Inactive' && p.status === 'Inactive');

    return matchesSearch && matchesNeighborhood && matchesStatus;
  });

  const activeCount = properties.filter((p) => !p.status || p.status === 'Active').length;
  const inactiveCount = properties.length - activeCount;

  const handleOpenAddModal = () => {
    setEditingProperty({
      title: '',
      subtitle: 'Executive Furnished Stay',
      neighborhood: 'Canton',
      address: 'Baltimore, MD',
      price: 245,
      cleaningFee: 145,
      taxRate: 0.095,
      guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      sqft: 1200,
      coverImage: '/assets/media/unsplash/photo-1512917774080-9991f1c4c750--25cc0a4415ec.jpg',
      gallery: [
        '/assets/media/unsplash/photo-1512917774080-9991f1c4c750--25cc0a4415ec.jpg',
        '/assets/media/unsplash/photo-1600585154340-be6161a56a0c--e705a536f2a6.jpg',
      ],
      description: 'Charming, meticulously appointed Baltimore residence located minutes from medical campuses and the harbor.',
      amenities: AVAILABLE_AMENITIES.slice(0, 5),
      commute: [
        { destination: 'Johns Hopkins Hospital', time: '8 min drive' },
        { destination: 'UMMC / Downtown', time: '10 min drive' },
      ],
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Property) => {
    setEditingProperty({ ...p });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty || !editingProperty.title) {
      alert('Please enter a property title');
      return;
    }

    saveProperty(editingProperty);
    setIsModalOpen(false);
    showToast(editingProperty.id ? `Property #${editingProperty.id} successfully updated.` : 'New property published to inventory.');
    setEditingProperty(null);
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}"? This will remove it from all website catalogs.`)) {
      deleteProperty(id);
      showToast(`Property "${title}" removed.`);
    }
  };

  const handleToggle = (id: number) => {
    const updated = togglePropertyStatus(id);
    if (updated) {
      showToast(`Property is now ${updated.status === 'Active' ? 'LIVE on website' : 'HIDDEN from website'}.`);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset inventory to default Baltimore seed properties? Any custom listings added will be replaced.')) {
      resetToDefault();
      showToast('Inventory reset to original 6 Baltimore residences.');
    }
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settingsForm);
    showToast('Website content & operational policies saved.');
  };

  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '32px 28px', marginTop: 20 }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            background: 'var(--forest)',
            color: '#f7f1e8',
            padding: '16px 24px',
            borderRadius: 8,
            boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            font: '500 0.85rem var(--sans)',
            border: '1px solid var(--copper)',
          }}
        >
          <span style={{ color: 'var(--copper)', fontSize: '1.2rem' }}>✓</span>
          {notification}
        </div>
      )}

      {/* Header and Scope of Work info badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
              SOW §2 & §5 · Admin Management System
            </span>
            <span style={{ background: 'rgba(170,118,84,0.12)', color: 'var(--copper)', fontSize: '0.62rem', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
              Self-Managed Platform
            </span>
          </div>
          <h2 style={{ font: '400 2.2rem/1.2 var(--serif)', margin: '6px 0' }}>
            Property Inventory & Content Dashboard
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', margin: 0 }}>
            Manage listings, update nightly pricing, toggle live availability, and edit website policies without code modifications.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, background: 'var(--paper)', padding: 4, borderRadius: 6, border: '1px solid var(--line)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              background: activeTab === 'listings' ? 'var(--forest)' : 'transparent',
              color: activeTab === 'listings' ? '#fff' : 'var(--ink)',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiHome />
            <span>Property Listings ({properties.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              background: activeTab === 'settings' ? 'var(--forest)' : 'transparent',
              color: activeTab === 'settings' ? '#fff' : 'var(--ink)',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FiSliders />
            <span>Website Policies & Info</span>
          </button>
        </div>
      </div>

      {activeTab === 'listings' ? (
        <>
          {/* Key KPI Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <div style={{ background: 'var(--paper)', padding: '16px 20px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--ink-soft)', letterSpacing: '0.08em' }}>Total Properties</div>
              <div style={{ font: '400 1.9rem var(--serif)', color: 'var(--forest)', margin: '4px 0' }}>{properties.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Full Baltimore Portfolio</div>
            </div>

            <div style={{ background: 'rgba(46, 125, 50, 0.08)', padding: '16px 20px', borderRadius: 8, border: '1px solid rgba(46, 125, 50, 0.2)' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#2e7d32', letterSpacing: '0.08em', fontWeight: 600 }}>Live On Website</div>
              <div style={{ font: '400 1.9rem var(--serif)', color: '#2e7d32', margin: '4px 0' }}>{activeCount}</div>
              <div style={{ fontSize: '0.72rem', color: '#2e7d32' }}>Visible in public catalog</div>
            </div>

            <div style={{ background: 'rgba(211, 47, 47, 0.06)', padding: '16px 20px', borderRadius: 8, border: '1px solid rgba(211, 47, 47, 0.2)' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#d32f2f', letterSpacing: '0.08em', fontWeight: 600 }}>Unpublished / Hidden</div>
              <div style={{ font: '400 1.9rem var(--serif)', color: '#d32f2f', margin: '4px 0' }}>{inactiveCount}</div>
              <div style={{ fontSize: '0.72rem', color: '#d32f2f' }}>Deactivated from public</div>
            </div>

            <div style={{ background: 'var(--paper)', padding: '16px 20px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--copper)', letterSpacing: '0.08em', fontWeight: 600 }}>Average Daily Rate</div>
              <div style={{ font: '400 1.9rem var(--serif)', color: 'var(--forest)', margin: '4px 0' }}>
                ${Math.round(properties.reduce((acc, p) => acc + p.price, 0) / (properties.length || 1))}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Across all active inventory</div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by title, address, or neighborhood..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  fontSize: '0.78rem',
                  minWidth: 260,
                  fontFamily: 'var(--sans)',
                }}
              />

              <select
                value={neighborhoodFilter}
                onChange={(e) => setNeighborhoodFilter(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--sans)',
                }}
              >
                <option value="all">All Neighborhoods</option>
                {NEIGHBORHOOD_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--sans)',
                }}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive / Hidden Only</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleResetDefaults}
                style={{
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  background: 'transparent',
                  color: 'var(--ink-soft)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                title="Restore default 6 Baltimore listings"
              >
                <FiRefreshCw />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--copper)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FiPlus />
                <span>Add New Property</span>
              </button>
            </div>
          </div>

          {/* Properties Inventory Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Residence</th>
                  <th style={{ padding: '14px 14px', fontWeight: 600 }}>Neighborhood</th>
                  <th style={{ padding: '14px 14px', fontWeight: 600 }}>Nightly Price</th>
                  <th style={{ padding: '14px 14px', fontWeight: 600 }}>Capacity / Specs</th>
                  <th style={{ padding: '14px 14px', fontWeight: 600 }}>Website Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                      No properties found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((p) => {
                    const isActive = !p.status || p.status === 'Active';
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--line)', background: isActive ? '#fff' : 'rgba(0,0,0,0.02)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <img
                              src={p.coverImage}
                              alt={p.title}
                              style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--line)' }}
                            />
                            <div>
                              <strong style={{ display: 'block', color: 'var(--forest)', fontSize: '0.82rem' }}>{p.title}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)' }}>{p.address}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ background: 'var(--paper)', padding: '4px 8px', borderRadius: 4, fontWeight: 600, color: 'var(--forest)', fontSize: '0.72rem' }}>
                            {p.neighborhood}
                          </span>
                        </td>
                        <td style={{ padding: '14px 14px' }}>
                          <strong style={{ color: 'var(--forest)' }}>${p.price}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)' }}> / night</span>
                        </td>
                        <td style={{ padding: '14px 14px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                          <div>{p.guests} Guests · {p.bedrooms} BR · {p.bathrooms} BA</div>
                          <div style={{ fontSize: '0.7rem' }}>{p.sqft.toLocaleString()} sq ft</div>
                        </td>
                        <td style={{ padding: '14px 14px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggle(p.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 10px',
                              borderRadius: 20,
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              border: isActive ? '1px solid rgba(46, 125, 50, 0.4)' : '1px solid rgba(211, 47, 47, 0.4)',
                              background: isActive ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                              color: isActive ? '#2e7d32' : '#d32f2f',
                              cursor: 'pointer',
                            }}
                            title="Click to toggle live display status"
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#2e7d32' : '#d32f2f' }}></span>
                            {isActive ? 'Active (Live)' : 'Inactive (Hidden)'}
                          </button>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Link
                              href={`/properties/${p.id}`}
                              target="_blank"
                              style={{
                                padding: '6px 10px',
                                borderRadius: 4,
                                border: '1px solid var(--line)',
                                background: '#fff',
                                color: 'var(--ink)',
                                textDecoration: 'none',
                                fontSize: '0.72rem',
                                fontWeight: 500,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                              title="Preview public listing"
                            >
                              <FiEye />
                              <span>View</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 4,
                                border: '1px solid var(--copper)',
                                background: 'rgba(170,118,84,0.1)',
                                color: 'var(--copper)',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <FiEdit2 />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(p.id, p.title)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 4,
                                border: '1px solid rgba(211,47,47,0.3)',
                                background: 'transparent',
                                color: '#d32f2f',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Delete listing"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Website Settings & Policies Tab */
        <form onSubmit={handleSettingsSubmit} style={{ maxWidth: 800 }}>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
            <h3 style={{ font: '400 1.5rem var(--serif)', margin: '0 0 16px', color: 'var(--forest)' }}>
              Top Announcement Banner
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <input
                type="checkbox"
                id="bannerEnabled"
                checked={settingsForm.bannerEnabled === 'true'}
                onChange={(e) => setSettingsForm({ ...settingsForm, bannerEnabled: e.target.checked ? 'true' : 'false' })}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="bannerEnabled" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
                Display site-wide announcement bar above header
              </label>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                Banner Message Text
              </label>
              <input
                type="text"
                value={settingsForm.bannerText}
                onChange={(e) => setSettingsForm({ ...settingsForm, bannerText: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--sans)',
                }}
              />
            </div>
          </div>

          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
            <h3 style={{ font: '400 1.5rem var(--serif)', margin: '0 0 16px', color: 'var(--forest)' }}>
              Official Host & SOW Contact Credentials
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                  Host / Owner Phone (Gonzalo Jouan)
                </label>
                <input
                  type="text"
                  value={settingsForm.contactPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--sans)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                  Host / Owner Email
                </label>
                <input
                  type="email"
                  value={settingsForm.contactEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--sans)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                  Standard Check-in Time
                </label>
                <input
                  type="text"
                  value={settingsForm.checkInTime}
                  onChange={(e) => setSettingsForm({ ...settingsForm, checkInTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--sans)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                  Standard Check-out Time
                </label>
                <input
                  type="text"
                  value={settingsForm.checkOutTime}
                  onChange={(e) => setSettingsForm({ ...settingsForm, checkOutTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--sans)',
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '14px 28px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--copper)',
              color: '#fff',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Save Website Settings ↗
          </button>
        </form>
      )}

      {/* ADD / EDIT PROPERTY MODAL */}
      {isModalOpen && editingProperty && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              width: '100%',
              maxWidth: 780,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px 36px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--copper)', fontWeight: 700 }}>
                  {editingProperty.id ? `Edit Property #${editingProperty.id}` : 'Create New Listing'}
                </span>
                <h3 style={{ font: '400 1.8rem var(--serif)', margin: '4px 0', color: 'var(--forest)' }}>
                  {editingProperty.id ? editingProperty.title || 'Edit Listing' : 'Add New Baltimore Residence'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: 'var(--ink-soft)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                title="Close modal"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProperty.title || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                    placeholder="e.g. The Canton Waterfront Promenade Townhouse"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Neighborhood *
                  </label>
                  <select
                    value={editingProperty.neighborhood || 'Canton'}
                    onChange={(e) => setEditingProperty({ ...editingProperty, neighborhood: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  >
                    {NEIGHBORHOOD_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={editingProperty.address || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                    placeholder="e.g. 2840 O'Donnell St, Baltimore, MD 21224"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Nightly Rate ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    required
                    value={editingProperty.price || 245}
                    onChange={(e) => setEditingProperty({ ...editingProperty, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Cleaning Fee ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={editingProperty.cleaningFee || 145}
                    onChange={(e) => setEditingProperty({ ...editingProperty, cleaningFee: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Guest Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={editingProperty.guests || 4}
                    onChange={(e) => setEditingProperty({ ...editingProperty, guests: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingProperty.bedrooms || 2}
                    onChange={(e) => setEditingProperty({ ...editingProperty, bedrooms: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    value={editingProperty.bathrooms || 2}
                    onChange={(e) => setEditingProperty({ ...editingProperty, bathrooms: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Square Footage (sq ft)
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="20000"
                    value={editingProperty.sqft || 1200}
                    onChange={(e) => setEditingProperty({ ...editingProperty, sqft: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                    Status
                  </label>
                  <select
                    value={editingProperty.status || 'Active'}
                    onChange={(e) => setEditingProperty({ ...editingProperty, status: e.target.value as any })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  >
                    <option value="Active">Active (Live on Website)</option>
                    <option value="Inactive">Inactive (Hidden / Draft)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                  Cover / Hero Image URL
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="url"
                    required
                    value={editingProperty.coverImage || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, coverImage: e.target.value })}
                    placeholder="https://..."
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem' }}
                  />
                  {editingProperty.coverImage && (
                    <img
                      src={editingProperty.coverImage}
                      alt="Preview"
                      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--line)' }}
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                  Description & Curated Story
                </label>
                <textarea
                  rows={4}
                  value={editingProperty.description || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', fontFamily: 'var(--sans)' }}
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 20px', borderRadius: 6, border: '1px solid var(--line)', background: 'transparent', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '12px 28px', borderRadius: 6, border: 'none', background: 'var(--copper)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {editingProperty.id ? 'Save Listing Changes' : 'Publish New Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
