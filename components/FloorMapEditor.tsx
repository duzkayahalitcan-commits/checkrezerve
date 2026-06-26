'use client'
/**
 * FloorMapEditor — İşletmeci için sürükle-bırak masa düzenleyici (TASLAK)
 *
 * MEVCUT DURUM: İskelet aşaması. Çalışan bir taslak değil.
 *
 * YAPILACAKLAR (placeholder):
 * 1. Her masayı SVG içinde sürüklenebilir yap (onMouseDown/onMouseMove)
 * 2. Yeni x,y koordinatını state'te tut
 * 3. "Kaydet" butonu → Supabase `masalar` tablosunda grid_x / grid_y güncelle
 * 4. Masa ekle/sil UI'ı
 */

import { useState } from 'react'
import type { TableLayout } from './InteractiveFloorMap'

interface EditorProps {
  tables: TableLayout[]
  onSave?: (updates: { id: string; x: number; y: number }[]) => Promise<void>
}

export default function FloorMapEditor({ tables: initialTables, onSave }: EditorProps) {
  const [tables, setTables] = useState(initialTables)
  const [dragId, setDragId] = useState<string | null>(null)

  // ─── Sürükle-bırak (placeholder) ──────────────────────────────────────────
  const handleMouseDown = (id: string) => { setDragId(id) }
  const handleMouseMove = () => {
    // TODO: mouse pozisyonunu izometrik grid'e çevir
    // state'i güncelle
  }
  const handleMouseUp = () => { setDragId(null) }

  // ─── Kaydet (placeholder) ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!onSave) return
    const updates = tables.map(t => ({ id: t.id, x: t.x, y: t.y }))
    await onSave(updates)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-900">Masa Düzenleyici</h2>
        <button
          onClick={handleSave}
          disabled={!onSave}
          className="bg-[#E53935] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          Kaydet
        </button>
      </div>

      {/* SVG düzenleme alanı */}
      <div
        className="relative rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 440 320"
          style={{ display: 'block', width: '100%', height: 'auto', minHeight: 240 }}
        >
          {/* Zemin */}
          <rect x="0" y="0" width="440" height="320" fill="#FAFAFA" />

          {/* Grid referans çizgileri */}
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`gx${i}`} x1={i * 34} y1={0} x2={i * 34} y2={320}
              stroke="#E5E7EB" strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`gy${i}`} x1={0} y1={i * 36} x2={440} y2={i * 36}
              stroke="#E5E7EB" strokeWidth={0.5}
            />
          ))}

          {/* Masalar (sürüklenebilir) */}
          {tables.map(t => {
            const cx = t.x * 34 + 17
            const cy = t.y * 36 + 18
            const isDragging = dragId === t.id
            return (
              <g
                key={t.id}
                onMouseDown={() => handleMouseDown(t.id)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <rect
                  x={cx - 14} y={cy - 12}
                  width={28} height={24} rx={4}
                  fill={isDragging ? '#E53935' : '#C9A678'}
                  stroke={isDragging ? '#2B1B17' : '#D4A373'}
                  strokeWidth={isDragging ? 2 : 1}
                />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize={8}
                  fill="#fff" fontWeight="bold" style={{ pointerEvents: 'none' }}
                >
                  {t.label.replace('Masa ', 'M')}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Açıklama */}
      <p className="text-xs text-stone-400 italic">
        💡 Bu düzenleyici taslak aşamasındadır. Masaları sürüklemek ve koordinatları
        kaydetmek için geliştirme yapılması gerekir.
      </p>
    </div>
  )
}
