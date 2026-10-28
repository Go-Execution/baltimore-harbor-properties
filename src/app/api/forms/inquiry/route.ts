import { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validEmail, validRequestOrigin } from '@/lib/forms/validation';

export async function POST(request: NextRequest) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  try {
    const body = await request.json();
    if (cleanText(body.website, 100)) return Response.json({ success: true });

    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 254).toLowerCase();
    const phone = cleanText(body.phone, 40);
    const message = cleanText(body.message, 4000);
    const stayDates = cleanText(body.stayDates, 160);
    const source = cleanText(body.source, 60) || 'website';
    const propertyId = Number.isInteger(Number(body.propertyId)) ? Number(body.propertyId) : null;

    if (name.length < 2) return jsonError('Please enter your full name.');
    if (!validEmail(email)) return jsonError('Please enter a valid email address.');
    if (message.length < 10) return jsonError('Please provide a little more detail.');

    const supabase = createServiceSupabaseClient();
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase.from('property_inquiries').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', since);
    if ((count || 0) >= 3) return jsonError('Too many recent submissions. Please wait a few minutes.', 429);

    const { error } = await supabase.from('property_inquiries').insert({
      name, email, phone, message, stay_dates: stayDates || null, property_id: propertyId,
      source, metadata: typeof body.metadata === 'object' && body.metadata ? body.metadata : {},
    });
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error('Inquiry submission failed', error instanceof Error ? error.message : 'Unknown error');
    return jsonError('Your message could not be sent. Please try again.', 500);
  }
}
