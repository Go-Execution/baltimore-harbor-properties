import { Property, Reservation } from '@/types';
import { PROPERTIES as SEED_PROPERTIES } from '@/data/properties';

const PROPERTIES_KEY = 'CSP_PROPERTIES_DATA_V1';
const RESERVATIONS_KEY = 'CSP_RESERVATIONS_DATA_V1';
const SETTINGS_KEY = 'CSP_SETTINGS_DATA_V1';

export const DEFAULT_SETTINGS = {
  bannerEnabled: 'true',
  bannerText: 'Special Rates Available for 30+ Day Medical & Clinical Rotations — Inquire for Per-Diem Direct Invoicing.',
  contactPhone: '(410) 218-8462',
  contactEmail: 'gonzalojouan@hotmail.com',
  agencyName: 'Go Execution',
  agencyEmail: 'info@goexecution.com',
  checkInTime: '3:00 PM',
  checkOutTime: '11:00 AM',
  quietHours: '10:00 PM - 8:00 AM',
};

const DEFAULT_RESERVATIONS: Reservation[] = [
  {
    id: 'CSP-2026-8941',
    guest: 'Aaron Miller (Johns Hopkins Fellow)',
    property: "The Hudson Townhouse · O'Donnell Square",
    dates: 'Oct 14 – Oct 28, 2026',
    status: 'In-Stay',
    total: '$3,440.00',
    guestEmail: 'aaron.miller@jhmi.edu',
    guestPhone: '(410) 555-0192',
    pinCode: '4892#',
    nights: 14,
  },
  {
    id: 'CSP-2026-8955',
    guest: 'Dr. Sarah Jenkins (Visiting Specialist)',
    property: 'Fells Point Historic Belgian Cobblestone',
    dates: 'Oct 15 – Oct 22, 2026',
    status: 'Arriving Today',
    total: '$1,925.00',
    guestEmail: 's.jenkins@umm.edu',
    guestPhone: '(443) 555-0144',
    pinCode: '3184#',
    nights: 7,
  },
  {
    id: 'CSP-2026-8970',
    guest: 'Marcus Vance (T. Rowe Price Exec)',
    property: 'Harbor East Promenade Penthouse Suite',
    dates: 'Oct 18 – Oct 25, 2026',
    status: 'Confirmed',
    total: '$3,185.00',
    guestEmail: 'm.vance@troweprice-corp.com',
    guestPhone: '(202) 555-0118',
    pinCode: '7721#',
    nights: 7,
  },
  {
    id: 'CSP-2026-8912',
    guest: 'Elena Rostova (BioPark Biotech)',
    property: 'Mount Vernon Cultural District Loft',
    dates: 'Oct 02 – Oct 10, 2026',
    status: 'Completed',
    total: '$1,720.00',
    guestEmail: 'erostova@biomd.com',
    guestPhone: '(410) 555-0177',
    pinCode: '9012#',
    nights: 8,
  },
];

