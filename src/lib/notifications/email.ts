import 'server-only';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

export type EmailJob = {
  eventType: string;
  recipient: string;
  subject: string;
  html: string;
  metadata?: Record<string, unknown>;
};

export function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function getAdminNotificationEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || null;
}

async function deliverEmail(id: string, job: EmailJob) {
  const supabase = createServiceSupabaseClient();
  const { data: current } = await supabase.from('notification_outbox').select('attempts').eq('id', id).maybeSingle();
  const attempts = Number(current?.attempts || 0) + 1;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    await supabase.from('notification_outbox').update({ last_error: 'Email provider is not configured.' }).eq('id', id);
    return { sent: false, pendingConfiguration: true };
  }

  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [job.recipient], subject: job.subject, html: job.html }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email provider could not be reached.';
    await supabase.from('notification_outbox').update({ status: 'Failed', attempts, last_error: message }).eq('id', id);
    return { sent: false, error: message };
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : `Email provider returned ${response.status}.`;
    await supabase.from('notification_outbox').update({ status: 'Failed', attempts, last_error: message }).eq('id', id);
    return { sent: false, error: message };
  }

  await supabase.from('notification_outbox').update({
    status: 'Sent', attempts, last_error: null, provider_message_id: payload?.id || null, sent_at: new Date().toISOString(),
  }).eq('id', id);
  return { sent: true };
}

export async function queueEmail(job: EmailJob) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from('notification_outbox').insert({
    event_type: job.eventType,
    recipient: job.recipient,
    subject: job.subject,
    html_body: job.html,
    metadata: job.metadata || {},
  }).select('id').single();
  if (error || !data) {
    console.error('Email queue insert failed', error?.message || 'Unknown error');
    return { queued: false };
  }
  const delivery = await deliverEmail(data.id, job);
  return { queued: true, id: data.id, ...delivery };
}

export async function retryOutboxEmail(id: string) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from('notification_outbox').select('*').eq('id', id).maybeSingle();
  if (error || !data) return { sent: false, error: 'Notification was not found.' };
  await supabase.from('notification_outbox').update({ status: 'Pending', last_error: null }).eq('id', id);
  return deliverEmail(id, {
    eventType: data.event_type,
    recipient: data.recipient,
    subject: data.subject,
    html: data.html_body,
    metadata: data.metadata,
  });
}

export function emailLayout(title: string, content: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#17231f"><div style="background:#17231f;color:#fff;padding:22px 26px"><strong>Baltimore Harbor Properties</strong></div><div style="padding:28px 26px;border:1px solid #ded8cc;border-top:0"><h1 style="font-size:24px;margin:0 0 16px">${escapeHtml(title)}</h1>${content}<p style="margin-top:28px;color:#66736e;font-size:13px">Baltimore Harbor Properties · Furnished stays in Baltimore</p></div></div>`;
}
