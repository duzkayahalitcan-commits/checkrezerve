'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

interface CiroData {
  bugun_ciro: number
  bu_hafta_ciro: number
  bu_ay_ciro: number
  bu_ay_rezervasyon: number
  gecen_ay_ciro: number
  degisim_yuzde: number | null
}

export default function CiroDashboard({ restaurantId }: { restaurantId: string }) {
  const [data, setData] = useState<CiroData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/panel/ciro-ozet?restaurant_id=${restaurantId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [restaurantId])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-stone-800/30 border border-stone-700 rounded-xl p-4 animate-pulse h-24" />
        ))}
      </div>
    )
  }

  if (!data) return null

  const cards = [
    {
      label: 'Bugün',
      value: `₺${data.bugun_ciro.toLocaleString()}`,
      icon: DollarSign,
      color: '#E53935',
    },
    {
      label: 'Bu Hafta',
      value: `₺${data.bu_hafta_ciro.toLocaleString()}`,
      icon: TrendingUp,
      color: '#F59E0B',
    },
    {
      label: 'Bu Ay',
      value: `₺${data.bu_ay_ciro.toLocaleString()}`,
      icon: Calendar,
      color: '#10B981',
      degisim: data.degisim_yuzde,
    },
    {
      label: 'Rezervasyon (Ay)',
      value: data.bu_ay_rezervasyon.toString(),
      icon: Calendar,
      color: '#8B5CF6',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div key={i} className="bg-stone-800/30 border border-stone-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{card.label}</span>
            <card.icon size={16} style={{ color: card.color }} />
          </div>
          <div className="text-lg font-bold text-white">{card.value}</div>
          {'degisim' in card && card.degisim != null && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${card.degisim >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {card.degisim >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              %{Math.abs(card.degisim)} geçen aya göre
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
