import { randomInt } from 'crypto';
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validRequestOrigin } from '@/lib/forms/validation';
import { emailLayout, escapeHtml, queueEmail } from '@/lib/notifications/email';
import { parseJsonBody, requestSecurityResponse } from '@/lib/security/request';

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
    const body = await parseJsonBody(request, 4096);
    const status = cleanText(body.status, 40);
    if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) return jsonError('Invalid reservation status.');

    const serviceClient = createServiceSupabaseClient();
    const { data: existing, error: readError } = await serviceClient.from('reservations').select('pin_code,guest_name,guest_email,property_title,dates,total').eq('id', reservationId).maybeSingle();
    if (readError || !existing) return jsonError('Reservation not found.', 404);
    const activePin = /^\d{4}#$/.test(existing.pin_code || '');
    const pinCode = status === 'Confirmed'
      ? (activePin ? existing.pin_code : `${randomInt(1000, 9999)}#`)
      : (status === 'Completed' || status === 'Cancelled' ? 'Expired' : existing.pin_code);
    const { error } = await serviceClient.from('reservations').update({ status, pin_code: pinCode }).eq('id', reservationId);
    if (error?.code === '23P01') return jsonError('This reservation conflicts with another active stay.', 409);
    if (error) throw error;
    if (status === 'Confirmed' || status === 'Cancelled') {
      const confirmed = status === 'Confirmed';
      await queueEmail({
        eventType: confirmed ? 'booking_confirmed' : 'booking_cancelled',
        recipient: existing.guest_email,
        subject: confirmed ? `Booking ${reservationId} confirmed` : `Update for booking request ${reservationId}`,
        html: emailLayout(confirmed ? 'Your stay is confirmed' : 'Your booking request was cancelled', confirmed
          ? `<p>Hi ${escapeHtml(existing.guest_name)},</p><p>Your stay at <strong>${escapeHtml(existing.property_title)}</strong> is confirmed.</p><p><strong>Dates:</strong> ${escapeHtml(existing.dates)}<br><strong>Total:</strong> ${escapeHtml(existing.total)}<br><strong>Door PIN:</strong> ${escapeHtml(pinCode)}</p><p>Keep this PIN private. It is also available through the Resident Portal.</p>`
          : `<p>Hi ${escapeHtml(existing.guest_name)},</p><p>Your request for <strong>${escapeHtml(existing.property_title)}</strong> could not be confirmed. No payment was collected. Reply to this email if you would like help finding alternative dates.</p>`),
        metadata: { reservationId, status },
      });
    }
    return Response.json({ success: true, status, pinCode });
  } catch (error) {
    const securityResponse = requestSecurityResponse(error);
    if (securityResponse) return securityResponse;
    console.error('Reservation status update failed', error instanceof Error ? error.message : 'Unknown error');
    return jsonError('Reservation status could not be updated.', 500);
  }
}
