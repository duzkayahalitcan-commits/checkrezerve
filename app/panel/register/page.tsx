'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { sendTelegramNotification } from './actions'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Şifreler eşleşmiyor.'); return }
    if (form.password.length < 8) { setError('Şifre en az 8 karakter olmalı.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    await sendTelegramNotification(form.name, form.email)
    setSent(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 -z-10">
        <Image src="/images/bg-emerald.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/images/logo-checkrezerve.jpg" alt="CheckRezerve" width={72} height={72} className="rounded-2xl mx-auto mb-3 shadow-xl" />
          <div className="text-2xl font-bold text-white tracking-tight">checkrezerve</div>
          <p className="text-white/60 text-sm mt-1 italic">Saniyeler içinde rezervasyon</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-stone-700 rounded-2xl p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">✅</div>
              <p className="text-white font-semibold">Kayıt başarılı!</p>
              <p className="text-stone-400 text-sm">E-posta adresinizi doğrulayın, ardından giriş yapabilirsiniz.</p>
              <a href="/panel/login" className="block text-amber-500 hover:text-amber-400 text-sm transition">← Giriş sayfasına dön</a>
            </div>
          ) : (
            <>
              <h1 className="text-white font-semibold mb-5">İşletme Kaydı</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'Ad Soyad', field: 'name', type: 'text', placeholder: 'Ahmet Yılmaz' },
                  { label: 'E-posta', field: 'email', type: 'email', placeholder: 'ad@sirket.com' },
                  { label: 'Şifre', field: 'password', type: 'password', placeholder: '••••••••' },
                  { label: 'Şifre Tekrar', field: 'confirm', type: 'password', placeholder: '••••••••' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="block text-stone-400 text-xs mb-1">{f.label}</label>
                    <input type={f.type} required value={form[f.field as keyof typeof form]} onChange={update(f.field)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500 transition"
                      placeholder={f.placeholder} />
                  </div>
                ))}
                {error && <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-lg py-2.5 text-sm transition">
                  {loading ? 'Kaydediliyor...' : 'İşletmeyi Kaydet'}
                </button>
                <a href="/panel/login" className="block text-center text-stone-500 hover:text-stone-300 text-xs transition">← Giriş sayfasına dön</a>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
