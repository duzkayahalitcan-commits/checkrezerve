'use client'

import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Group, Rect, Text } from 'react-konva'

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
}

const STAGE_W = 800
const STAGE_H = 480

type TableStatus = 'available' | 'occupied' | 'selected'

function tableColor(status: TableStatus, part: 'fill' | 'stroke' | 'text' | 'sub') {
  if (status === 'occupied') {
    return { fill: '#F3F4F6', stroke: '#D1D5DB', text: '#9CA3AF', sub: '#9CA3AF' }[part]
  }
  if (status === 'selected') {
    return { fill: '#DBEAFE', stroke: '#2563EB', text: '#1D4ED8', sub: '#3B82F6' }[part]
  }
  // available
  return { fill: '#F0FDF4', stroke: '#16A34A', text: '#14532D', sub: '#15803D' }[part]
}

export default function FloorPlanPicker({
  restaurantId,
  tables,
  selectedDate,
  selectedTime,
  selectedTableId,
  onSelect,
}: Props) {
  const [occupied, setOccupied] = useState<Set<string>>(new Set())
  const [loading,  setLoading]  = useState(false)

  // Fetch availability when date/time changes
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      setOccupied(new Set())
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(
      `/api/tables/${restaurantId}/availability?date=${selectedDate}&time=${selectedTime}`
    )
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setOccupied(new Set(data.occupied ?? []))
      })
      .catch(() => { /* silent — show all as available */ })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [restaurantId, selectedDate, selectedTime])

  function handleClick(tableId: string) {
    if (occupied.has(tableId)) return   // can't select an occupied table
    onSelect(selectedTableId === tableId ? null : tableId)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-green-500 bg-green-50 inline-block" />
          Boş
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-zinc-300 bg-zinc-100 inline-block" />
          Dolu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-blue-500 bg-blue-100 inline-block" />
          Seçildi
        </span>
        {loading && (
          <span className="ml-auto text-zinc-400 animate-pulse">Müsaitlik kontrol ediliyor…</span>
        )}
      </div>

      {/* Canvas */}
      <div className="rounded-2xl border border-zinc-200 overflow-x-auto bg-zinc-50">
        <Stage width={STAGE_W} height={STAGE_H}>
          <Layer>
            {tables.map(t => {
              const isOccupied = occupied.has(t.id)
              const isSelected = selectedTableId === t.id
              const status: TableStatus = isSelected ? 'selected' : isOccupied ? 'occupied' : 'available'
              const radius = t.shape === 'circle'
                ? Math.min(t.width, t.height) / 2
                : 8

              return (
                <Group
                  key={t.id}
                  x={t.x}
                  y={t.y}
                  onClick={() => handleClick(t.id)}
                  onTap={() => handleClick(t.id)}
                  style={{ cursor: isOccupied ? 'not-allowed' : 'pointer' }}
                >
                  <Rect
                    width={t.width}
                    height={t.height}
                    cornerRadius={radius}
                    fill={tableColor(status, 'fill') as string}
                    stroke={tableColor(status, 'stroke') as string}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    shadowBlur={isSelected ? 8 : 2}
                    shadowColor={isSelected ? '#93C5FD' : '#00000010'}
                    shadowEnabled
                  />
                  <Text
                    width={t.width}
                    y={t.height / 2 - 12}
                    align="center"
                    text={t.label}
                    fontSize={12}
                    fontStyle="bold"
                    fill={tableColor(status, 'text') as string}
                    listening={false}
                  />
                  <Text
                    width={t.width}
                    y={t.height / 2 + 2}
                    align="center"
                    text={isOccupied ? 'Dolu' : `${t.capacity} kişi`}
                    fontSize={10}
                    fill={tableColor(status, 'sub') as string}
                    listening={false}
                  />
                </Group>
              )
            })}
          </Layer>
        </Stage>
      </div>

      {selectedTableId && !occupied.has(selectedTableId) && (() => {
        const t = tables.find(x => x.id === selectedTableId)
        return t ? (
          <p className="text-sm text-green-700 font-medium">
            ✓ <span className="font-bold">{t.label}</span> seçildi — max {t.capacity} kişilik
          </p>
        ) : null
      })()}
    </div>
  )
}
