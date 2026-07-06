'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KrokiEditorPage from './KrokiEditorPage'
import NewZoneEditorPage from './NewZoneEditorPage'
import ModeSelector from '@/src/components/kroki/ModeSelector'
import type { KrokiZone } from '@/src/types/kroki-zone'

const C = {
  panel:     '#231510',
  border:    '#4A2E20',
  red:       '#E53935',
  gold:      '#C8963E',
  text:      '#F5ECD7',
  textMuted: '#A08060',
} as const

export type Mode = 'tables' | 'zones'

export default function KrokiTabsPage({
  restaurantId,
  slug,
  initialData,
  initialZones,
  initialMode,
}: {
  restaurantId: string
  slug: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any[]
  initialZones: KrokiZone[]
  initialMode?: Mode
}) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(initialMode ?? 'zones')

  // W-100: Mod değişince DB'ye kaydet
  useEffect(() => {
    if (mode && mode !== initialMode) {
      fetch('/api/panel/kroki-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId, kroki_mode: mode }),
      }).catch(() => {})
    }
  }, [mode])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Mode selector */}
      <ModeSelector currentMode={mode} onChange={setMode} />

      {/* Editors */}
      {mode === 'tables' ? (
        <KrokiEditorPage
          restaurantId={restaurantId}
          slug={slug}
          initialData={initialData}
        />
      ) : (
        <NewZoneEditorPage
          restaurantId={restaurantId}
          slug={slug}
          initialZones={initialZones}
        />
      )}
    </div>
  )
}
