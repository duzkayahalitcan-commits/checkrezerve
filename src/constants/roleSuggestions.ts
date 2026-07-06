import type { BusinessType } from '@/types'

/**
 * W-95: İşletme tipine göre ünvan/rol placeholder önerileri.
 * Hem onboarding "Ünvan" input'unda placeholder olarak,
 * hem de ileride raporlar/filtreler gibi yerlerde kullanılabilir.
 *
 * Harita: BusinessType → örnek ünvan metni
 */
export const ROLE_PLACEHOLDER: Partial<Record<BusinessType, string>> & { default: string } = {
  default:        'Örn: Personel',
  restaurant:     'Örn: Garson',
  barber:         'Örn: Berber Ustası',
  hairdresser:    'Örn: Kuaför',
  spa:            'Örn: Masör',
  beauty_salon:   'Örn: Güzellik Uzmanı',
  psychologist:   'Örn: Klinik Psikolog',
  dentist:        'Örn: Diş Hekimi',
  fitness:        'Örn: Antrenör',
  pilates:        'Örn: Pilates Eğitmeni',
  chiropractor:   'Örn: Fizyoterapist',
  veterinary:     'Örn: Veteriner Hekim',
}

/**
 * İşletme tipine göre placeholder döndürür.
 * @example getRolePlaceholder('restaurant') → 'Örn: Garson'
 * @example getRolePlaceholder('spa') → 'Örn: Masör'
 * @example getRolePlaceholder('unknown') → 'Örn: Personel'
 */
export function getRolePlaceholder(businessType?: string | null): string {
  if (!businessType) return ROLE_PLACEHOLDER.default
  return ROLE_PLACEHOLDER[businessType as BusinessType] ?? ROLE_PLACEHOLDER.default
}
