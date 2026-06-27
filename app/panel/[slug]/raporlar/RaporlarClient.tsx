'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts'

const GOLD = '#c9a84c'
const GREEN = '#22c55e'
const RED = '#ef4444'
const COLORS = ['#c9a84c', '#22c55e', '#0ea5e9', '#8b5cf6', '#f97316', '#ec4899', '#14b8a6']

type ResType = Record<string, unknown>
type Props = {
  slug: string; total: number; diff: number; diffPct: number
  cancelPct: number; prevCancelPct: number
  revenue: number; prevRevenue: number
  barData: { label: string; count: number }[]
  heatmapData: { hour: string; count: number }[]
  pieData: { name: string; value: number }[]
  staffBarData: { name: string; count: number }[]
  reservations: ResType[]
  dateFrom: string; dateTo: string; period: string
}

export default function RaporlarClient(props: Props) {
  const router = useRouter()
  const { slug, total, diff, diffPct, cancelPct, prevCancelPct, revenue, barData, heatmapData, pieData, staffBarData, reservations, dateFrom, dateTo, period } = props
  const [periodType, setPeriodType] = useState(period)
  const [customStart, setCustomStart] = useState(dateFrom)
  const [customEnd, setCustomEnd] = useState(dateTo)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('reserved_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function changePeriod(p: string) {
    setPeriodType(p)
    if (p === 'custom') return
    router.push(`/panel/${slug}/raporlar?period=${p}`)
  }

  function applyCustom() {
    if (customStart && customEnd) {
      router.push(`/panel/${slug}/raporlar?period=custom&bas=${customStart}&son=${customEnd}`)
    }
  }

  const filtered = useMemo(() => {
    let list = [...reservations]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        (r.guest_name as string)?.toLowerCase().includes(q) ||
        (r.guest_phone as string)?.includes(q)
      )
    }
    list.sort((a, b) => {
      const av = a[sortKey] as string ?? ''
      const bv = b[sortKey] as string ?? ''
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return list
  }, [reservations, search, sortKey, sortDir])

  function exportCSV() {
    const header = 'Tarih,Saat,Müşteri,Telefon,Kişi,Durum,Notlar'
    const rows = filtered.map(r =>
      `"${r.reserved_date}","${(r.reserved_time as string)?.slice(0,5)}","${r.guest_name ?? ''}","${r.guest_phone ?? ''}","${r.party_size ?? ''}","${r.status}","${(r.notes as string) ?? ''}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `rapor-${dateFrom}-${dateTo}.csv`
    a.click()
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-white">Raporlar</h1>
          <p className="text-xs text-stone-500 mt-0.5">{dateFrom} — {dateTo}</p>
        </div>
        <button onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-stone-800 text-stone-400 text-xs font-semibold hover:bg-stone-700 transition-colors">
          CSV Export
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Dönem seçici */}
        <div className="flex flex-wrap gap-2 items-center">
          {['day', 'week', 'month', 'custom'].map(p => (
            <button key={p} onClick={() => changePeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                periodType === p ? 'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30' : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}>
              {p === 'day' ? 'Bugün' : p === 'week' ? 'Bu Hafta' : p === 'month' ? 'Bu Ay' : 'Özel'}
            </button>
          ))}
          {periodType === 'custom' && (
            <div className="flex gap-2 items-center">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
              <span className="text-stone-600 text-xs">—</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
              <button onClick={applyCustom}
                className="px-3 py-1.5 rounded-lg bg-[#c9a84c] text-black text-xs font-semibold">Uygula</button>
            </div>
          )}
        </div>

        {/* KPI Kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="Toplam Rezervasyon" value={total} diff={diff} diffPct={diffPct} suffix="" />
          <KpiCard label="Doluluk Oranı" value={Math.min(100, Math.round((total / 31) * 100))} diff={0} diffPct={0} suffix="%" progress />
          <KpiCard label="Tahmini Gelir" value={revenue} diff={0} diffPct={0} suffix="₺" />
          <KpiCard label="İptal Oranı" value={cancelPct} diff={cancelPct - prevCancelPct} diffPct={Math.abs(cancelPct - prevCancelPct)} suffix="%" />
        </div>

        {/* Grafikler */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Günlük bar chart */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-200 mb-4">Günlük Rezervasyon</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                <XAxis dataKey="label" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #292524', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#d6d3d1' }} itemStyle={{ color: GOLD }} />
                <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Saatlik yoğunluk heatmap */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-200 mb-4">Saatlik Yoğunluk</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                <XAxis dataKey="hour" tick={{ fill: '#78716c', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #292524', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#d6d3d1' }} itemStyle={{ color: GREEN }} />
                <Area type="monotone" dataKey="count" stroke={GREEN} fill={GREEN} fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hizmet dağılımı pie */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-200 mb-4">Hizmet Dağılımı</h2>
            {pieData.length === 0 ? (
              <p className="text-stone-500 text-sm text-center py-8">Veri yok</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #292524', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#d6d3d1' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Personel performansı */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-200 mb-4">Personel Performansı</h2>
            {staffBarData.length === 0 ? (
              <p className="text-stone-500 text-sm text-center py-8">Veri yok</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={staffBarData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis type="number" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #292524', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: '#0ea5e9' }} />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detay tablosu */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-200">Rezervasyon Detayları</h2>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Ara..." className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-500 outline-none w-48" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-stone-500 border-b border-stone-800">
                  {['Tarih', 'Saat', 'Müşteri', 'Telefon', 'Kişi', 'Durum', 'Notlar'].map(h => (
                    <th key={h} className="text-left py-2 px-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-stone-600">Eşleşen rezervasyon yok</td></tr>
                ) : (
                  filtered.slice(0, 50).map((r: Record<string, unknown>) => (
                    <tr key={r.id as string} className="border-b border-stone-800/50 hover:bg-stone-800/30">
                      <td className="py-2 px-2 text-stone-300">{r.reserved_date as string}</td>
                      <td className="py-2 px-2 text-stone-400 font-mono">{(r.reserved_time as string)?.slice(0,5)}</td>
                      <td className="py-2 px-2 text-white font-medium">{r.guest_name as string ?? '—'}</td>
                      <td className="py-2 px-2 text-stone-400">{r.guest_phone as string ?? '—'}</td>
                      <td className="py-2 px-2 text-stone-400">{r.party_size as string ?? '—'}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' :
                          r.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                          r.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                          r.status === 'completed' ? 'bg-blue-500/15 text-blue-400' :
                          'bg-stone-800 text-stone-400'
                        }`}>{r.status as string}</span>
                      </td>
                      <td className="py-2 px-2 text-stone-500 max-w-32 truncate">{r.notes as string ?? ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 50 && (
            <p className="text-xs text-stone-600 text-center mt-3">+{filtered.length - 50} kayıt daha var</p>
          )}
        </div>
      </main>
    </div>
  )
}

function KpiCard({ label, value, diff, diffPct, suffix, progress }: {
  label: string; value: number; diff: number; diffPct: number; suffix: string; progress?: boolean
}) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
      <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-bold text-white ${suffix === '₺' ? '' : ''}`}>
        {suffix === '₺' ? `${value.toLocaleString()} ₺` : `${value}${suffix}`}
      </p>
      {diff !== 0 && (
        <p className={`text-xs mt-1 font-semibold flex items-center gap-1 ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <span>{diff >= 0 ? '▲' : '▼'}</span>
          <span>{diffPct}%</span>
        </p>
      )}
      {progress && (
        <div className="mt-2 h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#c9a84c] rounded-full transition-all" style={{ width: `${Math.min(100, value)}%` }} />
        </div>
      )}
    </div>
  )
}
