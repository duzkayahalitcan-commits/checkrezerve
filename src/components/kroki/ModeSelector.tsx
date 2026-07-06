'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <button
      onClick={onClick}
      style={{
        flex: 1,
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
  )
}
