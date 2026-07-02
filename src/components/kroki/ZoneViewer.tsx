'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  KrokiZone,
  ZONE_THEME_BG,
  polygonToRect,
} from '@/src/types/kroki-zone'
import ZoneCard from './ZoneCard'

// ─── Renkler ─────────────────────────────────────────────────────────────────
const C = {
  red:       '#E53935',
  espresso:  '#1A0F0A',
  espressoM: '#2A1A12',
  espressoL: '#3A2518',
  panel:     '#231510',
  border:    '#4A2E20',
  gold:      '#C8963E',
  text:      '#F5ECD7',
  textMuted: '#A08060',
  white:     '#FFFFFF',
} as const

// ─── Props ────────────────────────────────────────────────────────────────────
interface ZoneViewerProps {
  zones:           KrokiZone[]
  fullZoneIds?:    string[]          // hangi bölgeler dolu
  selectedZoneId?: string | null
  onSelect:        (zoneId: string | null, zoneName: string | null) => void
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
export default function ZoneViewer({
  zones,
  fullZoneIds = [],
  selectedZoneId,
  onSelect,
}: ZoneViewerProps) {
  const canvasRef   = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ w: 375, h: 220 })

  // Canvas boyutunu izle
  useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect
      // 16:9 benzeri oran, max 280px yükseklik
      setCanvasSize({ w: Math.max(width, 1), h: Math.min(Math.round(width * 0.58), 280) })
    })
    if (canvasRef.current) obs.observe(canvasRef.current)
    return () => obs.disconnect()
  }, [])

  // Aktif tema: seçili bölgenin teması, yoksa ilk bölgenin teması
  const activeZone = zones.find(z => z.id === selectedZoneId)
  const bgTheme    = activeZone?.theme ?? zones[0]?.theme ?? 'ic_mekan'

  const handleZoneClick = useCallback((zone: KrokiZone) => {
    const isFull = fullZoneIds.includes(zone.id)
    if (isFull) return
    if (selectedZoneId === zone.id) {
      onSelect(null, null)          // toggle off
    } else {
      onSelect(zone.id, zone.name)
    }
  }, [fullZoneIds, selectedZoneId, onSelect])

  const hasZones = zones.length > 0

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:           0,
      fontFamily:    "'DM Sans','Inter',sans-serif",
      color:         C.text,
    }}>

      {/* ── Başlık ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 0 12px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, color: C.gold }}>
          Bölge Seçin
        </span>
        <span style={{ fontSize: 12, color: C.textMuted }}>
          (isteğe bağlı)
        </span>
      </div>

      {hasZones ? (
        <>
          {/* ── Harita Overlay ───────────────────────────────────────────────── */}
          <div
            ref={canvasRef}
            style={{
              position:     'relative',
              width:        '100%',
              height:       canvasSize.h,
              borderRadius: 12,
              overflow:     'hidden',
              background:   '#0D0704',
              marginBottom: 14,
              flexShrink:   0,
            }}
          >
            {/* Arka plan görseli */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ZONE_THEME_BG[bgTheme]}
              alt=""
              draggable={false}
              style={{
                position:  'absolute', inset: 0,
                width:     '100%', height: '100%',
                objectFit: 'cover',
                transition:'opacity 0.4s',
                opacity:   selectedZoneId ? 0.55 : 0.65,
              }}
            />

            {/* SVG katmanı */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
              viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
              preserveAspectRatio="none"
            >
              {zones.map(zone => {
                const r      = polygonToRect(zone.polygon, canvasSize.w, canvasSize.h)
                const isFull = fullZoneIds.includes(zone.id)
                const isSel  = zone.id === selectedZoneId
                const isDim  = !!selectedZoneId && !isSel

                // Çok küçük dikdörtgenleri atla
                if (r.w < 4 || r.h < 4) return null

                // Dokunma alanı — min 44×44 mantığı: etiket + padding genişletilmiş
                const touchPad = 8
                const tx = Math.max(0, r.x - touchPad)
                const ty = Math.max(0, r.y - touchPad)
                const tw = Math.min(canvasSize.w - tx, r.w + touchPad * 2)
                const th = Math.min(canvasSize.h - ty, r.h + touchPad * 2)

                return (
                  <g key={zone.id}>
                    {/* Görsel fill */}
                    <rect
                      x={r.x} y={r.y} width={r.w} height={r.h}
                      fill={
                        isFull ? '#E5393560'
                        : isSel  ? zone.color + '60'
                        : isDim  ? '#00000040'
                        : zone.color + '35'
                      }
                      stroke={
                        isFull ? C.red
                        : isSel  ? zone.color
                        : zone.color + '80'
                      }
                      strokeWidth={isSel ? 2.5 : 1.5}
                      rx={4}
                      style={{ transition: 'fill 0.25s, stroke 0.25s' }}
                    />

                    {/* Dolu overlay çizgisi */}
                    {isFull && (
                      <line
                        x1={r.x} y1={r.y} x2={r.x + r.w} y2={r.y + r.h}
                        stroke={C.red} strokeWidth={1.5} opacity={0.5}
                      />
                    )}

                    {/* İsim */}
                    <text
                      x={r.x + r.w / 2}
                      y={r.y + r.h / 2 - (r.h > 44 ? 8 : 0)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={C.white}
                      fontSize={Math.max(10, Math.min(14, r.w / 7))}
                      fontFamily="DM Sans,sans-serif"
                      fontWeight={isSel ? '700' : '500'}
                      opacity={isDim ? 0.45 : 1}
                      style={{ pointerEvents: 'none', transition: 'opacity 0.25s' }}
                    >
                      {zone.name}
                    </text>

                    {/* "Dolu" etiketi */}
                    {isFull && r.h > 36 && (
                      <>
                        <rect
                          x={r.x + r.w / 2 - 18} y={r.y + r.h / 2 + 4}
                          width={36} height={14}
                          fill={C.red} rx={3}
                        />
                        <text
                          x={r.x + r.w / 2} y={r.y + r.h / 2 + 11}
                          textAnchor="middle" dominantBaseline="middle"
                          fill={C.white} fontSize={8} fontWeight="700"
                          fontFamily="DM Sans,sans-serif"
                          style={{ pointerEvents: 'none' }}
                        >
                          DOLU
                        </text>
                      </>
                    )}

                    {/* Genişletilmiş dokunma alanı (şeffaf) */}
                    <rect
                      x={tx} y={ty} width={tw} height={th}
                      fill="transparent"
                      style={{ cursor: isFull ? 'not-allowed' : 'pointer' }}
                      onClick={() => handleZoneClick(zone)}
                    />
                  </g>
                )
              })}
            </svg>
          </div>

          {/* ── ZoneCard Listesi ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {zones.map(zone => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                isSelected={zone.id === selectedZoneId}
                isFull={fullZoneIds.includes(zone.id)}
                onClick={() => handleZoneClick(zone)}
              />
            ))}
          </div>
        </>
      ) : (
        // Bölge tanımlı değil — sessizce geç (liste boş)
        null
      )}

      {/* ── "Fark Etmez" Butonu — her zaman görünür ─────────────────────────── */}
      <AnimatePresence>
        <motion.button
          key="fark-etmez"
          onClick={() => onSelect(null, null)}
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop:    hasZones ? 10 : 0,
            width:        '100%',
            minHeight:    44,
            background:   selectedZoneId === null
              ? `${C.gold}22`
              : C.espressoM,
            color:        selectedZoneId === null ? C.gold : C.textMuted,
            border:       `1.5px solid ${selectedZoneId === null ? C.gold : C.border}`,
            borderRadius: 12,
            fontSize:     14,
            fontWeight:   selectedZoneId === null ? 600 : 400,
            cursor:       'pointer',
            fontFamily:   'DM Sans,sans-serif',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            gap:          8,
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
