'use client'

import { useState, useEffect } from 'react'
import type { KrokiZone } from '@/src/types/kroki-zone'
import { ZONE_THEME_LABELS, ZONE_THEME_BG } from '@/src/types/kroki-zone'

const C = {
  red:       '#E53935',
  gold:      '#C8963E',
  espresso:  '#1A1008',
  espressoM: '#2A1A12',
  espressoL: '#3A2518',
  border:    '#4A2E20',
  text:      '#F5ECD7',
  textMuted: '#A08060',
  textFaint: '#5A3828',
}

const MOBILE_BREAKPOINT = 768
const ASPECT_RATIO = 16 / 10

interface Props {
  zones:           KrokiZone[]
  fullZoneIds?:    string[]
  selectedZoneId?: string | null
  onSelect:        (zoneId: string | null, zoneName: string | null) => void
}

export default function ZoneViewer({ zones, fullZoneIds = [], selectedZoneId, onSelect }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isSelAny = zones.some(z => z.id === selectedZoneId)
  const selectedZone = selectedZoneId ? zones.find(z => z.id === selectedZoneId) : null

  const zoneList = zones.map(zone => {
    const isFull = fullZoneIds.includes(zone.id)
    const isSel  = zone.id === selectedZoneId
    const bgImg  = zone.customPhoto ?? ZONE_THEME_BG[zone.theme] ?? ZONE_THEME_BG.ic_mekan

    const thumbSize = isMobile ? 56 : 80
    const cardMinH  = isMobile ? 64 : 72

    return (
      <button
        key={zone.id}
        onClick={() => {
          if (isFull) return
          onSelect(isSel ? null : zone.id, isSel ? null : zone.name)
        }}
        disabled={isFull}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', minHeight: cardMinH, padding: 0,
          borderRadius: 10,
          border: `2px solid ${isSel ? C.red : C.border}`,
          background: isSel ? `${C.red}14` : C.espressoM,
          cursor: isFull ? 'not-allowed' : 'pointer',
          opacity: isFull ? 0.5 : 1,
          overflow: 'hidden',
          textAlign: 'left', fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
      >
        <div style={{
          width: thumbSize, height: thumbSize, flexShrink: 0,
          background: `url(${bgImg}) center/cover`,
          borderRight: `1px solid ${isSel ? C.red : C.border}`,
        }} />

        <div style={{ flex: 1, padding: '10px 12px 10px 0', minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 700,
            color: isSel ? C.red : C.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {zone.name}
          </div>
          <div style={{
            fontSize: 11, color: isSel ? C.red : C.textMuted,
            marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            <span>{ZONE_THEME_LABELS[zone.theme]}</span>
            <span>·</span>
            <span>{zone.capacity} kişi</span>
          </div>
        </div>

        <div style={{ paddingRight: 10 }}>
          {isFull ? (
            <span style={{
              fontSize: 9, fontWeight: 800, color: C.red,
              background: `${C.red}20`, padding: '2px 7px',
              borderRadius: 4, letterSpacing: '0.04em',
            }}>
              DOLU
            </span>
          ) : isSel ? (
            <span style={{ fontSize: 15, color: C.red, fontWeight: 700 }}>✓</span>
          ) : null}
        </div>
      </button>
    )
  })

  const bgImg = selectedZone
    ? (selectedZone.customPhoto ?? ZONE_THEME_BG[selectedZone.theme] ?? ZONE_THEME_BG.ic_mekan)
    : ''
  const isFull = selectedZone ? fullZoneIds.includes(selectedZone.id) : false

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", color: C.text }}>
      {/* ── Flex container: desktop=satır, mobile=sütun (önce preview) ── */}
      <div style={{
        display: 'flex',
        gap: 14,
        alignItems: 'stretch',
        flexDirection: isMobile ? 'column' : 'row',
      }}>

        {/* ══════ LEFT PANEL — Scrollable zone list ══════ */}
        <div style={{
          width: isMobile ? '100%' : '35%',
          minWidth: isMobile ? 0 : 200,
          display: 'flex', flexDirection: 'column',
          order: isMobile ? 2 : 0,
        }}>
          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, color: C.gold }}>
              Bölge Seçin
            </span>
            <span style={{ fontSize: 11, color: C.textMuted }}>(isteğe bağlı)</span>
          </div>

          {zones.length > 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              overflowY: 'auto', maxHeight: isMobile ? 260 : 480, paddingRight: 6,
            }}>
              {zoneList}
            </div>
          ) : (
            <div style={{ padding: '32px 0', textAlign: 'center', color: C.textMuted, fontSize: 13 }}>
              Bu işletme için bölge tanımlanmamış.
            </div>
          )}
        </div>

        {/* ══════ RIGHT PANEL — Large preview ══════ */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          background: C.espresso,
          minHeight: isMobile ? 240 : 400,
          height: '100%',
          order: isMobile ? 1 : 0,
        }}>
          {selectedZone ? (
            <>
              {/* Image container with 16/10 aspect ratio */}
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: `${ASPECT_RATIO}`,
                flexShrink: 0,
                background: `url(${bgImg}) center/cover`,
              }}>
                {/* DOLU overlay */}
                {isFull && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 5,
                  }}>
                    <span style={{
                      fontSize: 28, fontWeight: 900, color: C.red,
                      letterSpacing: '0.1em',
                      textShadow: '0 2px 12px rgba(0,0,0,0.6)',
                      background: `${C.red}25`, padding: '8px 24px',
                      borderRadius: 8, border: `2px solid ${C.red}60`,
                    }}>
                      DOLU
                    </span>
                  </div>
                )}

                {/* Info overlay on image */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
                  padding: '50px 24px 24px',
                }}>
                  <div style={{
                    fontSize: 24, fontWeight: 800, color: '#fff',
                    marginBottom: 4, textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                  }}>
                    {selectedZone.name}
                  </div>
                  <div style={{
                    display: 'flex', gap: 14,
                    fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500,
                  }}>
                    <span>{ZONE_THEME_LABELS[selectedZone.theme]}</span>
                    <span>·</span>
                    <span>{selectedZone.capacity} kişi</span>
                    {selectedZone.tableCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{selectedZone.tableCount} masa</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: isMobile ? 240 : 400,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>🗺️</div>
                <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 500 }}>
                  Bir bölge seçin
                </div>
                <div style={{ fontSize: 11, color: C.textFaint, marginTop: 4 }}>
                  Sol listeden bir bölgeye tıklayarak önizleyin
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── "Fark etmez" — full width below both panels ── */}
      <div style={{ marginTop: 14 }}>
        <button
          onClick={() => onSelect(null, null)}
          style={{
            width: '100%', minHeight: 46,
            background: !isSelAny ? `${C.gold}22` : C.espressoM,
            color: !isSelAny ? C.gold : C.textMuted,
            border: `1.5px solid ${!isSelAny ? C.gold : C.border}`,
            borderRadius: 12, fontSize: 14,
            fontWeight: !isSelAny ? 600 : 400,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          {!isSelAny
            ? '✓ Fark etmez — herhangi bir bölge'
            : '↩ Fark etmez (bölge seçimini kaldır)'}
        </button>
      </div>
    </div>
  )
}
