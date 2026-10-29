import { NextRequest } from 'next/server';
import { isServerAdmin } from '@/lib/supabase/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { jsonError, validRequestOrigin } from '@/lib/forms/validation';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  if (!(await isServerAdmin())) return jsonError('Administrator access required.', 403);
  const { id } = await params;
  const body = await request.json();
  if (typeof body.approved !== 'boolean') return jsonError('Approval value is required.');
  const { data, error } = await createServiceSupabaseClient().from('property_reviews').update({ is_approved: body.approved }).eq('id', id).select('id,is_approved').maybeSingle();
  if (error || !data) return jsonError('Review could not be updated.', 500);
  return Response.json({ success: true, approved: data.is_approved });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  if (!(await isServerAdmin())) return jsonError('Administrator access required.', 403);
  const { id } = await params;
  const { error } = await createServiceSupabaseClient().from('property_reviews').delete().eq('id', id);
  if (error) return jsonError('Review could not be deleted.', 500);
  return Response.json({ success: true });
}
