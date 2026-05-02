'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Stage, Layer, Group, Rect, Text, Transformer } from 'react-konva'
import type Konva from 'konva'

export type EditorTable = {
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
  initialTables: EditorTable[]
  floorPlanEnabled: boolean
}

const STAGE_W  = 880
const STAGE_H  = 560
const MIN_SIZE = 50
const GRID     = 20

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `t-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function FloorPlanEditor({
  restaurantId,
  initialTables,
  floorPlanEnabled: initEnabled,
}: Props) {
  const [tables,    setTables]    = useState<EditorTable[]>(initialTables)
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

  // Keep transformer attached to selected node
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
        id:       makeId(),
        label:    `M${count + 1}`,
        capacity: 4,
        x:        60 + (count % 5) * 150,
        y:        60 + Math.floor(count / 5) * 150,
        width:    shape === 'circle' ? 84 : 96,
        height:   shape === 'circle' ? 84 : 72,
        shape,
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
    update(editingId, {
      label:    editLabel.trim() || 'Masa',
      capacity: Math.max(1, editCap),
    })
    setEditingId(null)
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/tables', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ restaurant_id: restaurantId, tables, floor_plan_enabled: enabled }),
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
          <Layer>
            {/* Subtle grid */}
            {Array.from({ length: Math.floor(STAGE_W / GRID) + 1 }, (_, i) => (
              <Rect key={`v${i}`} x={i * GRID} y={0} width={1} height={STAGE_H}
                fill="#E5E7EB" listening={false} />
            ))}
            {Array.from({ length: Math.floor(STAGE_H / GRID) + 1 }, (_, i) => (
              <Rect key={`h${i}`} x={0} y={i * GRID} width={STAGE_W} height={1}
                fill="#E5E7EB" listening={false} />
            ))}

            {/* Tables */}
            {tables.map(t => {
              const sel    = selectedId === t.id
              const radius = t.shape === 'circle'
                ? Math.min(t.width, t.height) / 2
                : 8
              return (
                <Group
                  key={t.id}
                  ref={registerRef(t.id)}
                  x={t.x}
                  y={t.y}
                  draggable
                  onClick={() => setSelectedId(t.id)}
                  onDblClick={() => openEdit(t)}
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
                  {/* Table shape */}
                  <Rect
                    width={t.width}
                    height={t.height}
                    cornerRadius={radius}
                    fill={sel ? '#DBEAFE' : '#FEF3C7'}
                    stroke={sel ? '#2563EB' : '#D97706'}
                    strokeWidth={sel ? 2.5 : 1.5}
                    shadowBlur={sel ? 10 : 4}
                    shadowColor={sel ? '#93C5FD' : '#00000018'}
                    shadowEnabled
                  />
                  {/* Label */}
                  <Text
                    width={t.width}
                    y={t.height / 2 - 12}
                    align="center"
                    text={t.label}
                    fontSize={13}
                    fontStyle="bold"
                    fill={sel ? '#1D4ED8' : '#92400E'}
                    listening={false}
                  />
                  {/* Capacity */}
                  <Text
                    width={t.width}
                    y={t.height / 2 + 2}
                    align="center"
                    text={`${t.capacity} kişi`}
                    fontSize={10}
                    fill={sel ? '#3B82F6' : '#B45309'}
                    listening={false}
                  />
                </Group>
              )
            })}

            {/* Single shared transformer */}
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
              <h3 className="font-bold text-zinc-900 mb-4">Masa Düzenle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Masa Adı / No
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmEdit()}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm
                               focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Kapasite (kişi)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={editCap}
                    onChange={e => setEditCap(parseInt(e.target.value, 10) || 1)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm
                               focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
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
