import 'server-only';
import { createServerSupabaseClient } from './server';

export async function getServerAdminUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return profile?.role === 'admin' ? user : null;
}

export async function isServerAdmin() {
  return Boolean(await getServerAdminUser());
}
