'use client'

import { useState } from 'react'

// ─── Tipler ──────────────────────────────────────────────────────────────────

export type PickerTable = {
  id: string
  label: string
  capacity: number
  x: number
  y: number
  width: number
  height: number
  shape: 'rect' | 'circle'
}

interface Props {
  restaurantId: string
  tables: PickerTable[]
  selectedDate: string
  selectedTime: string
  selectedTableId: string | null
  onSelect: (tableId: string | null) => void
  businessType?: string
}

// ─── Marka Renkleri ──────────────────────────────────────────────────────────

const RED    = '#E53935'
const ESPR   = '#2B1B17'
const GOLD   = '#D4A373'
const GRAY   = '#9CA3AF'
const LGRAY  = '#F3F4F6'
const WHITE  = '#FFFFFF'

// ─── 3 Model İçin Masa Verileri ─────────────────────────────────────────────

type ModelKey = 'salon' | 'teras' | 'lounge'

interface ModelConfig {
  label: string
  icon: string
  tables: PickerTable[]
}

const MODELS: Record<ModelKey, ModelConfig> = {
  salon: {
    label: 'Salon',
    icon: '🏠',
    tables: [
      { id: 's1', label: 'Masa 1', capacity: 4, x: 40,  y: 30,  width: 80,  height: 80,  shape: 'rect' },
      { id: 's2', label: 'Masa 2', capacity: 2, x: 180, y: 40,  width: 60,  height: 60,  shape: 'rect' },
      { id: 's3', label: 'Masa 3', capacity: 6, x: 320, y: 25,  width: 100, height: 90,  shape: 'rect' },
      { id: 's4', label: 'Masa 4', capacity: 4, x: 40,  y: 170, width: 80,  height: 80,  shape: 'rect' },
      { id: 's5', label: 'Masa 5', capacity: 2, x: 200, y: 180, width: 60,  height: 60,  shape: 'circle' },
      { id: 's6', label: 'Masa 6', capacity: 8, x: 320, y: 160, width: 110, height: 100, shape: 'rect' },
      { id: 's7', label: 'Masa 7', capacity: 4, x: 40,  y: 310, width: 80,  height: 80,  shape: 'rect' },
      { id: 's8', label: 'Masa 8', capacity: 6, x: 180, y: 300, width: 100, height: 90,  shape: 'rect' },
    ],
  },
  teras: {
    label: 'Teras',
    icon: '🌿',
    tables: [
      { id: 't1', label: 'Teras 1', capacity: 4, x: 50,  y: 30,  width: 90,  height: 80,  shape: 'rect' },
      { id: 't2', label: 'Teras 2', capacity: 2, x: 210, y: 50,  width: 60,  height: 60,  shape: 'circle' },
      { id: 't3', label: 'Teras 3', capacity: 6, x: 50,  y: 170, width: 100, height: 90,  shape: 'rect' },
      { id: 't4', label: 'Teras 4', capacity: 4, x: 230, y: 180, width: 80,  height: 80,  shape: 'rect' },
      { id: 't5', label: 'Teras 5', capacity: 2, x: 350, y: 40,  width: 60,  height: 60,  shape: 'circle' },
    ],
  },
  lounge: {
    label: 'Lounge',
    icon: '🛋️',
    tables: [
      { id: 'l1', label: 'Lounge 1', capacity: 4, x: 30,  y: 40,  width: 80,  height: 70,  shape: 'rect' },
      { id: 'l2', label: 'Lounge 2', capacity: 2, x: 170, y: 30,  width: 60,  height: 60,  shape: 'circle' },
      { id: 'l3', label: 'Lounge 3', capacity: 6, x: 300, y: 30,  width: 100, height: 90,  shape: 'rect' },
      { id: 'l4', label: 'Lounge 4', capacity: 4, x: 30,  y: 170, width: 80,  height: 70,  shape: 'rect' },
      { id: 'l5', label: 'Lounge 5', capacity: 8, x: 170, y: 160, width: 110, height: 100, shape: 'rect' },
      { id: 'l6', label: 'Lounge 6', capacity: 2, x: 340, y: 170, width: 60,  height: 60,  shape: 'circle' },
    ],
  },
}

// ─── SVG Masa Bileşeni ──────────────────────────────────────────────────────

type Status = 'available' | 'occupied' | 'selected'

function getColors(status: Status) {
  switch (status) {
    case 'occupied':
      return { fill: '#FEF2F2', stroke: '#EF4444', text: '#991B1B', sub: '#B91C1C' }
    case 'selected':
      return { fill: '#FDE8E8', stroke: RED, text: '#7F1D1D', sub: RED }
    default:
      return { fill: LGRAY, stroke: GRAY, text: ESPR, sub: GRAY }
  }
}

