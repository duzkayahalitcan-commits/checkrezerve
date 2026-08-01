'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { supabase } from '@/lib/supabase'
import { X, Phone, User, Clock, Tag, DollarSign } from 'lucide-react'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: tr }),
  getDay,
  locales: { tr },
})

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#E53935',
  pending:   '#F59E0B',
  cancelled: '#6B7280',
  completed: '#10B981',
}
const STATUS_TR: Record<string, string> = {
  confirmed: 'Onaylı',
  pending:   'Beklemede',
  cancelled: 'İptal',
  completed: 'Tamamlandı',
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: string
  status: string
  customer_name: string
  customer_phone: string | null
  hizmet_adi: string | null
  calisan_adi: string | null
  price_paid: number | null
  duration_minutes: number | null
  reserved_time: string
}

interface Props {
  restaurantId: string
  businessType?: string
  slug: string
}

export default function CalendarView({ restaurantId, businessType, slug }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [staffList, setStaffList] = useState<{ id: string; ad: string }[]>([])
  const [staffFilter, setStaffFilter] = useState<string>('all')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    supabase
      .from('calisanlar')
      .select('id, name, ad')
      .eq('restaurant_id', restaurantId)
      .eq('aktif', true)
      .order('ad')
      .then(({ data }) => {
        setStaffList((data ?? []).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          ad: (c.ad ?? c.name ?? '') as string,
        })))
      })
  }, [restaurantId])

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const start = format(startOfMonth(subMonths(new Date(date), 1)), 'yyyy-MM-dd')
      const end = format(endOfMonth(addMonths(new Date(date), 2)), 'yyyy-MM-dd')

      let query = supabase
        .from('reservations')
        .select(`
          id, guest_name, guest_phone, reserved_date, reserved_time,
          party_size, status, notes, price_paid, duration_minutes,
          calisan_id, hizmet_id,
          calisanlar!left(name, ad),
          hizmetler!left(ad, renk)
        `)
        .eq('restaurant_id', restaurantId)
        .gte('reserved_date', start)
        .lte('reserved_date', end)

      if (staffFilter !== 'all') {
        query = query.eq('calisan_id', staffFilter)
      }

      const { data } = await query.order('reserved_date').order('reserved_time')

      const mapped: CalendarEvent[] = (data ?? []).map((r: Record<string, unknown>) => {
        const calisan = (r.calisanlar as Record<string, unknown> | Record<string, unknown>[] | null)
        const calisanArr = Array.isArray(calisan) ? calisan : calisan ? [calisan] : []
        const hizmet = (r.hizmetler as Record<string, unknown> | Record<string, unknown>[] | null)
        const hizmetArr = Array.isArray(hizmet) ? hizmet : hizmet ? [hizmet] : []

        const timeStr = (r.reserved_time as string) ?? '00:00'
        const [h, m] = timeStr.split(':').map(Number)
        const startDate = new Date(`${r.reserved_date as string}T${timeStr}`)
        const duration = (r.duration_minutes as number) ?? 60
        const endDate = new Date(startDate.getTime() + duration * 60000)
        const calisanAdi = calisanArr[0]?.ad ?? calisanArr[0]?.name ?? null
        const hizmetAdi = hizmetArr[0]?.ad ?? null

        return {
          id: r.id as string,
          title: hizmetAdi ? `${hizmetAdi} - ${r.guest_name as string}` : (r.guest_name as string),
          start: startDate,
          end: endDate,
          status: (r.status as string) ?? 'pending',
          customer_name: r.guest_name as string,
          customer_phone: r.guest_phone as string | null,
          hizmet_adi: hizmetAdi as string | null,
          calisan_adi: calisanAdi as string | null,
          price_paid: r.price_paid as number | null,
          duration_minutes: (r.duration_minutes as number) ?? duration,
          reserved_time: timeStr,
        }
      })

      setEvents(mapped)
    } finally {
      setLoading(false)
    }
  }, [restaurantId, date, staffFilter])

  useEffect(() => { loadEvents() }, [loadEvents])

  const eventPropGetter = useCallback((event: CalendarEvent) => ({
    style: {
      backgroundColor: STATUS_COLORS[event.status] ?? '#6B7280',
      borderRadius: '6px',
      opacity: event.status === 'cancelled' ? 0.5 : 1,
      border: 'none',
      color: '#fff',
      fontSize: '12px',
      fontWeight: 600,
    },
  }), [])

  const messages = {
    allDay: 'Tüm gün',
    previous: 'Önceki',
    next: 'Sonraki',
    today: 'Bugün',
    month: 'Ay',
    week: 'Hafta',
    day: 'Gün',
    agenda: 'Ajanda',
    date: 'Tarih',
    time: 'Saat',
    event: 'Etkinlik',
    noEventsInRange: 'Bu aralıkta etkinlik yok',
    showMore: (total: number) => `+${total} daha`,
  }

  // Mobilde day view zorla
  const currentView = isMobile ? Views.DAY : view

  return (
    <div className="space-y-4">
      {/* Staff filter + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={staffFilter}
            onChange={e => setStaffFilter(e.target.value)}
            className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tüm Çalışanlar</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.ad}</option>
            ))}
          </select>
          {!isMobile && (
            <div className="flex gap-1 bg-stone-800 rounded-lg p-0.5">
              {[
                { key: Views.DAY, label: 'Gün' },
                { key: Views.WEEK, label: 'Hafta' },
                { key: Views.MONTH, label: 'Ay' },
              ].map(v => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    view === v.key
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="h-[600px] bg-stone-900/50 rounded-2xl border border-stone-800 flex items-center justify-center text-stone-500 text-sm">
          Yükleniyor...
        </div>
      ) : (
        <div className="bg-stone-900/30 rounded-2xl border border-stone-800 p-2 sm:p-4 calendar-dark">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: isMobile ? 500 : 650 }}
            view={currentView}
            onView={v => !isMobile && setView(v)}
            date={date}
            onNavigate={d => setDate(d)}
            eventPropGetter={eventPropGetter}
            onSelectEvent={e => setSelectedEvent(e as CalendarEvent)}
            messages={messages}
            min={new Date(0, 0, 0, 6, 0)}
            max={new Date(0, 0, 0, 23, 0)}
            step={30}
            timeslots={2}
          />
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white text-base">Rezervasyon Detayı</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-stone-500 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-white">
                <User size={15} className="text-stone-400" />
                <span className="font-semibold">{selectedEvent.customer_name}</span>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedEvent.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedEvent.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  selectedEvent.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {STATUS_TR[selectedEvent.status] ?? selectedEvent.status}
                </span>
              </div>
              {selectedEvent.customer_phone && (
                <a href={`tel:${selectedEvent.customer_phone}`} className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors">
                  <Phone size={14} /> {selectedEvent.customer_phone}
                </a>
              )}
              {selectedEvent.hizmet_adi && (
                <div className="flex items-center gap-2 text-stone-400">
                  <Tag size={14} /> {selectedEvent.hizmet_adi}
                </div>
              )}
              {selectedEvent.calisan_adi && (
                <div className="flex items-center gap-2 text-stone-400">
                  <User size={14} /> {selectedEvent.calisan_adi}
                </div>
              )}
              <div className="flex items-center gap-2 text-stone-400">
                <Clock size={14} />
                {format(new Date(selectedEvent.start), 'dd MMM yyyy, HH:mm', { locale: tr })} - {format(new Date(selectedEvent.end), 'HH:mm', { locale: tr })}
                {selectedEvent.duration_minutes && <span>({selectedEvent.duration_minutes}dk)</span>}
              </div>
              {selectedEvent.price_paid != null && (
                <div className="flex items-center gap-2 text-stone-400">
                  <DollarSign size={14} /> ₺{selectedEvent.price_paid}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for dark calendar theme */}
      <style>{`
        .calendar-dark .rbc-calendar { color: #fff; }
        .calendar-dark .rbc-header { color: #A08060; border-color: #3A2518; padding: 8px 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .calendar-dark .rbc-month-header { background: #2A1A12; }
        .calendar-dark .rbc-month-view, .calendar-dark .rbc-time-view, .calendar-dark .rbc-day-bg { border-color: #3A2518; background: #1A1008; }
        .calendar-dark .rbc-off-range-bg { background: #0f0a06; }
        .calendar-dark .rbc-today { background: rgba(229,57,53,0.08); }
        .calendar-dark .rbc-date-cell { color: #F5ECD7; font-size: 12px; padding: 4px; }
        .calendar-dark .rbc-date-cell.rbc-now { font-weight: 800; color: #E53935; }
        .calendar-dark .rbc-day-slot .rbc-time-slot { border-color: #2A1A12; }
        .calendar-dark .rbc-time-content { border-color: #3A2518; }
        .calendar-dark .rbc-time-gutter { color: #6D4C41; font-size: 11px; }
        .calendar-dark .rbc-label { color: #6D4C41; }
        .calendar-dark .rbc-timeslot-group { border-color: #2A1A12; }
        .calendar-dark .rbc-event { padding: 3px 6px !important; font-size: 11px !important; }
        .calendar-dark .rbc-toolbar { margin-bottom: 12px; }
        .calendar-dark .rbc-toolbar button { color: #A08060; border: 1px solid #3A2518; background: #2A1A12; font-size: 12px; padding: 6px 14px; border-radius: 8px; transition: all 0.15s; }
        .calendar-dark .rbc-toolbar button:hover { background: #3A2518; color: #F5ECD7; }
        .calendar-dark .rbc-toolbar button.rbc-active { background: rgba(229,57,53,0.2); color: #E53935; border-color: #E53935; }
        .calendar-dark .rbc-toolbar-label { color: #F5ECD7; font-weight: 700; font-size: 16px; }
        .calendar-dark .rbc-show-more { color: #E53935; font-size: 11px; font-weight: 600; }
        .calendar-dark .rbc-row-segment { padding: 2px 0; }
        .calendar-dark .rbc-row-bg { border-color: #3A2518; }
        .calendar-dark .rbc-agenda-view { color: #A08060; }
        .calendar-dark .rbc-agenda-table { border-color: #3A2518; }
        .calendar-dark .rbc-agenda-time-cell { color: #6D4C41; }
      `}</style>
    </div>
  )
}
