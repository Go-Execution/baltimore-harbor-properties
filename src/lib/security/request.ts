import 'server-only';
import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

export class RequestSecurityError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export function getClientIp(request: NextRequest) {
  const realIp = request.headers.get('x-real-ip')?.trim();
  const forwardedIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (realIp || forwardedIp || 'unknown').slice(0, 64);
}

function rateLimitKey(request: NextRequest, scope: string, discriminator = '', includeIp = true) {
  const secret = process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('Server rate-limit secret is not configured.');
  return createHmac('sha256', secret)
    .update(`${scope}:${includeIp ? getClientIp(request) : 'global'}:${discriminator}`)
    .digest('hex');
}

export async function consumeRateLimit(
  request: NextRequest,
  scope: string,
  limit: number,
  windowSeconds: number,
  discriminator = '',
  includeIp = true,
) {
  const { data, error } = await createServiceSupabaseClient().rpc('consume_request_rate_limit', {
    p_key: rateLimitKey(request, scope, discriminator, includeIp),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(result?.allowed),
    retryAfter: Math.max(1, Number(result?.retry_after || windowSeconds)),
  };
}

export async function clearRateLimit(request: NextRequest, scope: string, discriminator = '', includeIp = true) {
  await createServiceSupabaseClient()
    .from('request_rate_limits')
    .delete()
    .eq('rate_key', rateLimitKey(request, scope, discriminator, includeIp));
}

export async function parseJsonBody(request: NextRequest, maxBytes = 16_384): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
  if (contentType !== 'application/json') {
    throw new RequestSecurityError('Content-Type must be application/json.', 415);
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestSecurityError('Request body is too large.', 413);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new RequestSecurityError('Request body is too large.', 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new RequestSecurityError('Request body must contain valid JSON.', 400);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new RequestSecurityError('Request body must be a JSON object.', 400);
  }
  return parsed as Record<string, unknown>;
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json(
    { success: false, error: 'Too many requests. Please wait before trying again.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

export function requestSecurityResponse(error: unknown) {
  if (!(error instanceof RequestSecurityError)) return null;
  return Response.json({ success: false, error: error.message }, { status: error.status });
}