export function getStoredProperties(): Property[] {
  if (typeof window === 'undefined') {
    return SEED_PROPERTIES.map((p) => ({ ...p, status: p.status || 'Active' }));
  }

  try {
    const raw = localStorage.getItem(PROPERTIES_KEY);
    if (!raw) {
      const initial = SEED_PROPERTIES.map((p) => ({ ...p, status: p.status || 'Active' }));
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading properties from storage', err);
    return SEED_PROPERTIES;
  }
}

export function getActiveProperties(): Property[] {
  return getStoredProperties().filter((p) => !p.status || p.status === 'Active');
}

export function getPropertyById(id: number): Property | undefined {
  const all = getStoredProperties();
  return all.find((p) => p.id === id);
}

export function saveProperty(data: Partial<Property> & { id?: number }): Property {
  if (typeof window === 'undefined') {
    return data as Property;
  }

  const all = getStoredProperties();
  let updatedProp: Property;

  if (data.id && all.some((p) => p.id === data.id)) {
    // Update existing
    all.forEach((p, idx) => {
      if (p.id === data.id) {
        updatedProp = {
          ...p,
          ...data,
          status: data.status || p.status || 'Active',
        };
        all[idx] = updatedProp;
      }
    });
  } else {
    // Create new
    const newId = Math.max(0, ...all.map((p) => p.id)) + 1;
    updatedProp = {
      id: newId,
      title: data.title || 'Untitled Baltimore Residence',
      subtitle: data.subtitle || 'Executive Furnished Stay',
      neighborhood: data.neighborhood || 'Canton',
      address: data.address || 'Baltimore, MD 21224',
      price: Number(data.price) || 225,
      cleaningFee: Number(data.cleaningFee) || 145,
      taxRate: Number(data.taxRate) || 0.095,
      guests: Number(data.guests) || 4,
      bedrooms: Number(data.bedrooms) || 2,
      beds: Number(data.beds) || 2,
      bathrooms: Number(data.bathrooms) || 2,
      sqft: Number(data.sqft) || 1200,
      rating: 5.0,
      reviewsCount: 1,
      badges: data.badges?.length ? data.badges : ['New Listing', data.neighborhood || 'Baltimore'],
      coverImage:
        data.coverImage ||
        '/assets/media/unsplash/photo-1512917774080-9991f1c4c750--25cc0a4415ec.jpg',
      gallery:
        data.gallery?.length
          ? data.gallery
          : [
              data.coverImage ||
                '/assets/media/unsplash/photo-1512917774080-9991f1c4c750--25cc0a4415ec.jpg',
              '/assets/media/unsplash/photo-1600585154340-be6161a56a0c--e705a536f2a6.jpg',
              '/assets/media/unsplash/photo-1600565193348-f74bd3c7ccdf--6fe51e3c8698.jpg',
            ],
      description: data.description || 'Newly curated executive residence in Baltimore.',
      amenities: data.amenities || [
        { name: 'Gigabit Fiber WiFi', icon: '📶', category: 'Connectivity' },
        { name: 'Dedicated Workspace', icon: '💼', category: 'Work' },
        { name: 'In-Unit Washer/Dryer', icon: '🧺', category: 'Convenience' },
        { name: 'Chef Kitchen', icon: '🍳', category: 'Kitchen' },
      ],
      commute: data.commute || [
        { destination: 'Johns Hopkins Hospital', time: '8 min drive' },
        { destination: 'UMMC / Downtown', time: '10 min drive' },
      ],
      status: data.status || 'Active',
      featured: data.featured || false,
    };
    all.unshift(updatedProp);
  }

  try {
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(all));
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      throw new Error('The uploaded gallery is too large for browser storage. Remove one or two images and save again.');
    }
    throw error;
  }
  window.dispatchEvent(new CustomEvent('csp:properties-updated', { detail: all }));
  return updatedProp!;
}

export function deleteProperty(id: number): boolean {
  if (typeof window === 'undefined') return false;
  const all = getStoredProperties();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length !== all.length) {
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('csp:properties-updated', { detail: filtered }));
    return true;
  }
  return false;
}

export function togglePropertyStatus(id: number): Property | undefined {
  if (typeof window === 'undefined') return undefined;
  const all = getStoredProperties();
  let updated: Property | undefined;
  all.forEach((p) => {
    if (p.id === id) {
      p.status = p.status === 'Active' ? 'Inactive' : 'Active';
      updated = p;
    }
  });
  if (updated) {
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('csp:properties-updated', { detail: all }));
  }
  return updated;
}

export function resetPropertiesToDefault(): Property[] {
  if (typeof window === 'undefined') return SEED_PROPERTIES;
  const reset = SEED_PROPERTIES.map((p) => ({ ...p, status: 'Active' as const }));
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(reset));
  window.dispatchEvent(new CustomEvent('csp:properties-updated', { detail: reset }));
  return reset;
}

// ----------------- RESERVATIONS -----------------

export function getStoredReservations(): Reservation[] {
  if (typeof window === 'undefined') return DEFAULT_RESERVATIONS;
  try {
    const raw = localStorage.getItem(RESERVATIONS_KEY);
    if (!raw) {
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(DEFAULT_RESERVATIONS));
      return DEFAULT_RESERVATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RESERVATIONS;
  }
}

export function addReservation(reservation: Reservation): void {
  if (typeof window === 'undefined') return;
  const list = getStoredReservations();
  list.unshift(reservation);
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('csp:reservations-updated', { detail: list }));
}

export function updateReservationStatus(id: string, status: Reservation['status']): void {
  if (typeof window === 'undefined') return;
  const list = getStoredReservations();
  list.forEach((r) => {
    if (r.id === id) r.status = status;
  });
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('csp:reservations-updated', { detail: list }));
}

// ----------------- SETTINGS -----------------

export function getStoredSettings(): typeof DEFAULT_SETTINGS {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<typeof DEFAULT_SETTINGS>): typeof DEFAULT_SETTINGS {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const current = getStoredSettings();
  const merged = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent('csp:settings-updated', { detail: merged }));
  return merged;
}
