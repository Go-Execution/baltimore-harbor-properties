/**
 * Baltimore Harbor Properties — Single Residence Detail Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  let pid = parseInt(urlParams.get('pid'), 10) || 1;

  const prop = CSP_PROPERTIES.find(p => p.id === pid) || CSP_PROPERTIES[0];

  // Update Page Title and SEO Meta
  document.title = `${prop.title} — Baltimore Harbor Properties`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', `${prop.title} in ${prop.neighborhood}, Baltimore. ${prop.subtitle}`);

  // Populate Header & Overview
  const propTitle = document.getElementById('prop-title');
  const propAddress = document.getElementById('prop-address');
  const propBadges = document.getElementById('prop-badges');
  const propDesc = document.getElementById('prop-description');
  const propNeighborhoodLink = document.getElementById('prop-neighborhood-link');

  if (propTitle) propTitle.textContent = prop.title;
  if (propAddress) propAddress.innerHTML = `📍 ${prop.address} · <span style="color: var(--copper); font-weight: 500;">${prop.neighborhood}</span>`;
  if (propNeighborhoodLink) {
    propNeighborhoodLink.textContent = prop.neighborhood;
    propNeighborhoodLink.href = `properties.html?neighborhood=${encodeURIComponent(prop.neighborhood)}`;
  }

  if (propBadges) {
    propBadges.innerHTML = prop.badges.map(b => `<span class="p-badge p-badge--copper">${b}</span>`).join(' ');
  }
  if (propDesc) propDesc.textContent = prop.description;

  // Populate Quick Stats Strip
  const statsGuests = document.getElementById('stat-guests');
  const statsBeds = document.getElementById('stat-beds');
  const statsBaths = document.getElementById('stat-baths');
  const statsSqft = document.getElementById('stat-sqft');
  if (statsGuests) statsGuests.textContent = `${prop.guests} Guests`;
  if (statsBeds) statsBeds.textContent = `${prop.bedrooms} Bed (${prop.beds} Beds)`;
  if (statsBaths) statsBaths.textContent = `${prop.bathrooms} Bath`;
  if (statsSqft) statsSqft.textContent = `${prop.sqft} sq ft`;

  // Populate Gallery
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    const images = prop.gallery;
    galleryGrid.innerHTML = `
      <div class="gallery-item gallery-item--main" data-idx="0">
        <img src="${images[0] || prop.coverImage}" alt="${prop.title} Main Living Space">
      </div>
      <div class="gallery-item" data-idx="1">
        <img src="${images[1] || images[0]}" alt="${prop.title} Bedroom">
      </div>
      <div class="gallery-item" data-idx="2">
        <img src="${images[2] || images[0]}" alt="${prop.title} Kitchen">
      </div>
      <div class="gallery-item" data-idx="3">
        <img src="${images[3] || images[0]}" alt="${prop.title} Details">
      </div>
      <div class="gallery-item" data-idx="4">
        <img src="${images[4] || images[0]}" alt="${prop.title} Exterior & Neighborhood">
      </div>
      <button type="button" class="gallery-btn-all" id="open-all-photos-btn">
        View all ${prop.gallery.length} photos ↗
      </button>
    `;

    // Lightbox Modal
    const photosModal = document.getElementById('photos-modal');
    const photosModalBody = document.getElementById('photos-modal-body');

    function openLightbox(startIdx = 0) {
      if (!photosModal || !photosModalBody) return;
      photosModalBody.innerHTML = `
        <h3 style="font: 400 1.8rem var(--serif); margin: 0 0 16px;">${prop.title} Photo Gallery</h3>
        <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
          ${prop.gallery.map((img, i) => `
            <div>
              <img src="${img}" alt="${prop.title} photo ${i+1}" style="width: 100%; border-radius: 4px; display: block;">
            </div>
          `).join('')}
        </div>
      `;
      photosModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    document.getElementById('open-all-photos-btn')?.addEventListener('click', () => openLightbox(0));
    galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        openLightbox(idx);
      });
    });
  }

  // Populate Amenities
  const amenitiesContainer = document.getElementById('amenities-container');
  if (amenitiesContainer) {
    amenitiesContainer.innerHTML = prop.amenities.map(a => `
      <div class="amenity-row">
        <div class="amenity-icon">${a.icon}</div>
        <div>
          <strong style="display: block; font-size: 0.84rem; color: var(--ink);">${a.name}</strong>
          <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-soft);">${a.category}</span>
        </div>
      </div>
    `).join('');
  }

  // Populate Commute Times
  const commuteList = document.getElementById('commute-list');
  if (commuteList) {
    commuteList.innerHTML = prop.commute.map(c => `
      <div class="commute-item">
        <span class="place">${c.destination}</span>
        <span class="duration">⏱️ ${c.time}</span>
      </div>
    `).join('');
  }

  // Sticky Booking Calculator
  const rateDisplay = document.getElementById('calc-rate');
  const checkinInput = document.getElementById('calc-checkin');
  const checkoutInput = document.getElementById('calc-checkout');
  const guestsSelect = document.getElementById('calc-guests');
  const nightsCountEl = document.getElementById('calc-nights-count');
  const subtotalEl = document.getElementById('calc-subtotal');
  const cleaningEl = document.getElementById('calc-cleaning');
  const taxesEl = document.getElementById('calc-taxes');
  const totalEl = document.getElementById('calc-total');

  if (rateDisplay) rateDisplay.textContent = `$${prop.price}`;

  // Default dates: checkin = today + 2, checkout = today + 6 (4 nights)
  const today = new Date();
  const defCheckin = new Date(today);
  defCheckin.setDate(today.getDate() + 2);
  const defCheckout = new Date(today);
  defCheckout.setDate(today.getDate() + 6);

  function formatDateIso(d) {
    return d.toISOString().split('T')[0];
  }

  if (checkinInput && checkoutInput) {
    checkinInput.min = formatDateIso(today);
    checkinInput.value = formatDateIso(defCheckin);
    checkoutInput.min = formatDateIso(defCheckin);
    checkoutInput.value = formatDateIso(defCheckout);

    // Guest options
    if (guestsSelect) {
      guestsSelect.innerHTML = Array.from({ length: prop.guests }, (_, i) => i + 1).map(n => `
        <option value="${n}" ${n === 2 ? 'selected' : ''}>${n} ${n === 1 ? 'Guest' : 'Guests'}</option>
      `).join('');
    }

    function calculateBooking() {
      const d1 = new Date(checkinInput.value);
      const d2 = new Date(checkoutInput.value);
      let diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (isNaN(diffDays) || diffDays < 1) diffDays = 3;

      const subtotal = diffDays * prop.price;
      const cleaning = prop.cleaningFee;
      const taxes = Math.round((subtotal + cleaning) * prop.taxRate * 100) / 100;
      const total = subtotal + cleaning + taxes;

      if (nightsCountEl) nightsCountEl.textContent = `${diffDays} nights × $${prop.price}`;
      if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
      if (cleaningEl) cleaningEl.textContent = `$${cleaning}`;
      if (taxesEl) taxesEl.textContent = `$${taxes.toFixed(2)}`;
      if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

      return { diffDays, subtotal, cleaning, taxes, total };
    }

    checkinInput.addEventListener('change', () => {
      const d1 = new Date(checkinInput.value);
      const minOut = new Date(d1);
      minOut.setDate(d1.getDate() + 3); // 3 nights min
      checkoutInput.min = formatDateIso(minOut);
      if (new Date(checkoutInput.value) <= d1) {
        checkoutInput.value = formatDateIso(minOut);
      }
      calculateBooking();
    });

    checkoutInput.addEventListener('change', calculateBooking);
    calculateBooking();
  }

  // Reservation Flow Modal
  const reserveBtn = document.getElementById('reserve-btn');
  const reserveModal = document.getElementById('reserve-modal');
  const reserveSummary = document.getElementById('reserve-summary');
  const confirmBookingForm = document.getElementById('confirm-booking-form');

  if (reserveBtn && reserveModal) {
    reserveBtn.addEventListener('click', () => {
      const d1 = checkinInput.value;
      const d2 = checkoutInput.value;
      const guests = guestsSelect.value;
      const calc = (checkinInput && checkoutInput) ? calculateBooking() : { total: prop.price * 3, diffDays: 3 };

      if (reserveSummary) {
        reserveSummary.innerHTML = `
          <div style="background: #faf8f5; border: 1px solid var(--line); border-radius: 4px; padding: 16px; margin-bottom: 20px;">
            <strong style="font-size: 1rem; color: var(--ink); display: block; margin-bottom: 6px;">${prop.title}</strong>
            <p style="margin: 0 0 4px; font-size: 0.78rem; color: var(--ink-soft);">📍 ${prop.address}</p>
            <p style="margin: 0; font-size: 0.78rem; color: var(--copper); font-weight: 500;">
              📅 ${d1} to ${d2} (${calc.diffDays} Nights) · 👥 ${guests} Guests
            </p>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--line); font-size: 0.9rem; font-weight: 600; color: var(--ink);">
              Total: $${calc.total} USD (includes cleaning & MD taxes)
            </div>
          </div>
        `;
      }

      reserveModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });

    if (confirmBookingForm) {
      confirmBookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const guestName = document.getElementById('guest-fullname')?.value || 'Valued Guest';
        const confNum = 'CSP-' + Math.floor(100000 + Math.random() * 900000);

        // Update modal content to show confirmation receipt
        const modalInner = document.getElementById('reserve-modal-content');
        if (modalInner) {
          modalInner.innerHTML = `
            <div style="text-align: center; padding: 20px 0;">
              <div style="width: 60px; height: 60px; border-radius: 50%; background: #d1fae5; color: #065f46; display: grid; place-items: center; font-size: 1.8rem; margin: 0 auto 18px;">
                ✓
              </div>
              <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--copper); font-weight: 600;">Reservation Confirmed</span>
              <h2 style="font: 400 2.2rem var(--serif); margin: 6px 0 14px; color: var(--ink);">You're staying in Baltimore!</h2>
              <p style="font-size: 0.88rem; color: var(--ink-soft); max-width: 420px; margin: 0 auto 20px; line-height: 1.6;">
                Thank you, <strong>${guestName}</strong>. Your confirmation code is <strong style="color: var(--ink); font-family: monospace;">${confNum}</strong>. A copy with check-in instructions and keycode has been sent to your email.
              </p>
              <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                <a href="portal.html" class="btn-book" style="padding: 12px 24px;">Open Resident Portal ↗</a>
                <button type="button" class="btn-outline" data-close-modal style="padding: 12px 24px;">Close</button>
              </div>
            </div>
          `;

          modalInner.querySelectorAll('[data-close-modal]').forEach(b => {
            b.addEventListener('click', () => {
              reserveModal.classList.remove('is-open');
              document.body.style.overflow = '';
            });
          });
        }
      });
    }
  }

  // Generic modal close
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('is-open'));
      document.body.style.overflow = '';
    });
  });
});
