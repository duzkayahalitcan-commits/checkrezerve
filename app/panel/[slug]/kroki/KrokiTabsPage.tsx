'use client'

import { useState } from 'react'
import KrokiEditorPage from './KrokiEditorPage'
import ZoneEditorPage from './ZoneEditorPage'
import type { KrokiZone } from '@/src/types/kroki-zone'

const C = {
  panel:     '#231510',
  border:    '#4A2E20',
  red:       '#E53935',
  gold:      '#C8963E',
  text:      '#F5ECD7',
  textMuted: '#A08060',
} as const

type Tab = 'masa' | 'bolge'

export default function KrokiTabsPage({
  restaurantId,
  slug,
  initialData,
  initialZones,
}: {
  restaurantId: string
  slug: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any[]
  initialZones: KrokiZone[]
}) {
  const [tab, setTab] = useState<Tab>('masa')

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          6,
        padding:      '8px 14px',
        background:   C.panel,
        borderBottom: `1px solid ${C.border}`,
        flexShrink:   0,
      }}>
        <TabBtn
          active={tab === 'masa'}
          color={C.red}
          onClick={() => setTab('masa')}
        >
          Masa Editörü
        </TabBtn>
        <TabBtn
          active={tab === 'bolge'}
          color={C.gold}
          onClick={() => setTab('bolge')}
        >
          Bölge Sistemi ✦
        </TabBtn>
      </div>

      {/* Editors — toggle visibility to preserve state */}
      <div style={{ display: tab === 'masa' ? 'block' : 'none' }}>
        <KrokiEditorPage
          restaurantId={restaurantId}
          slug={slug}
          initialData={initialData}
        />
      </div>
      <div style={{ display: tab === 'bolge' ? 'block' : 'none' }}>
        <ZoneEditorPage
          restaurantId={restaurantId}
          slug={slug}
          initialZones={initialZones}
        />
      </div>
    </div>
  )
}

function TabBtn({
  active, color, onClick, children,
}: {
  active:   boolean
  color:    string
  onClick:  () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background:   active ? `${color}22` : 'transparent',
        color:        active ? color : C.textMuted,
        border:       `1px solid ${active ? color : C.border}`,
        borderRadius: 7,
        padding:      '5px 16px',
        fontSize:     13,
        fontWeight:   active ? 600 : 400,
        cursor:       'pointer',
        fontFamily:   'DM Sans,sans-serif',
        transition:   'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}
