'use client'

import { useState } from 'react'
import { C } from './KrokiEditor'

interface SetupResult {
  name: string
  width: number
  depth: number
  theme: string
}

export default function SetupModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (r: SetupResult) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState('Zemin Kat')
  const [width, setWidth] = useState(12)
  const [depth, setDepth] = useState(10)
  const [theme, setTheme] = useState('indoor')

  // ESC tuşuyla kapat
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel?.()
  }

  const inp: React.CSSProperties = {
    background: C.espressoL,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.text,
    fontSize: 13,
    padding: '8px 10px',
    width: '100%',
    outline: 'none',
    fontFamily: 'DM Sans,sans-serif',
    boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    fontSize: 9,
    color: C.textFaint,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 700,
    marginBottom: 6,
    display: 'block',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000A0',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.() }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 32,
          width: 440,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 24px 80px #00000090',
          position: 'relative',
        }}
      >
        {/* X close button */}
        <button
          onClick={() => onCancel?.()}
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            background: 'none',
            border: 'none',
            color: C.textMuted,
            fontSize: 18,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 6,
            lineHeight: 1,
          }}
          aria-label="Kapat"
        >
          ✕
        </button>

        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.gold, marginBottom: 6 }}>
            Salon Kurulumu
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>
            Yeni bir salon katı oluşturun
          </div>
        </div>

        <div>
          <label style={lbl}>Kat Adı</label>
          <input
            style={inp}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>En (metre)</label>
            <input
              style={inp}
              type="number"
              min={2}
              max={50}
              value={width}
              onChange={e => setWidth(Number(e.target.value))}
            />
          </div>
          <div>
            <label style={lbl}>Boy (metre)</label>
            <input
              style={inp}
              type="number"
              min={2}
              max={50}
              value={depth}
              onChange={e => setDepth(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label style={lbl}>Tema</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['indoor', 'garden', 'rooftop'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 6,
                  border: `1px solid ${theme === t ? C.red : C.border}`,
                  background: theme === t ? `${C.red}20` : C.espressoL,
                  color: theme === t ? C.red : C.textMuted,
                  fontSize: 11,
                  fontWeight: theme === t ? 700 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t === 'indoor' ? 'İç Mekan' : t === 'garden' ? 'Bahçe' : 'Çatı'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onConfirm({ name, width, depth, theme })}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 8,
            border: 'none',
            background: C.red,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Oluştur
        </button>
      </div>
    </div>
  )
}
