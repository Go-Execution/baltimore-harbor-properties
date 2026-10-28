import { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validEmail, validRequestOrigin } from '@/lib/forms/validation';

export async function POST(request: NextRequest) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  try {
    const body = await request.json();
    if (cleanText(body.website, 100)) return Response.json({ success: true });
    const propertyId = Number(body.propertyId);
    const author = cleanText(body.author, 120);
    const email = cleanText(body.email, 254).toLowerCase();
    const comment = cleanText(body.comment, 2000);
    const rating = Number(body.rating);

    if (!Number.isInteger(propertyId) || propertyId < 1) return jsonError('Invalid property.');
    if (author.length < 2) return jsonError('Please enter your name.');
    if (email && !validEmail(email)) return jsonError('Please enter a valid email address.');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return jsonError('Rating must be between 1 and 5.');
    if (comment.length < 10) return jsonError('Please write a more detailed review.');

    const supabase = createServiceSupabaseClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let query = supabase.from('property_reviews').select('id', { count: 'exact', head: true }).eq('property_id', propertyId).gte('created_at', since);
    query = email ? query.eq('email', email) : query.eq('author', author);
    const { count } = await query;
    if ((count || 0) >= 2) return jsonError('You have already submitted a recent review.', 429);

    const { error } = await supabase.from('property_reviews').insert({ property_id: propertyId, author, email: email || null, rating, comment, is_approved: false });
    if (error) throw error;
    return Response.json({ success: true, pendingModeration: true });
  } catch (error) {
    console.error('Review submission failed', error instanceof Error ? error.message : 'Unknown error');
    return jsonError('Your review could not be submitted. Please try again.', 500);
  }
}
