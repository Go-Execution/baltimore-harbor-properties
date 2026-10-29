import { randomInt } from 'crypto';
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validRequestOrigin } from '@/lib/forms/validation';

async function resolveStay(body: Record<string, unknown>) {
  const service = createServiceSupabaseClient();
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (user?.email) {
    const { data } = await service.from('reservations').select('id,property_id,property_title')
      .eq('guest_email', user.email.toLowerCase()).in('status', ['Confirmed', 'Arriving Today', 'In-Stay'])
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (data) return { reservation: data, userId: user.id };
  }

  const reservationId = cleanText(body.reservationId, 40).toUpperCase();
  const pinCode = cleanText(body.pinCode, 20);
  if (!reservationId || !pinCode) return null;
  const { data } = await service.from('reservations').select('id,property_id,property_title')
    .eq('id', reservationId).eq('pin_code', pinCode).in('status', ['Confirmed', 'Arriving Today', 'In-Stay']).maybeSingle();
  return data ? { reservation: data, userId: null } : null;
}

export async function POST(request: NextRequest) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  try {
    const body = await request.json();
    const access = await resolveStay(body);
    if (!access) return jsonError('A confirmed stay is required to access maintenance requests.', 403);
    const service = createServiceSupabaseClient();

    if (body.action === 'list') {
      let query = service.from('maintenance_tickets').select('*').order('created_at', { ascending: false });
      query = access.userId ? query.or(`reservation_id.eq.${access.reservation.id},user_id.eq.${access.userId}`) : query.eq('reservation_id', access.reservation.id);
      const { data, error } = await query;
      if (error) throw error;
      return Response.json({ success: true, tickets: data || [] });
    }

    if (body.action !== 'create') return jsonError('Invalid maintenance action.');
    const title = cleanText(body.title, 160);
    const description = cleanText(body.description, 2000);
    const category = cleanText(body.category, 60) || 'General';
    const room = cleanText(body.room, 100);
    const urgency = cleanText(body.urgency, 20);
    if (title.length < 3 || description.length < 10) return jsonError('Please provide a title and detailed description.');
    if (!['Normal', 'Urgent', 'Emergency'].includes(urgency)) return jsonError('Invalid urgency level.');
    const id = `TKT-${randomInt(100000, 999999)}`;
    const { data, error } = await service.from('maintenance_tickets').insert({
      id, user_id: access.userId, reservation_id: access.reservation.id,
      property_id: access.reservation.property_id, property_title: access.reservation.property_title,
      title, description, category, urgency, room: room || null, status: 'Under Review',
    }).select('*').single();
    if (error) throw error;
    return Response.json({ success: true, ticket: data });
  } catch (error) {
    console.error('Maintenance portal request failed', error instanceof Error ? error.message : 'Unknown error');
    return jsonError('Maintenance request could not be processed.', 500);
  }
}