function TableSvg({ table, status, onClick }: {
  table: PickerTable
  status: Status
  onClick: () => void
}) {
  const c = getColors(status)
  const cx = table.x + table.width / 2
  const cy = table.y + table.height / 2
  const r = Math.min(table.width, table.height) / 2 - 4

  return (
    <g
      style={{ cursor: status === 'occupied' ? 'not-allowed' : 'pointer' }}
      onClick={status === 'occupied' ? undefined : onClick}
    >
      {/* Gölge */}
      {status === 'selected' && (
        <rect
          x={table.x - 2}
          y={table.y - 2}
          width={table.width + 4}
          height={table.height + 4}
          rx={table.shape === 'circle' ? 50 : 10}
          fill="none"
          stroke={RED}
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={0.5}
        />
      )}

      {/* Masa gövdesi */}
      {table.shape === 'circle' ? (
        <circle cx={cx} cy={cy} r={r} fill={c.fill} stroke={c.stroke} strokeWidth={status === 'selected' ? 2.5 : 1.5} />
      ) : (
        <rect
          x={table.x}
          y={table.y}
          width={table.width}
          height={table.height}
          rx={10}
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth={status === 'selected' ? 2.5 : 1.5}
        />
      )}

      {/* Etiket */}
      <text
        x={cx}
        y={table.shape === 'circle' ? cy - 4 : table.y + table.height / 2 - 4}
        textAnchor="middle"
        fontSize={11}
        fontWeight="bold"
        fill={c.text}
        style={{ userSelect: 'none' }}
      >
        {table.label}
      </text>

      {/* Kapasite */}
      <text
        x={cx}
        y={table.shape === 'circle' ? cy + 10 : table.y + table.height / 2 + 10}
        textAnchor="middle"
        fontSize={9}
        fill={c.sub}
        style={{ userSelect: 'none' }}
      >
        {status === 'occupied' ? 'DOLU' : `${table.capacity} kişi`}
      </text>
    </g>
  )
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function FloorPlanPicker({
  restaurantId,
  tables: _tables,
  selectedDate,
  selectedTime,
  selectedTableId,
  onSelect,
  businessType = 'restaurant',
}: Props) {
  const [activeModel, setActiveModel] = useState<ModelKey>('salon')

  // SADECE restoran tipinde göster
  if (businessType !== 'restaurant') {
    return null
  }

  const model = MODELS[activeModel]
  const modelKeys = Object.keys(MODELS) as ModelKey[]

  return (
    <div className="flex flex-col gap-4">

      {/* Model sekmeleri */}
      <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl w-fit">
        {modelKeys.map(key => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveModel(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeModel === key
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <span>{MODELS[key].icon}</span>
            <span>{MODELS[key].label}</span>
          </button>
        ))}
      </div>

      {/* SVG Kroki */}
      <div className="relative rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
        {/* Zemin deseni */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 480 420"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        >
          {/* Zemin */}
          <rect x="0" y="0" width="480" height="420" fill="#FAFAFA" />

          {/* Duvar çizgisi */}
          <rect x="6" y="6" width="468" height="408" rx={8} fill="none" stroke="#E5E7EB" strokeWidth={2} strokeDasharray="6 4" />

          {/* Model adı */}
          <text x={240} y={26} textAnchor="middle" fontSize={11} fill={GRAY} style={{ userSelect: 'none' }}>
            {model.icon} {model.label}
          </text>

          {/* Masalar */}
          {model.tables.map(table => {
            // occupied simulation: belirli masaları dolu göster
            const isOccupiedSim = table.id === 's3' || table.id === 't4'
            const isSelected = selectedTableId === table.id
            const status: Status = isSelected ? 'selected' : isOccupiedSim ? 'occupied' : 'available'

            return (
              <TableSvg
                key={table.id}
                table={table}
                status={status}
                onClick={() => {
                  if (status !== 'occupied') {
                    onSelect(selectedTableId === table.id ? null : table.id)
                  }
                }}
              />
            )
          })}
        </svg>
      </div>

      {/* Lejant */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="1" width="10" height="10" rx={3} fill={LGRAY} stroke={GRAY} strokeWidth={1} />
          </svg>
          Boş
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="1" width="10" height="10" rx={3} fill="#FEF2F2" stroke="#EF4444" strokeWidth={1} />
          </svg>
          Dolu
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="1" width="10" height="10" rx={3} fill="#FDE8E8" stroke={RED} strokeWidth={2} />
          </svg>
          Seçildi
        </span>
      </div>

      {/* Seçilen masa bilgisi */}
      {selectedTableId && (() => {
        const allTables = modelKeys.flatMap(k => MODELS[k].tables)
        const t = allTables.find(x => x.id === selectedTableId)
        if (!t) return null
        return (
          <p className="text-sm font-medium" style={{ color: RED }}>
            ✓ <span className="font-bold">{t.label}</span> seçildi — max {t.capacity} kişilik
          </p>
        )
      })()}

      {/* Hidden input for form payload */}
      {selectedTableId && (
        <input type="hidden" name="table_id" value={selectedTableId} />
      )}
    </div>
  )
}
