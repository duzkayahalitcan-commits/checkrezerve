'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { THEMES, TABLE_TYPES, BG_IMAGES, TABLE_IMAGES, PX_PER_METER, GRID_SIZE } from '../../lib/kroki-config'
import SetupModal from './SetupModal'
import TableNode from './TableNode'

// ─── Renk paleti ────────────────────────────────────────────────────────────
export const C = {
  red: '#E53935', espresso: '#2B1B17', espressoL: '#3D2820', espressoM: '#4A3028',
  gold: '#D4A373', goldDim: '#A07850', surface: '#1A1008', panel: '#221510',
  border: '#3D2820', text: '#F5EDE4', textMuted: '#9E7A60', textFaint: '#5A3828',
}

const PX = PX_PER_METER
const GRID = GRID_SIZE
const MIN_ZOOM = 0.1
const MAX_ZOOM = 4.0
const ZOOM_STEP = 0.1
const TYPES = TABLE_TYPES

interface Table {
  id: string
  typeId: string
  x: number
  y: number
  label: string
  rotation: number
}

interface Floor {
  id: string
  label: string
  theme: string
  canvasW: number
  canvasH: number
  tables: Table[]
}

export default function KrokiEditor({
  initialData,
  restaurantId,
  onSave,
}: {
  initialData: Floor[]
  restaurantId: string
  onSave?: (data: Floor[]) => void
}) {
  const [floors, setFloors] = useState<Floor[]>(initialData)
  const [activeFloor, setActiveFloor] = useState<string | null>(
    initialData.length > 0 ? initialData[0].id : null
  )
  const [showSetup, setShowSetup] = useState(initialData.length === 0)
  const [editingFloor, setEditingFloor] = useState<string | null>(null)
  const [floorDraft, setFloorDraft] = useState('')
  const [showThemes, setShowThemes] = useState(false)
  const [zoom, setZoom] = useState(0.75)
  const [pan, setPan] = useState({ x: 40, y: 20 })
  const [selType, setSelType] = useState<string | null>(null)
  const [selTable, setSelTable] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [freeMove, setFreeMove] = useState(false)
  const [counter, setCounter] = useState(
    initialData.reduce((max, f) => Math.max(max, f.tables.length), 0) + 1
  )

  const svgRef = useRef<SVGSVGElement>(null)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })
  const [containerSize, setContainerSize] = useState({ w: 1200, h: 800 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const floor = floors.find((f: Floor) => f.id === activeFloor)
  const selTbl = floor?.tables.find((t: Table) => t.id === selTable)
  const selTp = selTbl ? TYPES.find((t: { id: string }) => t.id === selTbl.typeId) : null

  const clamp = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z))

  const snap = (v: number, grid: number, free: boolean) =>
    free ? Math.round(v) : Math.round(v / grid) * grid

  const zoomAt = useCallback((delta: number, cx: number, cy: number) => {
    setHasUserZoomed(true)
    setZoom(z => {
      const nz = clamp(+(z + delta).toFixed(2))
      // viewBox-based zoom: keep the point under cursor stable
      const r = svgRef.current?.getBoundingClientRect()
      if (r) {
        const mx = cx - r.left
        const my = cy - r.top
        setPan(p => ({
          x: p.x + mx * (containerSize.w / z - containerSize.w / nz) / (containerSize.w / z),
          y: p.y + my * (containerSize.h / z - containerSize.h / nz) / (containerSize.h / z),
        }))
      }
      return nz
    })
  }, [containerSize])

  // ─── Wheel zoom ──────────────────────────────────────────────────────────
  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const r = svgRef.current!.getBoundingClientRect()
      zoomAt(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP, e.clientX - r.left, e.clientY - r.top)
    },
    [zoomAt]
  )

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // ─── Keyboard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setFreeMove(true)
      if (e.key === 'Escape') { setSelType(null); setSelTable(null) }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selTable) {
        setFloors(fs =>
          fs.map(f =>
            f.id === activeFloor
              ? { ...f, tables: f.tables.filter(t => t.id !== selTable) }
              : f
          )
        )
        setSelTable(null)
      }
      if ((e.key === 'r' || e.key === 'R') && selTable) {
        setFloors(fs =>
          fs.map(f =>
            f.id === activeFloor
              ? {
                  ...f,
                  tables: f.tables.map(t =>
                    t.id === selTable ? { ...t, rotation: ((t.rotation || 0) + 45) % 360 } : t
                  ),
                }
              : f
          )
        )
      }
      const r = svgRef.current?.getBoundingClientRect()
      if (!r) return
      if (e.key === '+' || e.key === '=') zoomAt(ZOOM_STEP, r.width / 2, r.height / 2)
      if (e.key === '-') zoomAt(-ZOOM_STEP, r.width / 2, r.height / 2)
      if (e.key === '0') { setZoom(0.75); setPan({ x: 40, y: 20 }) }
    }
    const ku = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setFreeMove(false)
    }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    return () => {
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
    }
  }, [zoomAt, selTable, activeFloor])

  const svgXY = (cx: number, cy: number) => {
    const r = svgRef.current!.getBoundingClientRect()
    // viewBox-based coordinate: mouse offset relative to SVG, scaled by (viewBoxSize / containerSize)
    const vb = viewBox.split(' ').map(Number)
    return {
      x: vb[0] + (cx - r.left) * (vb[2] / r.width),
      y: vb[1] + (cy - r.top) * (vb[3] / r.height),
    }
  }

  // ─── Canvas click — masa yerleştir ──────────────────────────────────────
  const onCanvasClick = (e: React.MouseEvent) => {
    if (e.button !== 0 || !selType || !floor) return
    const type = TYPES.find(t => t.id === selType)
    if (!type) return
    const { x, y } = svgXY(e.clientX, e.clientY)
    const t: Table = {
      id: crypto.randomUUID(),
      typeId: type.id,
      x: snap(x, GRID, freeMove),
      y: snap(y, GRID, freeMove),
      label: `T${counter}`,
      rotation: 0,
    }
    setCounter(c => c + 1)
    setFloors(fs =>
      fs.map(f => (f.id === activeFloor ? { ...f, tables: [...f.tables, t] } : f))
    )
    setSelTable(t.id)
    setSelType(null)
  }

  // ─── Table mouse down ───────────────────────────────────────────────────
  const onTableMD = (e: React.MouseEvent, tid: string) => {
    e.stopPropagation()
    if (e.button !== 0) return
    setSelTable(tid)
    setSelType(null)
    const { x, y } = svgXY(e.clientX, e.clientY)
    const t = floor?.tables.find(t => t.id === tid)
    if (!t) return
    setDragging({ id: tid, ox: x - t.x, oy: y - t.y })
  }

  // ─── SVG mouse events ──────────────────────────────────────────────────
  const onSvgMD = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) {
      e.preventDefault()
      isPanning.current = true
      panStart.current = { x: e.clientX, y: e.clientY }
      panOrigin.current = { ...pan }
    }
    if (e.button === 0 && !selType) setSelTable(null)
  }

  const onSvgMM = (e: React.MouseEvent) => {
    if (isPanning.current) {
      setPan({
        x: panOrigin.current.x + e.clientX - panStart.current.x,
        y: panOrigin.current.y + e.clientY - panStart.current.y,
      })
      return
    }
    if (dragging && floor) {
      const { x, y } = svgXY(e.clientX, e.clientY)
      setFloors(fs =>
        fs.map(f =>
          f.id === activeFloor
            ? {
                ...f,
                tables: f.tables.map(t =>
                  t.id === dragging.id
                    ? {
                        ...t,
                        x: snap(x - dragging.ox, GRID, freeMove || e.altKey),
                        y: snap(y - dragging.oy, GRID, freeMove || e.altKey),
                      }
                    : t
                ),
              }
            : f
        )
      )
    }
  }

  const onSvgMU = () => {
    setDragging(null)
    isPanning.current = false
  }

  // ─── Floor management ──────────────────────────────────────────────────
  const handleSetup = ({ name, width, depth, theme }: { name: string; width: number; depth: number; theme: string }) => {
    const id = `f${Date.now()}`
    setFloors(f => [...f, { id, label: name, theme, canvasW: width * PX, canvasH: depth * PX, tables: [] }])
    setActiveFloor(id)
    setShowSetup(false)
  }

  const deleteFloor = (id: string) => {
    if (floors.length <= 1) return
    const rest = floors.filter(f => f.id !== id)
    setFloors(rest)
    if (activeFloor === id) setActiveFloor(rest[0].id)
  }

  const setFloorTheme = (tid: string) => {
    setFloors(f => f.map(fl => (fl.id === activeFloor ? { ...fl, theme: tid } : fl)))
    setShowThemes(false)
  }

  const commitRename = () => {
    if (floorDraft.trim())
      setFloors(f => f.map(fl => (fl.id === editingFloor ? { ...fl, label: floorDraft.trim() } : fl)))
    setEditingFloor(null)
  }

  const rotate = () => {
    if (!selTable) return
    setFloors(fs =>
      fs.map(f =>
        f.id === activeFloor
          ? {
              ...f,
              tables: f.tables.map(t =>
                t.id === selTable ? { ...t, rotation: ((t.rotation || 0) + 45) % 360 } : t
              ),
            }
          : f
      )
    )
  }

  const deleteSel = () => {
    if (!selTable) return
    setFloors(fs =>
      fs.map(f =>
        f.id === activeFloor ? { ...f, tables: f.tables.filter(t => t.id !== selTable) } : f
      )
    )
    setSelTable(null)
  }

  // W-100 B1: ResizeObserver ile container boyutunu izle
  // requestAnimationFrame ile ilk render'da container ölçüsü 0 dönerse tekrar dene
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const tryMeasure = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ w: rect.width, h: rect.height })
      } else {
        requestAnimationFrame(tryMeasure)
      }
    }
    requestAnimationFrame(tryMeasure)
    const obs = new ResizeObserver(([entry]) => {
      setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Auto-fit zoom: container'a ilk yüklendiğinde floor canvas sığacak zoom'u hesapla
  const fitZoom = useMemo(() => {
    if (!floor || !containerSize.w || !containerSize.h) return 0.75
    const scaleX = containerSize.w / floor.canvasW
    const scaleY = containerSize.h / floor.canvasH
    return Math.min(scaleX, scaleY) * 0.9 // W-100: %90 padding — canvas container'ı doldursun
  }, [floor?.canvasW, floor?.canvasH, containerSize])

  // İlk yükleme: fitZoom kullan, sonra kullanıcı zoom yapınca manuele geç
  const [hasUserZoomed, setHasUserZoomed] = useState(false)
  const effectiveZoom = hasUserZoomed ? zoom : fitZoom

  // W-100 B2: Boş kat için varsayılan viewBox — 12m×10m = 720×600px (PX=60)
  const DEFAULT_VIEWBOX = '0 0 720 600'
  const viewBox = floor
    ? `${-pan.x / effectiveZoom} ${-pan.y / effectiveZoom} ${containerSize.w / effectiveZoom} ${containerSize.h / effectiveZoom}`
    : DEFAULT_VIEWBOX

  const cursor = dragging ? 'grabbing' : selType ? 'crosshair' : 'default'
  const theme = THEMES.find(t => t.id === floor?.theme) || THEMES[0]
  const BG = BG_IMAGES as Record<string, string>
  const TBL_IMG = TABLE_IMAGES as Record<string, string>

  if (showSetup) return <SetupModal onConfirm={handleSetup} onCancel={() => {
    setShowSetup(false)
    if (floors.length === 0) {
      // If no floors exist, create a default one so the editor doesn't re-show setup
      const id = `f${Date.now()}`
      setFloors([{ id, label: 'Zemin Kat', theme: 'indoor', canvasW: 12 * PX, canvasH: 10 * PX, tables: [] }])
      setActiveFloor(id)
    }
  }} />

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        background: C.surface,
        color: C.text,
        fontFamily: "'DM Sans','Inter',sans-serif",
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 50,
          padding: '0 16px',
          background: C.panel,
          borderBottom: `1px solid ${C.border}`,
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: C.gold,
            textTransform: 'uppercase',
          }}
        >
          CheckRezerve
        </span>
        <div style={{ width: 1, height: 22, background: C.border }} />
        <span style={{ fontSize: 13, color: C.textMuted }}>Salon Krokileri</span>
        {floor && (
          <>
            <div style={{ width: 1, height: 22, background: C.border }} />
            <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>{floor.label}</span>
            <span style={{ fontSize: 10, color: C.textFaint }}>
              — {floor.tables.length} masa
            </span>
          </>
        )}
        <div style={{ flex: 1 }} />
        {selType && (
          <div
            style={{
              background: `${C.red}20`,
              border: `1px solid ${C.red}50`,
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 11,
              color: C.red,
            }}
          >
            {TYPES.find(t => t.id === selType)?.label} — canvas'a tıkla · ESC iptal
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: C.espressoL,
            borderRadius: 6,
            padding: '3px 8px',
            border: `1px solid ${C.border}`,
          }}
        >
          <button
            onClick={() => {
              const r = svgRef.current?.getBoundingClientRect()
              if (r) zoomAt(-ZOOM_STEP, r.width / 2, r.height / 2)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: C.textMuted,
              cursor: 'pointer',
              fontSize: 15,
              padding: '0 3px',
            }}
          >
            −
          </button>
          <span
            style={{
              color: C.text,
              minWidth: 38,
              textAlign: 'center',
              fontSize: 12,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => {
              const r = svgRef.current?.getBoundingClientRect()
              if (r) zoomAt(ZOOM_STEP, r.width / 2, r.height / 2)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: C.textMuted,
              cursor: 'pointer',
              fontSize: 15,
              padding: '0 3px',
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              setZoom(0.75)
              setPan({ x: 40, y: 20 })
            }}
            style={{
              background: 'none',
              border: 'none',
              color: C.textMuted,
              cursor: 'pointer',
              fontSize: 10,
              padding: '0 2px',
            }}
          >
            ↺
          </button>
        </div>
        <button
          onClick={() => setShowSetup(true)}
          style={{
            background: C.espressoM,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            color: C.textMuted,
            fontSize: 11,
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          + Kat Ekle
        </button>
        <button
          onClick={() => {
            onSave?.(floors)
          }}
          style={{
            background: C.red,
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            padding: '6px 16px',
            cursor: 'pointer',
          }}
        >
          Kaydet
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Left panel ────────────────────────────────────────── */}
        <div
          style={{
            width: 190,
            flexShrink: 0,
            background: C.panel,
            borderRight: `1px solid ${C.border}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 14px 8px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: C.textFaint,
              textTransform: 'uppercase',
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            Masa Tipleri
          </div>
          <div
            style={{
              flex: 1,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              overflowY: 'auto',
            }}
          >
            {TYPES.map(type => {
              const active = selType === type.id
              return (
                <div
                  key={type.id}
                  onClick={() => setSelType(active ? null : type.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    border: `1px solid ${active ? C.red : C.border}`,
                    background: active ? `${C.red}18` : C.espressoL,
                    transition: 'all 0.12s',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 32,
                      borderRadius: 4,
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#00000020',
                    }}
                  >
                    {type.img && TBL_IMG[type.id] ? (
                      <img
                        src={TBL_IMG[type.id]}
                        style={{
                          width: 36,
                          height: 36,
                          objectFit: 'contain',
                          mixBlendMode: 'multiply',
                        }}
                        alt={type.label}
                      />
                    ) : (
                      <div
                        style={{
                          width: type.id === 'bar' ? 30 : 18,
                          height: type.id === 'bar' ? 8 : 14,
                          borderRadius: 2,
                          background: active ? `${C.red}60` : '#6D4C4180',
                          border: `1px solid ${active ? C.red : C.goldDim}`,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: active ? C.red : C.textMuted,
                        fontWeight: active ? 700 : 400,
                      }}
                    >
                      {type.label}
                    </div>
                    <div style={{ fontSize: 9, color: C.textFaint }}>
                      {type.seats > 0 ? `${type.seats} kişi` : 'Tezgah'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div
            style={{
              margin: '0 10px 10px',
              padding: '8px 10px',
              borderRadius: 6,
              background: `${C.gold}10`,
              border: `1px solid ${C.goldDim}30`,
              fontSize: 9,
              color: C.goldDim,
              lineHeight: 1.8,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Kısayollar</div>
            <div>R = 45° döndür</div>
            <div>Alt = serbest taşı</div>
            <div>Del = seçili sil</div>
            <div>ESC = iptal</div>
          </div>
        </div>

        {/* ── Canvas ────────────────────────────────────────────── */}
        <div ref={canvasRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0D0704' }}>
          <svg
            ref={svgRef}
            style={{ width: '100%', height: '100%', display: 'block', cursor }}
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            onMouseDown={onSvgMD}
            onMouseMove={onSvgMM}
            onMouseUp={onSvgMU}
            onMouseLeave={onSvgMU}
            onClick={onCanvasClick}
            onContextMenu={e => e.preventDefault()}
          >
            <defs>
              <filter id="bgS">
                <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#000" floodOpacity="0.65" />
              </filter>
              <filter id="selG">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#E53935" floodOpacity="0.7" />
              </filter>
            </defs>
            <g style={{ pointerEvents: 'none' }}>
              {floor && (
                <image
                  href={BG[floor.theme] ?? BG['indoor']}
                  x={0}
                  y={0}
                  width={floor.canvasW}
                  height={floor.canvasH}
                  preserveAspectRatio="xMidYMid slice"
                  filter="url(#bgS)"
                />
              )}
              {/* Grid */}
              {floor &&
                Array.from({ length: Math.ceil(floor.canvasW / GRID) + 1 }, (_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * GRID}
                    y1={0}
                    x2={i * GRID}
                    y2={floor.canvasH}
                    stroke="#FFF"
                    strokeWidth={0.3}
                    opacity={0.07}
                  />
                ))}
              {floor &&
                Array.from({ length: Math.ceil(floor.canvasH / GRID) + 1 }, (_, i) => (
                  <line
                    key={`h${i}`}
                    x1={0}
                    y1={i * GRID}
                    x2={floor.canvasW}
                    y2={i * GRID}
                    stroke="#FFF"
                    strokeWidth={0.3}
                    opacity={0.07}
                  />
                ))}
              {floor && (
                <rect
                  x={0}
                  y={0}
                  width={floor.canvasW}
                  height={floor.canvasH}
                  fill="none"
                  stroke={C.gold}
                  strokeWidth={2}
                  opacity={0.3}
                />
              )}
              {floor?.tables.map(t => {
                const type = TYPES.find(tp => tp.id === t.typeId)
                if (!type) return null
                const isSel = t.id === selTable
                return (
                  <g
                    key={t.id}
                    transform={`translate(${t.x},${t.y}) rotate(${t.rotation || 0})`}
                    filter={isSel ? 'url(#selG)' : undefined}
                    onMouseDown={e => onTableMD(e, t.id)}
                    style={{ cursor: dragging?.id === t.id ? 'grabbing' : 'grab', pointerEvents: 'auto' }}
                  >
                    <TableNode
                      type={type}
                      selected={isSel}
                      label={t.label}
                      imgSrc={type.img ? TBL_IMG[type.id] : undefined}
                    />
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Theme picker popover */}
          {showThemes && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: `${C.panel}F2`,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 16,
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C.textMuted,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Arka Plan Teması
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {THEMES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setFloorTheme(t.id)}
                    style={{
                      width: 120,
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: `2px solid ${floor?.theme === t.id ? C.red : C.border}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        height: 64,
                        backgroundImage: `url(${BG[t.id]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div
                      style={{
                        padding: '6px 8px',
                        fontSize: 10,
                        fontWeight: 700,
                        textAlign: 'center',
                        color: floor?.theme === t.id ? C.red : C.textMuted,
                        background: C.espressoL,
                      }}
                    >
                      {t.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {floor?.tables.length === 0 && !selType && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#ffffff60',
                  lineHeight: 2,
                  background: '#00000070',
                  padding: '12px 20px',
                  borderRadius: 8,
                }}
              >
                Soldan masa tipini seç · Canvas'a tıklayarak yerleştir
              </div>
            </div>
          )}

          {/* Controls hint */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              background: '#00000080',
              borderRadius: 7,
              padding: '6px 10px',
            }}
          >
            {[
              ['Tekerlek', 'Zoom'],
              ['Orta tuş', 'Kaydır'],
              ['R', 'Döndür'],
              ['Alt', 'Serbest'],
              ['Del', 'Sil'],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 9,
                  marginBottom: 1,
                }}
              >
                <span style={{ color: C.gold, fontFamily: 'monospace' }}>{k}</span>
                <span style={{ color: '#ffffff50' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────── */}
        <div
          style={{
            width: 210,
            flexShrink: 0,
            background: C.panel,
            borderLeft: `1px solid ${C.border}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 14px 8px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: C.textFaint,
              textTransform: 'uppercase',
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {selTbl ? 'Masa Özellikleri' : 'Salon Özellikleri'}
          </div>
          <div style={{ flex: 1, padding: 14, overflow: 'auto' }}>
            {selTbl && selTp ? (
              <>
                <P label="Masa No" value={selTbl.label} />
                <P label="Tip" value={selTp.label} />
                <P label="Kapasite" value={selTp.seats > 0 ? `${selTp.seats} kişi` : 'Bar'} />
                <P label="Rotasyon" value={`${selTbl.rotation || 0}°`} />
                <button
                  onClick={rotate}
                  style={{
                    width: '100%',
                    marginBottom: 8,
                    padding: '8px',
                    borderRadius: 6,
                    background: `${C.gold}15`,
                    border: `1px solid ${C.goldDim}50`,
                    color: C.gold,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  ↻ 45° Döndür
                </button>
                <button
                  onClick={deleteSel}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 6,
                    background: '#B71C1C20',
                    border: '1px solid #B71C1C60',
                    color: '#EF5350',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  🗑 Masayı Sil
                </button>
              </>
            ) : floor ? (
              <>
                <P label="Kat Adı" value={floor.label} />
                <P label="Boyut" value={`${floor.canvasW / PX}m × ${floor.canvasH / PX}m`} />
                <P label="Masa Sayısı" value={floor.tables.length} />
                <P label="Tema" value={theme.label} />
                <div
                  onClick={() => setShowThemes(v => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: `1px solid ${C.border}`,
                    background: C.espressoM,
                    fontSize: 11,
                    color: C.text,
                    marginTop: 6,
                  }}
                >
                  <span>🎨</span>
                  <span>{showThemes ? 'Kapat' : 'Tema Değiştir'}</span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: C.textFaint,
                    marginTop: 16,
                    lineHeight: 1.8,
                    textAlign: 'center',
                  }}
                >
                  Masaya tıkla
                  <br />
                  özelliklerini gör
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Floor tabs ──────────────────────────────────────────── */}
      <div
        style={{
          height: 42,
          display: 'flex',
          alignItems: 'center',
          background: C.panel,
          borderTop: `1px solid ${C.border}`,
          padding: '0 12px',
          gap: 4,
          flexShrink: 0,
          overflowX: 'auto',
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: C.textFaint,
            textTransform: 'uppercase',
            marginRight: 6,
            whiteSpace: 'nowrap',
          }}
        >
          Katlar
        </span>
        {floors.map(fl => (
          <div
            key={fl.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              border: `1px solid ${fl.id === activeFloor ? C.red : C.border}`,
              background: fl.id === activeFloor ? `${C.red}18` : 'transparent',
              color: fl.id === activeFloor ? C.red : C.textMuted,
              fontSize: 11,
              fontWeight: fl.id === activeFloor ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
            onClick={() => setActiveFloor(fl.id)}
            onDoubleClick={() => {
              setEditingFloor(fl.id)
              setFloorDraft(fl.label)
            }}
          >
            {editingFloor === fl.id ? (
              <input
                autoFocus
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: C.red,
                  fontSize: 11,
                  fontWeight: 700,
                  width: 80,
                }}
                value={floorDraft}
                onChange={e => setFloorDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename()
                  e.stopPropagation()
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span>{fl.label}</span>
            )}
            {floors.length > 1 && (
              <span
                style={{ fontSize: 13, color: C.textFaint, cursor: 'pointer' }}
                onClick={e => {
                  e.stopPropagation()
                  deleteFloor(fl.id)
                }}
              >
                ×
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Status bar ──────────────────────────────────────────── */}
      <div
        style={{
          height: 24,
          display: 'flex',
          alignItems: 'center',
          background: C.espresso,
          borderTop: `1px solid ${C.border}`,
          padding: '0 14px',
          gap: 18,
          flexShrink: 0,
          fontSize: 9,
          color: C.textFaint,
        }}
      >
        <span style={{ color: C.gold }}>●</span>
        <span>Zoom {Math.round(zoom * 100)}%</span>
        {freeMove && <span style={{ color: C.red }}>SERBEST</span>}
        {selType && <span style={{ color: C.red }}>● Yerleştirme</span>}
        <span style={{ marginLeft: 'auto' }}>
          {floors.length} kat · {floors.reduce((a, f) => a + f.tables.length, 0)} masa
        </span>
      </div>
    </div>
  )
}

// ─── Property display component ──────────────────────────────────────────────
function P({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 9,
          color: C.textFaint,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 4,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: C.textMuted,
          background: C.espressoL,
          borderRadius: 6,
          padding: '7px 10px',
          border: `1px solid ${C.border}`,
        }}
      >
        {value}
      </div>
    </div>
  )
}
