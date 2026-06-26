'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { addTable, deleteTable } from './actions'

type Table = { id: string; ad: string; kapasite: number }

export default function Step4Tables({
  tables,
  slug,
  isRestaurant,
}: {
  tables: Table[]
  slug: string
  isRestaurant: boolean
}) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  // NOTE: Restoran degilse bu component render edilmez — server tarafi 5'e yonlendirir

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await addTable(fd)
    setLoading(false)
    if (res.success) {
      toast.show('Masa eklendi ✅', 'success')
      e.currentTarget.reset()
      router.refresh()
    } else {
      toast.show(res.error ?? 'Hata', 'error')
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteTable(id)
    if (res.success) {
      toast.show('Masa silindi', 'success')
      router.refresh()
    } else {
      toast.show(res.error ?? 'Hata', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <div className="text-4xl mb-2">🏠</div>
        <h1 className="text-xl font-bold text-white">Masa Düzeni</h1>
        <p className="text-sm text-stone-400 mt-1">Restoranınızdaki masa tiplerini ekleyin</p>
      </div>

      {tables.length > 0 && (
        <div className="bg-stone-800 border border-stone-700 rounded-2xl p-4 space-y-2">
          {tables.map(t => (
            <div key={t.id} className="flex items-center justify-between bg-stone-900 rounded-xl px-4 py-3">
              <div>
                <span className="text-sm font-medium text-white">{t.ad}</span>
                <span className="text-xs text-stone-400 ml-2">{t.kapasite} kişi</span>
              </div>
              <button type="button" onClick={() => handleDelete(t.id)}
                className="text-stone-500 hover:text-red-400 transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-stone-800 border border-stone-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Yeni Masa</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">Masa Adı *</label>
            <input name="ad" required
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#D4A373] outline-none"
              placeholder="Masa 1"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">Kapasite *</label>
            <input name="capacity" type="number" min={1} max={50} required
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#D4A373] outline-none"
              placeholder="4"
            />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-[#E53935] py-3 text-sm font-semibold text-white hover:bg-red-700 transition-all disabled:opacity-60"
        >
          {loading ? 'Ekleniyor...' : '+ Masa Ekle'}
        </button>
      </form>

      <div className="flex justify-end">
        <button type="button" onClick={() => router.push(`/panel/${slug}/onboarding/5`)}
          className="rounded-2xl bg-gradient-to-r from-[#D4A373] to-amber-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-all"
        >
          {tables.length > 0 ? 'Devam Et →' : 'Şimdilik Atla →'}
        </button>
      </div>
    </div>
  )
}
