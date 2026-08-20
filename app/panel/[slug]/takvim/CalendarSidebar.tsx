'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { updateReservation, softDeleteReservation, undoDeleteReservation } from './actions'
import type { TakvimReservation } from './CalendarTypes'

type Staff = { id: string; ad: string }
type Service = { id: string; ad: string }

export default function CalendarSidebar({
  reservation,
  onClose,
  slug,
  restaurantId,
}: {
  reservation: TakvimReservation | null
  onClose: () => void
  slug: string
  restaurantId: string
}) {
  const router = useRouter()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [undoTimer, setUndoTimer] = useState<number | null>(null)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [staffId, setStaffId] = useState('')
  const [notes, setNotes] = useState('')

  const [staffList, setStaffList] = useState<Staff[]>([])

  useEffect(() => {
    if (!reservation) return
    setDate(reservation.reserved_date ?? '')
    setTime((reservation.reserved_time ?? '').slice(0, 5))
    setStaffId(reservation.calisan_id ?? '')
    setNotes(reservation.special_requests ?? '')

    // Fetch staff for dropdown
    supabase
      .from('calisanlar')
      .select('id, ad')
      .eq('restaurant_id', restaurantId)
      .eq('aktif', true)
      .order('ad')
      .then(({ data }) => setStaffList(data ?? []))
  }, [reservation, restaurantId])

  async function handleSave() {
    if (!reservation) return
    setSaving(true)
    const res = await updateReservation(reservation.id, {
      reserved_date: date,
      reserved_time: time,
      calisan_id: staffId || null,
      special_requests: notes || null,
    })
    setSaving(false)
    if (res.success) {
      toast.show('Rezervasyon güncellendi ✅', 'success')
      router.refresh()
      onClose()
    } else {
      toast.show(res.error ?? 'Güncelleme hatası', 'error')
    }
  }

  async function handleDelete() {
    if (!reservation) return
    setDeleting(true)
    const res = await softDeleteReservation(reservation.id)
    setDeleting(false)
    if (res.success) {
      toast.show('Rezervasyon silindi', 'success')
      router.refresh()
      onClose()

      // 5 saniye "Geri Al" tostu
      const timer = window.setTimeout(async () => {
        setUndoTimer(null)
      }, 5000)
      setUndoTimer(timer)
    } else {
      toast.show(res.error ?? 'Silme hatası', 'error')
    }
  }

  async function handleUndo() {
    if (!reservation || !undoTimer) return
    clearTimeout(undoTimer)
    setUndoTimer(null)
    const res = await undoDeleteReservation(reservation.id)
    if (res.success) {
      toast.show('Silme geri alındı ✅', 'success')
      router.refresh()
    } else {
      toast.show(res.error ?? 'Geri alma hatası', 'error')
    }
  }

  const staffLabel = (reservation?.calisanlar as { ad: string } | null)?.ad

  return (
    <AnimatePresence>
      {reservation && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-stone-900 border-l border-stone-700 z-50 shadow-2xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Rezervasyon Düzenle</h2>
                <button onClick={onClose} className="text-stone-500 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Misafir bilgisi */}
              <div className="bg-stone-800 border border-stone-700 rounded-2xl p-4 space-y-2">
                <p className="text-sm font-semibold text-white">
                  {reservation.guest_name ?? 'Misafir'}
                </p>
                <p className="text-xs text-stone-400">
                  {reservation.guest_phone && `📞 ${reservation.guest_phone}`}
                  {reservation.party_size && ` · 👥 ${reservation.party_size} kişi`}
                </p>
                {(reservation.hizmetler as { ad: string } | null)?.ad && (
                  <p className="text-xs text-[#D4A373]">
                    ✨ {(reservation.hizmetler as { ad: string }).ad}
                  </p>
                )}
                {staffLabel && (
                  <p className="text-xs text-stone-400">💆 {staffLabel}</p>
                )}
              </div>

              {/* Düzenleme formu */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-stone-400 font-medium mb-1.5 block">Tarih</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4A373] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 font-medium mb-1.5 block">Saat</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4A373] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 font-medium mb-1.5 block">Personel</label>
                  <select
                    value={staffId}
                    onChange={e => setStaffId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4A373] outline-none"
                  >
                    <option value="">— Seçilmedi —</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.ad}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-stone-400 font-medium mb-1.5 block">Notlar</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4A373] outline-none resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#D4A373] py-3 text-sm font-bold text-[#0d2e1c] hover:bg-amber-600 transition-all disabled:opacity-60"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all disabled:opacity-60"
                >
                  {deleting ? '...' : 'Sil'}
                </button>
              </div>

              {/* Undo toast */}
              {undoTimer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-4 z-[60]"
                >
                  <p className="text-sm text-stone-200">Rezervasyon silindi</p>
                  <button
                    onClick={handleUndo}
                    className="text-sm font-bold text-[#D4A373] hover:text-amber-400 transition-colors"
                  >
                    Geri Al
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
