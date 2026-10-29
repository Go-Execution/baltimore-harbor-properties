import { randomInt } from 'crypto';
import { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validEmail, validRequestOrigin } from '@/lib/forms/validation';
import { emailLayout, escapeHtml, getAdminNotificationEmail, queueEmail } from '@/lib/notifications/email';

export async function POST(request: NextRequest) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  try {
    const body = await request.json();
    if (cleanText(body.website, 100)) return Response.json({ success: true });
    const guestName = cleanText(body.guest, 120);
    const guestEmail = cleanText(body.guestEmail, 254).toLowerCase();
    const guestPhone = cleanText(body.guestPhone, 40);
    const propertyId = Number(body.propertyId);
    const checkinDate = cleanText(body.checkinDate, 10);
    const checkoutDate = cleanText(body.checkoutDate, 10);

    if (guestName.length < 2) return jsonError('Please enter the guest name.');
    if (!validEmail(guestEmail)) return jsonError('Please enter a valid guest email.');
    if (!Number.isInteger(propertyId) || propertyId < 1) return jsonError('Please select a valid property.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkinDate) || !/^\d{4}-\d{2}-\d{2}$/.test(checkoutDate)) return jsonError('Valid stay dates are required.');
    const nights = Math.round((Date.parse(`${checkoutDate}T00:00:00Z`) - Date.parse(`${checkinDate}T00:00:00Z`)) / 86400000);
    if (!Number.isInteger(nights) || nights < 1 || nights > 365) return jsonError('Invalid stay duration.');

    const supabase = createServiceSupabaseClient();
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id,title,price,cleaning_fee,tax_rate,status')
      .eq('id', propertyId)
      .maybeSingle();
    if (propertyError || !property || property.status !== 'Active') return jsonError('This property is not currently available.', 409);
    const subtotal = nights * Number(property.price);
    const cleaningFee = Number(property.cleaning_fee || 0);
    const totalValue = subtotal + cleaningFee + ((subtotal + cleaningFee) * Number(property.tax_rate || 0));
    const total = `$${totalValue.toFixed(2)}`;
    const dates = `${checkinDate} – ${checkoutDate}`;
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('guest_email', guestEmail).gte('created_at', since);
    if ((count || 0) >= 2) return jsonError('A recent booking request already exists for this email.', 429);

    const year = new Date().getUTCFullYear();
    const id = `BHP-${year}-${randomInt(100000, 999999)}`;
    const { error } = await supabase.from('reservations').insert({
      id, guest_name: guestName, guest_email: guestEmail, guest_phone: guestPhone,
      property_id: propertyId, property_title: property.title, dates, checkin_date: checkinDate,
      checkout_date: checkoutDate, nights, total, pin_code: 'Pending approval', status: 'Pending',
      stay_purpose: cleanText(body.stayPurpose, 80) || null,
      special_requests: cleanText(body.specialRequests, 2000) || null,
    });
    if (error?.code === '23P01') return jsonError('Those dates have just become unavailable. Please choose different dates.', 409);
    if (error) throw error;
    const adminEmail = getAdminNotificationEmail();
    const jobs = [queueEmail({
      eventType: 'booking_request_received', recipient: guestEmail, subject: `Booking request ${id} received`,
      html: emailLayout('Your booking request is pending review', `<p>Hi ${escapeHtml(guestName)},</p><p>We received your request for <strong>${escapeHtml(property.title)}</strong>.</p><p><strong>Dates:</strong> ${escapeHtml(dates)}<br><strong>Estimated total:</strong> ${escapeHtml(total)}<br><strong>Reference:</strong> ${escapeHtml(id)}</p><p>No payment has been collected. We will confirm availability and send the next steps.</p>`),
      metadata: { reservationId: id, propertyId },
    })];
    if (adminEmail) jobs.push(queueEmail({
      eventType: 'admin_booking_request', recipient: adminEmail, subject: `New booking request ${id}`,
      html: emailLayout('New booking request', `<p><strong>${escapeHtml(guestName)}</strong><br>${escapeHtml(guestEmail)}<br>${escapeHtml(guestPhone)}</p><p>${escapeHtml(property.title)}<br>${escapeHtml(dates)}<br>${escapeHtml(total)}</p>`),
      metadata: { reservationId: id, propertyId },
    }));
    await Promise.allSettled(jobs);
    return Response.json({ success: true, reservationId: id });
  } catch (error) {
    console.error('Reservation submission failed', error instanceof Error ? error.message : 'Unknown error');
    return jsonError('Your booking request could not be saved. Please try again.', 500);
  }
}
