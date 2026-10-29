import { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validRequestOrigin } from '@/lib/forms/validation';
import { recordStayAccessResult, stayAccessAllowed, stayAccessKey } from '@/lib/stayAccessRateLimit';

export async function POST(request: NextRequest) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);

  try {
    const body = await request.json();
    const reservationId = cleanText(body.reservationId, 40).toUpperCase();
    const pinCode = cleanText(body.pinCode, 20);
    if (!/^([A-Z]{2,5})-\d{4}-\d{4,8}$/.test(reservationId) || pinCode.length < 4) {
      return jsonError('Reservation reference or door PIN is incorrect.', 401);
    }

    const accessKey = stayAccessKey(request, reservationId);
    if (!(await stayAccessAllowed(accessKey))) {
      return Response.json({ success: false, error: 'Too many attempts. Please wait 15 minutes before trying again.' }, { status: 429, headers: { 'Retry-After': '900' } });
    }

    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('id, guest_name, guest_email, property_id, property_title, dates, status, pin_code, nights, guest_count')
      .eq('id', reservationId)
      .eq('pin_code', pinCode)
      .maybeSingle();

    if (error || !data || data.status === 'Cancelled' || data.status === 'Pending') {
      await recordStayAccessResult(accessKey, false);
      return jsonError('Reservation reference or door PIN is incorrect.', 401);
    }

    await recordStayAccessResult(accessKey, true);

    return Response.json({
      success: true,
      reservation: {
        id: data.id,
        guest: data.guest_name,
        guestEmail: data.guest_email,
        property: data.property_title,
        propertyId: data.property_id,
        dates: data.dates,
        status: data.status,
        pinCode: data.pin_code,
        nights: data.nights,
        guestCount: data.guest_count,
      },
    });
  } catch (error) {
    console.error('Stay access verification failed', error instanceof Error ? error.message : 'Unknown error');
    return jsonError('Stay access could not be verified. Please try again.', 500);
  }
}
