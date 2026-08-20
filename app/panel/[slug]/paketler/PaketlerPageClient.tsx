'use client'

import { useState } from 'react'
import { Package, DollarSign } from 'lucide-react'
import PaketlerManager from './PaketlerManager'
import OdemeTakip from './OdemeTakip'

type Paket = {
  id: string; ad: string; toplam_seans: number; gecerlilik_gun: number
  fiyat: number | null; hizmet_id: string | null; aktif: boolean
}
type Service = { id: string; name: string }

export default function PaketlerPageClient({
  initialPaketler, services, restaurantId,
}: {
  initialPaketler: Paket[]; services: Service[]; restaurantId: string
}) {
  const [tab, setTab] = useState<'paketler' | 'odemeler'>('paketler')

  return (
    <div>
      <div className="px-6 pt-6 pb-0 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Paketler</h1>
        <p className="text-xs text-stone-500 mt-0.5">{initialPaketler.length} paket</p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setTab('paketler')}
            className={`pb-3 flex items-center gap-2 text-sm font-semibold border-b-2 transition-all ${
              tab === 'paketler' ? 'text-red-400 border-red-500' : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Package size={15} /> Paketler
          </button>
          <button
            onClick={() => setTab('odemeler')}
            className={`pb-3 flex items-center gap-2 text-sm font-semibold border-b-2 transition-all ${
              tab === 'odemeler' ? 'text-red-400 border-red-500' : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <DollarSign size={15} /> Bekleyen Ödemeler
          </button>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {tab === 'paketler' ? (
          <PaketlerManager paketler={initialPaketler} services={services} restaurantId={restaurantId} />
        ) : (
          <OdemeTakip restaurantId={restaurantId} />
        )}
      </main>
    </div>
  )
}
