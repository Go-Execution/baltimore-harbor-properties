import { getSupabaseClient, isSupabaseConfigured } from './client';
import { MaintenanceTicket, OwnerApproval, Property, PropertyReview, Reservation } from '@/types';
import { getStoredReservations, addReservation } from '@/utils/propertyStore';

/**
 * Save a new reservation to Supabase (and mirror to local store)
 */
export async function dbSaveReservation(res: Reservation & {
  propertyId?: number;
  checkinDate?: string;
  checkoutDate?: string;
  stayPurpose?: string;
  specialRequests?: string;
}): Promise<{ success: boolean; source: 'supabase' | 'local'; error?: string; reservationId?: string; pinCode?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    addReservation(res);
    return { success: true, source: 'local' };
  }

  try {
    const response = await fetch('/api/forms/reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(res),
    });
    const result = await response.json();
    if (!response.ok || !result.success) return { success: false, source: 'supabase', error: result.error || 'Booking request failed.' };
    const saved = { ...res, id: result.reservationId, pinCode: result.pinCode };
    addReservation(saved);
    return { success: true, source: 'supabase', reservationId: result.reservationId, pinCode: result.pinCode };
  } catch (err) {
    return { success: false, source: 'supabase', error: err instanceof Error ? err.message : 'Booking request failed.' };
  }
}

/**
 * Fetch all reservations from Supabase (or fallback to local store)
 */
export async function dbFetchReservations(): Promise<{ data: Reservation[]; source: 'supabase' | 'local' }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return { data: getStoredReservations(), source: 'local' };
  }

  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetch reservations error:', error?.message);
      return { data: [], source: 'supabase' };
    }

    const mapped: Reservation[] = data.map((r: any) => ({
      id: r.id,
      guest: r.guest_name,
      property: r.property_title,
      propertyId: r.property_id ? Number(r.property_id) : undefined,
      dates: r.dates,
      status: r.status,
      total: r.total,
      guestEmail: r.guest_email,
      guestPhone: r.guest_phone,
      pinCode: r.pin_code,
      nights: r.nights,
      guestCount: r.guest_count,
      createdAt: r.created_at,
    }));

    return { data: mapped, source: 'supabase' };
  } catch (err) {
    console.error('Supabase fetch exception:', err);
    return { data: [], source: 'supabase' };
  }
}

