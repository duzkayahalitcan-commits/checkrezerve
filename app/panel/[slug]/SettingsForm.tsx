'use client'

import { useState, useTransition } from 'react'
import { useTranslations }         from 'next-intl'
import type { Restaurant, WorkingHours, WorkingDayHours } from '@/types'

type Props = {
  restaurant: Pick<Restaurant,
    'id' | 'working_hours' | 'closed_dates' | 'prepayment_amount' | 'special_notes'
  >
}

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const
type Day = typeof DAYS[number]

const DEFAULT_HOURS: WorkingDayHours = { open: true, start: '09:00', end: '22:00' }

function initHours(raw: WorkingHours | null): Record<Day, WorkingDayHours> {
  const result = {} as Record<Day, WorkingDayHours>
  for (const d of DAYS) {
    result[d] = raw?.[d] ?? { ...DEFAULT_HOURS }
  }
  return result
}

export default function SettingsForm({ restaurant }: Props) {
  const t = useTranslations('panel')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const [hours, setHours]     = useState<Record<Day, WorkingDayHours>>(initHours(restaurant.working_hours ?? null))
  const [closedDates, setClosedDates] = useState<string[]>(restaurant.closed_dates ?? [])
  const [prepay, setPrepay]   = useState<number>(restaurant.prepayment_amount ?? 0)
  const [notes, setNotes]     = useState(restaurant.special_notes ?? '')
  const [dateInput, setDateInput] = useState('')

  function setDay(day: Day, patch: Partial<WorkingDayHours>) {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  function addDate() {
    if (!dateInput || closedDates.includes(dateInput)) return
    setClosedDates(prev => [...prev, dateInput].sort())
    setDateInput('')
  }

  function removeDate(d: string) {
    setClosedDates(prev => prev.filter(x => x !== d))
  }

  function save() {
    setSaved(false)
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/panel-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurant_id:     restaurant.id,
            working_hours:     hours,
            closed_dates:      closedDates,
            prepayment_amount: prepay,
            special_notes:     notes,
          }),
        })
        if (!res.ok) throw new Error((await res.json()).error ?? 'error')
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (e) {
        setError(e instanceof Error ? e.message : t('settingsSaveError'))
      }
    })
  }

  return (
    <div className="space-y-6">

      {/* Working hours */}
      <div>
        <h3 className="text-sm font-semibold text-stone-200 mb-3">{t('workingHours')}</h3>
        <div className="space-y-2">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => setDay(day, { open: !hours[day].open })}
                className={`w-16 text-center rounded-md py-1 text-xs font-medium transition ${
                  hours[day].open
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-stone-800 text-stone-500 border border-stone-700'
                }`}
              >
                {hours[day].open ? t('openStatus') : t('closedStatus')}
              </button>
              <span className="w-20 text-stone-400 text-xs">{t(day)}</span>
              {hours[day].open ? (
                <>
                  <input
                    type="time"
                    value={hours[day].start}
                    onChange={e => setDay(day, { start: e.target.value })}
                    className="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-stone-600 text-xs">–</span>
                  <input
                    type="time"
                    value={hours[day].end}
                    onChange={e => setDay(day, { end: e.target.value })}
                    className="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </>
              ) : (
                <span className="text-stone-600 text-xs italic">{t('closedStatus')}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Closed dates */}
      <div>
        <h3 className="text-sm font-semibold text-stone-200 mb-3">{t('closedDates')}</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="date"
            value={dateInput}
            onChange={e => setDateInput(e.target.value)}
            className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={addDate}
            disabled={!dateInput}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-semibold rounded-lg px-3 py-1.5 transition"
          >
            {t('addDate')}
          </button>
        </div>
        {closedDates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {closedDates.map(d => (
              <span key={d} className="inline-flex items-center gap-1 bg-stone-800 border border-stone-700 rounded-full px-2.5 py-1 text-xs text-stone-300">
                {d}
                <button
                  type="button"
                  onClick={() => removeDate(d)}
                  className="text-stone-500 hover:text-red-400 transition leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Prepayment */}
      <div>
        <h3 className="text-sm font-semibold text-stone-200 mb-1">{t('prepaymentAmount')}</h3>
        <p className="text-xs text-stone-500 mb-2">{t('prepaymentDesc')}</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={prepay}
            onChange={e => setPrepay(Number(e.target.value))}
            className="w-32 bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <span className="text-stone-400 text-sm">₺</span>
        </div>
      </div>

      {/* Special notes */}
      <div>
        <h3 className="text-sm font-semibold text-stone-200 mb-1">{t('specialNotes')}</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder={t('specialNotesPlaceholder')}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 resize-none"
        />
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-lg px-5 py-2 text-sm transition"
        >
          {isPending ? t('saving') : t('settingsSave')}
        </button>
        {saved && <span className="text-emerald-400 text-sm">{t('settingsSaved')}</span>}
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>

    </div>
  )
}
