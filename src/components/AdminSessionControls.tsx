'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseGetCurrentUser, supabaseSignOut } from '@/lib/supabase/auth';

export default function AdminSessionControls() {
  const router = useRouter();
  const [email, setEmail] = useState('Administrator');

  useEffect(() => {
    void supabaseGetCurrentUser().then((user) => user?.email && setEmail(user.email));
  }, []);

  const logout = async () => {
    await supabaseSignOut();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: '.68rem', color: '#a0a6a2' }}>{email}</span>
      <button type="button" onClick={logout} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid rgba(255,255,255,.25)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '.72rem' }}>Sign out</button>
    </div>
  );
}
