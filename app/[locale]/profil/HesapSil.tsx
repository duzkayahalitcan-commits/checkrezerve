'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// LG-07: Web'de giriş yapmış müşterinin hesabını silmesi (mobil ile aynı API: DELETE /api/users/me)
export default function HesapSil() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setBusy(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/giris'); return }
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Hesap silinemedi. Lütfen tekrar deneyin.')
        return
      }
      await supabase.auth.signOut()
      router.replace('/')
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white border border-red-100 rounded-2xl p-6 mt-10 shadow-sm">
      <h2 className="text-base font-bold text-zinc-900 mb-1">Hesabı sil</h2>
      <p className="text-sm text-zinc-500">
        Hesabınız, favorileriniz ve bildirim tercihleriniz silinir; geçmiş rezervasyonlarınızdaki kişisel
        bilgileriniz anonimleştirilir. Bu işlem geri alınamaz.
      </p>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 text-sm text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:border-red-300 px-4 py-2 rounded-xl transition-colors"
        >
          Hesabımı silmek istiyorum
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <label htmlFor="hesap-sil-onay" className="block text-sm text-zinc-700">
            Onaylamak için <span className="font-bold">SİL</span> yazın:
          </label>
          <input
            id="hesap-sil-onay"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="w-full max-w-xs border border-zinc-200 rounded-xl px-3 py-2 text-sm"
            autoComplete="off"
          />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={busy || confirmText.trim().toLocaleUpperCase('tr') !== 'SİL'}
              className="text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {busy ? 'Siliniyor…' : 'Hesabımı kalıcı olarak sil'}
            </button>
            <button
              onClick={() => { setOpen(false); setConfirmText(''); setError(null) }}
              className="text-sm text-zinc-600 hover:text-zinc-900 px-4 py-2"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
