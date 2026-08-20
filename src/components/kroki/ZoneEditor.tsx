'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  KrokiZone, ZoneTheme, ZonePoint,
  ZONE_THEME_LABELS, ZONE_THEME_BG,
  emptyZone, rectToPolygon, polygonToRect,
} from '@/src/types/kroki-zone'

// ─── Renk Paleti ─────────────────────────────────────────────────────────────
const C = {
  red:       '#E53935',
  redLight:  '#FFEBEE',
  gold:      '#C8963E',
  espresso:  '#1A0F0A',
  espressoM: '#2A1A12',
  espressoL: '#3A2518',
  panel:     '#231510',
  surface:   '#140C08',
  border:    '#4A2E20',
  text:      '#F5ECD7',
  textMuted: '#A08060',
  white:     '#FFFFFF',
} as const

const PRESET_COLORS = [
  '#E53935', '#D81B60', '#8E24AA', '#3949AB',
  '#039BE5', '#00897B', '#43A047', '#FB8C00',
  '#F4511E', '#6D4C41',
]

// ─── Sabit tema isimleri listesi (5 adet) ────────────────────────────────────
const THEME_ORDER: ZoneTheme[] = ['ic_mekan', 'bahce', 'teras', 'teras_alt', 'sokak']

// ─── Yardımcı: canvas px'e çevir ─────────────────────────────────────────────
function toCanvasPx(
  e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  el: HTMLDivElement,
): { cx: number; cy: number } {
  const rect = el.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  return {
    cx: Math.max(0, Math.min(clientX - rect.left, rect.width)),
    cy: Math.max(0, Math.min(clientY - rect.top,  rect.height)),
  }
}

// ─── Draft rectangle (çizim sırasında) ──────────────────────────────────────
interface DraftRect {
  startX: number
  startY: number
  endX:   number
  endY:   number
}

function draftBounds(d: DraftRect) {
  return {
    x: Math.min(d.startX, d.endX),
    y: Math.min(d.startY, d.endY),
    w: Math.abs(d.endX - d.startX),
    h: Math.abs(d.endY - d.startY),
  }
}

