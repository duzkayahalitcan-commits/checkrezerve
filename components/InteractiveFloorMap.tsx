'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Tip Tanımı ─────────────────────────────────────────────────────────────

export type TableLayout = {
  id:     string
  label:  string                       // "Masa 1", "VIP 2", …
  shape:  'square' | 'round'
  x:      number                       // izometrik grid x (0‑12)
  y:      number                       // izometrik grid y (0‑8)
  seats:  number
  zone:   string                       // area_id veya 'salon' | 'teras' | 'lounge'
  status: 'available' | 'occupied'
}

export type FloorMapProps = {
  tables:         TableLayout[]
  selectedId:     string | null
  onSelect:      (id: string | null) => void
  businessType?:  string
  /** Varsayılan 3 zone yerine dinamik alan listesi (special_areas) */
  areas?:         { id: string; name: string; color?: string | null }[]
}

// ─── Sabitler ───────────────────────────────────────────────────────────────

const RED   = '#E53935'
const ESPR  = '#2B1B17'
const GOLD  = '#D4A373'
const WOOD  = '#C9A678'        // boş masa — ahşap tonu
const WOOD_D  = '#C26B5C'      // dolu masa — koyu kırmızımsı

const VIEW_BOX = '0 0 440 320'
const TILE_W = 36               // izometrik tile genişlik
const TILE_H = 18               // izometrik tile yükseklik

// ─── Izometrik Dönüşüm ──────────────────────────────────────────────────────
// Kartez yen (gridX, gridY) → izometrik ekran (screenX, screenY)
function toIso(gx: number, gy: number): { sx: number; sy: number } {
  const sx = (gx - gy) * TILE_W + 220
  const sy = (gx + gy) * TILE_H + 20
  return { sx, sy }
}

// ─── Masa SVG Bileşeni ──────────────────────────────────────────────────────

interface TableSvgProps {
  table:   TableLayout
  isSelected: boolean
  onClick: () => void
}

const hoverVariants = {
  default: { scale: 1 },
  hover:   { scale: 1.05, transition: { type: 'spring', stiffness: 300, damping: 15 } },
}

const shadowFilter = (
  <filter id="tableShadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx={0} dy={2} stdDeviation={3} floodColor={ESPR} floodOpacity={0.25} />
  </filter>
)

