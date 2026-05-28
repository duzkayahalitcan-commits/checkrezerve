'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token || !refresh_token) {
      setStatus('error');
      return;
    }

    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) { setStatus('error'); return; }
      setStatus('redirecting');
      const deepLink = `checkrezerve://auth/callback#access_token=${access_token}&refresh_token=${refresh_token}`;
      window.location.href = deepLink;
      setTimeout(() => router.replace('/'), 2000);
    });
  }, [router]);

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      {status === 'loading' && <p>Giriş yapılıyor...</p>}
      {status === 'redirecting' && <p>✅ Uygulama açılıyor...</p>}
      {status === 'error' && <p>❌ Hata oluştu, tekrar deneyin.</p>}
    </div>
  );
}
