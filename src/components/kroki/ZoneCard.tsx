'use client'

import { motion } from 'motion/react'
import { KrokiZone, ZONE_THEME_LABELS } from '@/src/types/kroki-zone'

interface ZoneCardProps {
  zone:       KrokiZone
  isSelected: boolean
  isFull:     boolean
  onClick:    () => void
}

const C = {
  red:       '#E53935',
  redDark:   '#B71C1C',
  espresso:  '#1A0F0A',
  espressoM: '#2A1A12',
  espressoL: '#3A2518',
  border:    '#4A2E20',
  gold:      '#C8963E',
  text:      '#F5ECD7',
  textMuted: '#A08060',
  white:     '#FFFFFF',
} as const

export default function ZoneCard({ zone, isSelected, isFull, onClick }: ZoneCardProps) {
  return (
    <motion.button
      onClick={isFull ? undefined : onClick}
      whileTap={isFull ? {} : { scale: 0.97 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      disabled={isFull}
      style={{
        width:        '100%',
        textAlign:    'left',
        background:   isSelected
          ? `linear-gradient(135deg, ${zone.color}28 0%, ${zone.color}10 100%)`
          : C.espressoM,
        border:       `1.5px solid ${isSelected ? zone.color : C.border}`,
        borderRadius: 12,
        padding:      '14px 16px',
        cursor:       isFull ? 'not-allowed' : 'pointer',
        display:      'flex',
        alignItems:   'center',
        gap:          14,
        opacity:      isFull ? 0.6 : 1,
        transition:   'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Renk şerit */}
      <div style={{
        width:        4,
        alignSelf:    'stretch',
        borderRadius: 4,
        background:   isFull ? C.red : zone.color,
        flexShrink:   0,
        minHeight:    40,
      }} />

      {/* İçerik */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontFamily:   'Playfair Display,serif',
            fontSize:     15,
            fontWeight:   600,
            color:        isFull ? C.textMuted : C.text,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {zone.name}
          </span>

          {/* Dolu etiketi */}
          {isFull && (
            <span style={{
              background:   C.red,
              color:        C.white,
              fontSize:     10,
              fontWeight:   700,
              borderRadius: 4,
              padding:      '2px 6px',
              letterSpacing: 0.5,
              flexShrink:   0,
            }}>
              DOLU
            </span>
          )}

          {/* Seçili tick */}
          {isSelected && !isFull && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                marginLeft:   'auto',
                width:        20, height: 20,
                borderRadius: '50%',
                background:   zone.color,
                display:      'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink:   0,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Chip icon="👥" label={`${zone.capacity} kişi`} muted={isFull} />
          <Chip icon="🪑" label={`${zone.tableCount} masa`} muted={isFull} />
          <Chip icon="📍" label={ZONE_THEME_LABELS[zone.theme]} muted={isFull} />
        </div>
      </div>
    </motion.button>
  )
}

function Chip({ icon, label, muted }: { icon: string; label: string; muted?: boolean }) {
  return (
    <span style={{
      fontSize:   11,
      color:      muted ? '#6D4C41' : '#A08060',
      display:    'flex',
      alignItems: 'center',
      gap:        3,
    }}>
      <span style={{ fontSize: 10 }}>{icon}</span>
      {label}
    </span>
  )
}
