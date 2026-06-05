'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PanelAuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function handle() {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { setStatus('error'); return }
        router.replace('/panel')
        return
      }

      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) { setStatus('error'); return }
        router.replace('/panel')
        return
      }

      setStatus('error')
    }
    handle()
  }, [router])

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      {status === 'loading' && <p>Giriş yapılıyor...</p>}
      {status === 'error' && <p style={{ color:'red' }}>Hata oluştu, tekrar deneyin.</p>}
    </div>
  )
}
