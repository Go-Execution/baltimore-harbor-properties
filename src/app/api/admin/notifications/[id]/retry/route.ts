import { NextRequest } from 'next/server';
import { isServerAdmin } from '@/lib/supabase/admin';
import { retryOutboxEmail } from '@/lib/notifications/email';
import { jsonError, validRequestOrigin } from '@/lib/forms/validation';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  if (!(await isServerAdmin())) return jsonError('Administrator access required.', 403);
  const { id } = await params;
  const result = await retryOutboxEmail(id);
  if (!result.sent) return jsonError(result.error || (result.pendingConfiguration ? 'Email provider is not configured.' : 'Email could not be sent.'), 503);
  return Response.json({ success: true });
}
