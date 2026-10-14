/**
 * Chase Street Properties — Portals Hub Interactive Engine
 * Supporting Guest / Resident, Property Owner, and Operations Team Portals
 */

document.addEventListener('DOMContentLoaded', () => {
  // Demo State & LocalStorage
  const STORAGE_KEY = 'csp_portal_state_v1';

  const defaultState = {
    currentRole: 'guest', // 'guest' | 'owner' | 'admin'
    guest: {
      name: 'Aaron Miller',
      stayTitle: 'The Townhouse at Hudson Street',
      address: '3037 Hudson St, Baltimore, MD 21224',
      checkin: 'Oct 12, 2026',
      checkout: 'Oct 26, 2026',
      nightsTotal: 14,
      nightsRemaining: 11,
      doorCode: '4892#',
      wifiNetwork: 'ChaseStreet-Hudson-5G',
      wifiPass: 'BaltimoreWaterfront2026!',
      balanceDue: 0.00,
      totalPaid: 2478.40,
      tickets: [
        { id: 'TKT-104', title: 'HVAC Filter & Thermostat Calibration', category: 'HVAC', status: 'Dispatched', date: 'Oct 13, 2026', urgency: 'Normal' },
        { id: 'TKT-089', title: 'Additional Down Pillows Request', category: 'Housekeeping', status: 'Resolved', date: 'Oct 12, 2026', urgency: 'Low' }
      ]
    },
    owner: {
      name: 'Eleanor Vance',
      propertiesCount: 2,
      grossRevenue: '$9,480.00',
      netPayout: '$7,584.00',
      occupancyRate: '94.2%',
      adr: '$158.00',
      approvals: [
        { id: 'APP-201', property: '3037 Hudson St', item: 'Winter Furnace Inspection & Filter Replacement', cost: '$180.00', status: 'Pending' },
        { id: 'APP-198', property: '2904 O\'Donnell St', item: 'Balcony Deck Sealant & Power Wash', cost: '$240.00', status: 'Approved' }
      ]
    },
    admin: {
      occupiedUnits: 39,
      totalUnits: 42,
      todayCheckins: 4,
      openTickets: 2,
      reservations: [
        { id: 'RES-8821', guest: 'Aaron Miller', property: 'The Townhouse (Hudson)', dates: 'Oct 12 - Oct 26', status: 'In-Stay', total: '$2,478.40' },
        { id: 'RES-8824', guest: 'Dr. Sarah Jenkins', property: 'Quiet Retreat (Canton)', dates: 'Oct 15 - Nov 12', status: 'Arriving Today', total: '$3,180.00' },
        { id: 'RES-8829', guest: 'Marcus Vance', property: 'Harbor House (Pratt)', dates: 'Oct 18 - Oct 22', status: 'Confirmed', total: '$928.00' },
        { id: 'RES-8833', guest: 'Claire Dupont', property: 'The Captain\'s Loft (Thames)', dates: 'Oct 20 - Nov 05', status: 'Confirmed', total: '$2,875.00' }
      ]
    }
  };

  let state = defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = Object.assign({}, defaultState, JSON.parse(saved));
    }
  } catch (e) {
    console.error('Could not load saved portal state', e);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Could not persist portal state', e);
    }
  }

  // Toast notification helper
  function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  // Role Switcher Handlers
  const roleTabs = document.querySelectorAll('.portal-tab-btn');
  const demoBtns = document.querySelectorAll('.demo-btn');
  const rolePanels = {
    guest: document.getElementById('panel-guest'),
    owner: document.getElementById('panel-owner'),
    admin: document.getElementById('panel-admin')
  };

  function setRole(role) {
    state.currentRole = role;
    saveState();

    roleTabs.forEach(tab => {
      tab.classList.toggle('is-active', tab.dataset.role === role);
    });

    demoBtns.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.role === role);
    });

    Object.keys(rolePanels).forEach(r => {
      if (rolePanels[r]) {
        rolePanels[r].style.display = (r === role) ? 'block' : 'none';
      }
    });

    renderRoleView(role);
  }

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => setRole(tab.dataset.role));
  });

  demoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setRole(btn.dataset.role);
      showToast(`Switched view to ${btn.textContent.trim()}`);
    });
  });

  // Render view depending on role
  function renderRoleView(role) {
    if (role === 'guest') renderGuestView();
    else if (role === 'owner') renderOwnerView();
    else if (role === 'admin') renderAdminView();
  }

  // --- GUEST VIEW LOGIC ---
  function renderGuestView() {
    const list = document.getElementById('guest-tickets-list');
    if (!list) return;

    if (state.guest.tickets.length === 0) {
      list.innerHTML = `<p style="font-size: 0.85rem; color: var(--ink-soft); padding: 10px 0;">No active maintenance requests. Everything in your residence is in top order!</p>`;
    } else {
      list.innerHTML = state.guest.tickets.map(t => {
        let badgeClass = 'badge-yellow';
        if (t.status === 'Resolved') badgeClass = 'badge-green';
        if (t.status === 'Dispatched') badgeClass = 'badge-blue';

        return `
          <div class="ticket-item">
            <div class="ticket-info">
              <h5>${t.title} <small style="color: var(--copper); font-size: 0.7rem; font-weight: 400;">(${t.id})</small></h5>
              <p>Category: <strong>${t.category}</strong> · Urgency: <strong>${t.urgency}</strong> · Filed on ${t.date}</p>
            </div>
            <div>
              <span class="ticket-badge ${badgeClass}">${t.status}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Guest Ticket Form Submission
  const ticketForm = document.getElementById('submit-ticket-form');
  if (ticketForm) {
    ticketForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('ticket-title')?.value.trim();
      const category = document.getElementById('ticket-category')?.value;
      const urgency = document.getElementById('ticket-urgency')?.value;
      const desc = document.getElementById('ticket-desc')?.value.trim();

      if (!title || !desc) {
        showToast('Please fill out the ticket title and description.');
        return;
      }

      const newId = 'TKT-' + Math.floor(100 + Math.random() * 900);
      const newTicket = {
        id: newId,
        title: title,
        category: category || 'General',
        urgency: urgency || 'Normal',
        status: 'Dispatched',
        date: 'Today, Just now',
        description: desc
      };

      state.guest.tickets.unshift(newTicket);
      saveState();
      renderGuestView();
      ticketForm.reset();
      showToast(`Work order ${newId} dispatched to Chase Street Concierge!`);
    });
  }

  // Copy buttons (Door code & WiFi)
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = original, 2000);
        showToast(`Copied to clipboard: ${text}`);
      }).catch(() => {
        showToast(`PIN: ${text}`);
      });
    });
  });

  // Housekeeping service add-on
  document.getElementById('add-cleaning-btn')?.addEventListener('click', () => {
    showToast('Mid-stay deep housekeeping scheduled for tomorrow at 11:00 AM ($75 billed to stay).');
  });

  // --- OWNER VIEW LOGIC ---
  function renderOwnerView() {
    const approvalsContainer = document.getElementById('owner-approvals-list');
    if (!approvalsContainer) return;

    approvalsContainer.innerHTML = state.owner.approvals.map((app, idx) => {
      const isPending = app.status === 'Pending';
      return `
        <div class="ticket-item">
          <div class="ticket-info">
            <h5>${app.item}</h5>
            <p>Property: <strong>${app.property}</strong> · Estimated Cost: <strong>${app.cost}</strong></p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="ticket-badge ${isPending ? 'badge-yellow' : 'badge-green'}">${app.status}</span>
            ${isPending ? `
              <button class="btn-book approve-btn" data-index="${idx}" style="padding: 6px 12px; font-size: 0.65rem;">Approve</button>
              <button class="btn-outline decline-btn" data-index="${idx}" style="padding: 6px 12px; font-size: 0.65rem;">Decline</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach approve/decline listeners
    approvalsContainer.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        state.owner.approvals[idx].status = 'Approved';
        saveState();
        renderOwnerView();
        showToast('Work order approved! Maintenance crew scheduled.');
      });
    });

    approvalsContainer.querySelectorAll('.decline-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        state.owner.approvals[idx].status = 'Declined';
        saveState();
        renderOwnerView();
        showToast('Work order declined. Property manager notified.');
      });
    });
  }

  // --- ADMIN VIEW LOGIC ---
  function renderAdminView() {
    const resTableBody = document.getElementById('admin-reservations-body');
    if (!resTableBody) return;

    resTableBody.innerHTML = state.admin.reservations.map((r, idx) => {
      let badge = 'badge-green';
      if (r.status === 'Arriving Today') badge = 'badge-yellow';
      if (r.status === 'Confirmed') badge = 'badge-blue';

      return `
        <tr>
          <td><strong>${r.id}</strong></td>
          <td>${r.guest}</td>
          <td>${r.property}</td>
          <td>${r.dates}</td>
          <td><span class="ticket-badge ${badge}">${r.status}</span></td>
          <td><strong>${r.total}</strong></td>
          <td>
            <button class="btn-outline admin-view-res-btn" data-id="${r.id}" style="padding: 4px 10px; font-size: 0.62rem;">Manage</button>
          </td>
        </tr>
      `;
    }).join('');

    resTableBody.querySelectorAll('.admin-view-res-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast(`Viewing reservation file for ${btn.dataset.id}`);
      });
    });
  }

  // Owner statement download simulation
  document.querySelectorAll('.download-statement-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const month = btn.dataset.month || 'Current';
      showToast(`Generating certified PDF owner financial statement for ${month}... Download started.`);
    });
  });

  // Owner blackout date simulator
  document.getElementById('owner-blackout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const start = document.getElementById('blackout-start')?.value;
    const end = document.getElementById('blackout-end')?.value;
    if (start && end) {
      showToast(`Dates ${start} to ${end} locked for Owner Personal Stay. Syncing with Airbnb, VRBO & CSP Direct.`);
    }
  });

  // Initialize active role view
  setRole(state.currentRole || 'guest');
});
