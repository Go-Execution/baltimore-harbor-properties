'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MaintenanceTicket, OwnerApproval, Property, Reservation } from '@/types';
import AdminPropertyManager from '@/components/AdminPropertyManager';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { supabaseSignIn, supabaseSignUp, supabaseSignOut, supabaseGetCurrentUser, UserProfile } from '@/lib/supabase/auth';
import { dbCreateOwnerBlackout, dbCreateTicket, dbFetchOwnerDashboard, dbFetchReservations, dbFetchTickets, dbUpdateOwnerApproval, dbVerifyStayAccess, OwnerBlackout } from '@/lib/supabase/database';
import { getStoredReservations } from '@/utils/propertyStore';
import {
  FiKey,
  FiTrendingUp,
  FiShield,
  FiLock,
  FiUnlock,
  FiUser,
  FiLogOut,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
  FiPhone,
  FiMail,
  FiHome,
  FiAlertCircle,
  FiTool,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiDatabase,
  FiLayers,
  FiArrowRight,
  FiExternalLink,
} from 'react-icons/fi';

const STORAGE_KEY = 'csp_nextjs_portal_state_v1';
const AUTH_KEY = 'csp_nextjs_portal_auth_v1';

export default function PortalPage() {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authTab, setAuthTab] = useState<'passkey' | 'signin' | 'code' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Single Password (Client Review Mode)
  const [portalPassInput, setPortalPassInput] = useState('');
  const [portalRoleSelect, setPortalRoleSelect] = useState<'guest' | 'owner' | 'admin'>('guest');
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Form Inputs for Full Supabase Auth (Preserved for Production Auth)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [directBookingCode, setDirectBookingCode] = useState('');
  const [directPin, setDirectPin] = useState('');

  // Portal Role State
  const [currentRole, setCurrentRole] = useState<'guest' | 'owner' | 'admin'>('guest');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCloudLive, setIsCloudLive] = useState<boolean>(false);

  // Guest State
  const [guestTickets, setGuestTickets] = useState<MaintenanceTicket[]>([]);
  const [stayCredential, setStayCredential] = useState<{ reservationId: string; pinCode: string } | null>(null);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('HVAC');
  const [ticketUrgency, setTicketUrgency] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [ticketRoom, setTicketRoom] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  // Owner State
  const [ownerApprovals, setOwnerApprovals] = useState<OwnerApproval[]>([]);
  const [ownerProperties, setOwnerProperties] = useState<Property[]>([]);
  const [ownerBlackouts, setOwnerBlackouts] = useState<OwnerBlackout[]>([]);
  const [ownerReservations, setOwnerReservations] = useState<Reservation[]>([]);
  const [blackoutPropertyId, setBlackoutPropertyId] = useState('');
  const [blackoutStart, setBlackoutStart] = useState('');
  const [blackoutEnd, setBlackoutEnd] = useState('');

  // Admin State (Reservations from Supabase / Store)
  const [adminReservations, setAdminReservations] = useState<Reservation[]>([]);

  // Initialize Auth & Data on Load
  useEffect(() => {
    setIsCloudLive(isSupabaseConfigured());

    // Check for active session in Supabase or local auth cache
    async function initSession() {
      if (isSupabaseConfigured()) {
        const user = await supabaseGetCurrentUser();
        if (user) {
          setCurrentUser(user);
          setCurrentRole(user.role);
          setIsAuthenticated(true);
          await loadReservations();
          setGuestTickets(await dbFetchTickets());
          if (user.role === 'owner' || user.role === 'admin') await loadOwnerDashboard();
        }
      } else {
        try {
          const cachedAuth = localStorage.getItem(AUTH_KEY);
          if (cachedAuth) {
            const parsed = JSON.parse(cachedAuth);
            if (parsed && parsed.email) {
              setCurrentUser(parsed);
              setCurrentRole(parsed.role || 'guest');
              setIsAuthenticated(true);
            }
          }
        } catch (e) {}
      }

      if (!isSupabaseConfigured()) {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.guestTickets) setGuestTickets(parsed.guestTickets);
            if (parsed.ownerApprovals) setOwnerApprovals(parsed.ownerApprovals);
          }
        } catch (e) {}
      }

      if (!isSupabaseConfigured()) loadReservations();
    }

    initSession();
  }, []);

  const loadReservations = async () => {
    const { data, source } = await dbFetchReservations();
    setAdminReservations(source === 'supabase' ? data : (data.length ? data : getStoredReservations()));
  };

  const loadOwnerDashboard = async () => {
    const data = await dbFetchOwnerDashboard();
    setOwnerProperties(data.properties);
    setOwnerApprovals(data.approvals);
    setOwnerBlackouts(data.blackouts);
    setOwnerReservations(data.reservations.filter((reservation) => data.properties.some((property) => property.title === reservation.property)));
    if (data.properties[0]) setBlackoutPropertyId(String(data.properties[0].id));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied to clipboard: ${text}`);
    }).catch(() => {
      showToast(`Value: ${text}`);
    });
  };

  // Legacy passkey access is disabled; administrators use Supabase Auth.
  const handleOnePasswordAccess = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.assign('/admin/login');
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const res = await supabaseSignIn(loginEmail, loginPassword);
    setAuthLoading(false);

    if (res.error) {
      setAuthError(res.error);
      return;
    }

    const user: UserProfile = {
      id: res.data?.user?.id || 'demo-user',
      email: loginEmail,
      full_name: res.data?.user?.user_metadata?.full_name || loginEmail.split('@')[0],
      role: res.role || 'guest',
    };

    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    await loadReservations();
    setGuestTickets(await dbFetchTickets());
    if (user.role === 'owner' || user.role === 'admin') await loadOwnerDashboard();
    showToast(`Welcome back, ${user.full_name || user.email}!`);
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const res = await supabaseSignUp(signupEmail, signupPassword, signupName, 'guest');
    setAuthLoading(false);

    if (res.error) {
      setAuthError(res.error);
      return;
    }

    if (!res.data?.session) {
      setAuthTab('signin');
      setAuthError('Account created. Check your email to confirm the account, then sign in.');
      return;
    }

    const user: UserProfile = {
      id: res.data?.user?.id || 'demo-user-signup',
      email: signupEmail,
      full_name: signupName,
      role: 'guest',
    };

    setCurrentUser(user);
    setCurrentRole('guest');
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    await loadReservations();
    showToast(`Account created! Welcome to Baltimore Harbor Portals.`);
  };

  // Instant Access via Booking Code & PIN
  const handleCodeAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = directBookingCode.trim().toUpperCase();
    const cleanPin = directPin.trim();

    if (!cleanCode) {
      setAuthError('Please enter a valid Reservation Reference (e.g. BHP-2026-123456).');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    const result = await dbVerifyStayAccess(cleanCode, cleanPin);
    setAuthLoading(false);
    if (!result.success || !result.reservation) {
      setAuthError(result.error || 'Reservation reference or door PIN is incorrect.');
      return;
    }
    const matchedRes = result.reservation;

    const user: UserProfile = {
      id: 'guest-' + cleanCode,
      email: matchedRes?.guestEmail || 'resident@example.invalid',
      full_name: matchedRes?.guest || 'Resident Guest',
      role: 'guest',
    };

    setCurrentUser(user);
    setCurrentRole('guest');
    setIsAuthenticated(true);
    setStayCredential({ reservationId: cleanCode, pinCode: cleanPin });
    setAdminReservations([matchedRes]);
    setGuestTickets(await dbFetchTickets({ reservationId: cleanCode, pinCode: cleanPin }));
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    showToast(`Welcome! Stay dashboard unlocked for ${cleanCode}`);
  };

  // One-Click Demo Access
  const handleDemoLogin = (_role: 'guest' | 'owner' | 'admin') => {
    setAuthError('Demo access has been disabled. Use your secure account or reservation code.');
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    await supabaseSignOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setStayCredential(null);
    setGuestTickets([]);
    setAdminReservations([]);
    localStorage.removeItem(AUTH_KEY);
    showToast('Signed out of Baltimore Harbor Portals.');
  };

  // Submit Maintenance Ticket (Dispatches to Supabase & Local State)
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc) {
      showToast('Please fill out ticket title and description.');
      return;
    }

    const newTicket: MaintenanceTicket = {
      id: '',
      title: ticketTitle,
      category: ticketCategory,
      urgency: ticketUrgency,
      status: 'Under Review',
      date: 'Today, Just now',
      description: ticketDesc,
      room: ticketRoom || 'General'
    };

    const result = await dbCreateTicket(newTicket, stayCredential || {});
    if (!result.success || !result.ticket) {
      showToast(result.error || 'Maintenance request could not be submitted.');
      return;
    }
    setGuestTickets((current) => [result.ticket!, ...current]);

    setTicketTitle('');
    setTicketRoom('');
    setTicketDesc('');
    showToast(`Work order ${result.ticket.id} submitted to Baltimore Harbor Concierge.`);
  };

  // Owner Approve / Decline
  const handleApprovalAction = async (index: number, newStatus: 'Approved' | 'Declined') => {
    const target = ownerApprovals[index];
    const result = await dbUpdateOwnerApproval(target.id, newStatus);
    if (!result.success) return showToast(result.error || 'Approval could not be updated.');
    setOwnerApprovals((current) => current.map((item) => item.id === target.id ? { ...item, status: newStatus } : item));
    showToast(`Work order ${target.id} marked as ${newStatus}.`);
  };

  const handleCreateBlackout = async () => {
    if (!blackoutPropertyId || !blackoutStart || !blackoutEnd) return showToast('Select a property and both dates.');
    const result = await dbCreateOwnerBlackout(Number(blackoutPropertyId), blackoutStart, blackoutEnd);
    if (!result.success || !result.blackout) return showToast(result.error || 'Owner dates could not be reserved.');
    setOwnerBlackouts((current) => [result.blackout!, ...current]);
    setBlackoutStart('');
    setBlackoutEnd('');
    showToast('Owner dates saved to the live portfolio calendar.');
  };

  const activeReservation = adminReservations.find((reservation) => ['Confirmed', 'Arriving Today', 'In-Stay'].includes(reservation.status));
  const ownerAverageRate = ownerProperties.length ? ownerProperties.reduce((sum, property) => sum + property.price, 0) / ownerProperties.length : 0;
  const ownerActiveBookings = ownerReservations.filter((reservation) => ['Confirmed', 'Arriving Today', 'In-Stay'].includes(reservation.status)).length;

  return (
    <div className="portal-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-msg is-visible">
          {toastMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. AUTHENTICATION & ACCESS GATEWAY (When not authenticated)              */}
      {/* ========================================================================= */}
      {!isAuthenticated ? (
        <>
          <header className="portal-app-header">
            <div className="portal-app-header__inner">
              <Link href="/" className="portal-app-header__brand" title="Return to public site">
                <span className="portal-app-header__monogram">BHP</span>
                <div className="portal-app-header__title">
                  <strong>Baltimore Harbor Properties</strong>
                  <span>Executive Portals Hub</span>
                </div>
              </Link>
              <div className="portal-app-header__actions">
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                  }}
                >
                  <span>← Back to Website</span>
                </Link>
              </div>
            </div>
          </header>

          <main id="main" style={{ minHeight: '82vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px var(--gutter)', background: 'var(--paper)' }}>
            <div style={{ maxWidth: 540, width: '100%', background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '40px 36px', boxShadow: '0 20px 50px rgba(23,35,31,0.06)' }}>
              
              {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span className="brand__monogram" style={{ display: 'inline-block', width: 44, height: 44, lineHeight: '44px', background: 'var(--forest)', color: '#fff', borderRadius: '50%', fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>
                BHP
              </span>
              <span style={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--copper)', fontWeight: 700, marginBottom: 4 }}>
                Private Member & Resident Gateway
              </span>
              <h1 style={{ font: '400 clamp(1.8rem, 3.5vw, 2.4rem)/1.15 var(--serif)', color: 'var(--forest)', margin: 0 }}>
                Baltimore Harbor Portals Access
              </h1>
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-soft)', margin: '8px 0 0', lineHeight: 1.6 }}>
                Secure gateway for guests, property owners, and operations staff.
              </p>

              {/* Supabase Status Pill */}
              <div style={{ marginTop: 12 }}>
                {isCloudLive ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', padding: '4px 10px', background: '#eef6f2', color: '#107e4d', borderRadius: 20, fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#107e4d' }}></span>
                    Supabase Cloud DB Active (RLS Protected)
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', padding: '4px 10px', background: '#fef7e6', color: '#b45309', borderRadius: 20, fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}></span>
                    Local Secure Session (Supabase Ready in .env.local)
                  </span>
                )}
              </div>
            </div>

            {/* Access Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, background: '#faf8f5', padding: 4, borderRadius: 8, marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => { setAuthTab('passkey'); setAuthError(null); }}
                style={{
                  display: 'none',
                  padding: '9px 3px',
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: authTab === 'passkey' ? '#fff' : 'transparent',
                  color: authTab === 'passkey' ? 'var(--copper)' : 'var(--ink-soft)',
                  boxShadow: authTab === 'passkey' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                <FiKey />
                <span>Passkey</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('signin'); setAuthError(null); }}
                style={{
                  padding: '9px 3px',
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: authTab === 'signin' ? '#fff' : 'transparent',
                  color: authTab === 'signin' ? 'var(--forest)' : 'var(--ink-soft)',
                  boxShadow: authTab === 'signin' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                <FiUser />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('code'); setAuthError(null); }}
                style={{
                  padding: '9px 3px',
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: authTab === 'code' ? '#fff' : 'transparent',
                  color: authTab === 'code' ? 'var(--forest)' : 'var(--ink-soft)',
                  boxShadow: authTab === 'code' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                <FiLock />
                <span>Stay Code</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('signup'); setAuthError(null); }}
                style={{
                  padding: '9px 3px',
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: authTab === 'signup' ? '#fff' : 'transparent',
                  color: authTab === 'signup' ? 'var(--forest)' : 'var(--ink-soft)',
                  boxShadow: authTab === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                <FiLayers />
                <span>Register</span>
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: 6, fontSize: '0.8rem', marginBottom: 18 }}>
                {authError}
              </div>
            )}

            {/* TAB 0: SINGLE PASSWORD ACCESS (FOR CLIENT REVIEW) */}
            {authTab === 'passkey' && (
              <form onSubmit={handleOnePasswordAccess} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#f9f8f5', border: '1px solid #e7e2d8', borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiLock style={{ color: 'var(--copper)', fontSize: '1.2rem' }} />
                      <strong style={{ fontSize: '0.85rem', color: 'var(--forest)' }}>Client Review Access</strong>
                    </div>
                    <span style={{ background: 'var(--copper)', color: '#fff', fontSize: '0.62rem', padding: '3px 7px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Single Passkey
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
                    Enter the master access password to immediately inspect all 3 portals (Resident Stay, Property Owner, and Operations Hub).
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      Portal Access Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      style={{ background: 'none', border: 'none', color: 'var(--copper)', fontSize: '0.72rem', cursor: 'pointer', padding: 0, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {showPasswordText ? <FiEyeOff /> : <FiEye />}
                      <span>{showPasswordText ? 'Hide' : 'Show'} Password</span>
                    </button>
                  </div>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    placeholder="Administrator password"
                    value={portalPassInput}
                    onChange={(e) => setPortalPassInput(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.9rem', letterSpacing: showPasswordText ? 'normal' : '0.1em' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
                    Select Initial View to Open:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setPortalRoleSelect('guest')}
                      style={{
                        padding: '10px 4px',
                        border: portalRoleSelect === 'guest' ? '2px solid var(--forest)' : '1px solid var(--line)',
                        background: portalRoleSelect === 'guest' ? '#f0f5f2' : '#fff',
                        borderRadius: 6,
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: 'var(--forest)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                      }}
                    >
                      <FiHome />
                      <span>Resident</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortalRoleSelect('owner')}
                      style={{
                        padding: '10px 4px',
                        border: portalRoleSelect === 'owner' ? '2px solid var(--copper)' : '1px solid var(--line)',
                        background: portalRoleSelect === 'owner' ? '#fbf7f4' : '#fff',
                        borderRadius: 6,
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: 'var(--copper)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                      }}
                    >
                      <FiTrendingUp />
                      <span>Owner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortalRoleSelect('admin')}
                      style={{
                        padding: '10px 4px',
                        border: portalRoleSelect === 'admin' ? '2px solid #2b433b' : '1px solid var(--line)',
                        background: portalRoleSelect === 'admin' ? '#eef4f1' : '#fff',
                        borderRadius: 6,
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: 'var(--forest)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                      }}
                    >
                      <FiShield />
                      <span>Admin Hub</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-book"
                  style={{ width: '100%', padding: '13px', fontSize: '0.88rem', marginTop: 4, letterSpacing: '0.04em' }}
                >
                  {authLoading ? 'Verifying Passkey...' : 'Unlock Portal Access →'}
                </button>
              </form>
            )}

            {/* TAB 1: SIGN IN (SUPABASE FULL AUTH PRESERVED) */}
            {authTab === 'signin' && (
              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aaron.miller@jhmi.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.86rem' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-book"
                  style={{ width: '100%', padding: '12px', fontSize: '0.85rem', marginTop: 6 }}
                >
                  {authLoading ? 'Authenticating with Supabase...' : 'Sign In to Portal →'}
                </button>
              </form>
            )}

            {/* TAB 2: STAY CODE & PIN ACCESS */}
            {authTab === 'code' && (
              <form onSubmit={handleCodeAccess} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', margin: '0 0 4px', lineHeight: 1.6 }}>
                  Arriving guest? Enter the booking reference from your confirmation email or reservation receipt for instant keyless access.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Booking Reference Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BHP-2026-123456"
                    value={directBookingCode}
                    onChange={(e) => setDirectBookingCode(e.target.value)}
                    style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.86rem', textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Door PIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4892#"
                    value={directPin}
                    onChange={(e) => setDirectPin(e.target.value)}
                    style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.86rem' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-book"
                  style={{ width: '100%', padding: '12px', fontSize: '0.85rem', marginTop: 6 }}
                >
                  Unlock Stay Dashboard ↗
                </button>
              </form>
            )}

            {/* TAB 3: REGISTER */}
            {authTab === 'signup' && (
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Jordan Hayes"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jordan.hayes@jhmi.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Create Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                    Account Role
                  </label>
                  <select value="guest" disabled style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 6, fontSize: '0.86rem' }}>
                    <option value="guest">Resident / Visiting Fellow (Guest Portal)</option>
                  </select>
                  <small style={{ display: 'block', marginTop: 6, color: 'var(--ink-soft)' }}>
                    Owner and administrator access is assigned by Baltimore Harbor Properties after verification.
                  </small>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-book"
                  style={{ width: '100%', padding: '12px', fontSize: '0.85rem', marginTop: 6 }}
                >
                  {authLoading ? 'Creating Account in Supabase...' : 'Register Secure Account ↗'}
                </button>
              </form>
            )}

            {/* Quick Demo One-Click Access Divider */}
            <div style={{ display: 'none', marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
              <span style={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-soft)', fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
                Instant One-Click Demo Access
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('guest')}
                  className="btn-outline"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '0.78rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <FiUser style={{ color: 'var(--forest)', fontSize: '1.05rem' }} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <strong>Resident Guest</strong>: Aaron Miller (Hopkins Fellow)
                  </div>
                  <span style={{ color: 'var(--copper)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Enter <FiArrowRight /></span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('owner')}
                  className="btn-outline"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '0.78rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <FiTrendingUp style={{ color: 'var(--copper)', fontSize: '1.05rem' }} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <strong>Property Owner</strong>: Eleanor Vance (Investor Portfolio)
                  </div>
                  <span style={{ color: 'var(--copper)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Enter <FiArrowRight /></span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="btn-outline"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '0.78rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <FiShield style={{ color: 'var(--forest)', fontSize: '1.05rem' }} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <strong>Host Operations Admin</strong>: Gonzalo Jouan (Team Hub)
                  </div>
                  <span style={{ color: 'var(--copper)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Enter <FiArrowRight /></span>
                </button>
              </div>
            </div>

          </div>
        </main>
        </>
      ) : (

      /* ========================================================================= */
      /* 2. AUTHENTICATED PORTAL DASHBOARD (When logged in)                        */
      /* ========================================================================= */
      <>
        {/* Dedicated Standalone Portal Header */}
        <header className="portal-app-header">
          <div className="portal-app-header__inner">
            <Link href="/" className="portal-app-header__brand" title="Return to public site">
              <span className="portal-app-header__monogram">BHP</span>
              <div className="portal-app-header__title">
                <strong>Baltimore Harbor Properties</strong>
                <span>Executive Portals Hub</span>
              </div>
            </Link>

            <div className="portal-app-header__actions">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: isCloudLive ? '#34d399' : '#f59e0b', display: 'inline-block' }}></span>
                <span style={{ color: '#d1d5db', fontSize: '0.76rem' }}>
                  {currentUser?.full_name || currentUser?.email}
                </span>
                <span style={{ background: 'rgba(170,118,84,0.3)', color: 'var(--sand)', padding: '3px 8px', borderRadius: 4, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {currentRole === 'guest' ? 'Resident' : currentRole === 'owner' ? 'Owner' : 'Host Admin'}
                </span>
              </div>

              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  transition: 'background 0.2s',
                }}
              >
                <span>Public Site</span>
                <FiExternalLink />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 4,
                  background: 'rgba(239,68,68,0.2)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#fca5a5',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <FiLogOut />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Role Navigation Tabs with React Icons */}
        <nav className="portal-tabs-nav" aria-label="Portal Navigation Tabs">
          <div className="portal-tabs-nav__inner">
            <button
              type="button"
              className={`portal-tab-btn ${currentRole === 'guest' ? 'is-active' : ''}`}
              onClick={() => setCurrentRole('guest')}
            >
              <FiKey />
              <span>Resident & Guest Portal</span>
            </button>
            {(currentUser?.role === 'owner' || currentUser?.role === 'admin') && <button
              type="button"
              className={`portal-tab-btn ${currentRole === 'owner' ? 'is-active' : ''}`}
              onClick={() => setCurrentRole('owner')}
            >
              <FiTrendingUp />
              <span>Property Owner & Investor Portal</span>
            </button>}
            {currentUser?.role === 'admin' && <button
              type="button"
              className={`portal-tab-btn ${currentRole === 'admin' ? 'is-active' : ''}`}
              onClick={() => window.location.assign('/admin')}
            >
              <FiShield />
              <span>Operations & Management Portal</span>
            </button>}
          </div>
        </nav>

        <main id="main">
          <div className="portal-layout">
            {/* Left Sidebar */}
            <aside className="portal-sidebar">
              <div className="user-profile-card">
                <div className="user-avatar">
                  {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'BHP'}
                </div>
                <div className="user-info">
                  <h3>{currentUser?.full_name || 'Resident Guest'}</h3>
                  <span className="user-role-badge">
                    {currentRole === 'guest' ? 'Resident Member' : currentRole === 'owner' ? 'Property Investor' : 'Operations Host'}
                  </span>
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="sidebar-widget">
                <span className="widget-title">Portal Shortcuts</span>
                <ul className="stay-meta-list">
                  <li>
                    <span className="label"><FiHome style={{ color: 'var(--forest)' }} /> Current Stay</span>
                    <span className="value">{activeReservation?.property || 'No active stay'}</span>
                  </li>
                  <li>
                    <span className="label"><FiKey style={{ color: 'var(--copper)' }} /> Front Door PIN</span>
                    <span className="value" style={{ color: 'var(--copper)', fontWeight: 700 }}>{activeReservation?.pinCode && activeReservation.pinCode !== 'Pending approval' ? activeReservation.pinCode : 'Not issued'}</span>
                  </li>
                </ul>
              </div>

              {/* Host Support */}
              <div className="sidebar-widget">
                <span className="widget-title">Local Host Support</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', margin: '0 0 12px', lineHeight: 1.5 }}>
                  Need fresh linens, early check-out, or local recommendations?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href="tel:+14102188462" className="btn-outline" style={{ fontSize: '0.74rem', padding: '8px 12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <FiPhone style={{ color: 'var(--forest)' }} />
                    <span>Call Host: (410) 218-8462</span>
                  </a>
                  <a href="mailto:gonzalojouan@hotmail.com" className="btn-outline" style={{ fontSize: '0.74rem', padding: '8px 12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <FiMail style={{ color: 'var(--copper)' }} />
                    <span>Email Concierge</span>
                  </a>
                </div>
              </div>

              {/* Database info widget */}
              <div className="sidebar-widget" style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 6, padding: '14px' }}>
                <span className="widget-title" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiDatabase style={{ color: 'var(--forest)' }} />
                  <span>Data Security</span>
                </span>
                <p style={{ fontSize: '0.74rem', color: 'var(--ink-soft)', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {isCloudLive ? 'All tickets & reservations sync with Supabase PostgreSQL with RLS encryption.' : 'Local secure sandbox active. Add Supabase credentials in .env.local for production database.'}
                </p>
              </div>
            </aside>

            {/* Main Portal Viewports */}
            <div className="portal-content">
              {/* ========================================================= */}
              {/* 1. GUEST PORTAL VIEWPORT                                  */}
              {/* ========================================================= */}
              {currentRole === 'guest' && (
                <div className="portal-view">
                  <div className="welcome-banner">
                    <div>
                      <span className="eyebrow">
                        Welcome to Baltimore
                      </span>
                      <h2>{activeReservation ? `Your Stay at ${activeReservation.property}` : 'No active stay yet'}</h2>
                      <p>{activeReservation ? `${activeReservation.dates} · ${activeReservation.status}` : 'Confirmed reservations linked to your email will appear here.'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {activeReservation?.pinCode && activeReservation.pinCode !== 'Pending approval' && <button
                        type="button"
                        className="btn-book"
                        style={{ background: 'var(--sand)', color: 'var(--forest)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => handleCopy(activeReservation.pinCode || '')}
                      >
                        <FiKey />
                        <span>Copy Door PIN ({activeReservation.pinCode})</span>
                      </button>
                      }
                    </div>
                  </div>

                  {/* Dispatch Maintenance Work Order */}
                  <div className="section-card" style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--copper)', fontWeight: 700 }}>
                          Fast Local Support
                        </span>
                        <h3 style={{ margin: '2px 0 0', font: '400 1.5rem var(--serif)', color: 'var(--forest)' }}>
                          Dispatch Concierge / Work Order
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                        Average response time: &lt; 20 minutes
                      </span>
                    </div>

                    <form onSubmit={handleSubmitTicket} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                          Issue / Request Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Extra towels, plumbing check, thermostat help"
                          value={ticketTitle}
                          onChange={(e) => setTicketTitle(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                          Category
                        </label>
                        <select
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                        >
                          <option value="HVAC">HVAC / Climate Control</option>
                          <option value="Plumbing">Plumbing & Water</option>
                          <option value="Housekeeping">Housekeeping & Linens</option>
                          <option value="WiFi">WiFi & Connectivity</option>
                          <option value="Access">Keyless Access / Locks</option>
                          <option value="General">General Inquiries</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                          Specific Room / Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Master Bedroom, Kitchen sink"
                          value={ticketRoom}
                          onChange={(e) => setTicketRoom(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                          Urgency Level
                        </label>
                        <select
                          value={ticketUrgency}
                          onChange={(e) => setTicketUrgency(e.target.value as any)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                        >
                          <option value="Normal">Normal (Routine daytime dispatch)</option>
                          <option value="Urgent">Urgent (Needs attention today)</option>
                          <option value="Emergency">Emergency (Immediate on-call staff)</option>
                        </select>
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                          Detailed Description *
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Provide any helpful details for our maintenance technician..."
                          value={ticketDesc}
                          onChange={(e) => setTicketDesc(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.85rem' }}
                        />
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <button type="submit" disabled={!activeReservation} className="btn-book" style={{ padding: '10px 24px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: activeReservation ? 1 : .55 }}>
                          <span>{activeReservation ? 'Submit Work Order' : 'Confirmed Stay Required'}</span>
                          <FiArrowRight />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Work Orders Table */}
                  <div className="section-card" style={{ marginTop: 24 }}>
                    <h3 style={{ margin: '0 0 14px', font: '400 1.4rem var(--serif)', color: 'var(--forest)' }}>
                      Active Concierge Requests & Maintenance Tickets
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-soft)' }}>
                            <th style={{ padding: '8px 12px' }}>Ticket ID</th>
                            <th style={{ padding: '8px 12px' }}>Issue / Title</th>
                            <th style={{ padding: '8px 12px' }}>Category</th>
                            <th style={{ padding: '8px 12px' }}>Urgency</th>
                            <th style={{ padding: '8px 12px' }}>Status</th>
                            <th style={{ padding: '8px 12px' }}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {guestTickets.length === 0 && <tr><td colSpan={6} style={{ padding: 18, textAlign: 'center', color: 'var(--ink-soft)' }}>No maintenance requests for this stay.</td></tr>}
                          {guestTickets.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--line)' }}>
                              <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 600 }}>{t.id}</td>
                              <td style={{ padding: '12px', fontWeight: 600 }}>{t.title}</td>
                              <td style={{ padding: '12px' }}>{t.category}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', background: t.urgency === 'Emergency' ? '#fee2e2' : t.urgency === 'Urgent' ? '#fef3c7' : '#f3f4f6', color: t.urgency === 'Emergency' ? '#b91c1c' : t.urgency === 'Urgent' ? '#b45309' : '#374151' }}>
                                  {t.urgency}
                                </span>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', background: t.status === 'Resolved' ? '#dcfce7' : '#e0f2fe', color: t.status === 'Resolved' ? '#15803d' : '#0369a1', fontWeight: 600 }}>
                                  {t.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px', color: 'var(--ink-soft)' }}>{t.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 2. OWNER PORTAL VIEWPORT                                  */}
              {/* ========================================================= */}
              {currentRole === 'owner' && (
                <div className="portal-view">
                  <div className="welcome-banner">
                    <div>
                      <span className="eyebrow">
                        Property Investor Overview
                      </span>
                      <h2>{currentUser?.full_name || 'Owner'} Portfolio Dashboard</h2>
                      <p>{ownerProperties.length ? `Managing ${ownerProperties.length} assigned residence${ownerProperties.length === 1 ? '' : 's'} in Baltimore` : 'No properties have been assigned yet. Contact the administrator.'}</p>
                    </div>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 24 }}>
                    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 20 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Assigned Properties</span>
                      <strong style={{ display: 'block', fontSize: '1.6rem', color: 'var(--forest)', margin: '6px 0 2px' }}>{ownerProperties.length}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Live portfolio records</span>
                    </div>
                    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 20 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Active Bookings</span>
                      <strong style={{ display: 'block', fontSize: '1.6rem', color: 'var(--forest)', margin: '6px 0 2px' }}>{ownerActiveBookings}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Confirmed and in-stay</span>
                    </div>
                    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 20 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Average Daily Rate</span>
                      <strong style={{ display: 'block', fontSize: '1.6rem', color: 'var(--forest)', margin: '6px 0 2px' }}>${ownerAverageRate.toFixed(2)}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--copper)' }}>Across assigned properties</span>
                    </div>
                  </div>

                  {/* Pending Maintenance Approvals */}
                  <div className="section-card" style={{ marginTop: 24 }}>
                    <h3 style={{ margin: '0 0 14px', font: '400 1.4rem var(--serif)', color: 'var(--forest)' }}>
                      Maintenance & Repair Approvals
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', margin: '0 0 16px' }}>
                      Items exceeding $150 require owner authorization before work is dispatched.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {ownerApprovals.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No maintenance approvals are pending.</p>}
                      {ownerApprovals.map((app, idx) => (
                        <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 20px', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                              <strong style={{ fontSize: '0.88rem', color: 'var(--forest)' }}>{app.item}</strong>
                              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--copper)' }}>({app.id})</span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                              Property: <strong>{app.property}</strong> · Estimated Cost: <strong>{app.cost}</strong>
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: '0.74rem', fontWeight: 600, background: app.status === 'Approved' ? '#dcfce7' : app.status === 'Declined' ? '#fee2e2' : '#fef3c7', color: app.status === 'Approved' ? '#15803d' : app.status === 'Declined' ? '#b91c1c' : '#b45309' }}>
                              {app.status}
                            </span>
                            {app.status === 'Pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprovalAction(idx, 'Approved')}
                                  className="btn-book"
                                  style={{ padding: '6px 14px', fontSize: '0.72rem', background: '#16a34a' }}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApprovalAction(idx, 'Declined')}
                                  className="btn-outline"
                                  style={{ padding: '6px 12px', fontSize: '0.72rem', borderColor: '#dc2626', color: '#dc2626' }}
                                >
                                  Decline
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Owner Blackout Calendar */}
                  <div className="section-card" style={{ marginTop: 24 }}>
                    <h3 style={{ margin: '0 0 10px', font: '400 1.4rem var(--serif)', color: 'var(--forest)' }}>
                      Owner Personal Stay / Blackout Dates
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', margin: '0 0 16px' }}>
                      Block dates when you or your family plan to use your property.
                    </p>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: 4 }}>Property</label>
                        <select value={blackoutPropertyId} onChange={(event) => setBlackoutPropertyId(event.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.82rem', minWidth: 220 }}>
                          <option value="">Select property</option>
                          {ownerProperties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: 4 }}>Start Date</label>
                        <input
                          type="date"
                          value={blackoutStart}
                          onChange={(e) => setBlackoutStart(e.target.value)}
                          style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: 4 }}>End Date</label>
                        <input
                          type="date"
                          value={blackoutEnd}
                          onChange={(e) => setBlackoutEnd(e.target.value)}
                          style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 4, fontSize: '0.82rem' }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-book"
                        style={{ padding: '10px 20px', fontSize: '0.78rem' }}
                        onClick={() => void handleCreateBlackout()}
                      >
                        Reserve Owner Dates
                      </button>
                    </div>
                    {ownerBlackouts.length > 0 && <div style={{ marginTop: 18, display: 'grid', gap: 8 }}>{ownerBlackouts.map((blackout) => <div key={blackout.id} style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 5, fontSize: '.8rem' }}><strong>{ownerProperties.find((property) => property.id === blackout.propertyId)?.title || `Property #${blackout.propertyId}`}</strong> · {blackout.startDate} to {blackout.endDate}</div>)}</div>}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 3. OPERATIONS & ADMIN PORTAL VIEWPORT                     */}
              {/* ========================================================= */}
              {currentRole === 'admin' && currentUser?.role === 'admin' && (
                <div className="portal-view">
                  <div className="welcome-banner">
                    <div>
                      <span className="eyebrow">
                        Host Operations Control
                      </span>
                      <h2>Baltimore Harbor Central Management Hub</h2>
                      <p>Real-time booking logs, Supabase synchronization, and inventory control</p>
                    </div>
                  </div>

                  {/* Real-time Reservations from Supabase */}
                  <div className="section-card" style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--copper)', fontWeight: 700 }}>
                          Live Booking Feed
                        </span>
                        <h3 style={{ margin: '2px 0 0', font: '400 1.4rem var(--serif)', color: 'var(--forest)' }}>
                          Active & Upcoming Guest Reservations ({adminReservations.length})
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={loadReservations}
                        className="btn-outline"
                        style={{ padding: '6px 14px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <FiCheckCircle style={{ color: 'var(--forest)' }} />
                        <span>Refresh from Supabase</span>
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-soft)' }}>
                            <th style={{ padding: '8px 12px' }}>Code</th>
                            <th style={{ padding: '8px 12px' }}>Guest Name</th>
                            <th style={{ padding: '8px 12px' }}>Residence</th>
                            <th style={{ padding: '8px 12px' }}>Dates</th>
                            <th style={{ padding: '8px 12px' }}>PIN</th>
                            <th style={{ padding: '8px 12px' }}>Total</th>
                            <th style={{ padding: '8px 12px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminReservations.map((res) => (
                            <tr key={res.id} style={{ borderBottom: '1px solid var(--line)' }}>
                              <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--forest)' }}>
                                {res.id}
                              </td>
                              <td style={{ padding: '12px', fontWeight: 600 }}>
                                {res.guest}
                                {res.guestEmail && (
                                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--ink-soft)', fontWeight: 400 }}>
                                    {res.guestEmail}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px' }}>{res.property}</td>
                              <td style={{ padding: '12px', color: 'var(--ink-soft)' }}>{res.dates}</td>
                              <td style={{ padding: '12px', fontFamily: 'monospace', color: 'var(--copper)', fontWeight: 700 }}>
                                {res.pinCode || '4892#'}
                              </td>
                              <td style={{ padding: '12px', fontWeight: 600 }}>{res.total}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', background: res.status === 'In-Stay' ? '#dbeafe' : res.status === 'Arriving Today' ? '#fef3c7' : '#dcfce7', color: res.status === 'In-Stay' ? '#1d4ed8' : res.status === 'Arriving Today' ? '#b45309' : '#15803d', fontWeight: 600 }}>
                                  {res.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Inventory & Property Manager */}
                  <div style={{ marginTop: 24 }}>
                    <AdminPropertyManager />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </>
      )}

      {/* Dedicated Portal Footer */}
      <footer className="portal-app-footer">
        <div className="portal-app-footer__inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>Baltimore Harbor Properties</span>
            <span>·</span>
            <span>Executive Portal Hub</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/properties">Properties</Link>
            <Link href="/contact">Host Support</Link>
            <Link href="/policies">House Rules & Terms</Link>
          </div>
          <div>
            © {new Date().getFullYear()} Baltimore Harbor Properties LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
