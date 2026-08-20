'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'

type CalisanRow = {
  calisan_adi: string
  toplam_seans: number
  toplam_gelir: number
  ortalama_gelir: number
}

export default function CalisanGelir({ restaurantId }: { restaurantId: string }) {
  const now = new Date()
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [rows, setRows] = useState<CalisanRow[]>([])
  const [loading, setLoading] = useState(true)
  const maxGelir = Math.max(...rows.map(r => r.toplam_gelir), 1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/panel/calisan-gelir?restaurant_id=${restaurantId}&month=${month}`)
      const data = await res.json()
      setRows(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [restaurantId, month])

  useEffect(() => { load() }, [load])

  const prevMonth = () => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const nextMonth = () => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const exportCSV = () => {
    const header = 'Çalışan,Seans,Toplam Gelir,Ortalama Gelir\n'
    const csv = header + rows.map(r =>
      `"${r.calisan_adi}",${r.toplam_seans},${r.toplam_gelir},${r.ortalama_gelir}`
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `calisan-gelir-${month}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const monthLabel = new Date(month + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-all"><ChevronLeft size={18} /></button>
          <span className="text-white font-semibold text-sm capitalize">{monthLabel}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-all"><ChevronRight size={18} /></button>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 text-stone-400 hover:text-white text-xs font-semibold transition-all">
          <Download size={14} /> CSV
        </button>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="text-center py-10 text-stone-500 text-sm">Yükleniyor...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 text-stone-500 text-sm border border-stone-800 rounded-xl">Bu ay için veri yok</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-700/50">
                <th className="text-left py-3 px-3 font-medium">Çalışan</th>
                <th className="text-right py-3 px-3 font-medium">Seans</th>
                <th className="text-right py-3 px-3 font-medium">Toplam</th>
                <th className="text-right py-3 px-3 font-medium">Ortalama</th>
                <th className="pl-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-stone-800/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-white">{r.calisan_adi}</div>
                  </td>
                  <td className="py-3 px-3 text-right text-stone-300">{r.toplam_seans}</td>
                  <td className="py-3 px-3 text-right text-amber-400 font-semibold">₺{r.toplam_gelir.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-stone-400">₺{r.ortalama_gelir.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${(r.toplam_gelir / maxGelir) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
