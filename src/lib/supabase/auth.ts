import { getSupabaseClient, isSupabaseConfigured } from './client';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'guest' | 'owner' | 'admin';
  phone?: string;
}

/**
 * Sign in user with email & password via Supabase Auth
 */
export async function supabaseSignIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    // Demo fallback for instant testing when Supabase is not configured
    if (email.includes('guest') || email.includes('aaron')) {
      return { data: { user: { id: 'demo-guest-1', email }, session: {} }, error: null, role: 'guest' as const };
    }
    if (email.includes('owner') || email.includes('eleanor')) {
      return { data: { user: { id: 'demo-owner-1', email }, session: {} }, error: null, role: 'owner' as const };
    }
    if (email.includes('admin') || email.includes('gonzalo') || email.includes('host')) {
      return { data: { user: { id: 'demo-admin-1', email }, session: {} }, error: null, role: 'admin' as const };
    }
    return { data: { user: { id: 'demo-user-1', email }, session: {} }, error: null, role: 'guest' as const };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error: error.message, role: null };
  }

  // Fetch user role from profiles table
  let role: 'guest' | 'owner' | 'admin' = 'guest';
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    if (profile?.role) {
      role = profile.role;
    } else if (data.user.user_metadata?.role) {
      role = data.user.user_metadata.role;
    }
  }

  return { data, error: null, role };
}

/**
 * Sign up user with email & password via Supabase Auth
 */
export async function supabaseSignUp(
  email: string,
  password: string,
  fullName: string,
  role: 'guest' | 'owner' | 'admin' = 'guest'
) {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return {
      data: { user: { id: 'demo-signup-' + Date.now(), email, user_metadata: { full_name: fullName, role } } },
      error: null,
      message: 'Account created in demo mode. Connect Supabase in .env.local for production database storage.',
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Sign out current user
 */
export async function supabaseSignOut() {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
}

/**
 * Get current session user
 */
export async function supabaseGetCurrentUser(): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email || '',
      full_name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
      role: profile?.role || session.user.user_metadata?.role || 'guest',
      phone: profile?.phone,
    };
  } catch (err) {
    return null;
  }
}
