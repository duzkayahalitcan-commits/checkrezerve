'use client'

import { useState } from 'react'
import { LayoutGrid, Map } from 'lucide-react'
import TableManager from './TableManager'
import FloorPlanEditor from './FloorPlanEditor'

type Table = {
  id: string
  label: string
  capacity: number
  area_id: string | null
  x: number
  y: number
  width: number
  height: number
  shape: 'rect' | 'circle'
  rotation: number
  is_active: boolean
}

type SpecialArea = {
  id: string
  name: string
  capacity: number
  color: string | null
}

export default function MasalarContentClient({
  tables,
  areas,
  restaurantId,
}: {
  tables: Table[]
  areas: SpecialArea[]
  restaurantId: string
}) {
  const [view, setView] = useState<'kroki' | 'liste'>('kroki')

  return (
    <div className="space-y-4">
      {/* View switcher */}
      <div className="flex gap-1.5 bg-stone-950 border border-stone-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setView('kroki')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'kroki' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-white'
          }`}
        >
          <Map size={14} /> Kroki
        </button>
        <button
          onClick={() => setView('liste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'liste' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-white'
          }`}
        >
          <LayoutGrid size={14} /> Liste
        </button>
      </div>

      {view === 'kroki' ? (
        <FloorPlanEditor
          tables={tables}
          areas={areas}
          restaurantId={restaurantId}
        />
      ) : (
        <TableManager
          tables={tables}
          areas={areas}
          restaurantId={restaurantId}
        />
      )}
    </div>
  )
}
