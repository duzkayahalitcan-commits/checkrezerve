'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X, ChevronDown, Clock, Users, Phone, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

type Reservation = {
  id: string
  guest_name: string | null
  guest_phone: string | null
  reserved_date: string
  reserved_time: string
  party_size: number | null
  notes: string | null
  status: string
  source: string | null
  special_area_id: string | null
  table_id: string | null
  calisan_id: string | null
  hizmet_id: string | null
  created_at: string
  calisanlar?: { ad: string } | null
  hizmetler?: { ad: string; fiyat: number } | null
  special_areas?: { name: string } | null
}

type Staff = { id: string; ad: string }
type Service = { id: string; ad: string }
type Area = { id: string; name: string }

const STATUS_CLS: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-300 border-amber-500/25',
  confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
}

const STATUS_TR: Record<string, string> = {
  pending:   'Beklemede',
  confirmed: 'Onaylı',
  cancelled: 'İptal',
  completed: 'Tamamlandı',
}

export default function RezervasyonList({
  reservations,
  calisanlar,
  hizmetler,
  areas,
  filters,
  locale,
}: {
  reservations: Reservation[]
  calisanlar: Staff[]
  hizmetler: Service[]
  areas: Area[]
  filters: { durum?: string; tarih?: string; ara?: string }
  locale: string
}) {
  const router = useRouter()
  const toast = useToast()
  const today = new Date().toISOString().slice(0, 10)
  const [search, setSearch] = useState(filters.ara ?? '')
  const [statusFilter, setStatusFilter] = useState(filters.durum ?? 'all')
  const [dateFilter, setDateFilter] = useState(filters.tarih ?? '')
  const [areaFilter, setAreaFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...reservations]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(r =>
        r.guest_name?.toLowerCase().includes(q) ||
        r.guest_phone?.includes(q)
      )
    }
    if (statusFilter !== 'all') list = list.filter(r => r.status === statusFilter)
    if (dateFilter) list = list.filter(r => r.reserved_date === dateFilter)
    if (areaFilter !== 'all') list = list.filter(r => r.special_area_id === areaFilter)
    return list
  }, [reservations, search, statusFilter, dateFilter, areaFilter])

  const selectedRes = selectedId ? (filtered.find(r => r.id === selectedId) ?? null) : null

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      const res = await fetch('/api/panel-reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('Güncelleme başarısız')
      toast.show(status === 'confirmed' ? '✓ Onaylandı' : status === 'cancelled' ? 'İptal edildi' : 'Güncellendi', status === 'cancelled' ? 'error' : 'success')
      router.refresh()
    } catch {
      toast.show('Güncelleme başarısız', 'error')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="İsim veya telefon ara..."
            className="w-full pl-9 pr-8 py-2 bg-stone-900 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            showFilters || statusFilter !== 'all' || dateFilter || areaFilter !== 'all'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
              : 'bg-stone-900 text-stone-400 border border-stone-700 hover:border-stone-500'
          }`}
        >
          <Filter size={14} />
          Filtrele
          {(statusFilter !== 'all' || dateFilter || areaFilter !== 'all') && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      {/* Expandable filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 p-4 bg-stone-900 border border-stone-800 rounded-2xl">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Durum</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Tümü</option>
                  <option value="pending">Beklemede</option>
                  <option value="confirmed">Onaylı</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Tarih</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Alan</label>
                <select
                  value={areaFilter}
                  onChange={e => setAreaFilter(e.target.value)}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Tümü</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              {(statusFilter !== 'all' || dateFilter || areaFilter !== 'all') && (
                <div className="flex items-end">
                  <button
                    onClick={() => { setStatusFilter('all'); setDateFilter(''); setAreaFilter('all') }}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-400 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                  >
                    Temizle
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500">{filtered.length} rezervasyon</p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-stone-900/50 border border-stone-800 rounded-2xl">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-stone-400 font-semibold">Eşleşen rezervasyon bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: i * 0.02, ease: [0.23, 1, 0.32, 1] }}
                onClick={() => setSelectedId(r.id)}
                className={`rounded-xl border border-stone-800 p-3 sm:p-4 transition-opacity cursor-pointer hover:border-stone-700 hover:bg-stone-900/50 ${updating === r.id ? 'opacity-40' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white text-sm">{r.guest_name ?? 'Misafir'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_CLS[r.status] ?? ''}`}>
                        {STATUS_TR[r.status] ?? r.status}
                      </span>
                      {r.source === 'ai' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">AI</span>
                      )}
                      {r.reserved_date !== today && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-700 text-stone-300 border border-stone-600">
                          {new Date(r.reserved_date + 'T12:00').toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-stone-400">
                      <span className="flex items-center gap-1"><Clock size={11} /> {r.reserved_time.slice(0, 5)}</span>
                      <span>📅 {new Date(r.reserved_date + 'T12:00').toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {r.party_size ?? '—'}</span>
                      {r.special_areas?.name && <span>📍 {r.special_areas.name}</span>}
                      {r.calisanlar?.ad && <span>💆 {r.calisanlar.ad}</span>}
                    </div>
                    {r.guest_phone && (
                      <a href={`tel:${r.guest_phone}`} className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-400 transition-colors mt-1">
                        <Phone size={10} /> {r.guest_phone}
                      </a>
                    )}
                    {r.notes && <p className="mt-1.5 text-xs text-stone-600 italic">&ldquo;{r.notes}&rdquo;</p>}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(r.id, 'confirmed')} disabled={updating === r.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/35 transition-colors disabled:opacity-50 min-w-0">Onayla</button>
                        <button onClick={() => updateStatus(r.id, 'cancelled')} disabled={updating === r.id}
                          className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-50 min-w-0">Reddet</button>
                      </>
                    )}
                    {r.status === 'confirmed' && (
                      <button onClick={() => updateStatus(r.id, 'completed')} disabled={updating === r.id}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-medium hover:bg-blue-500/25 transition-colors disabled:opacity-50 min-w-0">Tamamla</button>
                    )}
                    {(r.status === 'confirmed' || r.status === 'pending') && (
                      <button onClick={() => updateStatus(r.id, 'cancelled')} disabled={updating === r.id}
                        className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50 min-w-0">İptal</button>
                    )}
                    {r.status === 'cancelled' && (
                      <button onClick={() => updateStatus(r.id, 'pending')} disabled={updating === r.id}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors disabled:opacity-50 min-w-0">Geri Al</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRes && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-white text-base">Rezervasyon Detayı</h2>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-stone-500 hover:text-white transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2 mb-5">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${STATUS_CLS[selectedRes.status] ?? ''}`}>
                  {STATUS_TR[selectedRes.status] ?? selectedRes.status}
                </span>
                {selectedRes.source === 'ai' && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">AI</span>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Müşteri', value: selectedRes.guest_name ?? '—' },
                  { label: 'Telefon', value: selectedRes.guest_phone ?? '—' },
                  { label: 'Tarih', value: new Date(selectedRes.reserved_date + 'T12:00').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Saat', value: selectedRes.reserved_time?.slice(0, 5) ?? '—' },
                  { label: 'Kişi Sayısı', value: selectedRes.party_size ? `${selectedRes.party_size} kişi` : '—' },
                  selectedRes.special_areas?.name ? { label: 'Alan', value: selectedRes.special_areas.name } : null,
                  selectedRes.calisanlar?.ad ? { label: 'Çalışan', value: selectedRes.calisanlar.ad } : null,
                  selectedRes.hizmetler?.ad ? { label: 'Hizmet', value: selectedRes.hizmetler.ad + (selectedRes.hizmetler.fiyat ? ` — ${selectedRes.hizmetler.fiyat} ₺` : '') } : null,
                  selectedRes.notes ? { label: 'Notlar', value: selectedRes.notes } : null,
                ].filter(Boolean).map(f => f && (
                  <div key={f.label} className="flex gap-3">
                    <span className="text-stone-500 text-xs w-24 shrink-0 pt-0.5">{f.label}</span>
                    <span className="text-stone-200 text-sm font-medium">{f.value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {selectedRes.status === 'pending' && (
                  <button
                    onClick={() => { updateStatus(selectedRes.id, 'confirmed'); setSelectedId(null) }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/35 transition-colors"
                  >
                    Onayla
                  </button>
                )}
                {selectedRes.status === 'confirmed' && (
                  <button
                    onClick={() => { updateStatus(selectedRes.id, 'completed'); setSelectedId(null) }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 text-sm font-semibold hover:bg-blue-500/25 transition-colors"
                  >
                    Tamamla
                  </button>
                )}
                {(selectedRes.status === 'pending' || selectedRes.status === 'confirmed') && (
                  <button
                    onClick={() => { updateStatus(selectedRes.id, 'cancelled'); setSelectedId(null) }}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors"
                  >
                    İptal Et
                  </button>
                )}
                {selectedRes.status === 'cancelled' && (
                  <button
                    onClick={() => { updateStatus(selectedRes.id, 'pending'); setSelectedId(null) }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500/15 text-amber-400 text-sm font-semibold hover:bg-amber-500/25 transition-colors"
                  >
                    Geri Al
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
