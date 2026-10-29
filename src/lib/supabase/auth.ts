import { getSupabaseClient, isSupabaseConfigured } from './client';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'guest' | 'owner' | 'admin';
  phone?: string;
}

export function validAccountPassword(password: string) {
  return password.length >= 12
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

/**
 * Sign in user with email & password via Supabase Auth
 */
export async function supabaseSignIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return { data: null, error: 'Authentication service is not configured.', role: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error: 'Invalid email or password.', role: null };
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
  _role: 'guest' | 'owner' | 'admin' = 'guest'
) {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return {
      data: null,
      error: 'Authentication service is not configured.',
    };
  }

  if (!validAccountPassword(password)) {
    return { data: null, error: 'Use 12+ characters with uppercase, lowercase, number, and symbol.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/portal`,
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
      role: profile?.role || 'guest',
      phone: profile?.phone,
    };
  } catch (err) {
    return null;
  }
}

export async function supabaseRequestPasswordReset(email: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Authentication service is not configured.' };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
  });
  return { error: error?.message || null };
}

export async function supabaseUpdatePassword(password: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Authentication service is not configured.' };
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message || null };
}
