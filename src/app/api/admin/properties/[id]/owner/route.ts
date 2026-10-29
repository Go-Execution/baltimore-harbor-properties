import { NextRequest } from 'next/server';
import { isServerAdmin } from '@/lib/supabase/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { jsonError, validRequestOrigin } from '@/lib/forms/validation';
import { parseJsonBody, requestSecurityResponse } from '@/lib/security/request';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validRequestOrigin(request)) return jsonError('Invalid request origin.', 403);
  if (!(await isServerAdmin())) return jsonError('Administrator access required.', 403);
  const propertyId = Number((await params).id);
  let body: Record<string, unknown>;
  try { body = await parseJsonBody(request, 4096); }
  catch (error) { return requestSecurityResponse(error) || jsonError('Invalid request body.'); }
  const ownerId = typeof body.ownerId === 'string' && body.ownerId ? body.ownerId : null;
  if (!Number.isInteger(propertyId) || propertyId < 1) return jsonError('Invalid property.');
  const service = createServiceSupabaseClient();
  if (ownerId) {
    const { data: owner } = await service.from('profiles').select('id,role').eq('id', ownerId).maybeSingle();
    if (!owner || !['owner', 'admin'].includes(owner.role)) return jsonError('Select a verified owner account.', 409);
  }
  if (!ownerId) {
    const { error } = await service.from('property_owners').delete().eq('property_id', propertyId);
    if (error) return jsonError('Property owner could not be removed.', 500);
    return Response.json({ success: true, ownerId: null });
  }
  const { data, error } = await service.from('property_owners').upsert({ property_id: propertyId, owner_id: ownerId }, { onConflict: 'property_id' }).select('property_id,owner_id').single();
  if (error || !data) return jsonError('Property owner could not be updated.', 500);
  return Response.json({ success: true, ownerId: data.owner_id });
}
