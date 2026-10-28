'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseRequestPasswordReset, supabaseSignIn, supabaseSignOut } from '@/lib/supabase/auth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    searchParams.get('error') === 'admin_required' ? 'This account does not have administrator access.' : null,
  );

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await supabaseSignIn(email.trim().toLowerCase(), password);
    if (result.error) {
      setMessage(result.error);
      setLoading(false);
      return;
    }
    if (result.role !== 'admin') {
      await supabaseSignOut();
      setMessage('This account does not have administrator access.');
      setLoading(false);
      return;
    }
    const requestedNext = searchParams.get('next') || '/admin';
    const next = requestedNext.startsWith('/admin') ? requestedNext : '/admin';
    router.replace(next);
    router.refresh();
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setMessage('Enter your admin email first.');
      return;
    }
    setLoading(true);
    const result = await supabaseRequestPasswordReset(email.trim().toLowerCase());
    setLoading(false);
    setMessage(result.error || 'Password reset link sent. Check your email.');
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--paper)', padding: 24 }}>
      <section style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '36px 32px', boxShadow: '0 20px 60px rgba(23,35,31,.12)' }}>
        <Link href="/" style={{ color: 'var(--forest)', textDecoration: 'none', fontWeight: 700 }}>BHP · Baltimore Harbor Properties</Link>
        <p style={{ color: 'var(--copper)', textTransform: 'uppercase', letterSpacing: '.14em', fontSize: '.68rem', fontWeight: 700, margin: '22px 0 6px' }}>Secure Operations Access</p>
        <h1 style={{ font: '400 2.25rem/1.1 var(--serif)', margin: '0 0 10px' }}>Admin sign in</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: '.84rem', lineHeight: 1.6, marginBottom: 24 }}>Use the Supabase administrator email and password assigned to your account.</p>
        {message && <div role="alert" style={{ padding: '10px 12px', background: '#f8f2ed', border: '1px solid #dec8b8', color: '#7a3e24', borderRadius: 6, fontSize: '.78rem', marginBottom: 16 }}>{message}</div>}
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: '.75rem', fontWeight: 600 }}>Email address
            <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} style={{ padding: '12px 13px', border: '1px solid var(--line)', borderRadius: 6 }} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: '.75rem', fontWeight: 600 }}>Password
            <input type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} style={{ padding: '12px 13px', border: '1px solid var(--line)', borderRadius: 6 }} />
          </label>
          <button type="submit" disabled={loading} className="btn-book" style={{ padding: 13, border: 0, cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Verifying…' : 'Sign in securely'}</button>
          <button type="button" disabled={loading} onClick={handleReset} style={{ border: 0, background: 'transparent', color: 'var(--copper)', cursor: 'pointer', fontSize: '.76rem' }}>Forgot password?</button>
        </form>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading secure sign in…</main>}>
      <AdminLoginForm />
    </Suspense>
  );
}
