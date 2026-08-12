// Sektör bazlı terminoloji — business_type'a göre randevu terimi.
// Restoran → Rezervasyon, Psikolog → Seans, Pilates → Ders, diğerleri → Randevu.
// Hem panel raporlarında hem PDF'te kullanılır.

export type SectorTerm = 'Rezervasyon' | 'Seans' | 'Ders' | 'Randevu'

export function sectorTerm(businessType?: string | null): SectorTerm {
  switch (businessType) {
    case 'restaurant': return 'Rezervasyon'
    case 'psychologist': return 'Seans'
    case 'pilates': return 'Ders'
    default: return 'Randevu'
  }
}

// Çoğul / genel kullanım için küçük harf varyantı (örn. "Toplam Rezervasyon")
export function sectorTermPlural(businessType?: string | null): string {
  return sectorTerm(businessType)
}
