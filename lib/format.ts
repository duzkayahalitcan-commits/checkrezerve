// PX-11: Türkçe biçimlendirme yardımcıları.
// toLocaleString() locale'siz çağrılınca tarayıcı diline göre "1,250.5" gibi çıkıyordu.

const tlFormatter = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 1250 → "1.250,00 ₺". null/undefined/NaN → "-" */
export function formatTL(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (n == null || Number.isNaN(n)) return '-'
  return `${tlFormatter.format(n)} ₺`
}

/** "2026-09-23" → "23 Eylül Çarşamba" */
export function formatTarihUzun(isoDate: string): string {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })
}

/** Türkçe büyük/küçük harf (i→İ, ı→I). String.prototype.toUpperCase() 'i'yi 'I' yapar. */
export const trUpper = (s: string) => s.toLocaleUpperCase('tr-TR')
export const trLower = (s: string) => s.toLocaleLowerCase('tr-TR')
