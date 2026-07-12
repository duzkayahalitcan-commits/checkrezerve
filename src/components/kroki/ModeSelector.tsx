'use client'

import { useState } from 'react'

const C = {
  panel:     '#231510',
  border:    '#4A2E20',
  red:       '#E53935',
  gold:      '#C8963E',
  text:      '#F5ECD7',
  textMuted: '#A08060',
} as const

type Mode = 'tables' | 'zones'

export default function ModeSelector({
  currentMode,
  onChange,
}: {
  currentMode: Mode
  onChange: (mode: Mode) => void
}) {
  const [mode, setMode] = useState<Mode>(currentMode)

  const handleChange = (newMode: Mode) => {
    setMode(newMode)
    onChange(newMode)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '10px 14px',
        background: C.panel,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <ModeCard
          active={mode === 'tables'}
          icon="📐"
          title="Detaylı Masa Krokisi"
          desc="Masaları tek tek yerleştir"
          onClick={() => handleChange('tables')}
        />
        <ModeCard
          active={mode === 'zones'}
          icon="🗂️"
          title="Bölge Kartları"
          desc="Hazır görsellerle hızlı kurulum"
          onClick={() => handleChange('zones')}
        />
      </div>
      <div style={{
        padding: '6px 14px 8px',
        background: C.panel,
        fontSize: 10,
        color: C.textMuted,
        textAlign: 'center',
        borderBottom: `1px solid ${C.border}`,
        opacity: 0.7,
      }}>
        Aktif mod rezervasyon sayfasında müşterilere gösterilir
      </div>
    </div>
  )
}

function ModeCard({
  active, icon, title, desc, onClick,
}: {
  active: boolean
  icon: string
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          zIndex: 10,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.04em',
          padding: '2px 6px',
          borderRadius: 4,
          ...(active
            ? { background: '#22C55E20', color: '#4ADE80', border: '1px solid #22C55E50' }
            : { background: '#FFFFFF10', color: C.textMuted, border: '1px solid #FFFFFF20' }
          ),
        }}
      >
        {active ? '● AKTİF' : '○ PASİF'}
      </div>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          borderRadius: 10,
          cursor: 'pointer',
          border: `2px solid ${active ? C.red : C.border}`,
          background: active ? `${C.red}15` : '#1A1008',
          transition: 'all 0.15s',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: active ? C.red : C.text,
            marginBottom: 2,
          }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>
            {desc}
          </div>
        </div>
      </button>
    </div>
  )
}