// ─── ZoneEditor Props ────────────────────────────────────────────────────────
interface ZoneEditorProps {
  restaurantId: string
  initialZones: KrokiZone[]
  onSave:       (zones: KrokiZone[]) => Promise<void>
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
export default function ZoneEditor({
  restaurantId: _restaurantId,
  initialZones,
  onSave,
}: ZoneEditorProps) {
  const canvasRef   = useRef<HTMLDivElement>(null)
  const [zones,     setZones]     = useState<KrokiZone[]>(initialZones)
  const [activeId,  setActiveId]  = useState<string | null>(null)
  const [draft,     setDraft]     = useState<DraftRect | null>(null)
  const [drawing,   setDrawing]   = useState(false)
  const [editPanel, setEditPanel] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [mode,      setMode]      = useState<'select' | 'draw'>('select')

  // Seçili bölge
  const activeZone = zones.find(z => z.id === activeId) ?? null

  // Seçili bölgeyi güncelle
  const updateActive = useCallback((patch: Partial<KrokiZone>) => {
    setZones(zs => zs.map(z => z.id === activeId ? { ...z, ...patch } : z))
  }, [activeId])

  // ─── Canvas boyutu ──────────────────────────────────────────────────────────
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 })
  useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setCanvasSize({ w: Math.max(width, 1), h: Math.max(height, 1) })
    })
    if (canvasRef.current) obs.observe(canvasRef.current)
    return () => obs.disconnect()
  }, [])

  // ─── Çizim: mousedown / touchstart ─────────────────────────────────────────
  const onPointerDown = useCallback((
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (mode !== 'draw' || !canvasRef.current) return
    e.preventDefault()
    const { cx, cy } = toCanvasPx(e as React.MouseEvent<HTMLDivElement>, canvasRef.current)
    setDraft({ startX: cx, startY: cy, endX: cx, endY: cy })
    setDrawing(true)
  }, [mode])

  // ─── Çizim: mousemove / touchmove ──────────────────────────────────────────
  const onPointerMove = useCallback((
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!drawing || !canvasRef.current) return
    e.preventDefault()
    const { cx, cy } = toCanvasPx(e as React.MouseEvent<HTMLDivElement>, canvasRef.current)
    setDraft(d => d ? { ...d, endX: cx, endY: cy } : d)
  }, [drawing])

  // ─── Çizim: mouseup / touchend ──────────────────────────────────────────────
  const onPointerUp = useCallback(() => {
    if (!drawing || !draft || !canvasRef.current) return
    setDrawing(false)
    const { x, y, w, h } = draftBounds(draft)
    if (w < 20 || h < 20) { setDraft(null); return }   // çok küçük → iptal

    const polygon = rectToPolygon(x, y, w, h, canvasSize.w, canvasSize.h)
    const newZone = emptyZone({ polygon })
    setZones(zs => [...zs, newZone])
    setActiveId(newZone.id)
    setEditPanel(true)
    setDraft(null)
    setMode('select')
  }, [drawing, draft, canvasSize, zones.length])

  // ─── Bölge seçimi (tıklama) ─────────────────────────────────────────────────
  const onZoneClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (mode === 'select') {
      setActiveId(prev => prev === id ? null : id)
      setEditPanel(true)
    }
  }, [mode])

  // ─── Canvas boş alana tıklama → seçimi kaldır ──────────────────────────────
  const onCanvasClick = useCallback(() => {
    if (mode === 'select') {
      setActiveId(null)
      setEditPanel(false)
    }
  }, [mode])

  // ─── Sil ────────────────────────────────────────────────────────────────────
  const deleteActive = useCallback(() => {
    setZones(zs => zs.filter(z => z.id !== activeId))
    setActiveId(null)
    setEditPanel(false)
  }, [activeId])

  // ─── Kaydet ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await onSave(zones)
    } finally {
      setSaving(false)
    }
  }, [zones, onSave])

  // ─── Drag: bölge taşıma ─────────────────────────────────────────────────────
  const dragState = useRef<{
    zoneId: string
    startMx: number; startMy: number
    origPolygon: ZonePoint[]
  } | null>(null)

  const onZonePointerDown = useCallback((
    id: string,
    e: React.MouseEvent<SVGRectElement>,
  ) => {
    if (mode !== 'select') return
    e.stopPropagation()
    const zone = zones.find(z => z.id === id)
    if (!zone) return
    dragState.current = {
      zoneId: id,
      startMx: e.clientX,
      startMy: e.clientY,
      origPolygon: zone.polygon,
    }
  }, [mode, zones])

  const onDragMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const ds = dragState.current
    if (!ds || !canvasRef.current) return
    const dx = (e.clientX - ds.startMx) / canvasSize.w
    const dy = (e.clientY - ds.startMy) / canvasSize.h
    setZones(zs => zs.map(z => {
      if (z.id !== ds.zoneId) return z
      const newPoly = ds.origPolygon.map(p => ({
        x: Math.max(0, Math.min(1, p.x + dx)),
        y: Math.max(0, Math.min(1, p.y + dy)),
      }))
      return { ...z, polygon: newPoly }
    }))
  }, [canvasSize])

  const onDragEnd = useCallback(() => {
    dragState.current = null
  }, [])

  // ─── Temaya ait arka plan rengi (overlay için) ───────────────────────────────
  const bgImage = activeZone
    ? ZONE_THEME_BG[activeZone.theme]
    : ZONE_THEME_BG['ic_mekan']

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      width:         '100%',
      height:        '100vh',
      background:    C.surface,
      color:         C.text,
      fontFamily:    "'DM Sans','Inter',sans-serif",
      userSelect:    'none',
      overflow:      'hidden',
    }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            8,
        padding:        '10px 16px',
        background:     C.panel,
        borderBottom:   `1px solid ${C.border}`,
        flexShrink:     0,
      }}>
        <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 17, color: C.gold, marginRight: 8 }}>
          Bölge Editörü
        </span>

        {/* Mod butonları */}
        <ToolBtn
          active={mode === 'select'}
          onClick={() => setMode('select')}
          title="Seç / Taşı"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 0l16 12-7 1-4 8z"/>
          </svg>
        </ToolBtn>

        <ToolBtn
          active={mode === 'draw'}
          onClick={() => { setMode('draw'); setActiveId(null); setEditPanel(false) }}
          title="Yeni Bölge Çiz"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="12" y1="3" x2="12" y2="21"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
          </svg>
        </ToolBtn>

        <div style={{ width: 1, height: 22, background: C.border }} />

        <span style={{ fontSize: 12, color: C.textMuted }}>
          {mode === 'draw'
            ? '↖ Dikdörtgen çizmek için sürükle'
            : `${zones.length} bölge`}
        </span>

        <div style={{ flex: 1 }} />

        {/* Kaydet */}
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          style={{
            background:   saving ? C.espressoM : C.red,
            color:        C.white,
            border:       'none',
            borderRadius: 8,
            padding:      '7px 20px',
            fontSize:     13,
            fontWeight:   600,
            cursor:       saving ? 'wait' : 'pointer',
            fontFamily:   'DM Sans,sans-serif',
          }}
        >
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </motion.button>
      </div>

      {/* ── Gövde ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Canvas ──────────────────────────────────────────────────────────── */}
        <div
          ref={canvasRef}
          onClick={onCanvasClick}
          onMouseDown={onPointerDown}
          onMouseMove={e => { onPointerMove(e); onDragMove(e) }}
          onMouseUp={() => { onPointerUp(); onDragEnd() }}
          onMouseLeave={onDragEnd}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
          style={{
            flex:      1,
            position:  'relative',
            overflow:  'hidden',
            cursor:    mode === 'draw' ? 'crosshair' : 'default',
            background: '#0D0704',
          }}
        >
          {/* Arka plan görseli */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt=""
            draggable={false}
            style={{
              position:   'absolute', inset: 0,
              width:      '100%', height: '100%',
              objectFit:  'cover',
              opacity:    0.45,
              pointerEvents: 'none',
            }}
          />

          {/* Bölgeler SVG katmanı */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
            viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
            preserveAspectRatio="none"
          >
            {zones.map(zone => {
              const r = polygonToRect(zone.polygon, canvasSize.w, canvasSize.h)
              const isActive = zone.id === activeId
              return (
                <g key={zone.id}>
                  <rect
                    x={r.x} y={r.y} width={r.w} height={r.h}
                    fill={zone.color + (isActive ? '55' : '33')}
                    stroke={isActive ? zone.color : zone.color + '99'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeDasharray={isActive ? undefined : '6 3'}
                    rx={4}
                    style={{ cursor: mode === 'select' ? 'move' : 'default' }}
                    onClick={e => onZoneClick(zone.id, e)}
                    onMouseDown={e => onZonePointerDown(zone.id, e)}
                  />
                  {/* İsim etiketi */}
                  <text
                    x={r.x + r.w / 2}
                    y={r.y + r.h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={C.white}
                    fontSize={Math.max(11, Math.min(16, r.w / 8))}
                    fontFamily="DM Sans,sans-serif"
                    fontWeight="600"
                    style={{ pointerEvents: 'none', textShadow: '0 1px 4px #000' }}
                  >
                    {zone.name}
                  </text>
                  {/* Kapasite etiketi */}
                  {r.h > 40 && (
                    <text
                      x={r.x + r.w / 2}
                      y={r.y + r.h / 2 + Math.max(11, Math.min(16, r.w / 8)) + 4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={C.white + 'BB'}
                      fontSize={Math.max(9, Math.min(12, r.w / 10))}
                      fontFamily="DM Sans,sans-serif"
                      style={{ pointerEvents: 'none' }}
                    >
                      {zone.capacity} kişi · {zone.tableCount} masa
                    </text>
                  )}
                </g>
              )
            })}

            {/* Draft rectangle (çizilirken) */}
            {draft && (() => {
              const { x, y, w, h } = draftBounds(draft)
              return (
                <rect
                  x={x} y={y} width={w} height={h}
                  fill={C.red + '22'}
                  stroke={C.red}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  rx={4}
                  style={{ pointerEvents: 'none' }}
                />
              )
            })()}
          </svg>

          {/* Boş durum */}
          {zones.length === 0 && mode === 'select' && (
            <div style={{
              position:      'absolute', inset: 0,
              display:       'flex', flexDirection: 'column',
              alignItems:    'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 38, marginBottom: 12 }}>🗺️</div>
              <p style={{ color: C.textMuted, fontSize: 14, textAlign: 'center' }}>
                Yukarıdan <strong style={{ color: C.text }}>Yeni Bölge Çiz</strong> modunu seç<br/>
                ve tuval üzerine sürükle
              </p>
            </div>
          )}
        </div>

        {/* ── Sağ Panel (düzenleme) ────────────────────────────────────────────── */}
        <AnimatePresence>
          {editPanel && activeZone && (
            <motion.div
              key="edit-panel"
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0,   opacity: 1 }}
              exit={{   x: 320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                width:        300,
                flexShrink:   0,
                background:   C.panel,
                borderLeft:   `1px solid ${C.border}`,
                display:      'flex',
                flexDirection:'column',
                overflow:     'hidden',
              }}
            >
              {/* Panel başlık */}
              <div style={{
                display:     'flex', alignItems: 'center', justifyContent: 'space-between',
                padding:     '14px 16px',
                borderBottom:`1px solid ${C.border}`,
                flexShrink:  0,
              }}>
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 15, color: C.gold }}>
                  Bölgeyi Düzenle
                </span>
                <button
                  onClick={() => { setEditPanel(false); setActiveId(null) }}
                  style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                >×</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

                {/* ─ İsim ──────────────────────────────────────────────────── */}
                <FieldLabel>Bölge Adı</FieldLabel>
                <input
                  value={activeZone.name}
                  onChange={e => updateActive({ name: e.target.value })}
                  style={inputStyle}
                  placeholder="örn: Teras, Bahçe…"
                />

                {/* ─ Renk ──────────────────────────────────────────────────── */}
                <FieldLabel>Renk</FieldLabel>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {PRESET_COLORS.map(col => (
                    <button
                      key={col}
                      onClick={() => updateActive({ color: col })}
                      style={{
                        width:        26, height: 26,
                        borderRadius: '50%',
                        background:   col,
                        border:       activeZone.color === col
                          ? `3px solid ${C.white}`
                          : `2px solid ${C.border}`,
                        cursor:       'pointer',
                      }}
                    />
                  ))}
                  {/* Özel renk */}
                  <label style={{ position: 'relative', cursor: 'pointer' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background:   activeZone.color,
                      border:       `2px solid ${C.border}`,
                      display:      'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize:     12, color: C.white,
                    }}>✏️</div>
                    <input
                      type="color"
                      value={activeZone.color}
                      onChange={e => updateActive({ color: e.target.value })}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    />
                  </label>
                </div>

                {/* ─ Kapasite ──────────────────────────────────────────────── */}
                <FieldLabel>Kapasite (kişi)</FieldLabel>
                <input
                  type="number" min={1} max={999}
                  value={activeZone.capacity}
                  onChange={e => updateActive({ capacity: Number(e.target.value) })}
                  style={inputStyle}
                />

                {/* ─ Masa Sayısı ───────────────────────────────────────────── */}
                <FieldLabel>Masa Sayısı</FieldLabel>
                <input
                  type="number" min={0} max={200}
                  value={activeZone.tableCount}
                  onChange={e => updateActive({ tableCount: Number(e.target.value) })}
                  style={inputStyle}
                />

                {/* ─ Tema ──────────────────────────────────────────────────── */}
                <FieldLabel>Arka Plan Teması</FieldLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {THEME_ORDER.map(tid => (
                    <button
                      key={tid}
                      onClick={() => updateActive({ theme: tid })}
                      style={{
                        position:     'relative',
                        borderRadius: 8,
                        overflow:     'hidden',
                        border:       activeZone.theme === tid
                          ? `2px solid ${C.red}`
                          : `2px solid ${C.border}`,
                        cursor:       'pointer',
                        background:   'none',
                        padding:      0,
                        height:       60,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ZONE_THEME_BG[tid]}
                        alt={ZONE_THEME_LABELS[tid]}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position:   'absolute', inset: 0,
                        background: activeZone.theme === tid ? `${C.red}33` : '#00000055',
                        display:    'flex', alignItems: 'flex-end',
                        padding:    '4px 6px',
                      }}>
                        <span style={{
                          fontSize:   10,
                          color:      C.white,
                          fontWeight: activeZone.theme === tid ? 700 : 400,
                          lineHeight: 1.2,
                        }}>
                          {ZONE_THEME_LABELS[tid]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* ─ Sil ───────────────────────────────────────────────────── */}
                <motion.button
                  onClick={deleteActive}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    width:        '100%',
                    background:   '#B71C1C20',
                    color:        '#EF5350',
                    border:       '1px solid #B71C1C60',
                    borderRadius: 8,
                    padding:      '9px 0',
                    fontSize:     13,
                    cursor:       'pointer',
                    fontFamily:   'DM Sans,sans-serif',
                  }}
                >
                  🗑 Bölgeyi Sil
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Sol kenar: bölge listesi ────────────────────────────────────────── */}
        <div style={{
          width:        200,
          flexShrink:   0,
          background:   C.espresso,
          borderRight:  `1px solid ${C.border}`,
          display:      'flex',
          flexDirection:'column',
          overflow:     'hidden',
          order:        -1,   // canvas'ın solunda
        }}>
          <div style={{
            padding:     '12px 14px 8px',
            fontSize:    11,
            color:       C.textMuted,
            fontWeight:  600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            borderBottom:`1px solid ${C.border}`,
            flexShrink: 0,
          }}>
            Bölgeler
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {zones.length === 0 && (
              <p style={{ padding: '16px 14px', fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
                Henüz bölge yok. Çizim modunda tuval üzerine dikdörtgen çiz.
              </p>
            )}
            {zones.map(zone => (
              <ZoneListItem
                key={zone.id}
                zone={zone}
                isActive={zone.id === activeId}
                onClick={() => {
                  setActiveId(zone.id)
                  setEditPanel(true)
                  setMode('select')
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Alt Bileşenler ───────────────────────────────────────────────────────────

const C2 = {
  red:       '#E53935',
  gold:      '#C8963E',
  espressoM: '#2A1A12',
  espressoL: '#3A2518',
  border:    '#4A2E20',
  text:      '#F5ECD7',
  textMuted: '#A08060',
  white:     '#FFFFFF',
}

function ToolBtn({
  active, onClick, title, children,
}: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      title={title}
      style={{
        background:   active ? `${C2.red}25` : C2.espressoL,
        color:        active ? C2.red : C2.textMuted,
        border:       `1px solid ${active ? C2.red : C2.border}`,
        borderRadius: 7,
        width:        32, height: 32,
        display:      'flex', alignItems: 'center', justifyContent: 'center',
        cursor:       'pointer',
      }}
    >
      {children}
    </motion.button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: C2.textMuted, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width:        '100%',
  boxSizing:    'border-box',
  background:   C2.espressoM,
  border:       `1px solid ${C2.border}`,
  borderRadius: 7,
  color:        C2.text,
  padding:      '8px 10px',
  fontSize:     13,
  fontFamily:   'DM Sans,sans-serif',
  marginBottom: 14,
  outline:      'none',
}

function ZoneListItem({
  zone, isActive, onClick,
}: {
  zone: KrokiZone; isActive: boolean; onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: '#3A251888' }}
      style={{
        width:        '100%',
        display:      'flex', alignItems: 'center', gap: 8,
        padding:      '10px 14px',
        background:   isActive ? `${zone.color}20` : 'transparent',
        border:       'none',
        borderLeft:   `3px solid ${isActive ? zone.color : 'transparent'}`,
        cursor:       'pointer',
        textAlign:    'left',
      }}
    >
      <div style={{
        width: 12, height: 12, borderRadius: 3,
        background: zone.color, flexShrink: 0,
      }} />
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontSize: 13, color: C2.text, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {zone.name}
        </div>
        <div style={{ fontSize: 11, color: C2.textMuted }}>
          {zone.capacity} kişi · {zone.tableCount} masa
        </div>
      </div>
    </motion.button>
  )
}
