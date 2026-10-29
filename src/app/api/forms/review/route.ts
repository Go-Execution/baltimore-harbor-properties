import { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validDateInput, validEmail, validRequestOrigin } from '@/lib/forms/validation';
import { emailLayout, escapeHtml, getAdminNotificationEmail, queueEmail } from '@/lib/notifications/email';
import { consumeRateLimit, parseJsonBody, rateLimitResponse, requestSecurityResponse } from '@/lib/security/request';

export async function POST(request: NextRequest) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  try {
    const throttle = await consumeRateLimit(request, 'public-review', 6, 600);
    if (!throttle.allowed) return rateLimitResponse(throttle.retryAfter);
    const body = await parseJsonBody(request, 12_288);
    if (cleanText(body.website, 100)) return Response.json({ success: true });
    const propertyId = Number(body.propertyId);
    const author = cleanText(body.author, 120);
    const email = cleanText(body.email, 254).toLowerCase();
    const comment = cleanText(body.comment, 2000);
    const stayDate = cleanText(body.stayDate, 10);
    const rating = Number(body.rating);

    if (!Number.isInteger(propertyId) || propertyId < 1) return jsonError('Invalid property.');
    if (author.length < 2) return jsonError('Please enter your name.');
    if (email && !validEmail(email)) return jsonError('Please enter a valid email address.');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return jsonError('Rating must be between 1 and 5.');
    if (comment.length < 10) return jsonError('Please write a more detailed review.');
    if (stayDate && (!validDateInput(stayDate) || Date.parse(`${stayDate}T00:00:00Z`) > Date.now())) return jsonError('Please enter a valid past stay date.');

    const supabase = createServiceSupabaseClient();
    const { data: property } = await supabase.from('properties').select('id').eq('id', propertyId).maybeSingle();
    if (!property) return jsonError('Property not found.', 404);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let query = supabase.from('property_reviews').select('id', { count: 'exact', head: true }).eq('property_id', propertyId).gte('created_at', since);
    query = email ? query.eq('email', email) : query.eq('author', author);
    const { count } = await query;
    if ((count || 0) >= 2) return jsonError('You have already submitted a recent review.', 429);

    const reviewDate = stayDate ? new Date(`${stayDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : undefined;
    const { error } = await supabase.from('property_reviews').insert({ property_id: propertyId, author, email: email || null, rating, comment, ...(reviewDate ? { date: reviewDate } : {}), is_approved: false });
    if (error) throw error;
    const jobs = [] as Array<ReturnType<typeof queueEmail>>;
    if (email) jobs.push(queueEmail({
      eventType: 'review_received', recipient: email, subject: 'Your review was received',
      html: emailLayout('Thank you for your review', `<p>Hi ${escapeHtml(author)},</p><p>We received your ${rating}-star review. It will appear on the property page after moderation.</p>`),
      metadata: { propertyId, rating },
    }));
    const adminEmail = getAdminNotificationEmail();
    if (adminEmail) jobs.push(queueEmail({
      eventType: 'admin_review_pending', recipient: adminEmail, subject: `Review awaiting moderation from ${author}`,
      html: emailLayout('Review awaiting moderation', `<p><strong>${escapeHtml(author)}</strong> submitted a ${rating}-star review:</p><p>${escapeHtml(comment)}</p>`),
      metadata: { propertyId, rating },
    }));
    await Promise.allSettled(jobs);
    return Response.json({ success: true, pendingModeration: true });
  } catch (error) {
    const securityResponse = requestSecurityResponse(error);
    if (securityResponse) return securityResponse;
    console.error('Review submission failed', error instanceof Error ? error.message : 'Unknown error');
    return jsonError('Your review could not be submitted. Please try again.', 500);
  }
}
