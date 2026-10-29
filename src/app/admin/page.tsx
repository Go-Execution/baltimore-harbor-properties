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
  status: 'New' | 'Contacted' | 'Booked' | 'Archived';
  created_at: string;
};

type Review = { id: string; author: string; email?: string; rating: number; comment: string; is_approved: boolean; created_at: string; property_id: number };
type Notification = { id: string; recipient: string; subject: string; event_type: string; status: 'Pending' | 'Sent' | 'Failed'; last_error?: string; created_at: string };
type PortalUser = { id: string; email: string; full_name?: string; role: 'guest' | 'owner' | 'admin'; created_at: string };
type ManagedProperty = { id: number; title: string; neighborhood: string; owner_id?: string | null };
type AdminTicket = { id: string; title: string; description: string; property_title?: string; category: string; urgency: string; status: 'Under Review' | 'Dispatched' | 'In Progress' | 'Resolved'; created_at: string };
type SystemStatus = { siteUrl: boolean; supabase: boolean; emailProvider: boolean; emailSender: boolean; adminNotifications: boolean; payments: boolean };

export default function AdminDashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([]);
  const [managedProperties, setManagedProperties] = useState<ManagedProperty[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase.from('property_inquiries').select('id,name,email,phone,message,source,status,created_at').order('created_at', { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (error) setInquiryError('Inquiries could not be loaded.');
        else setInquiries((data || []) as Inquiry[]);
      });
    supabase.from('property_reviews').select('id,author,email,rating,comment,is_approved,created_at,property_id').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setReviews((data || []) as Review[]));
    supabase.from('notification_outbox').select('id,recipient,subject,event_type,status,last_error,created_at').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setNotifications((data || []) as Notification[]));
    supabase.from('profiles').select('id,email,full_name,role,created_at').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setPortalUsers((data || []) as PortalUser[]));
    Promise.all([
      supabase.from('properties').select('id,title,neighborhood').order('id'),
      supabase.from('property_owners').select('property_id,owner_id'),
    ]).then(([propertyResult, assignmentResult]) => {
      const assignments = new Map((assignmentResult.data || []).map((item: any) => [Number(item.property_id), item.owner_id]));
      setManagedProperties((propertyResult.data || []).map((item: any) => ({ ...item, owner_id: assignments.get(Number(item.id)) || null })) as ManagedProperty[]);
    });
    supabase.from('maintenance_tickets').select('id,title,description,property_title,category,urgency,status,created_at').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setTickets((data || []) as AdminTicket[]));
    fetch('/api/admin/system-status').then((response) => response.json()).then((result) => result.success && setSystemStatus(result.services));
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

  const updateInquiryStatus = async (id: string, status: Inquiry['status']) => {
    setOperationMessage(null);
    const response = await fetch(`/api/admin/inquiries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const result = await response.json();
    if (!response.ok) return setOperationMessage(result.error || 'Inquiry could not be updated.');
    setInquiries((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  };

  const moderateReview = async (id: string, action: 'approve' | 'hide' | 'delete') => {
    setOperationMessage(null);
    const response = await fetch(`/api/admin/reviews/${id}`, action === 'delete'
      ? { method: 'DELETE' }
      : { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: action === 'approve' }) });
    const result = await response.json();
    if (!response.ok) return setOperationMessage(result.error || 'Review could not be updated.');
    setReviews((current) => action === 'delete' ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, is_approved: action === 'approve' } : item));
  };

  const retryNotification = async (id: string) => {
    setOperationMessage(null);
    const response = await fetch(`/api/admin/notifications/${id}/retry`, { method: 'POST' });
    const result = await response.json();
    if (!response.ok) return setOperationMessage(result.error || 'Email could not be sent.');
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, status: 'Sent', last_error: undefined } : item));
    setOperationMessage('Email sent successfully.');
  };

  const updatePortalRole = async (id: string, role: PortalUser['role']) => {
    setOperationMessage(null);
    const response = await fetch(`/api/admin/users/${id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    const result = await response.json();
    if (!response.ok) return setOperationMessage(result.error || 'Portal role could not be updated.');
    setPortalUsers((current) => current.map((item) => item.id === id ? { ...item, role } : item));
  };

  const assignPropertyOwner = async (propertyId: number, ownerId: string | null) => {
    setOperationMessage(null);
    const response = await fetch(`/api/admin/properties/${propertyId}/owner`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ownerId }) });
    const result = await response.json();
    if (!response.ok) return setOperationMessage(result.error || 'Property owner could not be assigned.');
    setManagedProperties((current) => current.map((item) => item.id === propertyId ? { ...item, owner_id: result.ownerId } : item));
  };

  const updateTicketStatus = async (id: string, status: AdminTicket['status']) => {
    setOperationMessage(null);
    const response = await fetch(`/api/admin/tickets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const result = await response.json();
    if (!response.ok) return setOperationMessage(result.error || 'Ticket could not be updated.');
    setTickets((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  };
  const serviceCards: Array<[string, boolean | undefined]> = [
    ['Canonical site URL', systemStatus?.siteUrl],
    ['Supabase database', systemStatus?.supabase],
    ['Resend API', systemStatus?.emailProvider],
    ['Verified email sender', systemStatus?.emailSender],
    ['Admin notifications', systemStatus?.adminNotifications],
    ['Stripe payments (skipped)', false],
  ];

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

        <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '24px 28px', marginTop: 32 }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>Production Readiness</span>
          <h2 style={{ font: '400 1.65rem/1.2 var(--serif)', margin: '4px 0 16px' }}>Connected Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            {serviceCards.map(([label, ready]) => <div key={label} style={{ padding: 14, borderRadius: 6, border: '1px solid var(--line)', background: ready ? '#eef6f2' : '#fff7ed' }}><strong style={{ display: 'block', fontSize: '.8rem' }}>{label}</strong><span style={{ fontSize: '.72rem', color: ready ? '#107e4d' : '#b45309' }}>{ready ? 'Configured' : label === 'Stripe payments (skipped)' ? 'Intentionally disabled' : 'Needs environment variable'}</span></div>)}
          </div>
        </section>

        {operationMessage && <div role="status" style={{ marginTop: 24, padding: 12, borderRadius: 6, background: '#f8f2ed', color: 'var(--forest)' }}>{operationMessage}</div>}

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
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>Resident Operations</span>
          <h2 style={{ font: '400 1.9rem/1.2 var(--serif)', margin: '4px 0 18px' }}>Maintenance & Concierge Tickets</h2>
          {tickets.length === 0 ? <p style={{ color: 'var(--ink-soft)' }}>No resident tickets have been submitted.</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}><thead><tr><th style={{ padding: 10, textAlign: 'left' }}>Ticket</th><th style={{ padding: 10, textAlign: 'left' }}>Property</th><th style={{ padding: 10, textAlign: 'left' }}>Request</th><th style={{ padding: 10 }}>Urgency</th><th style={{ padding: 10 }}>Status</th></tr></thead><tbody>{tickets.map((ticket) => <tr key={ticket.id} style={{ borderTop: '1px solid var(--line)' }}><td style={{ padding: 10, fontFamily: 'monospace' }}>{ticket.id}</td><td style={{ padding: 10 }}>{ticket.property_title || 'Unassigned'}</td><td style={{ padding: 10 }}><strong>{ticket.title}</strong><br /><small style={{ color: 'var(--ink-soft)' }}>{ticket.description}</small></td><td style={{ padding: 10, textAlign: 'center' }}>{ticket.urgency}</td><td style={{ padding: 10, textAlign: 'center' }}><select value={ticket.status} onChange={(event) => void updateTicketStatus(ticket.id, event.target.value as AdminTicket['status'])} style={{ padding: 7, border: '1px solid var(--line)', borderRadius: 4 }}><option>Under Review</option><option>Dispatched</option><option>In Progress</option><option>Resolved</option></select></td></tr>)}</tbody></table></div>}
        </section>

        <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '32px 28px', marginTop: 32 }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>Phase 2 · Form Submissions</span>
          <h2 style={{ font: '400 1.9rem/1.2 var(--serif)', margin: '4px 0 18px' }}>Website Inquiries</h2>
          {inquiryError && <p role="alert" style={{ color: '#b42318' }}>{inquiryError}</p>}
          {!inquiryError && inquiries.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No inquiries have been received yet.</p>}
          {inquiries.length > 0 && (
            <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '.78rem' }}>
                <thead><tr style={{ background: 'var(--paper)' }}><th style={{ padding: 12 }}>Received</th><th style={{ padding: 12 }}>Contact</th><th style={{ padding: 12 }}>Source</th><th style={{ padding: 12 }}>Message</th><th style={{ padding: 12 }}>Status</th></tr></thead>
                <tbody>{inquiries.map((item) => (
                  <tr key={item.id} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: 12, whiteSpace: 'nowrap' }}>{new Date(item.created_at).toLocaleString()}</td>
                    <td style={{ padding: 12 }}><strong>{item.name}</strong><br /><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone ? <><br />{item.phone}</> : null}</td>
                    <td style={{ padding: 12 }}>{item.source || 'website'}</td>
                    <td style={{ padding: 12, maxWidth: 560, whiteSpace: 'pre-wrap' }}>{item.message}</td>
                    <td style={{ padding: 12 }}><select value={item.status} onChange={(event) => void updateInquiryStatus(item.id, event.target.value as Inquiry['status'])} style={{ padding: 7, border: '1px solid var(--line)', borderRadius: 4 }}><option>New</option><option>Contacted</option><option>Booked</option><option>Archived</option></select></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '32px 28px', marginTop: 32 }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>Guest Trust</span>
          <h2 style={{ font: '400 1.9rem/1.2 var(--serif)', margin: '4px 0 18px' }}>Review Moderation</h2>
          {reviews.length === 0 ? <p style={{ color: 'var(--ink-soft)' }}>No reviews are awaiting management.</p> : (
            <div style={{ display: 'grid', gap: 12 }}>{reviews.map((review) => <article key={review.id} style={{ border: '1px solid var(--line)', borderRadius: 7, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><strong>{review.author} · {'★'.repeat(review.rating)}</strong><span style={{ color: review.is_approved ? '#107e4d' : 'var(--copper)', fontSize: '.75rem' }}>{review.is_approved ? 'Published' : 'Pending'}</span></div>
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--ink-soft)' }}>{review.comment}</p>
              <div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => void moderateReview(review.id, 'approve')} style={{ padding: '7px 12px' }}>Approve</button><button type="button" onClick={() => void moderateReview(review.id, 'hide')} style={{ padding: '7px 12px' }}>Hide</button><button type="button" onClick={() => void moderateReview(review.id, 'delete')} style={{ padding: '7px 12px', color: '#b42318' }}>Delete</button></div>
            </article>)}</div>
          )}
        </section>

        <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '32px 28px', marginTop: 32 }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>Transactional Email</span>
          <h2 style={{ font: '400 1.9rem/1.2 var(--serif)', margin: '4px 0 18px' }}>Notification Outbox</h2>
          {notifications.length === 0 ? <p style={{ color: 'var(--ink-soft)' }}>No notification events yet.</p> : (
            <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}><thead><tr><th style={{ padding: 10, textAlign: 'left' }}>Created</th><th style={{ padding: 10, textAlign: 'left' }}>Recipient</th><th style={{ padding: 10, textAlign: 'left' }}>Subject</th><th style={{ padding: 10 }}>Status</th><th style={{ padding: 10 }}>Action</th></tr></thead><tbody>{notifications.map((item) => <tr key={item.id} style={{ borderTop: '1px solid var(--line)' }}><td style={{ padding: 10 }}>{new Date(item.created_at).toLocaleString()}</td><td style={{ padding: 10 }}>{item.recipient}</td><td style={{ padding: 10 }}>{item.subject}{item.last_error ? <small style={{ display: 'block', color: '#b42318' }}>{item.last_error}</small> : null}</td><td style={{ padding: 10, textAlign: 'center' }}>{item.status}</td><td style={{ padding: 10, textAlign: 'center' }}>{item.status !== 'Sent' ? <button type="button" onClick={() => void retryNotification(item.id)} style={{ padding: '6px 10px' }}>Retry</button> : '—'}</td></tr>)}</tbody></table></div>
          )}
        </section>

        <section style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '32px 28px', marginTop: 32 }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700 }}>Access Control</span>
          <h2 style={{ font: '400 1.9rem/1.2 var(--serif)', margin: '4px 0 18px' }}>Portal Users & Roles</h2>
          {portalUsers.length === 0 ? <p style={{ color: 'var(--ink-soft)' }}>No registered portal users yet.</p> : (
            <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}><thead><tr><th style={{ textAlign: 'left', padding: 10 }}>User</th><th style={{ textAlign: 'left', padding: 10 }}>Registered</th><th style={{ textAlign: 'left', padding: 10 }}>Role</th></tr></thead><tbody>{portalUsers.map((item) => <tr key={item.id} style={{ borderTop: '1px solid var(--line)' }}><td style={{ padding: 10 }}><strong>{item.full_name || item.email}</strong><br /><span style={{ color: 'var(--ink-soft)' }}>{item.email}</span></td><td style={{ padding: 10 }}>{new Date(item.created_at).toLocaleDateString()}</td><td style={{ padding: 10 }}><select value={item.role} onChange={(event) => void updatePortalRole(item.id, event.target.value as PortalUser['role'])} style={{ padding: 7, border: '1px solid var(--line)', borderRadius: 4 }}><option value="guest">Guest</option><option value="owner">Owner</option><option value="admin">Admin</option></select></td></tr>)}</tbody></table></div>
          )}
          <h3 style={{ font: '400 1.35rem var(--serif)', margin: '28px 0 12px' }}>Property Owner Assignments</h3>
          <div style={{ display: 'grid', gap: 10 }}>{managedProperties.map((property) => <div key={property.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, border: '1px solid var(--line)', borderRadius: 6, padding: 12, flexWrap: 'wrap' }}><div><strong>{property.title}</strong><br /><small style={{ color: 'var(--ink-soft)' }}>{property.neighborhood}</small></div><select value={property.owner_id || ''} onChange={(event) => void assignPropertyOwner(property.id, event.target.value || null)} style={{ minWidth: 230, padding: 8, border: '1px solid var(--line)', borderRadius: 4 }}><option value="">Unassigned</option>{portalUsers.filter((user) => user.role === 'owner' || user.role === 'admin').map((user) => <option key={user.id} value={user.id}>{user.full_name || user.email}</option>)}</select></div>)}</div>
        </section>
      </main>
    </div>
  );
}
