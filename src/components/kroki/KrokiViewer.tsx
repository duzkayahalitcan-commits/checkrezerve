'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { THEMES, TABLE_TYPES, BG_IMAGES, TABLE_IMAGES, GRID_SIZE } from '../../lib/kroki-config'
import TableNode from './TableNode'
import { C } from './KrokiEditor'

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

interface OccupiedMap {
  [tableId: string]: boolean
}

export default function KrokiViewer({
  floors,
  occupiedTables,
  onTableSelect,
  slug,
}: {
  floors: Floor[]
  occupiedTables?: OccupiedMap
  onTableSelect?: (table: Table) => void
  slug?: string
}) {
  const [activeFloor, setActiveFloor] = useState(floors.length > 0 ? floors[0].id : null)
  const [zoom, setZoom] = useState(0.75)
  const [pan, setPan] = useState({ x: 40, y: 20 })

  const svgRef = useRef<SVGSVGElement>(null)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })

  const floor = floors.find(f => f.id === activeFloor)

  const clamp = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z))

  const zoomAt = useCallback((delta: number, cx: number, cy: number) => {
    setZoom(z => {
      const nz = clamp(+(z + delta).toFixed(2))
      const sc = nz / z
      setPan(p => ({ x: cx - sc * (cx - p.x), y: cy - sc * (cy - p.y) }))
      return nz
    })
  }, [])

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

  const onSvgMD = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) {
      e.preventDefault()
      isPanning.current = true
      panStart.current = { x: e.clientX, y: e.clientY }
      panOrigin.current = { ...pan }
    }
  }

  const onSvgMM = (e: React.MouseEvent) => {
    if (isPanning.current) {
      setPan({
        x: panOrigin.current.x + e.clientX - panStart.current.x,
        y: panOrigin.current.y + e.clientY - panStart.current.y,
      })
    }
  }

  const onSvgMU = () => {
    isPanning.current = false
  }

  const BG = BG_IMAGES as Record<string, string>
  const TBL_IMG = TABLE_IMAGES as Record<string, string>

  if (floors.length === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#0D0704',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Floor tabs */}
      {floors.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '8px 12px',
            background: '#1A1008',
            borderBottom: '1px solid #3D2820',
          }}
        >
          {floors.map(fl => (
            <button
              key={fl.id}
              onClick={() => setActiveFloor(fl.id)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: `1px solid ${fl.id === activeFloor ? '#E53935' : '#3D2820'}`,
                background: fl.id === activeFloor ? '#E5393518' : 'transparent',
                color: fl.id === activeFloor ? '#E53935' : '#9E7A60',
                fontSize: 11,
                fontWeight: fl.id === activeFloor ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {fl.label}
            </button>
          ))}
        </div>
      )}

      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
        onMouseDown={onSvgMD}
        onMouseMove={onSvgMM}
        onMouseUp={onSvgMU}
        onMouseLeave={onSvgMU}
        onContextMenu={e => e.preventDefault()}
      >
        <defs>
          <filter id="vBgS">
            <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#000" floodOpacity="0.65" />
          </filter>
        </defs>
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {floor && (
            <image
              href={BG[floor.theme] ?? BG['indoor']}
              x={0}
              y={0}
              width={floor.canvasW}
              height={floor.canvasH}
              preserveAspectRatio="xMidYMid slice"
              filter="url(#vBgS)"
            />
          )}
          {floor &&
            Array.from({ length: Math.ceil(floor.canvasW / GRID_SIZE) + 1 }, (_, i) => (
              <line
                key={`v${i}`}
                x1={i * GRID_SIZE}
                y1={0}
                x2={i * GRID_SIZE}
                y2={floor.canvasH}
                stroke="#FFF"
                strokeWidth={0.3}
                opacity={0.07}
              />
            ))}
          {floor &&
            Array.from({ length: Math.ceil(floor.canvasH / GRID_SIZE) + 1 }, (_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={i * GRID_SIZE}
                x2={floor.canvasW}
                y2={i * GRID_SIZE}
                stroke="#FFF"
                strokeWidth={0.3}
                opacity={0.07}
              />
            ))}
          {floor?.tables.map(t => {
            const type = TYPES.find(tp => tp.id === t.typeId)
            if (!type) return null
            const isOccupied = occupiedTables?.[t.id]
            const opacity = isOccupied ? 0.4 : 1

            return (
              <g
                key={t.id}
                transform={`translate(${t.x},${t.y}) rotate(${t.rotation || 0})`}
                style={{ cursor: isOccupied ? 'not-allowed' : 'pointer', opacity }}
                onClick={() => {
                  if (!isOccupied) onTableSelect?.(t)
                }}
              >
                {isOccupied && (
                  <rect
                    x={-30}
                    y={-12}
                    width={60}
                    height={24}
                    rx={6}
                    fill="#EF444480"
                  />
                )}
                <TableNode
                  type={type}
                  selected={false}
                  label={t.label}
                  imgSrc={type.img ? TBL_IMG[type.id] : undefined}
                />
              </g>
            )
          })}
        </g>
      </svg>

      {/* Controls hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          background: '#00000080',
          borderRadius: 7,
          padding: '6px 10px',
          fontSize: 9,
          color: '#ffffff50',
        }}
      >
        Tekerlek = Zoom · Sağ tuş = Kaydır
      </div>
    </div>
  )
}