export async function dbUpdateReservationStatus(id: string, status: Reservation['status']): Promise<{ success: boolean; pinCode?: string; error?: string }> {
  try {
    const response = await fetch(`/api/admin/reservations/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    return response.ok && result.success
      ? { success: true, pinCode: result.pinCode }
      : { success: false, error: result.error || 'Reservation status could not be updated.' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Reservation status could not be updated.' };
  }
}

export async function dbVerifyStayAccess(reservationId: string, pinCode: string): Promise<{ success: boolean; reservation?: Reservation; error?: string }> {
  try {
    const response = await fetch('/api/stay-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, pinCode }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) return { success: false, error: result.error || 'Stay access could not be verified.' };
    return { success: true, reservation: { ...(result.reservation as Reservation), pinCode } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Stay access could not be verified.' };
  }
}

/**
 * Save a new maintenance work order
 */
type StayCredential = { reservationId?: string; pinCode?: string };

function mapTicket(t: any): MaintenanceTicket {
  return { id: t.id, title: t.title, category: t.category, status: t.status, date: t.date, urgency: t.urgency, description: t.description, room: t.room };
}

export async function dbCreateTicket(ticket: MaintenanceTicket, access: StayCredential = {}): Promise<{ success: boolean; source: 'supabase' | 'local'; ticket?: MaintenanceTicket; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return { success: true, source: 'local' };
  }

  try {
    const response = await fetch('/api/portal/maintenance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...access, title: ticket.title, description: ticket.description, category: ticket.category, urgency: ticket.urgency, room: ticket.room }),
    });
    const result = await response.json();
    return response.ok && result.success ? { success: true, source: 'supabase', ticket: mapTicket(result.ticket) } : { success: false, source: 'supabase', error: result.error || 'Ticket submission failed.' };
  } catch (err) {
    return { success: false, source: 'supabase', error: err instanceof Error ? err.message : 'Ticket submission failed.' };
  }
}

/**
 * Fetch maintenance tickets
 */
export async function dbFetchTickets(access: StayCredential = {}): Promise<MaintenanceTicket[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return [];
  }

  try {
    const response = await fetch('/api/portal/maintenance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list', ...access }),
    });
    const result = await response.json();
    return response.ok && result.success ? result.tickets.map(mapTicket) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Submit a direct property inquiry / contact message
 */
export async function dbSubmitInquiry(inquiry: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: number;
  stayDates?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    // Store in localStorage for audit
    try {
      const stored = JSON.parse(localStorage.getItem('csp_inquiries_v1') || '[]');
      stored.unshift({ ...inquiry, createdAt: new Date().toISOString() });
      localStorage.setItem('csp_inquiries_v1', JSON.stringify(stored));
    } catch (e) {}
    return { success: true };
  }

  try {
    const response = await fetch('/api/forms/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    });
    const result = await response.json();
    return response.ok && result.success ? { success: true } : { success: false, error: result.error || 'Message could not be sent.' };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Message could not be sent.' };
  }
}

/**
 * Submit a verified guest review
 */
export async function dbSubmitReview(review: {
  propertyId: number;
  author: string;
  email?: string;
  stayDate?: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; error?: string; pendingModeration?: boolean }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    try {
      const key = `csp_reviews_${review.propertyId}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      stored.unshift({
        author: review.author,
        date: review.stayDate ? new Date(`${review.stayDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        text: review.comment,
        rating: review.rating,
      });
      localStorage.setItem(key, JSON.stringify(stored));
    } catch (e) {}
    return { success: true };
  }

  try {
    const response = await fetch('/api/forms/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    const result = await response.json();
    return response.ok && result.success
      ? { success: true, pendingModeration: Boolean(result.pendingModeration) }
      : { success: false, error: result.error || 'Review could not be submitted.' };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Review could not be submitted.' };
  }
}

export async function dbFetchApprovedReviews(propertyId: number): Promise<PropertyReview[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('property_reviews')
    .select('author,date,comment,rating')
    .eq('property_id', propertyId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((item) => ({ author: item.author, date: item.date, text: item.comment, rating: item.rating }));
}

export type OwnerBlackout = { id: string; propertyId: number; startDate: string; endDate: string; notes?: string };
export type OwnerDashboardData = { properties: Property[]; approvals: OwnerApproval[]; blackouts: OwnerBlackout[]; reservations: Reservation[] };

export async function dbFetchOwnerDashboard(): Promise<OwnerDashboardData> {
  const empty = { properties: [], approvals: [], blackouts: [], reservations: [] };
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return empty;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;
  const { data: assignments } = await supabase.from('property_owners').select('property_id').eq('owner_id', user.id);
  const propertyIds = (assignments || []).map((assignment: any) => Number(assignment.property_id));
  const [propertyResult, approvalResult, blackoutResult, reservationResult] = await Promise.all([
    propertyIds.length ? supabase.from('properties').select('*').in('id', propertyIds).order('id') : Promise.resolve({ data: [], error: null }),
    supabase.from('owner_approvals').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    supabase.from('owner_blackouts').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    supabase.from('reservations').select('*').order('created_at', { ascending: false }),
  ]);
  const properties = (propertyResult.data || []).map((row: any) => ({
    id: Number(row.id), title: row.title, subtitle: row.subtitle || '', neighborhood: row.neighborhood, address: row.address,
    price: Number(row.price), cleaningFee: Number(row.cleaning_fee), taxRate: Number(row.tax_rate), guests: Number(row.guests),
    bedrooms: Number(row.bedrooms), beds: Number(row.beds), bathrooms: Number(row.bathrooms), sqft: Number(row.sqft || 0),
    rating: Number(row.rating || 0), reviewsCount: Number(row.reviews_count || 0), badges: row.badges || [], coverImage: row.cover_image || '',
    gallery: row.gallery || [], description: row.description || '', amenities: row.amenities || [], commute: row.commute || [], status: row.status,
  })) as Property[];
  return {
    properties,
    approvals: (approvalResult.data || []).map((row: any) => ({ id: row.id, property: row.property_title, item: row.item, cost: row.cost, status: row.status })),
    blackouts: (blackoutResult.data || []).map((row: any) => ({ id: row.id, propertyId: Number(row.property_id), startDate: row.start_date, endDate: row.end_date, notes: row.notes })),
    reservations: (reservationResult.data || []).map((row: any) => ({ id: row.id, guest: row.guest_name, property: row.property_title, propertyId: row.property_id ? Number(row.property_id) : undefined, dates: row.dates, status: row.status, total: row.total, guestEmail: row.guest_email, guestPhone: row.guest_phone, pinCode: row.pin_code, nights: row.nights, guestCount: row.guest_count, createdAt: row.created_at })),
  };
}

export async function dbUpdateOwnerApproval(id: string, status: 'Approved' | 'Declined') {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  const { error } = await supabase.from('owner_approvals').update({ status }).eq('id', id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function dbCreateOwnerBlackout(propertyId: number, startDate: string, endDate: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Sign in to reserve owner dates.' };
  const { data, error } = await supabase.from('owner_blackouts').insert({ owner_id: user.id, property_id: propertyId, start_date: startDate, end_date: endDate }).select('*').single();
  return error ? { success: false, error: error.message } : { success: true, blackout: { id: data.id, propertyId: Number(data.property_id), startDate: data.start_date, endDate: data.end_date } as OwnerBlackout };
}

export async function dbDeleteOwnerBlackout(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  const { error } = await supabase.from('owner_blackouts').delete().eq('id', id);
  return error ? { success: false, error: error.message } : { success: true };
}
