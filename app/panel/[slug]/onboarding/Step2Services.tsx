'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { addService, deleteService } from './actions'

type Service = { id: string; ad: string; duration_minutes: number; price: number | null }

export default function Step2Services({ services, slug }: { services: Service[]; slug: string }) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await addService(fd)
    setLoading(false)
    if (res.success) {
      toast.show('Hizmet eklendi ✅', 'success')
      e.currentTarget.reset()
      router.refresh()
    } else {
      toast.show(res.error ?? 'Hata', 'error')
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteService(id)
    if (res.success) {
      toast.show('Hizmet silindi', 'success')
      router.refresh()
    } else {
      toast.show(res.error ?? 'Hata', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h1 className="text-xl font-bold text-white">Hizmetlerinizi Ekleyin</h1>
        <p className="text-sm text-stone-400 mt-1">En az 1 hizmet eklemelisiniz</p>
      </div>

      {/* Mevcut hizmetler */}
      {services.length > 0 && (
        <div className="bg-stone-800 border border-stone-700 rounded-2xl p-4 space-y-2">
          {services.map(s => (
            <div key={s.id} className="flex items-center justify-between bg-stone-900 rounded-xl px-4 py-3">
              <div>
                <span className="text-sm font-medium text-white">{s.ad}</span>
                <span className="text-xs text-stone-400 ml-2">{s.duration_minutes} dk</span>
                {s.price != null && <span className="text-xs text-[#D4A373] ml-2">{s.price} ₺</span>}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
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

      {/* Yeni hizmet formu */}
      <form onSubmit={handleSubmit} className="bg-stone-800 border border-stone-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Yeni Hizmet</h2>

        <div>
          <label className="text-xs text-stone-400 font-medium mb-1.5 block">Hizmet Adı *</label>
          <input name="name" required
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#D4A373] outline-none"
            placeholder="Örn: Saç Kesimi"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">Süre (dk) *</label>
            <input name="duration_minutes" type="number" min={5} max={480} required
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#D4A373] outline-none"
              placeholder="30"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">Fiyat (₺)</label>
            <input name="price" type="number" step="0.01" min={0}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#D4A373] outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-[#E53935] py-3 text-sm font-semibold text-white hover:bg-red-700 transition-all disabled:opacity-60"
        >
          {loading ? 'Ekleniyor...' : '+ Hizmet Ekle'}
        </button>
      </form>

      {/* Devam */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => router.push(`/panel/${slug}/onboarding/3`)}
          disabled={services.length === 0}
          className="rounded-2xl bg-gradient-to-r from-[#D4A373] to-amber-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-all disabled:opacity-50"
        >
          {services.length > 0 ? 'Devam Et →' : 'En az 1 hizmet ekleyin'}
        </button>
      </div>
    </div>
  )
}
