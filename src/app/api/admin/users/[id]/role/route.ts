import { NextRequest } from 'next/server';
import { getServerAdminUser } from '@/lib/supabase/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { cleanText, jsonError, validRequestOrigin } from '@/lib/forms/validation';

const roles = ['guest', 'owner', 'admin'] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  const admin = await getServerAdminUser();
  if (!admin) return jsonError('Administrator access required.', 403);
  const { id } = await params;
  const role = cleanText((await request.json()).role, 20);
  if (!roles.includes(role as (typeof roles)[number])) return jsonError('Invalid portal role.');
  if (id === admin.id && role !== 'admin') return jsonError('You cannot remove your own administrator role.', 409);
  const { data, error } = await createServiceSupabaseClient().from('profiles').update({ role }).eq('id', id).select('id,role').maybeSingle();
  if (error || !data) return jsonError('User role could not be updated.', 500);
  return Response.json({ success: true, role: data.role });
}
