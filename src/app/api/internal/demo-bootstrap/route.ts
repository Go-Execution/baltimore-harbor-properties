import { randomBytes, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';
import { type User } from '@supabase/supabase-js';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

function authorized(request: NextRequest) {
  const expected = process.env.DEMO_BOOTSTRAP_TOKEN;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return Response.json({ success: false }, { status: 404 });

  const supabase = createServiceSupabaseClient();
  const targets: Array<{ email: string; fullName: string; role: 'admin' | 'guest' }> = [
    { email: 'goexecution@gmail.com', fullName: 'Go Execution Admin', role: 'admin' },
    { email: 'justin@goexecution.com', fullName: 'Justin Customer Demo', role: 'guest' },
  ];
  const listResult = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listResult.error) return Response.json({ success: false, error: 'User provisioning failed.' }, { status: 500 });

  const accounts: Array<{ email: string; role: string; password: string }> = [];
  for (const target of targets) {
    const password = `${randomBytes(18).toString('base64url')}Aa1!`;
    const existing = listResult.data.users.find((user: User) => user.email?.toLowerCase() === target.email);
    const userResult = existing
      ? await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true, user_metadata: { full_name: target.fullName } })
      : await supabase.auth.admin.createUser({ email: target.email, password, email_confirm: true, user_metadata: { full_name: target.fullName } });
    if (userResult.error || !userResult.data.user) {
      return Response.json({ success: false, error: `Could not provision ${target.email}.` }, { status: 500 });
    }
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userResult.data.user.id,
      email: target.email,
      full_name: target.fullName,
      role: target.role,
    }, { onConflict: 'id' });
    if (profileError) return Response.json({ success: false, error: `Could not assign ${target.email}.` }, { status: 500 });
    accounts.push({ email: target.email, role: target.role, password });
  }

  return Response.json({ success: true, accounts });
}
