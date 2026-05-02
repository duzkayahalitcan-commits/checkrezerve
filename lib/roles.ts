// ─── Rol sistemi yardımcı fonksiyonları ──────────────────────────────────────
// Veritabanındaki rol isimleri değişmez; bu dosya sadece UI etiketlerini yönetir.

export type UserRole =
  | 'super_admin'
  | 'business_owner'
  | 'business_manager'
  | 'customer'

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin:      'Sistem Yöneticisi',
  business_owner:   'Sahip',
  business_manager: 'Yönetici',
  customer:         'Müşteri',
}

/** Veritabanındaki rol değerini Türkçe UI etiketine çevirir. */
export function getRoleLabel(role: string | null | undefined): string {
  if (!role) return 'Bilinmiyor'
  return ROLE_LABELS[role as UserRole] ?? role
}
