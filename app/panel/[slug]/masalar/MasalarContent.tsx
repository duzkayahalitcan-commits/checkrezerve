'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Users, Clock, Plus } from 'lucide-react'

type Table = { id: string; label: string; capacity: number; area_id: string | null; x: number; y: number; shape?: string; rotation?: number }
type Area = { id: string; name: string; color?: string | null }
type TodayRes = { id: string; guest_name: string | null; reserved_time: string; party_size: number | null; status: string; masa_tipi_id: string | null; calisanlar?: { ad: string } | null; hizmetler?: { ad: string } | null }

const STATUS_DOT: Record<string, string> = {
  pending:   'bg-amber-400',
  confirmed: 'bg-emerald-400',
  completed: 'bg-blue-400',
  cancelled: 'bg-stone-500',
}

export default function MasalarContent({
  tables, areas, todayReservations, slug, restaurantId,
}: {
  tables: Table[]; areas: Area[]; todayReservations: TodayRes[]; slug: string; restaurantId: string
}) {
  const router = useRouter()
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<{ table: Table; reservations: TodayRes[] } | null>(null)

  const filteredTables = selectedArea ? tables.filter(t => t.area_id === selectedArea) : tables

  // Her masa için bugünkü rezervasyonlar (kanonik anahtar: masa_tipi_id)
  const resMap = new Map<string, TodayRes[]>()
  for (const r of todayReservations) {
    if (r.masa_tipi_id) {
      if (!resMap.has(r.masa_tipi_id)) resMap.set(r.masa_tipi_id, [])
      resMap.get(r.masa_tipi_id)!.push(r)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alan sekmeleri */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setSelectedArea(null)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedArea === null ? 'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30' : 'bg-stone-800 text-stone-400 border border-stone-700'
          }`}>Tümü</button>
        {areas.map(a => (
          <button key={a.id} onClick={() => setSelectedArea(a.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedArea === a.id ? 'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30' : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}>{a.name}</button>
        ))}
      </div>

      {/* Masa kart grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredTables.map(t => {
          const reservations = resMap.get(t.id) ?? []
          const isOccupied = reservations.some(r => r.status === 'confirmed')
          const hasPending = reservations.some(r => r.status === 'pending')
          const hasCompleted = reservations.length > 0 && !isOccupied && !hasPending

          const statusColor = isOccupied ? 'bg-red-500/20 border-red-500/40' :
                              hasPending ? 'bg-amber-500/20 border-amber-500/40' :
                              hasCompleted ? 'bg-blue-500/15 border-blue-500/30' :
                              'bg-emerald-500/10 border-emerald-500/20'

          const statusDot = isOccupied ? 'bg-red-400' :
                            hasPending ? 'bg-amber-400' :
                            hasCompleted ? 'bg-blue-400' : 'bg-emerald-400'

          const statusLabel = isOccupied ? 'Dolu' :
                              hasPending ? 'Yakında' :
                              hasCompleted ? 'Tamamlandı' : 'Boş'

          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedTable({ table: t, reservations })}
              className={`rounded-2xl p-4 border text-left transition-all ${statusColor} hover:shadow-lg`}
            >
              {/* Shape icon */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  t.shape === 'circle' ? 'rounded-full' : 'rounded-xl'
                } ${isOccupied ? 'bg-red-500/15' : hasPending ? 'bg-amber-500/15' : 'bg-emerald-500/15'}`}>
                  🪑
                </div>
                <span className={`w-2 h-2 rounded-full ${statusDot}`} />
              </div>

              <p className="text-sm font-semibold text-white truncate">{t.label}</p>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1"><Users size={10} /> {t.capacity} kişi</p>

              {/* Rezervasyon durumu */}
              <div className="mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium" style={{
                    color: isOccupied ? '#f87171' : hasPending ? '#fbbf24' : '#34d399'
                  }}>{statusLabel}</span>
                  {reservations.length > 0 && (
                    <span className="text-[10px] text-stone-500">{reservations.length} rez.</span>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Masa popup */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedTable(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedTable.table.label}</h2>
                  <p className="text-xs text-stone-500">{selectedTable.table.capacity} kişi</p>
                </div>
                <button onClick={() => setSelectedTable(null)} className="text-stone-500 hover:text-white p-1 text-xl">×</button>
              </div>

              {selectedTable.reservations.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-stone-600 text-sm mb-4">Bugün bu masa için rezervasyon yok</p>
                  <button
                    onClick={() => { setSelectedTable(null); router.push(`/panel/${slug}/takvim?view=gunluk&masa=${selectedTable.table.id}`) }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a84c] text-black text-sm font-semibold hover:bg-amber-500 transition-all"
                  >
                    <Plus size={15} /> Rezervasyon Ekle
                  </button>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {selectedTable.reservations.map(r => (
                    <div key={r.id} className="flex items-center gap-3 bg-stone-800 rounded-xl p-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[r.status] ?? 'bg-stone-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{r.guest_name ?? 'Misafir'}</p>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="flex items-center gap-1"><Clock size={10} />{r.reserved_time?.slice(0, 5)}</span>
                          {r.party_size && <span>· {r.party_size} kişi</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
