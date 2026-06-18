'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Grid3X3, Save, Trash2, X, Circle, Square, Maximize2,
  ArrowLeft, ArrowRight, GripHorizontal, RefreshCw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

type Table = {
  id: string
  label: string
  capacity: number
  area_id: string | null
  x: number
  y: number
  width: number
  height: number
  shape: 'rect' | 'circle'
  rotation: number
  is_active: boolean
}

type SpecialArea = {
  id: string
  name: string
  capacity: number
  color: string | null
}

interface Props {
  tables: Table[]
  areas: SpecialArea[]
  restaurantId: string
}

const CANVAS_W = 800
const CANVAS_H = 600
const GRID = 20
const SNAP = 10

const AREA_COLORS: Record<string, string> = {
  mavi: '#3B82F6',
  yesil: '#22C55E',
  turuncu: '#F97316',
  gri: '#6B7280',
}

const AREA_COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Mavi' },
  { value: '#22C55E', label: 'Yeşil' },
  { value: '#F97316', label: 'Turuncu' },
  { value: '#6B7280', label: 'Gri' },
  { value: '#8B5CF6', label: 'Mor' },
  { value: '#EC4899', label: 'Pembe' },
]

function snap(v: number): number {
  return Math.round(v / SNAP) * SNAP
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export default function FloorPlanEditor({ tables, areas, restaurantId }: Props) {
  const router = useRouter()
  const toast = useToast()
  const canvasRef = useRef<HTMLDivElement>(null)

  // State
  const [activeAreaId, setActiveAreaId] = useState<string | null>(
    areas.length > 0 ? areas[0].id : null
  )
  const [tableList, setTableList] = useState<Table[]>(tables)
  const [areaList, setAreaList] = useState<SpecialArea[]>(areas)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editForm, setEditForm] = useState({ label: '', capacity: 4, shape: 'rect' as 'rect' | 'circle', width: 80, height: 80, rotation: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [newTableShape, setNewTableShape] = useState<'rect' | 'circle'>('rect')
  const [showPalette, setShowPalette] = useState(true)

  // New area form
  const [newAreaName, setNewAreaName] = useState('')
  const [newAreaColor, setNewAreaColor] = useState('#3B82F6')
  const [showNewArea, setShowNewArea] = useState(false)
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null)
  const [editAreaName, setEditAreaName] = useState('')

  // Filter tables by active area
  const activeTables = tableList.filter(t =>
    t.area_id === activeAreaId && t.is_active
  )
  const selectedTable = selectedTableId
    ? tableList.find(t => t.id === selectedTableId) ?? null
    : null

  // When selecting a table, populate edit form
  useEffect(() => {
    if (selectedTable) {
      setEditForm({
        label: selectedTable.label,
        capacity: selectedTable.capacity,
        shape: selectedTable.shape,
        width: selectedTable.width,
        height: selectedTable.height,
        rotation: selectedTable.rotation ?? 0,
      })
    }
  }, [selectedTableId])

  // ─── Drag handlers ───
  const handleMouseDown = useCallback((e: React.MouseEvent, tableId: string) => {
    e.preventDefault()
    setSelectedTableId(tableId)
    const table = tableList.find(t => t.id === tableId)
    if (!table || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    setDragging(tableId)
    setDragOffset({
      x: e.clientX - rect.left - table.x,
      y: e.clientY - rect.top - table.y,
    })
  }, [tableList])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    let nx = snap(e.clientX - rect.left - dragOffset.x)
    let ny = snap(e.clientY - rect.top - dragOffset.y)
    nx = clamp(nx, 0, CANVAS_W - 40)
    ny = clamp(ny, 0, CANVAS_H - 40)

    setTableList(prev => prev.map(t =>
      t.id === dragging ? { ...t, x: nx, y: ny } : t
    ))
  }, [dragging, dragOffset])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  // ─── Add table to canvas ───
  async function addTable(shape: 'rect' | 'circle') {
    const draft = {
      table: 'tables',
      payload: {
        label: `M${(tableList.filter(t => t.area_id === activeAreaId).length + 1)}`,
        capacity: shape === 'circle' ? 4 : 2,
        shape,
        width: shape === 'circle' ? 60 : shape === 'rect' ? 80 : 80,
        height: 60,
        x: 50 + Math.random() * 150,
        y: 50 + Math.random() * 150,
        rotation: 0,
        area_id: activeAreaId,
        is_active: true,
      },
    }

    try {
      const res = await fetch('/api/panel-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      setTableList(prev => [...prev, { ...draft.payload, id: data.id } as unknown as Table])
      toast.show('Masa eklendi', 'success')
    } catch {
      toast.show('Eklenemedi', 'error')
    }
  }

  // ─── Delete table ───
  async function deleteTable(id: string) {
    try {
      await fetch('/api/panel-tables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'tables', id }),
      })
      setTableList(prev => prev.filter(t => t.id !== id))
      setSelectedTableId(null)
      toast.show('Silindi', 'success')
    } catch {
      toast.show('Silinemedi', 'error')
    }
  }

  // ─── Save edit form changes ───
  async function saveEdit() {
    if (!selectedTable) return
    try {
      await fetch('/api/tables/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tables: [{
            id: selectedTable.id,
            label: editForm.label,
            capacity: editForm.capacity,
            shape: editForm.shape,
            width: editForm.width,
            height: editForm.height,
            rotation: editForm.rotation,
          }],
        }),
      })
      setTableList(prev => prev.map(t =>
        t.id === selectedTable.id ? { ...t, ...editForm } : t
      ))
      toast.show('Güncellendi', 'success')
    } catch {
      toast.show('Güncellenemedi', 'error')
    }
  }

  // ─── Bulk save all positions ───
  async function bulkSave() {
    setIsSaving(true)
    const updates = tableList
      .filter(t => t.area_id === activeAreaId)
      .map(t => ({
        id: t.id,
        x: t.x,
        y: t.y,
        rotation: t.rotation ?? 0,
      }))

    if (updates.length === 0) { setIsSaving(false); return }

    try {
      const res = await fetch('/api/tables/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables: updates }),
      })
      if (!res.ok) throw new Error()
      toast.show(`${updates.length} masa kaydedildi`, 'success')
    } catch {
      toast.show('Kayıt başarısız', 'error')
    }
    setIsSaving(false)
  }

  // ─── Add area ───
  async function addArea() {
    if (!newAreaName.trim()) return
    try {
      const res = await fetch('/api/panel-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'special_areas',
          payload: { name: newAreaName.trim(), capacity: 10, color: newAreaColor },
        }),
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      const newArea = { id: data.id, name: newAreaName.trim(), capacity: 10, color: newAreaColor }
      setAreaList(prev => [...prev, newArea])
      setActiveAreaId(newArea.id)
      setNewAreaName('')
      setShowNewArea(false)
      toast.show('Alan eklendi', 'success')
    } catch {
      toast.show('Eklenemedi', 'error')
    }
  }

  // ─── Delete area ───
  async function deleteArea(id: string) {
    try {
      await fetch('/api/panel-tables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'special_areas', id }),
      })
      setAreaList(prev => {
        const next = prev.filter(a => a.id !== id)
        if (activeAreaId === id) setActiveAreaId(next[0]?.id ?? null)
        return next
      })
      toast.show('Alan silindi', 'success')
    } catch {
      toast.show('Silinemedi', 'error')
    }
  }

  // ─── Edit area name ───
  async function saveAreaName(id: string) {
    if (!editAreaName.trim()) return
    try {
      await fetch('/api/panel-tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'special_areas', id, payload: { name: editAreaName.trim() } }),
      })
      setAreaList(prev => prev.map(a => a.id === id ? { ...a, name: editAreaName.trim() } : a))
      setEditingAreaId(null)
      toast.show('Güncellendi', 'success')
    } catch {
      toast.show('Güncellenemedi', 'error')
    }
  }

  const activeArea = areaList.find(a => a.id === activeAreaId)
  const areaColor = activeArea?.color || '#6B7280'

  return (
    <div className="space-y-4">
      {/* ═══ Area Tabs ═══ */}
      <div className="flex flex-wrap items-center gap-2">
        {areaList.map(a => (
          <div key={a.id} className="relative group">
            <button
              onClick={() => { setActiveAreaId(a.id); setSelectedTableId(null) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeAreaId === a.id
                  ? 'bg-stone-800 text-white border-stone-600 shadow-sm'
                  : 'text-stone-400 border-stone-800 hover:text-white hover:border-stone-600'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: a.color || '#6B7280' }}
              />
              {a.name}
              <span className="text-[11px] text-stone-500 ml-1">
                {tableList.filter(t => t.area_id === a.id && t.is_active).length}
              </span>
            </button>
            {editingAreaId === a.id ? (
              <div className="absolute top-full left-0 mt-2 z-20 flex gap-2 bg-stone-900 border border-stone-700 rounded-xl p-2 shadow-xl">
                <input
                  value={editAreaName}
                  onChange={e => setEditAreaName(e.target.value)}
                  className="w-28 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && saveAreaName(a.id)}
                />
                <button onClick={() => saveAreaName(a.id)} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"><ArrowRight size={12} /></button>
                <button onClick={() => setEditingAreaId(null)} className="p-1 rounded bg-stone-800 text-stone-400 hover:text-white"><X size={12} /></button>
              </div>
            ) : (
              <div className="absolute top-0 right-0 -mr-1 -mt-1 hidden group-hover:flex gap-0.5">
                <button
                  onClick={() => { setEditingAreaId(a.id); setEditAreaName(a.name) }}
                  className="w-4 h-4 rounded-full bg-stone-700 text-stone-300 hover:bg-stone-600 flex items-center justify-center"
                  title="Adı düzenle"
                >
                  <span className="text-[8px]">✎</span>
                </button>
                <button
                  onClick={() => deleteArea(a.id)}
                  className="w-4 h-4 rounded-full bg-red-500/30 text-red-300 hover:bg-red-500/50 flex items-center justify-center"
                  title="Alanı sil"
                >
                  <X size={8} />
                </button>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => setShowNewArea(!showNewArea)}
          className="px-3 py-2 rounded-xl text-xs font-medium text-stone-400 border border-dashed border-stone-700 hover:text-white hover:border-stone-500 transition-colors"
        >
          + Alan Ekle
        </button>
      </div>

      {/* New area form */}
      <AnimatePresence>
        {showNewArea && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl p-3"
          >
            <input
              value={newAreaName}
              onChange={e => setNewAreaName(e.target.value)}
              placeholder="Alan adı"
              className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              onKeyDown={e => e.key === 'Enter' && addArea()}
            />
            <select
              value={newAreaColor}
              onChange={e => setNewAreaColor(e.target.value)}
              className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-xs text-white"
            >
              {AREA_COLOR_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button onClick={addArea} disabled={!newAreaName.trim()} className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-semibold">
              Ekle
            </button>
            <button onClick={() => setShowNewArea(false)} className="p-2 rounded-lg text-stone-500 hover:text-white"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Main Canvas + Sidebar ═══ */}
      <div className="flex gap-4">
        {/* Shape Palette */}
        {showPalette && (
          <div className="w-20 shrink-0 space-y-2">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Şekiller</p>
            <button
              onClick={() => addTable('rect')}
              className="w-full flex flex-col items-center gap-1 p-2 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 transition-colors group"
              title="Kare masa (2 kişi)"
            >
              <Square size={22} className="text-stone-400 group-hover:text-white transition-colors" />
              <span className="text-[9px] text-stone-500 group-hover:text-stone-300">2 kişi</span>
            </button>
            <button
              onClick={() => addTable('rect')}
              className="w-full flex flex-col items-center gap-1 p-2 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 transition-colors group"
              title="Dikdörtgen masa (4 kişi)"
            >
              <Maximize2 size={22} className="text-stone-400 group-hover:text-white transition-colors" />
              <span className="text-[9px] text-stone-500 group-hover:text-stone-300">4 kişi</span>
            </button>
            <button
              onClick={() => addTable('circle')}
              className="w-full flex flex-col items-center gap-1 p-2 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 transition-colors group"
              title="Yuvarlak masa (4 kişi)"
            >
              <Circle size={22} className="text-stone-400 group-hover:text-white transition-colors" />
              <span className="text-[9px] text-stone-500 group-hover:text-stone-300">4 kişi</span>
            </button>
            <button
              onClick={() => setShowPalette(false)}
              className="w-full p-2 rounded-xl border border-stone-800 text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
              title="Paneli gizle"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {!showPalette && (
          <button
            onClick={() => setShowPalette(true)}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl border border-stone-800 text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
            title="Şekil panelini göster"
          >
            <GripHorizontal size={14} />
          </button>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className="relative overflow-hidden rounded-2xl border border-stone-700 bg-stone-900/50 cursor-crosshair"
            style={{ width: CANVAS_W, height: CANVAS_H, backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `, backgroundSize: `${GRID}px ${GRID}px` }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Room silhouette hint */}
            <div className="absolute inset-4 border-2 border-dashed border-stone-800/50 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-stone-800 text-xs font-medium select-none">
                {activeArea?.name ?? 'Alan'} — Masaları sürükleyip bırakın
              </span>
            </div>

            {activeTables.map(t => {
              const isSelected = selectedTableId === t.id
              const isDragging = dragging === t.id
              const rotation = t.rotation ?? 0
              const radius = t.shape === 'circle' ? Math.min(t.width, t.height) / 2 : 8

              return (
                <div
                  key={t.id}
                  onMouseDown={e => handleMouseDown(e, t.id)}
                  style={{
                    position: 'absolute',
                    left: t.x,
                    top: t.y,
                    width: t.width,
                    height: t.height,
                    transform: `rotate(${rotation}deg)`,
                    borderRadius: radius,
                    border: `2px solid ${isSelected ? '#E53935' : isDragging ? '#F97316' : '#E0E0E0'}`,
                    backgroundColor: isSelected ? '#FFF5F5' : isDragging ? '#FFFBEB' : '#F5F5F5',
                    cursor: 'grab',
                    zIndex: isDragging ? 100 : isSelected ? 10 : 1,
                    boxShadow: isSelected ? '0 0 0 3px rgba(229,57,53,0.2)' : isDragging ? '0 4px 12px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.15)',
                    transition: isDragging ? 'none' : 'box-shadow 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                  }}
                >
                  <span className="text-xs font-bold text-stone-800 leading-none" style={{ fontSize: t.width > 70 ? 11 : 9 }}>
                    {t.label}
                  </span>
                  <span className="text-[9px] text-stone-500 leading-none mt-0.5">
                    {t.capacity} kişi
                  </span>
                </div>
              )
            })}
          </div>

          {/* Toolbar below canvas */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Grid3X3 size={12} />
              {activeTables.length} masa aktif
              {dragging && <span className="text-amber-400 ml-2">Sürükleniyor...</span>}
            </div>
            <button
              onClick={bulkSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-sm font-semibold transition-colors"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </div>

        {/* ═══ Right Edit Sidebar ═══ */}
        <AnimatePresence>
          {selectedTable && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-56 shrink-0 bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Masa Düzenle</h3>
                <button onClick={() => setSelectedTableId(null)} className="text-stone-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Label */}
                <div>
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Ad / Numara</label>
                  <input
                    value={editForm.label}
                    onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                    className="w-full mt-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Kapasite</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={editForm.capacity}
                    onChange={e => setEditForm(f => ({ ...f, capacity: Math.min(20, Math.max(1, Number(e.target.value) || 1)) }))}
                    className="w-full mt-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Shape */}
                <div>
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Şekil</label>
                  <select
                    value={editForm.shape}
                    onChange={e => setEditForm(f => ({ ...f, shape: e.target.value as 'rect' | 'circle' }))}
                    className="w-full mt-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="rect">Kare/Dikdörtgen</option>
                    <option value="circle">Yuvarlak</option>
                  </select>
                </div>

                {/* Width */}
                <div>
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Genişlik</label>
                  <input
                    type="number"
                    min={40}
                    max={200}
                    value={editForm.width}
                    onChange={e => setEditForm(f => ({ ...f, width: clamp(Number(e.target.value) || 40, 40, 200) }))}
                    className="w-full mt-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Yükseklik</label>
                  <input
                    type="number"
                    min={40}
                    max={200}
                    value={editForm.height}
                    onChange={e => setEditForm(f => ({ ...f, height: clamp(Number(e.target.value) || 40, 40, 200) }))}
                    className="w-full mt-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <label className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Dönüş</label>
                  <div className="flex gap-1 mt-1">
                    {[0, 90, 180, 270].map(deg => (
                      <button
                        key={deg}
                        onClick={() => setEditForm(f => ({ ...f, rotation: deg }))}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          editForm.rotation === deg
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save edit */}
                <button
                  onClick={saveEdit}
                  className="w-full px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors"
                >
                  Uygula
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteTable(selectedTable.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm font-medium transition-colors"
                >
                  <Trash2 size={13} /> Masayı Sil
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
