'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminPropertyManager from '@/components/AdminPropertyManager';
import AdminSessionControls from '@/components/AdminSessionControls';
import { getSupabaseClient } from '@/lib/supabase/client';
import { dbFetchReservations, dbUpdateReservationStatus } from '@/lib/supabase/database';
import { Reservation } from '@/types';

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
  created_at: string;
};

export default function AdminDashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase.from('property_inquiries').select('id,name,email,phone,message,source,created_at').order('created_at', { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (error) setInquiryError('Inquiries could not be loaded.');
        else setInquiries((data || []) as Inquiry[]);
      });
  }, []);

  useEffect(() => {
    dbFetchReservations().then(({ data }) => setReservations(data));
  }, []);

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    setReservationError(null);
    const result = await dbUpdateReservationStatus(id, status);
    if (!result.success) return setReservationError(result.error || 'Reservation status could not be updated.');
    setReservations((current) => current.map((item) => item.id === id ? { ...item, status, pinCode: result.pinCode || item.pinCode } : item));
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Top Admin Bar */}
      <header
        style={{
          background: 'var(--forest)',
          color: '#fff',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', textDecoration: 'none' }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'var(--copper)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              BHP
            </span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', letterSpacing: '0.04em' }}>Baltimore Harbor Properties</strong>
              <span style={{ fontSize: '0.65rem', color: '#a0a6a2', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Management Control Center
              </span>
            </div>
          </Link>

          <span style={{ background: 'rgba(170,118,84,0.25)', color: 'var(--sand)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
            Dedicated Admin Hub (SOW §2)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Gonzalo Jouan</span>
            <span style={{ fontSize: '0.68rem', color: '#a0a6a2' }}>Principal Host & Owner</span>
          </div>

          <Link
            href="/"
            style={{
              padding: '8px 14px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Public Site ↗
          </Link>
          <Link
            href="/portal"
            style={{
              padding: '8px 14px',
              borderRadius: 4,
              background: 'var(--copper)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            Portals Hub (Guest/Owner) ↗
          </Link>
          <AdminSessionControls />
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1380, margin: '32px auto', padding: '0 24px' }}>
        {/* SOW Verification Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #17231f 0%, #20352e 100%)',
            color: '#fff',
            padding: '24px 28px',
            borderRadius: 8,
            marginBottom: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            border: '1px solid rgba(170,118,84,0.3)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--sand)', fontWeight: 700 }}>
              Go Execution · Scope of Work Delivery
            </span>
            <h1 style={{ font: '400 1.9rem/1.2 var(--serif)', margin: '4px 0', color: '#fff' }}>
              Welcome back, Gonzalo. Your Real-Time Operations Control.
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#cbd3ce', margin: 0, maxWidth: 840 }}>
              You have full sovereign control over your Baltimore rental inventory. Create new residences, update pricing for peak medical rotation seasons, toggle immediate website visibility, and inspect live guest reservations without developer assistance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 16px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', color: '#a0a6a2', textTransform: 'uppercase' }}>Active Inquiries</div>
              <div style={{ font: '400 1.4rem var(--serif)', color: '#fff' }}>{inquiries.length}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 16px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', color: '#a0a6a2', textTransform: 'uppercase' }}>Booking Records</div>
              <div style={{ font: '400 1.4rem var(--serif)', color: 'var(--sand)' }}>{reservations.length}</div>
            </div>
          </div>
        </div>

        {/* Property Listing Manager Component */}
        <AdminPropertyManager />

        {/* Live Guest Reservations Pipeline (SOW §4) */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '32px 28px', marginTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>
                SOW §4 · Guest Reservations Pipeline
              </span>
              <h2 style={{ font: '400 1.9rem/1.2 var(--serif)', margin: '4px 0' }}>
                Live Bookings & Requests
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
              Total Reservations: <strong>{reservations.length}</strong>
            </span>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
            {reservationError && <p role="alert" style={{ color: '#b42318', padding: '0 16px' }}>{reservationError}</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Booking Code</th>
                  <th style={{ padding: '14px 14px', fontWeight: 600 }}>Primary Guest</th>
                  <th style={{ padding: '14px 14px', fontWeight: 600 }}>Assigned Residence</th>
                  <th style={{ padding: '14px 14px', fontWeight: 600 }}>Dates</th>
                  <th style={{ padding: '14px 14px', fontWeight: 600 }}>Keypad PIN</th>
                  <th style={{ padding: '14px 14px', fontWeight: 600 }}>Estimated Total</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--forest)' }}>
                      {res.id}
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <strong style={{ display: 'block', color: 'var(--ink)' }}>{res.guest}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)' }}>
                        {res.guestEmail || 'Direct website booking'} · {res.guestPhone || ''}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px', color: 'var(--forest)', fontWeight: 500 }}>
                      {res.property}
                    </td>
                    <td style={{ padding: '14px 14px', color: 'var(--ink-soft)' }}>
                      {res.dates}
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <code style={{ background: 'rgba(170,118,84,0.12)', color: 'var(--copper)', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                        {res.pinCode || 'Not issued'}
                      </code>
                    </td>
                    <td style={{ padding: '14px 14px', fontWeight: 700, color: 'var(--forest)' }}>
                      {res.total}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <select
                        value={res.status}
                        onChange={(e) => void updateReservationStatus(res.id, e.target.value as Reservation['status'])}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 4,
                          border: '1px solid var(--line)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background:
                            res.status === 'In-Stay'
                              ? 'rgba(46,125,50,0.1)'
                              : res.status === 'Arriving Today'
                              ? 'rgba(170,118,84,0.15)'
                              : 'var(--paper)',
                          color:
                            res.status === 'In-Stay'
                              ? '#2e7d32'
                              : res.status === 'Arriving Today'
                              ? 'var(--copper)'
                              : 'var(--forest)',
                          fontFamily: 'var(--sans)',
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Arriving Today">Arriving Today</option>
                        <option value="In-Stay">In-Stay</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '32px 28px', marginTop: 32 }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>Phase 2 · Form Submissions</span>
          <h2 style={{ font: '400 1.9rem/1.2 var(--serif)', margin: '4px 0 18px' }}>Website Inquiries</h2>
          {inquiryError && <p role="alert" style={{ color: '#b42318' }}>{inquiryError}</p>}
          {!inquiryError && inquiries.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No inquiries have been received yet.</p>}
          {inquiries.length > 0 && (
            <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '.78rem' }}>
                <thead><tr style={{ background: 'var(--paper)' }}><th style={{ padding: 12 }}>Received</th><th style={{ padding: 12 }}>Contact</th><th style={{ padding: 12 }}>Source</th><th style={{ padding: 12 }}>Message</th></tr></thead>
                <tbody>{inquiries.map((item) => (
                  <tr key={item.id} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: 12, whiteSpace: 'nowrap' }}>{new Date(item.created_at).toLocaleString()}</td>
                    <td style={{ padding: 12 }}><strong>{item.name}</strong><br /><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone ? <><br />{item.phone}</> : null}</td>
                    <td style={{ padding: 12 }}>{item.source || 'website'}</td>
                    <td style={{ padding: 12, maxWidth: 560, whiteSpace: 'pre-wrap' }}>{item.message}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
