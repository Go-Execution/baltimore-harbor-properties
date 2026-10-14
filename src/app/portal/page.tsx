'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MaintenanceTicket, OwnerApproval, Reservation } from '@/types';
import Footer from '@/components/Footer';
import AdminPropertyManager from '@/components/AdminPropertyManager';

const STORAGE_KEY = 'csp_nextjs_portal_state_v1';

export default function PortalPage() {
  const [currentRole, setCurrentRole] = useState<'guest' | 'owner' | 'admin'>('guest');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Guest State
  const [guestTickets, setGuestTickets] = useState<MaintenanceTicket[]>([
    { id: 'TKT-104', title: 'HVAC Filter & Thermostat Calibration', category: 'HVAC', status: 'Dispatched', date: 'Oct 13, 2026', urgency: 'Normal' },
    { id: 'TKT-089', title: 'Additional Down Pillows Request', category: 'Housekeeping', status: 'Resolved', date: 'Oct 12, 2026', urgency: 'Normal' }
  ]);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('HVAC');
  const [ticketUrgency, setTicketUrgency] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [ticketRoom, setTicketRoom] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  // Owner State
  const [ownerApprovals, setOwnerApprovals] = useState<OwnerApproval[]>([
    { id: 'APP-201', property: '3037 Hudson St', item: 'Winter Furnace Inspection & Filter Replacement', cost: '$180.00', status: 'Pending' },
    { id: 'APP-198', property: '2904 O\'Donnell St', item: 'Balcony Deck Sealant & Power Wash', cost: '$240.00', status: 'Approved' }
  ]);
  const [blackoutStart, setBlackoutStart] = useState('');
  const [blackoutEnd, setBlackoutEnd] = useState('');

  // Admin State
  const [adminReservations, setAdminReservations] = useState<Reservation[]>([
    { id: 'RES-8821', guest: 'Aaron Miller', property: 'The Townhouse (Hudson)', dates: 'Oct 12 - Oct 26', status: 'In-Stay', total: '$2,478.40' },
    { id: 'RES-8824', guest: 'Dr. Sarah Jenkins', property: 'Quiet Retreat (Canton)', dates: 'Oct 15 - Nov 12', status: 'Arriving Today', total: '$3,180.00' },
    { id: 'RES-8829', guest: 'Marcus Vance', property: 'Harbor House (Pratt)', dates: 'Oct 18 - Oct 22', status: 'Confirmed', total: '$928.00' },
    { id: 'RES-8833', guest: 'Claire Dupont', property: 'The Captain\'s Loft (Thames)', dates: 'Oct 20 - Nov 05', status: 'Confirmed', total: '$2,875.00' }
  ]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentRole) setCurrentRole(parsed.currentRole);
        if (parsed.guestTickets) setGuestTickets(parsed.guestTickets);
        if (parsed.ownerApprovals) setOwnerApprovals(parsed.ownerApprovals);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToStorage = (updatedRole = currentRole, updatedTickets = guestTickets, updatedApprovals = ownerApprovals) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentRole: updatedRole,
        guestTickets: updatedTickets,
        ownerApprovals: updatedApprovals
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const switchRole = (role: 'guest' | 'owner' | 'admin') => {
    setCurrentRole(role);
    saveToStorage(role, guestTickets, ownerApprovals);
    const labels = { guest: 'Guest: Aaron Miller', owner: 'Owner: Eleanor Vance', admin: 'Operations Admin' };
    showToast(`Switched view to ${labels[role]}`);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied to clipboard: ${text}`);
    }).catch(() => {
      showToast(`Value: ${text}`);
    });
  };

  // Submit Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc) {
      showToast('Please fill out ticket title and description.');
      return;
    }

    const newId = 'TKT-' + Math.floor(100 + Math.random() * 900);
    const newTicket: MaintenanceTicket = {
      id: newId,
      title: ticketTitle,
      category: ticketCategory,
      urgency: ticketUrgency,
      status: 'Dispatched',
      date: 'Today, Just now',
      description: ticketDesc,
      room: ticketRoom
    };

    const updated = [newTicket, ...guestTickets];
    setGuestTickets(updated);
    saveToStorage(currentRole, updated, ownerApprovals);
    setTicketTitle('');
    setTicketRoom('');
    setTicketDesc('');
    showToast(`Work order ${newId} dispatched to Chase Street Concierge!`);
  };

  // Approve / Decline Owner work orders
  const handleApprovalAction = (index: number, newStatus: 'Approved' | 'Declined') => {
    const updated = [...ownerApprovals];
    updated[index].status = newStatus;
    setOwnerApprovals(updated);
    saveToStorage(currentRole, guestTickets, updated);
    showToast(`Work order ${updated[index].id} marked as ${newStatus}.`);
  };

  return (
    <div className="portal-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-msg is-visible">
          {toastMessage}
        </div>
      )}

      {/* Top Demo Bar */}
      <aside className="demo-bar" aria-label="Demo Role Switcher">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="demo-bar__badge">Interactive Portals</span>
          <span>Select a live test persona to explore all portal capabilities:</span>
        </div>
        <div className="demo-bar__buttons">
          <button
            type="button"
            className={`demo-btn ${currentRole === 'guest' ? 'is-active' : ''}`}
            onClick={() => switchRole('guest')}
          >
            👤 Guest: Aaron Miller
          </button>
          <button
            type="button"
            className={`demo-btn ${currentRole === 'owner' ? 'is-active' : ''}`}
            onClick={() => switchRole('owner')}
          >
            🏢 Owner: Eleanor Vance
          </button>
          <button
            type="button"
            className={`demo-btn ${currentRole === 'admin' ? 'is-active' : ''}`}
            onClick={() => switchRole('admin')}
          >
            ⚙️ Team: Operations Admin
          </button>
        </div>
      </aside>

      {/* Role Navigation Tabs */}
      <nav className="portal-tabs-nav" aria-label="Portal Navigation Tabs">
        <div className="portal-tabs-nav__inner">
          <button
            type="button"
            className={`portal-tab-btn ${currentRole === 'guest' ? 'is-active' : ''}`}
            onClick={() => switchRole('guest')}
          >
            <span>🔑</span> Resident & Guest Portal
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${currentRole === 'owner' ? 'is-active' : ''}`}
            onClick={() => switchRole('owner')}
          >
            <span>📊</span> Property Owner & Investor Portal
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${currentRole === 'admin' ? 'is-active' : ''}`}
            onClick={() => switchRole('admin')}
          >
            <span>⚡</span> Operations & Management Portal
          </button>
        </div>
      </nav>

      <main id="main">
        <div className="portal-layout">
          {/* Sidebar */}
          <aside className="portal-sidebar">
            <div className="user-profile-card">
              <div className="user-avatar">CS</div>
              <div className="user-info">
                <h3>{currentRole === 'guest' ? 'Aaron Miller' : currentRole === 'owner' ? 'Eleanor Vance' : 'Chase Street Team'}</h3>
                <span>{currentRole === 'guest' ? 'In-Stay Resident' : currentRole === 'owner' ? 'Property Investor' : 'Operations Supervisor'}</span>
              </div>
            </div>

            <nav className="portal-nav-menu" aria-label="Portal section navigation">
              <a className="portal-nav-link is-active" href="#overview">
                <span>🏠 Overview</span>
              </a>
              {currentRole === 'guest' && (
                <>
                  <a className="portal-nav-link" href="#access">
                    <span>🔐 Access & WiFi</span>
                  </a>
                  <a className="portal-nav-link" href="#maintenance">
                    <span>🛠️ Maintenance</span>
                    <span className="portal-nav-badge">{guestTickets.length} Active</span>
                  </a>
                  <a className="portal-nav-link" href="#perks">
                    <span>☕ Neighborhood Perks</span>
                  </a>
                </>
              )}
              {currentRole === 'owner' && (
                <>
                  <a className="portal-nav-link" href="#revenue">
                    <span>📈 Revenue & Yield</span>
                  </a>
                  <a className="portal-nav-link" href="#approvals">
                    <span>✍️ Approvals</span>
                    <span className="portal-nav-badge">
                      {ownerApprovals.filter(a => a.status === 'Pending').length} Pending
                    </span>
                  </a>
                  <a className="portal-nav-link" href="#statements">
                    <span>📄 Statements</span>
                  </a>
                </>
              )}
              {currentRole === 'admin' && (
                <>
                  <a className="portal-nav-link" href="#reservations">
                    <span>📅 Guest Pipeline</span>
                  </a>
                  <a className="portal-nav-link" href="#units">
                    <span>🏢 Unit Inventory</span>
                  </a>
                </>
              )}
              <Link className="portal-nav-link" href="/contact">
                <span>📞 Concierge Desk</span>
              </Link>
            </nav>

            <div className="emergency-help-box">
              <strong>24/7 Baltimore Support</strong>
              <p style={{ margin: '0 0 8px' }}>Direct line to on-call supervisor & maintenance dispatch:</p>
              <a href="tel:+14102188462" style={{ fontWeight: 600, color: '#633614', textDecoration: 'underline' }}>
                +1 (410) 218-8462
              </a>
            </div>
          </aside>

          {/* Main Content Panels */}
          <section className="portal-main">
            {/* ===================================== */}
            {/* GUEST ROLE PANEL                     */}
            {/* ===================================== */}
            {currentRole === 'guest' && (
              <div id="panel-guest">
                {/* Access Hero Keycard */}
                <div className="access-hero-card" id="access">
                  <div className="access-header">
                    <div>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--sand)', fontWeight: 600 }}>
                        Current Active Stay
                      </span>
                      <h2 className="access-property-title">The Townhouse at Hudson Street</h2>
                      <div className="access-stay-dates">3037 Hudson St, Canton · Oct 12 – Oct 26, 2026 (11 Nights Remaining)</div>
                    </div>
                    <span className="p-badge p-badge--copper">Live Stay</span>
                  </div>

                  <div className="access-credentials-grid">
                    <div className="cred-box">
                      <span>Front Keypad PIN</span>
                      <div className="cred-code-wrap">
                        <strong>4892#</strong>
                        <button type="button" className="copy-btn" onClick={() => handleCopy('4892#')}>Copy PIN</button>
                      </div>
                    </div>

                    <div className="cred-box">
                      <span>WiFi Network</span>
                      <div className="cred-code-wrap">
                        <strong style={{ fontSize: '0.95rem' }}>ChaseStreet-5G</strong>
                        <button type="button" className="copy-btn" onClick={() => handleCopy('ChaseStreet-Hudson-5G')}>Copy</button>
                      </div>
                    </div>

                    <div className="cred-box">
                      <span>WiFi Password</span>
                      <div className="cred-code-wrap">
                        <strong style={{ fontSize: '0.85rem' }}>Waterfront2026!</strong>
                        <button type="button" className="copy-btn" onClick={() => handleCopy('BaltimoreWaterfront2026!')}>Copy</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Tiles */}
                <div style={{ marginTop: 28 }}>
                  <div className="panel-header">
                    <div>
                      <h2>Resident Services & Controls</h2>
                      <p>On-demand conveniences tailored for your stay in Baltimore</p>
                    </div>
                  </div>

                  <div className="quick-tiles-grid">
                    <div className="quick-tile" onClick={() => showToast('Mid-stay deep housekeeping scheduled for tomorrow at 11:00 AM ($75 billed).')}>
                      <div className="quick-tile-icon">🧹</div>
                      <div>
                        <h4>Mid-Stay Housekeeping</h4>
                        <p>Fresh percale linens, bathroom deep sanitization, and trash turnover.</p>
                      </div>
                      <span className="action-hint">Request Service ($75) →</span>
                    </div>

                    <div className="quick-tile" onClick={() => showToast('Parking Space: Bay #3 behind 3037 Hudson St. Keycard on kitchen island.')}>
                      <div className="quick-tile-icon">🚗</div>
                      <div>
                        <h4>Reserved Parking Spot</h4>
                        <p>Private fenced space Bay #3 behind property with 24/7 camera monitoring.</p>
                      </div>
                      <span className="action-hint">View Space Info →</span>
                    </div>

                    <div className="quick-tile" onClick={() => showToast('House Manual: Nest set to 70°F. Trash collection is Tuesday morning.')}>
                      <div className="quick-tile-icon">📖</div>
                      <div>
                        <h4>Digital House Manual</h4>
                        <p>Appliance guides, Nest thermostat operation, and neighborhood schedule.</p>
                      </div>
                      <span className="action-hint">Open Manual →</span>
                    </div>
                  </div>
                </div>

                {/* Maintenance Submitter & Tracker */}
                <div className="portal-card" style={{ marginTop: 30 }} id="maintenance">
                  <div className="panel-header" style={{ marginBottom: 14 }}>
                    <div>
                      <h3>Maintenance & Concierge Requests</h3>
                      <p className="subtitle">Submit any maintenance or comfort request for swift resolution by our local Canton team.</p>
                    </div>
                    <span className="p-badge">Avg Response: 22 Mins</span>
                  </div>

                  <form className="ticket-form" onSubmit={handleSubmitTicket} style={{ background: '#fdfbf7', padding: 22, border: '1px solid var(--line)', borderRadius: 4 }}>
                    <div className="ticket-form-grid">
                      <div>
                        <label htmlFor="t-title">Issue Summary *</label>
                        <input
                          type="text"
                          id="t-title"
                          placeholder="e.g. Living room AC thermostat adjustment"
                          value={ticketTitle}
                          onChange={(e) => setTicketTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="t-cat">Category *</label>
                        <select
                          id="t-cat"
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                        >
                          <option value="HVAC">Climate / HVAC / Heat</option>
                          <option value="Plumbing">Plumbing & Water</option>
                          <option value="WiFi/Tech">WiFi / Television / Smart Locks</option>
                          <option value="Housekeeping">Linens & Housekeeping Supplies</option>
                          <option value="Noise/Exterior">Exterior / Noise / Parking</option>
                          <option value="General">Other / General Question</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="t-urg">Priority Level</label>
                        <select
                          id="t-urg"
                          value={ticketUrgency}
                          onChange={(e) => setTicketUrgency(e.target.value as any)}
                        >
                          <option value="Normal">Normal (Within 2-4 hours)</option>
                          <option value="Urgent">Urgent (Within 1 hour)</option>
                          <option value="Emergency">Emergency (Immediate Dispatch)</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="t-room">Location in Home</label>
                        <input
                          type="text"
                          id="t-room"
                          placeholder="e.g. Master Bedroom / Kitchen"
                          value={ticketRoom}
                          onChange={(e) => setTicketRoom(e.target.value)}
                        />
                      </div>

                      <div className="form-group-full">
                        <label htmlFor="t-desc">Details & Description *</label>
                        <textarea
                          id="t-desc"
                          placeholder="Please describe what you are experiencing..."
                          value={ticketDesc}
                          onChange={(e) => setTicketDesc(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn-book" style={{ padding: '12px 24px' }}>
                        Dispatch Request to Concierge ↗
                      </button>
                    </div>
                  </form>

                  {/* Active Tickets List */}
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                      Active & Recent Work Orders
                    </h4>
                    <div className="tickets-list">
                      {guestTickets.map((t) => (
                        <div key={t.id} className="ticket-item">
                          <div className="ticket-info">
                            <h5>{t.title} <small style={{ color: 'var(--copper)', fontSize: '0.7rem', fontWeight: 400 }}>({t.id})</small></h5>
                            <p>Category: <strong>{t.category}</strong> · Urgency: <strong>{t.urgency}</strong> · Filed on {t.date}</p>
                          </div>
                          <div>
                            <span className={`ticket-badge ${t.status === 'Resolved' ? 'badge-green' : 'badge-blue'}`}>
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Neighborhood Perks */}
                <div className="portal-card" style={{ marginTop: 30 }} id="perks">
                  <h3>Chase Street Local Resident Perks</h3>
                  <p className="subtitle">Exclusive privileges negotiated with our favorite neighborhood partners in Canton and Fells Point.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, padding: 18 }}>
                      <strong style={{ color: 'var(--ink)', display: 'block', fontSize: '0.9rem' }}>☕ Canton Coffee Roasters</strong>
                      <p style={{ margin: '4px 0 10px', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>15% off all espresso drinks & fresh pastries. Use code <strong>CSGUEST15</strong>.</p>
                    </div>
                    <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, padding: 18 }}>
                      <strong style={{ color: 'var(--ink)', display: 'block', fontSize: '0.9rem' }}>🚤 Baltimore Water Taxi</strong>
                      <p style={{ margin: '4px 0 10px', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Unlimited daily harbor crossing pass at 20% resident discount.</p>
                    </div>
                    <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, padding: 18 }}>
                      <strong style={{ color: 'var(--ink)', display: 'block', fontSize: '0.9rem' }}>🏋️ Merritt Clubs Canton</strong>
                      <p style={{ margin: '4px 0 10px', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Complimentary guest day-passes to rooftop pool and fitness center.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================== */}
            {/* OWNER ROLE PANEL                     */}
            {/* ===================================== */}
            {currentRole === 'owner' && (
              <div id="panel-owner">
                <div className="panel-header" id="revenue">
                  <div>
                    <h2>Property Owner Portfolio Dashboard</h2>
                    <p>Real-time occupancy, revenue yield, and maintenance approvals for Eleanor Vance</p>
                  </div>
                  <button
                    type="button"
                    className="btn-book"
                    onClick={() => showToast('Generating certified PDF statement for October 2026... Download started.')}
                  >
                    Download October Statement (PDF) ↗
                  </button>
                </div>

                {/* KPI Metrics */}
                <div className="metrics-row">
                  <div className="kpi-card">
                    <span className="kpi-label">October Gross Revenue</span>
                    <div className="kpi-val">$9,480</div>
                    <span className="kpi-trend">▲ +14.2% vs. Long-Term Lease</span>
                  </div>

                  <div className="kpi-card">
                    <span className="kpi-label">Net Owner Payout</span>
                    <div className="kpi-val" style={{ color: 'var(--copper)' }}>$7,584</div>
                    <span className="kpi-trend" style={{ color: 'var(--ink-soft)' }}>Direct ACH scheduled Nov 1</span>
                  </div>

                  <div className="kpi-card">
                    <span className="kpi-label">Portfolio Occupancy</span>
                    <div className="kpi-val">94.2%</div>
                    <span className="kpi-trend">▲ 28 nights booked</span>
                  </div>

                  <div className="kpi-card">
                    <span className="kpi-label">Average Daily Rate (ADR)</span>
                    <div className="kpi-val">$158</div>
                    <span className="kpi-trend">▲ Optimized by dynamic AI</span>
                  </div>
                </div>

                {/* Approvals */}
                <div className="portal-card" style={{ marginTop: 30 }} id="approvals">
                  <div className="panel-header" style={{ marginBottom: 12 }}>
                    <div>
                      <h3>Owner Maintenance Approvals</h3>
                      <p className="subtitle">Review capital items and routine service recommendations requiring your sign-off.</p>
                    </div>
                  </div>
                  <div className="tickets-list">
                    {ownerApprovals.map((app, idx) => (
                      <div key={app.id} className="ticket-item">
                        <div className="ticket-info">
                          <h5>{app.item}</h5>
                          <p>Property: <strong>{app.property}</strong> · Estimated Cost: <strong>{app.cost}</strong></p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className={`ticket-badge ${app.status === 'Pending' ? 'badge-yellow' : app.status === 'Approved' ? 'badge-green' : 'badge-yellow'}`}>
                            {app.status}
                          </span>
                          {app.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                className="btn-book"
                                style={{ padding: '6px 12px', fontSize: '0.65rem' }}
                                onClick={() => handleApprovalAction(idx, 'Approved')}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="btn-outline"
                                style={{ padding: '6px 12px', fontSize: '0.65rem' }}
                                onClick={() => handleApprovalAction(idx, 'Declined')}
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

                {/* Financial Statements */}
                <div className="portal-card" style={{ marginTop: 30 }} id="statements">
                  <div className="panel-header" style={{ marginBottom: 12 }}>
                    <div>
                      <h3>Historical Financial Statements</h3>
                      <p className="subtitle">Audited monthly statements detailing nightly revenue, turnover cleaning fees, and net disbursements.</p>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Properties</th>
                          <th>Gross Booking</th>
                          <th>Mgmt Fee (20%)</th>
                          <th>Net Disbursement</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>October 2026</strong></td>
                          <td>3037 Hudson & 2904 O'Donnell</td>
                          <td>$9,480.00</td>
                          <td>$1,896.00</td>
                          <td><strong style={{ color: 'var(--copper)' }}>$7,584.00</strong></td>
                          <td><span className="ticket-badge badge-yellow">Processing</span></td>
                          <td>
                            <button
                              type="button"
                              className="btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.65rem' }}
                              onClick={() => showToast('Downloading October statement PDF...')}
                            >
                              PDF ↗
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>September 2026</strong></td>
                          <td>3037 Hudson & 2904 O'Donnell</td>
                          <td>$9,820.00</td>
                          <td>$1,964.00</td>
                          <td><strong style={{ color: 'var(--copper)' }}>$7,856.00</strong></td>
                          <td><span className="ticket-badge badge-green">Disbursed (ACH)</span></td>
                          <td>
                            <button
                              type="button"
                              className="btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.65rem' }}
                              onClick={() => showToast('Downloading September statement PDF...')}
                            >
                              PDF ↗
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Blackout Dates */}
                <div className="portal-card" style={{ marginTop: 30 }}>
                  <h3>Owner Personal Stay Calendar Lock</h3>
                  <p className="subtitle">Want to enjoy your Baltimore property? Lock out personal dates with zero commission.</p>
                  <form
                    className="ticket-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      showToast(`Dates ${blackoutStart} to ${blackoutEnd} locked for Owner Stay. Syncing with Airbnb, VRBO & CSP Direct.`);
                    }}
                    style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}
                  >
                    <div>
                      <label htmlFor="b-prop">Select Property</label>
                      <select id="b-prop">
                        <option value="hudson">3037 Hudson Street (The Townhouse)</option>
                        <option value="odonnell">2904 O'Donnell Street (Quiet Retreat)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="b-start">Start Date</label>
                      <input
                        type="date"
                        id="b-start"
                        value={blackoutStart}
                        onChange={(e) => setBlackoutStart(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="b-end">End Date</label>
                      <input
                        type="date"
                        id="b-end"
                        value={blackoutEnd}
                        onChange={(e) => setBlackoutEnd(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-book" style={{ padding: '11px 20px' }}>
                      Lock Personal Stay 🔒
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ===================================== */}
            {/* ADMIN ROLE PANEL                     */}
            {/* ===================================== */}
            {currentRole === 'admin' && (
              <div id="panel-admin">
                <div className="panel-header">
                  <div>
                    <h2>Chase Street Mission Control</h2>
                    <p>Centralized reservations, occupancy monitoring, and work order dispatch</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/admin" className="btn-outline" style={{ background: 'var(--copper)', color: '#fff', border: 'none' }}>
                      Dedicated Admin Hub ↗
                    </Link>
                    <Link href="/properties" className="btn-outline">
                      View Public Catalog ↗
                    </Link>
                  </div>
                </div>

                {/* SOW §2 & §5: Real-time Property Listing Management & Website Policies */}
                <div style={{ marginBottom: 32 }}>
                  <AdminPropertyManager />
                </div>

                {/* Admin KPIs */}
                <div className="metrics-row">
                  <div className="kpi-card">
                    <span className="kpi-label">Occupancy Rate</span>
                    <div className="kpi-val">92.8%</div>
                    <span className="kpi-trend">39 of 42 units filled</span>
                  </div>

                  <div className="kpi-card">
                    <span className="kpi-label">Today's Check-ins</span>
                    <div className="kpi-val" style={{ color: 'var(--copper)' }}>4</div>
                    <span className="kpi-trend" style={{ color: 'var(--ink-soft)' }}>Keys & codes dispatched</span>
                  </div>

                  <div className="kpi-card">
                    <span className="kpi-label">Active Work Orders</span>
                    <div className="kpi-val">2</div>
                    <span className="kpi-trend" style={{ color: '#3b82f6' }}>Technicians assigned</span>
                  </div>

                  <div className="kpi-card">
                    <span className="kpi-label">Cleanliness Score</span>
                    <div className="kpi-val">4.99</div>
                    <span className="kpi-trend">★ Top 1% Baltimore Stays</span>
                  </div>
                </div>

                {/* Pipeline */}
                <div className="portal-card" style={{ marginTop: 30 }} id="reservations">
                  <div className="panel-header" style={{ marginBottom: 14 }}>
                    <div>
                      <h3>Active & Upcoming Guest Pipeline</h3>
                      <p className="subtitle">Direct bookings, corporate allocations, and incoming medical fellows.</p>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Ref ID</th>
                          <th>Guest Name</th>
                          <th>Property</th>
                          <th>Dates</th>
                          <th>Status</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminReservations.map((r) => (
                          <tr key={r.id}>
                            <td><strong>{r.id}</strong></td>
                            <td>{r.guest}</td>
                            <td>{r.property}</td>
                            <td>{r.dates}</td>
                            <td>
                              <span className={`ticket-badge ${r.status === 'In-Stay' ? 'badge-green' : r.status === 'Arriving Today' ? 'badge-yellow' : 'badge-blue'}`}>
                                {r.status}
                              </span>
                            </td>
                            <td><strong>{r.total}</strong></td>
                            <td>
                              <button
                                type="button"
                                className="btn-outline"
                                style={{ padding: '4px 10px', fontSize: '0.62rem' }}
                                onClick={() => showToast(`Viewing reservation file for ${r.id}`)}
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Units */}
                <div className="portal-card" style={{ marginTop: 30 }} id="units">
                  <h3>Quick Inventory Unit Status</h3>
                  <p className="subtitle">Toggle live availability across booking channels with one touch.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>3037 Hudson Street</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Canton · $149/night</span>
                      </div>
                      <span className="ticket-badge badge-green">Occupied (Aaron M.)</span>
                    </div>

                    <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>2904 O'Donnell Street</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Canton · $99/night</span>
                      </div>
                      <span className="ticket-badge badge-yellow">Turnover (Today)</span>
                    </div>

                    <div style={{ background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>712 E Pratt Street</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Inner Harbor · $189/night</span>
                      </div>
                      <span className="ticket-badge badge-green">Occupied (Corp Stay)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer showTopCta={false} />
    </div>
  );
}
