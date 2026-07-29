'use client'

import { useState } from 'react'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return

    setError(null)
    setPending(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, from: redirectTo }),
      })

      const json = await res.json()
      console.log('[LoginForm] response:', { ok: res.ok, status: res.status, json })

      if (res.ok && json.success) {
        // Cookie'yi hem client-side set et (hemen) hem sunucu set-cookie'den
        if (json.token) {
          const secure = location.protocol === 'https:' ? '; Secure' : ''
          document.cookie = `cr_admin=${json.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`
        }
        // Tam sayfa yönlendirme — cookie set edildikten sonra
        window.location.href = json.redirectUrl || '/admin'
      } else {
        setError(json.error || 'Bir hata oluştu.')
      }
    } catch {
      setError('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.')
    }
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-stone-300">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@checkrezerve.com"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-stone-600 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-stone-300">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-stone-600 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-900/30 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </button>
    </form>
  )
}
