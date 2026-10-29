import { NextRequest } from 'next/server';
import { isServerAdmin } from '@/lib/supabase/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validRequestOrigin } from '@/lib/forms/validation';

const statuses = ['New', 'Contacted', 'Booked', 'Archived'] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  if (!(await isServerAdmin())) return jsonError('Administrator access required.', 403);
  const { id } = await params;
  const body = await request.json();
  const status = cleanText(body.status, 20);
  if (!statuses.includes(status as (typeof statuses)[number])) return jsonError('Invalid inquiry status.');
  const { data, error } = await createServiceSupabaseClient().from('property_inquiries').update({ status }).eq('id', id).select('id,status').maybeSingle();
  if (error || !data) return jsonError('Inquiry status could not be updated.', 500);
  return Response.json({ success: true, status: data.status });
}
