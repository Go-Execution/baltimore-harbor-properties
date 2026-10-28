import { getSupabaseClient, isSupabaseConfigured } from './client';
import { MaintenanceTicket, Reservation } from '@/types';
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
      dates: r.dates,
      status: r.status,
      total: r.total,
      guestEmail: r.guest_email,
      guestPhone: r.guest_phone,
      pinCode: r.pin_code,
      nights: r.nights,
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
    return { success: true, reservation: result.reservation as Reservation };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Stay access could not be verified.' };
  }
}

/**
 * Save a new maintenance work order
 */
export async function dbCreateTicket(ticket: MaintenanceTicket): Promise<{ success: boolean; source: 'supabase' | 'local'; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return { success: true, source: 'local' };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, source: 'supabase', error: 'Sign in before creating a maintenance request.' };
    const { error } = await supabase.from('maintenance_tickets').insert({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description || '',
      category: ticket.category,
      urgency: ticket.urgency,
      status: ticket.status,
      room: ticket.room || '',
      date: ticket.date,
      user_id: user.id,
    });

    if (error) {
      console.warn('Supabase ticket insert error:', error.message);
      return { success: false, source: 'supabase', error: error.message };
    }

    return { success: true, source: 'supabase' };
  } catch (err) {
    return { success: false, source: 'supabase', error: err instanceof Error ? err.message : 'Ticket submission failed.' };
  }
}

/**
 * Fetch maintenance tickets
 */
export async function dbFetchTickets(): Promise<MaintenanceTicket[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((t: any) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      status: t.status,
      date: t.date,
      urgency: t.urgency,
      description: t.description,
      room: t.room,
    }));
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
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
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