function TableShape({ table, isSelected, onClick }: TableSvgProps) {
  const { sx, sy } = toIso(table.x, table.y)
  const occupied = table.status === 'occupied'
  const fill  = occupied ? WOOD_D : isSelected ? RED : WOOD
  const stroke = occupied ? '#A0523F' : isSelected ? ESPR : GOLD
  const strokeW = isSelected ? 2.5 : 1.2

  // Square (diamond in isometric) vs Round (ellipse)
  const w = isSelected ? TILE_W + 6 : TILE_W
  const h = isSelected ? TILE_H + 3 : TILE_H

  const rect = table.shape === 'square' ? (
    <>
      {/* Drop-shadow ellipse */}
      <ellipse cx={sx} cy={sy + 18} rx={w * 0.55} ry={h * 0.4}
        fill={ESPR} opacity={0.15}
      />
      <g transform={`translate(${sx}, ${sy})`}>
        {/* Diamond: kareyi izometrik yapmak için 45°+ skew, scale */}
        <g transform={`rotate(-45) scale(1, 0.52)`}>
          <motion.rect
            x={-w / 2} y={-h / 2}
            width={w} height={h} rx={4}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeW}
            filter="url(#tableShadow)"
            initial={false}
            animate={{
              fill: [fill, fill],
              stroke: [stroke, stroke],
              scale: isSelected ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </g>
      </g>
    </>
  ) : (
    <>
      <ellipse cx={sx} cy={sy + 18} rx={w * 0.6} ry={h * 0.45}
        fill={ESPR} opacity={0.12}
      />
      <g transform={`translate(${sx}, ${sy})`}>
        <motion.ellipse
          cx={0} cy={0}
          rx={w / 2}
          ry={h / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeW}
          filter="url(#tableShadow)"
          initial={false}
          animate={{
            fill: [fill, fill],
            stroke: [stroke, stroke],
            scale: isSelected ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </g>
    </>
  )

  // Etiket
  const labelY = sy - 18 - (isSelected ? 2 : 0)

  return (
    <g
      style={{ cursor: occupied ? 'not-allowed' : 'pointer' }}
      onClick={occupied ? undefined : onClick}
    >
      {rect}
      <text
        x={sx} y={labelY}
        textAnchor="middle"
        fontSize={isSelected ? 10 : 9}
        fontWeight={isSelected ? 'bold' : 'normal'}
        fill={isSelected ? RED : ESPR}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {table.label}
      </text>
      {table.shape !== 'square' && (
        <text
          x={sx} y={labelY + 11}
          textAnchor="middle"
          fontSize={7}
          fill="#9CA3AF"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {table.seats} kişi
        </text>
      )}
    </g>
  )
}

// ─── Zone Sabitleri (varsayılan) ────────────────────────────────────────────

// ─── Zemin Deseni (izometrik grid) ──────────────────────────────────────────

function IsoGrid() {
  const lines: React.ReactNode[] = []
  for (let gx = 0; gx <= 12; gx++) {
    const { sx, sy: sy0 } = toIso(gx, 0)
    const { sx: _, sy: sy1 } = toIso(gx, 8)
    lines.push(
      <line key={`gx${gx}`} x1={sx} y1={sy0} x2={sx} y2={sy1}
        stroke="#E5E7EB" strokeWidth={0.5} opacity={0.6}
      />
    )
  }
  for (let gy = 0; gy <= 8; gy++) {
    const { sx: sx0, sy } = toIso(0, gy)
    const { sx: sx1, sy: _ } = toIso(12, gy)
    lines.push(
      <line key={`gy${gy}`} x1={sx0} y1={sy} x2={sx1} y2={sy}
        stroke="#E5E7EB" strokeWidth={0.5} opacity={0.6}
      />
    )
  }
  return <g opacity={0.5}>{lines}</g>
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function InteractiveFloorMap({
  tables,
  selectedId,
  onSelect,
  businessType = 'restaurant',
  areas,
}: FloorMapProps) {
  // Dinamik zone: eğer areas prop'u verilmişse onu kullan, yoksa varsayılan 3 zone
  const defaultZones = [
    { key: 'salon',  label: 'Salon',  icon: '🏠' },
    { key: 'teras',  label: 'Teras',  icon: '🌿' },
    { key: 'lounge', label: 'Lounge', icon: '🛋️' },
  ]

  const zoneList = areas && areas.length > 0
    ? areas.map(a => ({ key: a.id, label: a.name, icon: '📍' as const }))
    : defaultZones

  const allZoneKeys = zoneList.map(z => z.key)
  const [activeZone, setActiveZone] = useState<string>(allZoneKeys[0] ?? 'salon')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Sadece restoran
  if (businessType !== 'restaurant') return null

  const zoneTables = tables.filter(t => t.zone === activeZone)
  const zoneOccupied = zoneTables.filter(t => t.status === 'occupied').length
  const zoneAvailable = zoneTables.filter(t => t.status === 'available').length

  return (
    <div className="flex flex-col gap-4">
      {/* Zone sekmeleri */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit">
        {zoneList.map(z => (
          <button
            key={z.key}
            type="button"
            onClick={() => setActiveZone(z.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeZone === z.key
                ? 'bg-white shadow-sm border border-stone-200 text-stone-900'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <span>{z.icon}</span>
            <span>{z.label}</span>
            <span className={`text-xs ml-0.5 ${activeZone === z.key ? 'text-stone-400' : 'text-stone-400'}`}>
              ({tables.filter(t => t.zone === z.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* SVG Kroki */}
      <div className="relative rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden">
        <svg
          viewBox={VIEW_BOX}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%', height: 'auto', minHeight: 240 }}
        >
          {/* Filtreler */}
          <defs>{shadowFilter}</defs>

          {/* Zemin */}
          <rect x="0" y="0" width="440" height="320" fill="#FAFAFA" />
          <IsoGrid />

          {/* Zone border */}
          <rect x="2" y="2" width="436" height="316" rx={10}
            fill="none" stroke="#E5E7EB" strokeWidth={1.5} strokeDasharray="6 3"
          />

          {/* Zone etiketi */}
          <text x={220} y={18} textAnchor="middle" fontSize={10} fill="#9CA3AF"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {zoneList.find(z => z.key === activeZone)?.icon} {zoneList.find(z => z.key === activeZone)?.label}
          </text>

          {/* Masalar */}
          <AnimatePresence mode="popLayout">
            {zoneTables.map(table => {
              const isSelected = selectedId === table.id
              const isHovered = hoveredId === table.id
              const occupied = table.status === 'occupied'

              return (
                <motion.g
                  key={table.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={() => !occupied && setHoveredId(table.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: occupied ? 'not-allowed' : 'pointer' }}
                  onClick={occupied ? undefined : () => {
                    onSelect(isSelected ? null : table.id)
                  }}
                >
                  <TableShape
                    table={table}
                    isSelected={isSelected}
                    onClick={() => {}}
                  />
                </motion.g>
              )
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Lejant */}
      <div className="flex items-center gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="1" width="10" height="10" rx={2} fill={WOOD} stroke={GOLD} strokeWidth={0.8} />
          </svg>
          Boş
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="1" width="10" height="10" rx={2} fill={WOOD_D} stroke="#A0523F" strokeWidth={0.8} />
          </svg>
          Dolu
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="1" width="10" height="10" rx={2} fill={RED} stroke={ESPR} strokeWidth={1.2} />
          </svg>
          Seçili
        </span>
        {selectedId && (
          <span className="ml-auto font-medium" style={{ color: RED }}>
            ✓ Seçildi
          </span>
        )}
      </div>

      {/* Durum özeti */}
      <div className="flex items-center gap-3 text-xs text-stone-400">
        <span>{zoneAvailable} müsait</span>
        <span>·</span>
        <span>{zoneOccupied} dolu</span>
      </div>
    </div>
  )
}

// ─── Supabase → TableLayout[] Mapping Fonksiyonu ───────────────────────────
// Dışarıdan çağırmak için: mapRestaurantTables(rawTables, reservations, date)
//
// Beklenen Supabase tablosu: `masalar` (veya `tables`)
// Kolonlar:
//   id         uuid
//   label      text          → "Masa 1"
//   shape      text          → "square" veya "round"
//   grid_x     int           → izometrik grid x (0‑12)
//   grid_y     int           → izometrik grid y (0‑8)
//   seats      int           → kişi sayısı
//   zone       text          → "salon", "teras", veya "lounge"
//
// Rezervasyonlarla kesişim: reservations tablosundaki table_id ile
// masalar.id'yi eşleştir, eşleşen masaları "occupied" yap.

export function mapRestaurantTables(
  tables: {
    id: string
    label: string
    shape: string
    grid_x: number
    grid_y: number
    seats: number
    zone: string
  }[],
  reservations?: { table_id: string; date: string }[],
  date?: string
): TableLayout[] {
  const occupiedTableIds = new Set<string>()
  if (reservations && date) {
    reservations
      .filter(r => r.date === date && r.table_id)
      .forEach(r => occupiedTableIds.add(r.table_id))
  }

  return tables.map(t => ({
    id: t.id,
    label: t.label,
    shape: t.shape === 'round' ? 'round' : 'square',
    x: t.grid_x,
    y: t.grid_y,
    seats: t.seats,
    zone: t.zone as TableLayout['zone'],
    status: occupiedTableIds.has(t.id) ? 'occupied' : 'available',
  }))
}
