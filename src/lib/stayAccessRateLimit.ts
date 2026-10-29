import 'server-only';
import { createHash } from 'crypto';
import { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export function stayAccessKey(request: NextRequest, reservationId: string) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const clientIp = forwarded || request.headers.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(`${clientIp}:${reservationId}`).digest('hex');
}

export async function stayAccessAllowed(accessKey: string) {
  const { data } = await createServiceSupabaseClient()
    .from('stay_access_attempts')
    .select('blocked_until')
    .eq('access_key', accessKey)
    .maybeSingle();
  return !data?.blocked_until || Date.parse(data.blocked_until) <= Date.now();
}

export async function recordStayAccessResult(accessKey: string, success: boolean) {
  const service = createServiceSupabaseClient();
  if (success) {
    await service.from('stay_access_attempts').delete().eq('access_key', accessKey);
    return;
  }

  const now = new Date();
  const { data: existing } = await service.from('stay_access_attempts')
    .select('attempt_count,window_started_at')
    .eq('access_key', accessKey)
    .maybeSingle();
  const windowExpired = !existing || Date.parse(existing.window_started_at) < now.getTime() - WINDOW_MS;
  const attemptCount = windowExpired ? 1 : existing.attempt_count + 1;
  const blockedUntil = attemptCount >= MAX_FAILURES ? new Date(now.getTime() + WINDOW_MS).toISOString() : null;
  await service.from('stay_access_attempts').upsert({
    access_key: accessKey,
    attempt_count: attemptCount,
    window_started_at: windowExpired ? now.toISOString() : existing!.window_started_at,
    blocked_until: blockedUntil,
    updated_at: now.toISOString(),
  });
}

