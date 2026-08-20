/**
 * İşletmeye özel arka plan sistemi (Sprint: background_image).
 *
 * - İşletme sahibi özel bir arka plan görseli yükleyebilir (background_image).
 * - Görsel yoksa sektöre göre zarif bir degrade varsayılan arka plan kullanılır.
 * - Rezervasyon ekranı ve AI çağrı asistanı arayüzü bu arka planı kullanır.
 */

// Sektöre göre varsayılan degrade arka planlar.
// Metin üstünde okunabilirlik için koyu, derin tonlar tercih edildi.
export const SECTOR_GRADIENTS: Record<string, string> = {
  restaurant:
    'radial-gradient(120% 120% at 20% 0%, #1a1a2e 0%, #0f0f23 45%, #05050f 100%)',
  cafe:
    'radial-gradient(120% 120% at 20% 0%, #241409 0%, #160d05 55%, #0a0502 100%)',
  barber:
    'radial-gradient(120% 120% at 80% 0%, #1c2333 0%, #12151f 50%, #07090f 100%)',
  hairdresser:
    'radial-gradient(120% 120% at 20% 0%, #2b1e3a 0%, #1a1226 55%, #0b0712 100%)',
  spa:
    'radial-gradient(120% 120% at 20% 0%, #0e2a2a 0%, #0a1d1d 55%, #040f0f 100%)',
  beauty_salon:
    'radial-gradient(120% 120% at 80% 0%, #2a1526 0%, #1b0d19 55%, #0c060b 100%)',
  psychologist:
    'radial-gradient(120% 120% at 20% 0%, #14243a 0%, #0d1830 55%, #060a18 100%)',
  dentist:
    'radial-gradient(120% 120% at 20% 0%, #0f3a4a 0%, #0b2833 55%, #05151b 100%)',
  fitness:
    'radial-gradient(120% 120% at 20% 0%, #1f1a2e 0%, #141020 55%, #080610 100%)',
  veterinary:
    'radial-gradient(120% 120% at 80% 0%, #1e2a1a 0%, #141f11 55%, #0a1207 100%)',
  pilates:
    'radial-gradient(120% 120% at 20% 0%, #2a2030 0%, #1a1420 55%, #0d0912 100%)',
  klinik:
    'radial-gradient(120% 120% at 20% 0%, #0f3a3a 0%, #0a2a2a 55%, #041414 100%)',
  default:
    'radial-gradient(120% 120% at 20% 0%, #1a1a2e 0%, #10101f 50%, #07070f 100%)',
}

export function getSectorGradient(businessType: string | null | undefined): string {
  const type = (businessType ?? 'default').toLowerCase()
  return SECTOR_GRADIENTS[type] ?? SECTOR_GRADIENTS.default
}

export interface ResolvedBackground {
  /** true → custom image URL, false → sector gradient */
  isImage: boolean
  imageUrl: string | null
  gradient: string
}

/**
 * İşletmenin etkin arka planını çözer.
 * Özel görsel varsa onu, yoksa sektör degradasını döner.
 */
export function resolveBackground(
  customImage: string | null | undefined,
  businessType: string | null | undefined,
): ResolvedBackground {
  const imageUrl = customImage?.trim() || null
  return {
    isImage: !!imageUrl,
    imageUrl,
    gradient: getSectorGradient(businessType),
  }
}
