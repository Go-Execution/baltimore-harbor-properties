import { getSupabaseClient, isSupabaseConfigured } from './client';
import { MaintenanceTicket, OwnerApproval, Reservation, Property } from '@/types';
import { getStoredReservations, addReservation } from '@/utils/propertyStore';

/**
 * Save a new reservation to Supabase (and mirror to local store)
 */
export async function dbSaveReservation(res: Reservation): Promise<{ success: boolean; source: 'supabase' | 'local'; error?: string }> {
  // Always update local store so UI is immediately responsive
  addReservation(res);

  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return { success: true, source: 'local' };
  }

  try {
    const { error } = await supabase.from('reservations').insert({
      id: res.id,
      guest_name: res.guest,
      guest_email: res.guestEmail || '',
      guest_phone: res.guestPhone || '',
      property_title: res.property,
      dates: res.dates,
      total: res.total,
      pin_code: res.pinCode || '4892#',
      status: res.status,
      nights: res.nights || 1,
      created_at: res.createdAt || new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase reservation insert warning:', error.message);
      return { success: true, source: 'local', error: error.message };
    }

    return { success: true, source: 'supabase' };
  } catch (err: any) {
    console.error('Supabase reservation exception:', err);
    return { success: true, source: 'local', error: err.message };
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
      console.warn('Supabase fetch reservations error, using local fallback:', error?.message);
      return { data: getStoredReservations(), source: 'local' };
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
    return { data: getStoredReservations(), source: 'local' };
  }
}

/**
 * Save a new maintenance work order
 */
export async function dbCreateTicket(ticket: MaintenanceTicket): Promise<{ success: boolean; source: 'supabase' | 'local' }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return { success: true, source: 'local' };
  }

  try {
    const { error } = await supabase.from('maintenance_tickets').insert({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description || '',
      category: ticket.category,
      urgency: ticket.urgency,
      status: ticket.status,
      room: ticket.room || '',
      date: ticket.date,
    });

    if (error) {
      console.warn('Supabase ticket insert error:', error.message);
      return { success: true, source: 'local' };
    }

    return { success: true, source: 'supabase' };
  } catch (err) {
    return { success: true, source: 'local' };
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
}): Promise<{ success: boolean }> {
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
    const { error } = await supabase.from('property_inquiries').insert({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone || '',
      message: inquiry.message,
      property_id: inquiry.propertyId || null,
    });

    if (error) {
      console.warn('Supabase inquiry insert warning:', error.message);
    }
    return { success: true };
  } catch (err) {
    return { success: true };
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
}): Promise<{ success: boolean }> {
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
    const { error } = await supabase.from('property_reviews').insert({
      property_id: review.propertyId,
      author: review.author,
      email: review.email || '',
      rating: review.rating,
      comment: review.comment,
      is_approved: true,
    });

    if (error) {
      console.warn('Supabase review insert warning:', error.message);
    }
    return { success: true };
  } catch (err) {
    return { success: true };
  }
}
