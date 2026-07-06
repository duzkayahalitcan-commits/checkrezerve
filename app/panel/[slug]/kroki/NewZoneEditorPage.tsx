'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import type { KrokiZone, ZoneTheme } from '@/src/types/kroki-zone'
import { ZONE_THEME_LABELS, ZONE_THEME_BG } from '@/src/types/kroki-zone'

const C = {
  red: '#E53935', espresso: '#2B1B17', espressoL: '#3D2820', espressoM: '#4A3028',
  gold: '#D4A373', goldDim: '#A07850', surface: '#1A1008', panel: '#221510',
  border: '#3D2820', text: '#F5EDE4', textMuted: '#9E7A60', textFaint: '#5A3828',
}

const THEME_ORDER: ZoneTheme[] = ['ic_mekan', 'bahce', 'teras', 'teras_alt', 'sokak']
const PRESET_COLORS = ['#E53935', '#FF6F00', '#FDD835', '#43A047', '#1E88E5', '#8E24AA', '#00ACC1', '#6D4C41']

export default function NewZoneEditorPage({
  restaurantId,
  slug,
  initialZones,
}: {
  restaurantId: string
  slug: string
  initialZones: KrokiZone[]
}) {
  const router = useRouter()
  const toast = useToast()
  const [zones, setZones] = useState<KrokiZone[]>(initialZones)
  const [editing, setEditing] = useState<KrokiZone | null>(null)
  const [saving, setSaving] = useState(false)

  const addZone = () => {
    setZones(zs => {
      // Mevcut isimlerden en yüksek "Bölge N" numarasını bul
      let maxNum = 0
      for (const z of zs) {
        const m = z.name.match(/Bölge (\d+)/)
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10))
      }
      const newZone: KrokiZone = {
        id: crypto.randomUUID(),
        name: `Bölge ${maxNum + 1}`,
        color: PRESET_COLORS[zs.length % PRESET_COLORS.length],
        capacity: 20,
        tableCount: 0,
        theme: 'ic_mekan',
        polygon: [],
      }
      setEditing(newZone)
      return [...zs, newZone]
    })
  }

  const deleteZone = (id: string) => {
    setZones(zs => zs.filter(z => z.id !== id))
    if (editing?.id === id) setEditing(null)
  }

  const updateZone = (id: string, patch: Partial<KrokiZone>) => {
    setZones(zs => zs.map(z => z.id === id ? { ...z, ...patch } : z))
    if (editing?.id === id) setEditing(prev => prev ? { ...prev, ...patch } : null)
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/panel/kroki-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId, kroki_zones: zones }),
      })
      if (!res.ok) throw new Error('Kaydedilemedi')
      toast.show('Bölgeler kaydedildi ✅', 'success')
      router.refresh()
    } catch {
      toast.show('Bölgeler kaydedilemedi', 'error')
    }
    setSaving(false)
  }

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      minHeight: 0,
      background: C.surface,
      color: C.text,
      fontFamily: "'DM Sans','Inter',sans-serif",
    }}>
      {/* Main zone grid */}
      <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Bölgeler</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{zones.length} bölge</div>
          </div>
          <button
            onClick={addZone}
            style={{
              background: C.red,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            + Bölge Ekle
          </button>
        </div>

        {/* Zone cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}>
          {zones.map(zone => (
            <div
              key={zone.id}
              onClick={() => setEditing(zone)}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                border: `2px solid ${editing?.id === zone.id ? C.red : C.border}`,
                transition: 'all 0.15s',
                background: C.panel,
              }}
            >
              {/* Card image */}
              <div style={{
                height: 130,
                background: `url(${zone.customPhoto ?? ZONE_THEME_BG[zone.theme]}) center/cover`,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: zone.color,
                  borderRadius: '50%',
                  width: 14,
                  height: 14,
                  border: '2px solid #fff',
                }} />
              </div>
              {/* Card info */}
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  {zone.name}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted }}>
                  {ZONE_THEME_LABELS[zone.theme]} · {zone.capacity} kişi
                </div>
                {zone.tableCount > 0 && (
                  <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2 }}>
                    {zone.tableCount} masa
                  </div>
                )}
              </div>
            </div>
          ))}
          {zones.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              color: C.textMuted,
              fontSize: 13,
            }}>
              Henüz bölge eklenmemiş. "Bölge Ekle" butonuna tıklayın.
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button
            onClick={saveAll}
            disabled={saving}
            style={{
              background: C.red,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              padding: '10px 24px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Kaydediliyor...' : 'Bölgeleri Kaydet'}
          </button>
        </div>
      </div>

      {/* Right panel — edit zone */}
      {editing && (
        <div style={{
          width: 260,
          flexShrink: 0,
          background: C.panel,
          borderLeft: `1px solid ${C.border}`,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflow: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Bölge Düzenle</div>
            <button
              onClick={() => setEditing(null)}
              style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 16, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize: 9, color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 }}>Bölge Adı</label>
            <input
              value={editing.name}
              onChange={e => updateZone(editing.id, { name: e.target.value })}
              style={{
                width: '100%',
                background: C.espressoL,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 13,
                padding: '8px 10px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Theme */}
          <div>
            <label style={{ fontSize: 9, color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 }}>Bölge Görseli</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {THEME_ORDER.map(tid => (
                <button
                  key={tid}
                  onClick={() => updateZone(editing.id, { theme: tid })}
                  style={{
                    padding: 0,
                    borderRadius: 6,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${editing.theme === tid ? C.red : C.border}`,
                    background: 'none',
                  }}
                >
                  <div style={{ height: 50, background: `url(${ZONE_THEME_BG[tid]}) center/cover` }} />
                  <div style={{
                    fontSize: 9,
                    padding: '3px 0',
                    textAlign: 'center',
                    background: C.espressoL,
                    color: editing.theme === tid ? C.red : C.textMuted,
                    fontWeight: editing.theme === tid ? 700 : 400,
                  }}>
                    {ZONE_THEME_LABELS[tid]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label style={{ fontSize: 9, color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 }}>Renk</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(col => (
                <button
                  key={col}
                  onClick={() => updateZone(editing.id, { color: col })}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: col,
                    border: `2px solid ${editing.color === col ? '#fff' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Custom photo upload — W-100 A3 */}
          <div>
            <label style={{ fontSize: 9, color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 }}>Kendi Fotoğrafını Yükle</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file || !editing) return
                if (file.size > 5 * 1024 * 1024) {
                  toast.show('Fotoğraf en fazla 5MB olabilir', 'error')
                  return
                }
                try {
                  const fd = new FormData()
                  fd.append('photo', file)
                  fd.append('zone_id', editing.id)
                  fd.append('restaurant_id', restaurantId)
                  const res = await fetch('/api/panel/zone-photo', { method: 'POST', body: fd })
                  const json = await res.json()
                  if (!res.ok) throw new Error(json.error ?? 'Yüklenemedi')
                  updateZone(editing.id, { customPhoto: json.photo_url } as Partial<KrokiZone>)
                  toast.show('Fotoğraf yüklendi ✅', 'success')
                } catch (err) {
                  toast.show(err instanceof Error ? err.message : 'Yüklenemedi', 'error')
                }
                e.target.value = ''
              }}
              style={{ display: 'none' }}
              id={`photo-upload-${editing?.id ?? ''}`}
            />
            <label
              htmlFor={`photo-upload-${editing?.id ?? ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px',
                borderRadius: 6,
                background: C.espressoL,
                border: `1px dashed ${C.border}`,
                color: C.textMuted,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              📷 Fotoğraf Seç
            </label>
            {editing.customPhoto && (
              <div style={{ marginTop: 8, position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editing.customPhoto}
                  alt=""
                  style={{ width: '100%', height: 80, borderRadius: 6, objectFit: 'cover' }}
                />
                <button
                  onClick={() => updateZone(editing.id, { customPhoto: '' })}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: '#00000080', border: 'none', borderRadius: 4,
                    color: '#fff', fontSize: 10, padding: '2px 6px', cursor: 'pointer',
                  }}
                >
                  ✕ Varsayılana Dön
                </button>
              </div>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label style={{ fontSize: 9, color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 }}>Kapasite (kişi)</label>
            <input
              type="number"
              min={1}
              value={editing.capacity}
              onChange={e => updateZone(editing.id, { capacity: parseInt(e.target.value) || 1 })}
              style={{
                width: '100%',
                background: C.espressoL,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 13,
                padding: '8px 10px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Table count */}
          <div>
            <label style={{ fontSize: 9, color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 }}>Masa Sayısı</label>
            <input
              type="number"
              min={0}
              value={editing.tableCount}
              onChange={e => updateZone(editing.id, { tableCount: parseInt(e.target.value) || 0 })}
              style={{
                width: '100%',
                background: C.espressoL,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 13,
                padding: '8px 10px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Delete */}
          <button
            onClick={() => deleteZone(editing.id)}
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
              marginTop: 'auto',
            }}
          >
            🗑 Bölgeyi Sil
          </button>
        </div>
      )}
    </div>
  )
}
