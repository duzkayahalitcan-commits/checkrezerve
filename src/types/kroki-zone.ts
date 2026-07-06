// ─── Bölge (Zone) Sistemi ─────────────────────────────────────────────────────

export type ZoneTheme =
  | 'ic_mekan'
  | 'bahce'
  | 'teras'
  | 'teras_alt'
  | 'sokak'

export const ZONE_THEME_LABELS: Record<ZoneTheme, string> = {
  ic_mekan:  'İç Mekan',
  bahce:     'Bahçe',
  teras:     'Teras',
  teras_alt: 'Teras (Alt)',
  sokak:     'Sokak',
}

export const ZONE_THEME_BG: Record<ZoneTheme, string> = {
  ic_mekan:  '/images/kroki/ic_mekan.jpg',
  bahce:     '/images/kroki/bahce.jpg',
  teras:     '/images/kroki/teras.jpg',
  teras_alt: '/images/kroki/teras_alt.jpg',
  sokak:     '/images/kroki/sokak.jpg',
}

// Normalize edilmiş koordinat (0–1 arası, canvas boyutundan bağımsız)
export interface ZonePoint {
  x: number  // 0.0 – 1.0
  y: number  // 0.0 – 1.0
}

export interface KrokiZone {
  id:         string
  name:       string
  color:      string        // hex renk, örn "#E53935"
  capacity:   number        // toplam kişi kapasitesi
  tableCount: number        // masa sayısı
  theme:      ZoneTheme
  // rectangle olarak saklansa da polygon olarak tutulur: 4 köşe
  // polygon[0]=sol-üst, [1]=sağ-üst, [2]=sağ-alt, [3]=sol-alt
  polygon:    ZonePoint[]
  // W-100: custom photo URL — null veya boş string = tema görseli kullan
  customPhoto?: string | null
}

// Sıfır zona yardımcı constructor
export function emptyZone(overrides?: Partial<KrokiZone>): KrokiZone {
  return {
    id:         crypto.randomUUID(),
    name:       'Yeni Bölge',
    color:      '#E53935',
    capacity:   20,
    tableCount: 0,
    theme:      'ic_mekan',
    polygon:    [],
    customPhoto: null,
    ...overrides,
  }
}

// Rectangle'dan polygon üretir (normalize koordinat)
export function rectToPolygon(
  x: number, y: number, w: number, h: number,
  canvasW: number, canvasH: number,
): ZonePoint[] {
  return [
    { x: x / canvasW,       y: y / canvasH },         // sol-üst
    { x: (x + w) / canvasW, y: y / canvasH },         // sağ-üst
    { x: (x + w) / canvasW, y: (y + h) / canvasH },  // sağ-alt
    { x: x / canvasW,       y: (y + h) / canvasH },  // sol-alt
  ]
}

// Polygon'u canvas piksellerine çevirir
export function polygonToRect(
  polygon: ZonePoint[],
  canvasW: number,
  canvasH: number,
): { x: number; y: number; w: number; h: number } {
  if (polygon.length < 4) return { x: 0, y: 0, w: 0, h: 0 }
  const x = polygon[0].x * canvasW
  const y = polygon[0].y * canvasH
  const w = (polygon[1].x - polygon[0].x) * canvasW
  const h = (polygon[3].y - polygon[0].y) * canvasH
  return { x, y, w, h }
}
