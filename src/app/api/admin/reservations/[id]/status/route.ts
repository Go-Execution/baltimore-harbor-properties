import { randomInt } from 'crypto';
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validRequestOrigin } from '@/lib/forms/validation';

const allowedStatuses = ['Pending', 'Confirmed', 'Arriving Today', 'In-Stay', 'Completed', 'Cancelled'] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return jsonError('Authentication required.', 401);
  const { data: profile } = await authClient.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') return jsonError('Administrator access required.', 403);

  try {
    const { id } = await params;
    const reservationId = cleanText(id, 40);
    const body = await request.json();
    const status = cleanText(body.status, 40);
    if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) return jsonError('Invalid reservation status.');

    const serviceClient = createServiceSupabaseClient();
    const { data: existing, error: readError } = await serviceClient.from('reservations').select('pin_code').eq('id', reservationId).maybeSingle();
    if (readError || !existing) return jsonError('Reservation not found.', 404);
    const pinCode = status === 'Confirmed' && existing.pin_code === 'Pending approval' ? `${randomInt(1000, 9999)}#` : existing.pin_code;
    const { error } = await serviceClient.from('reservations').update({ status, pin_code: pinCode }).eq('id', reservationId);
    if (error) throw error;
    return Response.json({ success: true, status, pinCode });
  } catch (error) {
    console.error('Reservation status update failed', error instanceof Error ? error.message : 'Unknown error');
    return jsonError('Reservation status could not be updated.', 500);
  }
}
