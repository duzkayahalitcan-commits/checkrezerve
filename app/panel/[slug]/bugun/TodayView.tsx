'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, Users, Phone, List, LayoutGrid } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Reservation = {
  id: string
  guest_name: string | null
  guest_phone: string | null
  reserved_time: string
  party_size: number | null
  notes: string | null
  status: string
  source: string | null
  special_area_id: string | null
  table_id: string | null
  masa_tipi_id: string | null
  calisan_id?: string | null
  calisanlar?: { ad: string } | null
  hizmetler?: { ad: string; fiyat: number } | null
  special_areas?: { name: string } | null
}

type Table = {
  id: string
  label: string
  capacity: number
  x: number
  y: number
  width: number
  height: number
  shape: string
  is_active: boolean
}

type Area = {
  id: string
  name: string
  capacity: number
}

const statusColors: Record<string, string> = {
  pending:   'border-l-amber-500 bg-amber-500/8',
  confirmed: 'border-l-emerald-500 bg-emerald-500/8',
  completed: 'border-l-blue-500 bg-blue-500/8',
  cancelled: 'border-l-red-500/50 bg-red-500/5 opacity-60',
}

const statusBadgeColors: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-300',
  confirmed: 'bg-emerald-500/15 text-emerald-300',
  completed: 'bg-blue-500/15 text-blue-400',
  cancelled: 'bg-red-500/15 text-red-400',
}

const statusLabels: Record<string, string> = {
  pending:   'Beklemede',
  confirmed: 'Onaylı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
}

