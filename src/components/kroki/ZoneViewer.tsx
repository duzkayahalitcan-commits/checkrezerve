'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { KrokiZone } from '@/src/types/kroki-zone'
import { ZONE_THEME_LABELS, ZONE_THEME_BG } from '@/src/types/kroki-zone'

const C = {
  red:       '#E53935',
  gold:      '#C8963E',
  espressoM: '#2A1A12',
  espressoL: '#3A2518',
  border:    '#4A2E20',
  text:      '#F5ECD7',
  textMuted: '#A08060',
}

interface Props {
  zones:           KrokiZone[]
  fullZoneIds?:    string[]
  selectedZoneId?: string | null
  onSelect:        (zoneId: string | null, zoneName: string | null) => void
}

export default function ZoneViewer({ zones, fullZoneIds = [], selectedZoneId, onSelect }: Props) {
  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", color: C.text }}>
      {/* Başlık */}
      <div style={{ padding: '0 0 14px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, color: C.gold }}>
          Bölge Seçin
        </span>
        <span style={{ fontSize: 12, color: C.textMuted }}>(isteğe bağlı)</span>
      </div>

      {/* Kart grid'i */}
      {zones.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {zones.map(zone => {
            const isFull = fullZoneIds.includes(zone.id)
            const isSel  = zone.id === selectedZoneId
            const bgImg  = zone.customPhoto ?? ZONE_THEME_BG[zone.theme] ?? ZONE_THEME_BG.ic_mekan

            return (
              <motion.button
                key={zone.id}
                onClick={() => {
                  if (isFull) return
                  onSelect(isSel ? null : zone.id, isSel ? null : zone.name)
                }}
                whileTap={{ scale: 0.98 }}
                disabled={isFull}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            14,
                  width:          '100%',
                  minHeight:      68,
                  padding:        0,
                  borderRadius:    12,
                  border:         `2px solid ${isSel ? C.red : C.border}`,
                  background:     isSel ? `${C.red}12` : C.espressoM,
                  cursor:         isFull ? 'not-allowed' : 'pointer',
                  opacity:        isFull ? 0.55 : 1,
                  overflow:       'hidden',
                  textAlign:      'left',
                  fontFamily:     'inherit',
                  transition:     'all 0.2s',
                }}
              >
                {/* Görsel */}
                <div
                  style={{
                    width:          80,
                    height:         68,
                    flexShrink:     0,
                    background:     `url(${bgImg}) center/cover`,
                    borderRight:    `1px solid ${C.border}`,
                  }}
                />

                {/* Bilgi */}
                <div style={{ flex: 1, padding: '8px 12px 8px 0' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isSel ? C.red : C.text }}>
                    {zone.name}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, display: 'flex', gap: 8 }}>
                    <span>{ZONE_THEME_LABELS[zone.theme]}</span>
                    <span>·</span>
                    <span>{zone.capacity} kişi</span>
                    {zone.tableCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{zone.tableCount} masa</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Dolu / seçili badge */}
                <div style={{ paddingRight: 14 }}>
                  {isFull ? (
                    <span style={{ fontSize: 10, color: C.red, fontWeight: 700, background: `${C.red}20`, padding: '3px 8px', borderRadius: 4 }}>
                      DOLU
                    </span>
                  ) : isSel ? (
                    <span style={{ fontSize: 16 }}>✓</span>
                  ) : null}
                </div>
              </motion.button>
            )
          })}
        </div>
      ) : (
        <div style={{ padding: '40px 0', textAlign: 'center', color: C.textMuted, fontSize: 13 }}>
          Bu işletme için bölge tanımlanmamış.
        </div>
      )}

      {/* "Fark Etmez" butonu */}
      <AnimatePresence>
        <motion.button
          key="fark-etmez"
          onClick={() => onSelect(null, null)}
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop:    12,
            width:        '100%',
            minHeight:    44,
            background:   selectedZoneId === null ? `${C.gold}22` : C.espressoM,
            color:        selectedZoneId === null ? C.gold : C.textMuted,
            border:       `1.5px solid ${selectedZoneId === null ? C.gold : C.border}`,
            borderRadius: 12,
            fontSize:     14,
            fontWeight:   selectedZoneId === null ? 600 : 400,
            cursor:       'pointer',
            fontFamily:   'inherit',
            transition:   'all 0.2s',
          }}
        >
          {selectedZoneId === null
            ? '✓ Fark etmez — herhangi bir bölge'
            : '↩ Fark etmez (bölge seçimini kaldır)'}
        </motion.button>
      </AnimatePresence>
    </div>
  )
}
