/**
 * Chase Street Properties — Stays / Properties Catalog Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('properties-grid');
  const countEl = document.getElementById('results-count');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const bedroomSelect = document.getElementById('bedroom-select');
  const neighborhoodChips = document.querySelectorAll('.filter-chip[data-neighborhood]');
  const modalBackdrop = document.getElementById('quick-modal');
  const modalBody = document.getElementById('quick-modal-body');

  let activeNeighborhood = 'all';
  let activeSearch = '';
  let activeSort = 'featured';
  let activeBedrooms = 'all';

  // Parse URL search params (e.g. from homepage check stays bar)
  const urlParams = new URLSearchParams(window.location.search);
  const paramGuests = urlParams.get('guests');
  const paramNeighborhood = urlParams.get('neighborhood');
  if (paramNeighborhood) {
    activeNeighborhood = paramNeighborhood;
    neighborhoodChips.forEach(chip => {
      chip.classList.toggle('is-active', chip.dataset.neighborhood === activeNeighborhood);
    });
  }

  function getFilteredProperties() {
    return CSP_PROPERTIES.filter(p => {
      // Neighborhood filter
      if (activeNeighborhood !== 'all' && p.neighborhood.toLowerCase() !== activeNeighborhood.toLowerCase()) {
        return false;
      }

      // Bedrooms filter
      if (activeBedrooms !== 'all') {
        const bedsNum = parseInt(activeBedrooms, 10);
        if (bedsNum === 3 && p.bedrooms < 3) return false;
        if (bedsNum < 3 && p.bedrooms !== bedsNum) return false;
      }

      // Guests filter from query param
      if (paramGuests && p.guests < parseInt(paramGuests, 10)) {
        return false;
      }

      // Search text filter
      if (activeSearch.trim()) {
        const query = activeSearch.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchNeigh = p.neighborhood.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchAmenity = p.amenities.some(a => a.name.toLowerCase().includes(query));
        if (!matchTitle && !matchNeigh && !matchDesc && !matchAmenity) return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeSort === 'price-asc') return a.price - b.price;
      if (activeSort === 'price-desc') return b.price - a.price;
      if (activeSort === 'rating') return b.rating - a.rating;
      return a.id - b.id; // default featured
    });
  }

  function renderProperties() {
    if (!grid) return;
    const items = getFilteredProperties();
    if (countEl) {
      countEl.innerHTML = `Showing <strong>${items.length}</strong> available ${items.length === 1 ? 'residence' : 'residences'} in Baltimore`;
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 70px 20px; background: #fff; border: 1px solid var(--line); border-radius: 4px;">
          <p style="font: 2.2rem var(--serif); margin: 0 0 10px;">No residences match your criteria.</p>
          <p style="color: var(--ink-soft); font-size: 0.9rem; margin-bottom: 24px;">Try clearing filters or selecting another neighborhood.</p>
          <button id="reset-filters-btn" class="btn-book" style="margin: 0 auto;">Reset All Filters</button>
        </div>
      `;
      document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
        activeNeighborhood = 'all';
        activeSearch = '';
        activeBedrooms = 'all';
        if (searchInput) searchInput.value = '';
        if (bedroomSelect) bedroomSelect.value = 'all';
        neighborhoodChips.forEach(c => c.classList.toggle('is-active', c.dataset.neighborhood === 'all'));
        renderProperties();
      });
      return;
    }

    grid.innerHTML = items.map(p => {
      const badgesHtml = p.badges.map(b => `<span class="p-badge">${b}</span>`).join('');
      const amenitiesTags = p.amenities.slice(0, 3).map(a => `<span class="amenity-tag">${a.name}</span>`).join('');

      return `
        <article class="p-card" data-id="${p.id}">
          <div class="p-card__media">
            <img src="${p.coverImage}" alt="${p.title}" loading="lazy">
            <div class="p-card__badge-row">
              <span class="p-badge p-badge--copper">${p.neighborhood}</span>
              <div>${badgesHtml}</div>
            </div>
          </div>
          <div class="p-card__content">
            <div class="p-card__location">${p.address}</div>
            <h3 class="p-card__title">
              <a href="property-detail.html?pid=${p.id}">${p.title}</a>
            </h3>
            <p class="p-card__desc">${p.subtitle || p.description}</p>
            <div class="p-card__specs">
              <span>👥 ${p.guests} Guests</span>
              <span>🛏️ ${p.bedrooms} ${p.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
              <span>🚿 ${p.bathrooms} Bath</span>
              <span>📐 ${p.sqft} sq ft</span>
            </div>
            <div class="p-card__amenities-tags">
              ${amenitiesTags}
            </div>
            <div class="p-card__footer">
              <div class="p-card__rate">
                From <strong>$${p.price}</strong> / night
              </div>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn-outline quick-view-btn" data-id="${p.id}">Quick View</button>
                <a href="property-detail.html?pid=${p.id}" class="btn-book">Details ↗</a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach quick view listeners
    grid.querySelectorAll('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = parseInt(btn.dataset.id, 10);
        openQuickView(pid);
      });
    });
  }

  function openQuickView(pid) {
    const prop = CSP_PROPERTIES.find(p => p.id === pid);
    if (!prop || !modalBackdrop || !modalBody) return;

    modalBody.innerHTML = `
      <div style="display: flex; gap: 24px; flex-direction: column;">
        <div style="aspect-ratio: 16/9; overflow: hidden; border-radius: 4px;">
          <img src="${prop.coverImage}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--copper); font-weight: 600;">${prop.neighborhood} · Baltimore, MD</span>
          <h2 style="font: 400 2.2rem var(--serif); margin: 6px 0 12px; color: var(--ink);">${prop.title}</h2>
          <p style="font-size: 0.88rem; line-height: 1.7; color: var(--ink-soft); margin: 0 0 16px;">${prop.description}</p>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #faf8f5; border: 1px solid var(--line); border-radius: 4px; padding: 14px; margin-bottom: 20px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; text-align: center;">
            <div><strong style="display:block; font-size: 1.1rem; font-family: var(--serif); color: var(--ink);">${prop.guests}</strong>Guests</div>
            <div><strong style="display:block; font-size: 1.1rem; font-family: var(--serif); color: var(--ink);">${prop.bedrooms}</strong>Bedrooms</div>
            <div><strong style="display:block; font-size: 1.1rem; font-family: var(--serif); color: var(--ink);">${prop.bathrooms}</strong>Baths</div>
            <div><strong style="display:block; font-size: 1.1rem; font-family: var(--serif); color: var(--ink);">${prop.sqft}</strong>Sq Ft</div>
          </div>

          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-soft); margin: 0 0 10px;">Top Amenities Included</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem;">
              ${prop.amenities.slice(0, 6).map(a => `<div style="display: flex; align-items: center; gap: 8px;"><span>${a.icon}</span><span>${a.name}</span></div>`).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 18px; border-top: 1px solid var(--line);">
            <div>
              <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-soft);">Nightly Rate</span>
              <div style="font: 400 2.2rem var(--serif); color: var(--ink);">$${prop.price} <small style="font-size: 0.8rem; font-family: var(--sans); color: var(--ink-soft);">/ night</small></div>
            </div>
            <a href="property-detail.html?pid=${prop.id}" class="btn-book" style="padding: 14px 28px; font-size: 0.75rem;">View Full Details & Book ↗</a>
          </div>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  // Modal close handlers
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      modalBackdrop?.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  // Filters event listeners
  neighborhoodChips.forEach(chip => {
    chip.addEventListener('click', () => {
      neighborhoodChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeNeighborhood = chip.dataset.neighborhood;
      renderProperties();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearch = e.target.value;
      renderProperties();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderProperties();
    });
  }

  if (bedroomSelect) {
    bedroomSelect.addEventListener('change', (e) => {
      activeBedrooms = e.target.value;
      renderProperties();
    });
  }

  renderProperties();
});