export default function TodayView({
  restaurantId,
  date,
  reservations,
  tables,
  areas,
}: {
  restaurantId: string
  date: string
  reservations: Reservation[]
  tables: Table[]
  areas: Area[]
}) {
  const toast = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [activeArea, setActiveArea] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Date navigation — push to URL so server re-fetches
  function shiftDate(direction: -1 | 1) {
    const d = new Date(date + 'T12:00')
    d.setDate(d.getDate() + direction)
    router.push(`${pathname}?t=${d.toISOString().slice(0, 10)}`)
  }

  const isToday = date === new Date().toISOString().slice(0, 10)

  // Compute area assignments for tables
  const tableAreaMap = useMemo(() => {
    const map: Record<string, { tableId: string; tableLabel: string; capacity: number }> = {}
    // Actually we need a tables_areas junction or area assignment.
    // For now: tables without special_area_id are "Ana Salon"
    // The reservation's special_area_id gives area info.
    return map
  }, [tables])

  // Filter reservations by active area
  const filteredRes = useMemo(() => {
    if (!activeArea) return reservations
    return reservations.filter(r => {
      if (activeArea === '__no_area') return !r.special_area_id
      return r.special_area_id === activeArea
    })
  }, [reservations, activeArea])

  // Status counts
  const totalGuests = reservations.length
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length
  const pendingCount = reservations.filter(r => r.status === 'pending').length
  const noshowCount = reservations.filter(r => r.status === 'cancelled').length

  // For grid view: group reservations by table
  const tableAssignments = useMemo(() => {
    const assigned = reservations.filter(r => r.table_id)
    const map = new Map<string, Reservation[]>()
    for (const r of assigned) {
      const tid = r.table_id!
      if (!map.has(tid)) map.set(tid, [])
      map.get(tid)!.push(r)
    }
    return map
  }, [reservations])

  // Unassigned reservations (no table)
  const unassigned = useMemo(() => {
    return reservations.filter(r => !r.table_id)
  }, [reservations])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error } = await client.from('reservations').update({ status }).eq('id', id)
      if (error) throw error
      toast.show('Durum güncellendi', 'success')
      router.refresh()
    } catch {
      toast.show('Güncelleme başarısız', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const dateDisplay = new Date(date + 'T12:00').toLocaleDateString('tr-TR', {
    weekday: 'short', day: 'numeric', month: 'long',
  })

  // Format waiting time
  function waitingTime(time: string) {
    const now = new Date()
    const [h, m] = time.split(':').map(Number)
    const resTime = new Date()
    resTime.setHours(h, m, 0, 0)
    const diffMin = Math.round((now.getTime() - resTime.getTime()) / 60000)
    if (diffMin <= 0) return '0 dk'
    return `${diffMin} dk`
  }

  return (
    <div className="space-y-5">
      {/* ── Date Navigation ── */}
      <div className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-2xl px-5 py-3">
        <button onClick={() => shiftDate(-1)} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-white">{dateDisplay}</span>
          {isToday && <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">Bugün</span>}
        </div>
        <button onClick={() => shiftDate(1)} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Status Counters ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Toplam', count: totalGuests, color: 'text-white', bg: 'bg-stone-800' },
          { label: 'Onaylı', count: confirmedCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Bekleyen', count: pendingCount, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'İptal', count: noshowCount, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-white/5 rounded-xl p-3 text-center`}>
            <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Area Tabs + View Toggle ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveArea(null)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeArea === null ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'
            }`}
          >
            Tümü
          </button>
          {areas.map(area => (
            <button
              key={area.id}
              onClick={() => setActiveArea(area.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeArea === area.id ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'
              }`}
            >
              {area.name}
            </button>
          ))}
          <button
            onClick={() => setActiveArea('__no_area')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeArea === '__no_area' ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'
            }`}
          >
            Atanmamış
          </button>
        </div>
        <div className="flex gap-1 bg-stone-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-stone-700 text-white' : 'text-stone-500 hover:text-white'}`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-stone-700 text-white' : 'text-stone-500 hover:text-white'}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {viewMode === 'grid' ? (
        /* Grid view — masa bazlı kartlar */
        <div className="space-y-6">
          {/* Tables with reservations */}
          {tables.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Masalar</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {tables.map(table => {
                  const assigned = tableAssignments.get(table.id) ?? []
                  const hasReservation = assigned.length > 0
                  const firstRes = assigned[0]
                  const isWaiting = firstRes && firstRes.status === 'pending'
                  return (
                    <motion.div
                      key={table.id}
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`rounded-xl border p-4 transition-all ${
                        hasReservation
                          ? isWaiting
                            ? 'bg-amber-500/8 border-amber-500/30'
                            : 'bg-emerald-500/8 border-emerald-500/30'
                          : 'bg-stone-900 border-stone-800 hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">{table.label}</span>
                        <span className="text-[10px] text-stone-500">{table.capacity} kişi</span>
                      </div>
                      {hasReservation ? (
                        <div className="space-y-2">
                          {assigned.map(r => (
                            <div key={r.id} className="text-xs space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-semibold ${r.status === 'confirmed' ? 'text-emerald-300' : 'text-amber-300'}`}>
                                  {r.guest_name ?? 'Misafir'}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusBadgeColors[r.status] ?? ''}`}>
                                  {statusLabels[r.status] ?? r.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-stone-500">
                                <span className="flex items-center gap-0.5">
                                  <Clock size={10} /> {r.reserved_time.slice(0, 5)}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Users size={10} /> {r.party_size ?? '—'}
                                </span>
                                {r.status === 'confirmed' && (
                                  <span className="text-amber-400 font-medium">{waitingTime(r.reserved_time)}</span>
                                )}
                              </div>
                              {r.guest_phone && (
                                <a href={`tel:${r.guest_phone}`} className="flex items-center gap-0.5 text-stone-600 hover:text-amber-400 transition-colors">
                                  <Phone size={9} /> {r.guest_phone}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-600 italic">Boş</div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Unassigned reservations */}
          {unassigned.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Atanmamış Rezervasyonlar</h3>
              <div className="space-y-2">
                {unassigned.map(r => (
                  <ReservationCard key={r.id} reservation={r} onStatusChange={updateStatus} updating={updating === r.id} />
                ))}
              </div>
            </div>
          )}

          {reservations.length === 0 && (
            <div className="text-center py-16 bg-stone-900/50 border border-stone-800 rounded-2xl">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-stone-400 font-semibold">Bu gün rezervasyon yok</p>
              <p className="text-stone-600 text-sm mt-1">Yeni rezervasyon alındığında burada görünecek</p>
            </div>
          )}
        </div>
      ) : (
        /* List view — kronolojik liste */
        <div className="space-y-2">
          {filteredRes.length === 0 ? (
            <div className="text-center py-16 bg-stone-900/50 border border-stone-800 rounded-2xl">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-stone-400 font-semibold">Rezervasyon bulunamadı</p>
            </div>
          ) : (
            filteredRes.map(r => (
              <ReservationCard key={r.id} reservation={r} onStatusChange={updateStatus} updating={updating === r.id} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ReservationCard({
  reservation: r,
  onStatusChange,
  updating,
}: {
  reservation: Reservation
  onStatusChange: (id: string, status: string) => void
  updating: boolean
}) {
  const isBeauty = r.calisan_id !== null
  const sColor = statusColors[r.status] ?? 'border-l-stone-700'

  return (
    <div className={`rounded-xl border border-stone-800 border-l-4 p-4 transition-opacity ${sColor} ${updating ? 'opacity-40' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-white text-sm">{r.guest_name ?? 'Misafir'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusBadgeColors[r.status] ?? ''}`}>
              {statusLabels[r.status] ?? r.status}
            </span>
            {r.source === 'ai' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">AI</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-stone-400">
            <span className="flex items-center gap-1"><Clock size={11} /> {r.reserved_time.slice(0, 5)}</span>
            {isBeauty ? (
              <>
                <span>💆 {r.calisanlar?.ad ?? '—'}</span>
                {r.hizmetler && <span>✨ {r.hizmetler.ad} {r.hizmetler.fiyat > 0 && `(${r.hizmetler.fiyat} ₺)`}</span>}
              </>
            ) : (
              <span className="flex items-center gap-1"><Users size={11} /> {r.party_size ?? '—'} kişi</span>
            )}
            {r.special_areas?.name && <span>📍 {r.special_areas.name}</span>}
          </div>
          {r.guest_phone && (
            <a href={`tel:${r.guest_phone}`} className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-400 transition-colors mt-1">
              <Phone size={10} /> {r.guest_phone}
            </a>
          )}
          {r.notes && <p className="mt-1.5 text-xs text-stone-600 italic">&ldquo;{r.notes}&rdquo;</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {r.status === 'pending' && (
            <>
              <button onClick={() => onStatusChange(r.id, 'confirmed')} disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/35 transition-colors disabled:opacity-50 whitespace-nowrap">
                Onayla
              </button>
              <button onClick={() => onStatusChange(r.id, 'cancelled')} disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-50 whitespace-nowrap">
                Reddet
              </button>
            </>
          )}
          {r.status === 'confirmed' && (
            <button onClick={() => onStatusChange(r.id, 'completed')} disabled={updating}
              className="px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-medium hover:bg-blue-500/25 transition-colors disabled:opacity-50 whitespace-nowrap">
              Tamamla
            </button>
          )}
          {r.status === 'pending' && (
            <button onClick={() => onStatusChange(r.id, 'cancelled')} disabled={updating}
              className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50 whitespace-nowrap">
              İptal
            </button>
          )}
          {r.status === 'cancelled' && (
            <button onClick={() => onStatusChange(r.id, 'pending')} disabled={updating}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors disabled:opacity-50 whitespace-nowrap">
              Geri Al
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
