'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseUpdatePassword, validAccountPassword } from '@/lib/supabase/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validAccountPassword(password)) return setMessage('Use 12+ characters with uppercase, lowercase, number, and symbol.');
    if (password !== confirmPassword) return setMessage('Passwords do not match.');
    setLoading(true);
    const result = await supabaseUpdatePassword(password);
    setLoading(false);
    if (result.error) return setMessage(result.error);
    router.replace('/admin');
    router.refresh();
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--paper)', padding: 24 }}>
      <section style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '36px 32px' }}>
        <h1 style={{ font: '400 2rem var(--serif)' }}>Set a new password</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: '.82rem' }}>Use 12+ characters with a mix of letters, numbers and symbols.</p>
        {message && <div role="alert" style={{ color: '#9f2d20', marginBottom: 12 }}>{message}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <input type="password" autoComplete="new-password" required minLength={12} placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ padding: 12 }} />
          <input type="password" autoComplete="new-password" required minLength={12} placeholder="Confirm password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} style={{ padding: 12 }} />
          <button className="btn-book" disabled={loading} type="submit" style={{ padding: 13, border: 0 }}>{loading ? 'Saving…' : 'Save new password'}</button>
        </form>
      </section>
    </main>
  );
}
