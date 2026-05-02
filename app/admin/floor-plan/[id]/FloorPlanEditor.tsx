'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Stage, Layer, Group, Rect, Text, Transformer } from 'react-konva'
import type Konva from 'konva'

export type ElementType = 'table' | 'tree' | 'window' | 'door'

export type EditorTable = {
  id: string
  label: string
  capacity: number
  x: number
  y: number
  width: number
  height: number
  shape: 'rect' | 'circle'
  element_type?: ElementType
}

interface Props {
  restaurantId: string
  initialTables: EditorTable[]
  floorPlanEnabled: boolean
}

const STAGE_W  = 880
const STAGE_H  = 560
const MIN_SIZE = 30
const GRID     = 20

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `t-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function isTable(t: EditorTable) {
  return !t.element_type || t.element_type === 'table'
}

function elementColors(t: EditorTable, sel: boolean) {
  if (t.element_type === 'tree') {
    return {
      fill:   sel ? '#BBF7D0' : '#86EFAC',
      stroke: sel ? '#16A34A' : '#15803D',
      text:   sel ? '#14532D' : '#166534',
    }
  }
  if (t.element_type === 'window') {
    return {
      fill:   sel ? '#BFDBFE' : '#DBEAFE',
      stroke: sel ? '#2563EB' : '#60A5FA',
      text:   sel ? '#1E40AF' : '#1D4ED8',
    }
  }
  if (t.element_type === 'door') {
    return {
      fill:   sel ? '#FDE68A' : '#FEF3C7',
      stroke: sel ? '#B45309' : '#D97706',
      text:   sel ? '#78350F' : '#92400E',
    }
  }
  // default: table
  return {
    fill:   sel ? '#DBEAFE' : '#FEF3C7',
    stroke: sel ? '#2563EB' : '#D97706',
    text:   sel ? '#1D4ED8' : '#92400E',
  }
}

export default function FloorPlanEditor({
  restaurantId,
  initialTables,
  floorPlanEnabled: initEnabled,
}: Props) {
  const [tables,     setTables]     = useState<EditorTable[]>(initialTables)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [editLabel,  setEditLabel]  = useState('')
  const [editCap,    setEditCap]    = useState(4)
  const [enabled,    setEnabled]    = useState(initEnabled)
  const [saving,     setSaving]     = useState(false)
  const [savedMsg,   setSavedMsg]   = useState(false)

  // Konva refs
  const groupRefs = useRef<Map<string, Konva.Group>>(new Map())
  const trRef     = useRef<Konva.Transformer>(null)

  // Fix 1: Transformer ayrı layer'da — group re-render tetiklemiyor
  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    const node = selectedId ? groupRefs.current.get(selectedId) : undefined
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selectedId])

  const registerRef = useCallback(
    (id: string) => (node: Konva.Group | null) => {
      if (node) groupRefs.current.set(id, node)
      else      groupRefs.current.delete(id)
    },
    []
  )

  const update = useCallback((id: string, patch: Partial<EditorTable>) => {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  // ── Actions ────────────────────────────────────────────────────────────────

  function addTable(shape: 'rect' | 'circle') {
    const count = tables.length
    setTables(prev => [
      ...prev,
      {
        id:           makeId(),
        label:        `M${count + 1}`,
        capacity:     4,
        x:            60 + (count % 5) * 150,
        y:            60 + Math.floor(count / 5) * 150,
        width:        shape === 'circle' ? 84 : 96,
        height:       shape === 'circle' ? 84 : 72,
        shape,
        element_type: 'table',
      },
    ])
  }

  // Fix 4: Dekoratif eleman ekleme (is_table=false)
  function addElement(element_type: 'tree' | 'window' | 'door') {
    const count = tables.length
    const defaults: Record<string, { w: number; h: number; shape: 'rect' | 'circle'; label: string }> = {
      tree:   { w: 52, h: 52, shape: 'circle', label: 'Ağaç' },
      window: { w: 100, h: 20, shape: 'rect',  label: 'Cam'  },
      door:   { w: 80,  h: 20, shape: 'rect',  label: 'Kapı' },
    }
    const d = defaults[element_type]
    setTables(prev => [
      ...prev,
      {
        id:           makeId(),
        label:        d.label,
        capacity:     0,
        x:            60 + (count % 5) * 140,
        y:            60 + Math.floor(count / 5) * 120,
        width:        d.w,
        height:       d.h,
        shape:        d.shape,
        element_type,
      },
    ])
  }

  function deleteSelected() {
    if (!selectedId) return
    setTables(prev => prev.filter(t => t.id !== selectedId))
    setSelectedId(null)
  }

  function openEdit(t: EditorTable) {
    setEditingId(t.id)
    setEditLabel(t.label)
    setEditCap(t.capacity)
  }

  function confirmEdit() {
    if (!editingId) return
    const t = tables.find(x => x.id === editingId)
    update(editingId, {
      label:    editLabel.trim() || (t ? t.label : 'Masa'),
      ...(t && isTable(t) ? { capacity: Math.max(1, editCap) } : {}),
    })
    setEditingId(null)
  }

  async function save() {
    setSaving(true)
    try {
      // Dekoratif elemanlar is_table=false olarak işaretleniyor
      const payload = tables.map(t => ({
        ...t,
        is_table: isTable(t),
      }))
      const res = await fetch('/api/admin/tables', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ restaurant_id: restaurantId, tables: payload, floor_plan_enabled: enabled }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Sunucu hatası')
      }
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => addTable('rect')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200
                     text-amber-800 text-sm font-semibold hover:bg-amber-100 transition-colors"
        >
          <span className="text-base">⬛</span> Kare Masa Ekle
        </button>
        <button
          onClick={() => addTable('circle')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200
                     text-amber-800 text-sm font-semibold hover:bg-amber-100 transition-colors"
        >
          <span className="text-base">⬤</span> Yuvarlak Masa Ekle
        </button>

        {/* Fix 4: Yeni eleman butonları */}
        <button
          onClick={() => addElement('tree')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200
                     text-green-800 text-sm font-semibold hover:bg-green-100 transition-colors"
        >
          🌳 Ağaç
        </button>
        <button
          onClick={() => addElement('window')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200
                     text-blue-800 text-sm font-semibold hover:bg-blue-100 transition-colors"
        >
          🪟 Cam
        </button>
        <button
          onClick={() => addElement('door')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200
                     text-orange-800 text-sm font-semibold hover:bg-orange-100 transition-colors"
        >
          🚪 Kapı
        </button>

        <button
          onClick={deleteSelected}
          disabled={!selectedId}
          className="px-4 py-2.5 rounded-xl border border-red-200 text-red-700 text-sm font-semibold
                     hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🗑 Sil
        </button>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Kroki aktif
          </label>
          <button
            onClick={save}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60
              ${savedMsg
                ? 'bg-green-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {saving ? 'Kaydediliyor…' : savedMsg ? '✓ Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-zinc-400">
        Tıklayarak seçin · Sürükleyerek konumlandırın · Kenarlıktan çekerek boyutlandırın · Çift tıklayarak adı düzenleyin
      </p>

      {/* Canvas */}
      <div
        className="rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50"
        style={{ width: STAGE_W, maxWidth: '100%' }}
      >
        <Stage
          width={STAGE_W}
          height={STAGE_H}
          onMouseDown={e => {
            if (e.target === e.target.getStage()) setSelectedId(null)
          }}
        >
          {/* Fix 3: Grid ayrı layer — hiç event dinlemiyor, table layer'ını yavaşlatmıyor */}
          <Layer listening={false}>
            {Array.from({ length: Math.floor(STAGE_W / GRID) + 1 }, (_, i) => (
              <Rect key={`v${i}`} x={i * GRID} y={0} width={1} height={STAGE_H}
                fill="#E5E7EB" perfectDrawEnabled={false} />
            ))}
            {Array.from({ length: Math.floor(STAGE_H / GRID) + 1 }, (_, i) => (
              <Rect key={`h${i}`} x={0} y={i * GRID} width={STAGE_W} height={1}
                fill="#E5E7EB" perfectDrawEnabled={false} />
            ))}
          </Layer>

          {/* Tables layer */}
          <Layer>
            {tables.map(t => {
              const sel    = selectedId === t.id
              const radius = t.shape === 'circle'
                ? Math.min(t.width, t.height) / 2
                : 8
              const colors = elementColors(t, sel)
              const isThin = (t.element_type === 'window' || t.element_type === 'door')

              return (
                // Fix 1: perfectDrawEnabled={false} — Konva'nın çift render pass'ini devre dışı bırakır
                <Group
                  key={t.id}
                  ref={registerRef(t.id)}
                  x={t.x}
                  y={t.y}
                  draggable
                  perfectDrawEnabled={false}
                  onClick={() => setSelectedId(t.id)}
                  onDblClick={() => openEdit(t)}
                  // Fix 3: onDragEnd ile kaydet (onDragMove'da her frame state update olmamalı)
                  onDragEnd={e =>
                    update(t.id, { x: e.target.x(), y: e.target.y() })
                  }
                  onTransformEnd={e => {
                    const node = e.target as Konva.Group
                    const sx   = node.scaleX()
                    const sy   = node.scaleY()
                    node.scaleX(1)
                    node.scaleY(1)
                    update(t.id, {
                      x:      node.x(),
                      y:      node.y(),
                      width:  Math.max(MIN_SIZE, t.width  * sx),
                      height: Math.max(MIN_SIZE, t.height * sy),
                    })
                  }}
                >
                  <Rect
                    width={t.width}
                    height={t.height}
                    cornerRadius={radius}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={sel ? 2.5 : 1.5}
                    shadowBlur={sel ? 10 : 4}
                    shadowColor={sel ? '#93C5FD' : '#00000018'}
                    shadowEnabled
                    perfectDrawEnabled={false}
                  />
                  {/* Fix 1: sadece bir Text — label ortada, ince elemanlarda üstte */}
                  <Text
                    width={t.width}
                    y={isThin ? (t.height / 2 - 6) : (t.height / 2 - 12)}
                    align="center"
                    text={t.label}
                    fontSize={isThin ? 9 : 13}
                    fontStyle="bold"
                    fill={colors.text}
                    listening={false}
                    perfectDrawEnabled={false}
                  />
                  {/* Kapasite sadece masa tiplerinde gösterilir */}
                  {isTable(t) && (
                    <Text
                      width={t.width}
                      y={t.height / 2 + 2}
                      align="center"
                      text={`${t.capacity} kişi`}
                      fontSize={10}
                      fill={colors.text}
                      listening={false}
                      perfectDrawEnabled={false}
                    />
                  )}
                </Group>
              )
            })}
          </Layer>

          {/* Fix 1: Transformer ayrı layer'da — table layer'ını kirletmiyor */}
          <Layer>
            <Transformer
              ref={trRef}
              rotateEnabled={false}
              keepRatio={false}
              boundBoxFunc={(old, box) =>
                box.width < MIN_SIZE || box.height < MIN_SIZE ? old : box
              }
            />
          </Layer>
        </Stage>
      </div>

      {tables.length === 0 && (
        <p className="text-center text-sm text-zinc-400 py-4">
          Yukarıdaki butonlarla masa ekleyerek başlayın.
        </p>
      )}

      {/* Edit modal */}
      {editingId && (() => {
        const t = tables.find(x => x.id === editingId)
        if (!t) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-80">
              <h3 className="font-bold text-zinc-900 mb-4">
                {isTable(t) ? 'Masa Düzenle' : 'Eleman Düzenle'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    {isTable(t) ? 'Masa Adı / No' : 'Etiket'}
                  </label>
                  {/* Fix 2: text rengi explicit — background ile aynı renge düşmesin */}
                  <input
                    autoFocus
                    type="text"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmEdit()}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm
                               focus:outline-none focus:border-red-400 transition-colors"
                    style={{ color: '#1a1a1a', backgroundColor: '#ffffff' }}
                  />
                </div>
                {isTable(t) && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Kapasite (kişi)
                    </label>
                    {/* Fix 2: text rengi explicit */}
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={editCap}
                      onChange={e => setEditCap(parseInt(e.target.value, 10) || 1)}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm
                                 focus:outline-none focus:border-red-400 transition-colors"
                      style={{ color: '#1a1a1a', backgroundColor: '#ffffff' }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm
                             text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={confirmEdit}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700
                             text-white text-sm font-bold transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
