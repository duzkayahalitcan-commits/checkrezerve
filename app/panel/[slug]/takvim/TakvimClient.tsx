'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import CalendarGrid from './CalendarGrid'
import WeeklyView from './WeeklyView'
import DailyView from './DailyView'
import CalendarSidebar from './CalendarSidebar'
import type { TakvimReservation, ViewMode } from './CalendarTypes'

export default function TakvimClient({
  slug,
  restaurantId,
  initialReservations,
  viewMode: initialMode,
}: {
  slug: string
  restaurantId: string
  initialReservations: TakvimReservation[]
  viewMode: ViewMode
}) {
  const router = useRouter()


  const [viewMode, setViewMode] = useState<ViewMode>(initialMode)
  const [reservations, setReservations] = useState<TakvimReservation[]>(initialReservations)
  const [selectedRes, setSelectedRes] = useState<TakvimReservation | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Günlük görünümde hangi tarih
  const today = new Date().toISOString().slice(0, 10)
  const [dailyDate, setDailyDate] = useState(today)

  // ─── Realtime subscription ──────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('takvim-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations', filter: `restaurant_id=eq.${restaurantId}` },
        () => {
          // Sayfayi tamamen yenilemek yerine router.refresh ile guncelle
          router.refresh()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [restaurantId, router])

  // ─── View toggle ────────────────────────────────────────────────────────
  function switchView(mode: ViewMode) {
    setViewMode(mode)
    setSelectedRes(null)
    const viewParam = mode === 'monthly' ? '' : mode === 'weekly' ? 'haftalik' : 'gunluk'
    router.push(`/panel/${slug}/takvim${viewParam ? `?view=${viewParam}` : ''}`)
  }

  // ─── Loading skeleton ───────────────────────────────────────────────────
  if (!reservations) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 bg-stone-800 rounded-xl w-48" />
        <div className="h-4 bg-stone-800 rounded-xl w-32" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-stone-800 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-white">Rezervasyon Takvimi</h1>
          <p className="text-xs text-stone-500 mt-0.5">{reservations.length} kayıt</p>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg bg-stone-800 p-0.5 gap-0.5">
          {([
            { key: 'daily' as const, label: 'Günlük' },
            { key: 'weekly' as const, label: 'Haftalık' },
            { key: 'monthly' as const, label: 'Aylık' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchView(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === key ? 'bg-[#D4A373]/20 text-[#D4A373]' : 'text-stone-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          {viewMode === 'daily' && (
            <DailyView
              date={dailyDate}
              reservations={reservations.filter(r => r.reserved_date === dailyDate && !r.is_deleted)}
              onSelect={setSelectedRes}
              selectedId={selectedRes?.id ?? null}
            />
          )}

          {viewMode === 'weekly' && (
            <WeeklyView
              reservations={reservations}
              onSelect={setSelectedRes}
              selectedId={selectedRes?.id ?? null}
            />
          )}

          {viewMode === 'monthly' && (
            <CalendarGrid
              year={new Date().getFullYear()}
              month={new Date().getMonth() + 1}
              reservations={reservations}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSelectReservation={setSelectedRes}
              restaurantId={restaurantId}
            />
          )}
        </div>
      </main>

      {/* ── Slide-over sidebar ──────────────────────────────────────────── */}
      <CalendarSidebar
        reservation={selectedRes}
        onClose={() => setSelectedRes(null)}
        slug={slug}
        restaurantId={restaurantId}
      />
    </div>
  )
}
