// PX-12: Ortak telefon yardımcıları (Türkiye varsayılanı +90).
// DB'de guest_phone karışık biçimlerde duruyor (0XXXXXXXXXX, 5XXXXXXXXX, boşluklu/tireli).
// Kayıt biçimini değiştirmeden karşılaştırmalar phoneKey() ile yapılmalı.

/** E.164: +905XXXXXXXXX. Zaten + ile başlayan uluslararası numaraları korur (idempotent). */
export function normalizePhoneE164(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith('+')) return `+${trimmed.slice(1).replace(/\D/g, '')}`
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return trimmed
  if (digits.startsWith('0')) return `+90${digits.slice(1)}`                 // 05XX... → +905XX...
  if (digits.startsWith('90') && digits.length >= 12) return `+${digits}`   // 905XX... → +905XX...
  return `+90${digits}`                                                      // 5XX... → +905XX...
}

/** Karşılaştırma anahtarı: aynı numaranın tüm yazımları aynı anahtarı verir. */
export function phoneKey(raw: string | null | undefined): string {
  if (!raw) return ''
  const e164 = normalizePhoneE164(raw)
  // TR numaralarında son 10 hane (5XXXXXXXXX); diğer ülkelerde E.164'ün kendisi
  return e164.startsWith('+90') ? e164.slice(3) : e164
}

/** Gevşek doğrulama: TR numarası (2–5 ile başlayan 10 hane) veya + ile 10–15 haneli uluslararası numara. */
export function isValidPhone(raw: string | null | undefined): boolean {
  if (!raw) return false
  const e164 = normalizePhoneE164(raw)
  // Sabit hat (2xx–4xx) da kabul: arayarak ulaşılabilir; SMS yalnızca 5xx'e gider
  if (e164.startsWith('+90')) return /^\+90[2-5]\d{9}$/.test(e164)
  return /^\+\d{10,15}$/.test(e164)
}

/** Görüntüleme maskesi: 0 5XX XXX XX XX (TR) — diğerleri E.164 olarak. */
export function formatPhoneTR(raw: string | null | undefined): string {
  if (!raw) return ''
  const e164 = normalizePhoneE164(raw)
  const m = e164.match(/^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/)
  return m ? `0 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164
}

/** DB'de karışık biçimde tutulan bir numaranın olası yazımları (IN sorgusu için). */
export function phoneVariants(raw: string | null | undefined): string[] {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length < 10) return []
  const local = digits.slice(-10)
  return [`0${local}`, `+90${local}`, `90${local}`, local]
}
