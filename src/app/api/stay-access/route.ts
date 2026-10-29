import { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validRequestOrigin } from '@/lib/forms/validation';
import { clearRateLimit, consumeRateLimit, parseJsonBody, rateLimitResponse, requestSecurityResponse } from '@/lib/security/request';

export async function POST(request: NextRequest) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);

  try {
    const ipThrottle = await consumeRateLimit(request, 'stay-access-ip', 20, 900);
    if (!ipThrottle.allowed) return rateLimitResponse(ipThrottle.retryAfter);
    const body = await parseJsonBody(request, 4096);
    const reservationId = cleanText(body.reservationId, 40).toUpperCase();
    const pinCode = cleanText(body.pinCode, 20);
    if (!/^([A-Z]{2,5})-\d{4}-\d{4,8}$/.test(reservationId) || pinCode.length < 4) {
      return jsonError('Reservation reference or door PIN is incorrect.', 401);
    }

    const reservationThrottle = await consumeRateLimit(request, 'stay-access-reservation', 8, 900, reservationId, false);
    if (!reservationThrottle.allowed) return rateLimitResponse(reservationThrottle.retryAfter);

    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('id, guest_name, property_id, property_title, dates, status, nights, guest_count')
      .eq('id', reservationId)
      .eq('pin_code', pinCode)
      .in('status', ['Confirmed', 'Arriving Today', 'In-Stay'])
      .maybeSingle();

    if (error || !data) {
      return jsonError('Reservation reference or door PIN is incorrect.', 401);
    }

    await Promise.all([
      clearRateLimit(request, 'stay-access-ip'),
      clearRateLimit(request, 'stay-access-reservation', reservationId, false),
    ]);

    return Response.json({
      success: true,
      reservation: {
        id: data.id,
        guest: data.guest_name,
        property: data.property_title,
        propertyId: data.property_id,
        dates: data.dates,
        status: data.status,
        nights: data.nights,
        guestCount: data.guest_count,
      },
    });
  } catch (error) {
    const securityResponse = requestSecurityResponse(error);
    if (securityResponse) return securityResponse;
    console.error('Stay access verification failed', error instanceof Error ? error.message : 'Unknown error');
    return jsonError('Stay access could not be verified. Please try again.', 500);
  }
}
