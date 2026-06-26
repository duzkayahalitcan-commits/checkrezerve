// ─── Rol sistemi yardımcı fonksiyonları ──────────────────────────────────────
// Veritabanındaki rol isimleri değişmez; bu dosya sadece UI etiketlerini ve
// granüler yetki kontrollerini yönetir.

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

// ─── Granüler Yetki Fonksiyonları ────────────────────────────────────────────
// Her fonksiyon bir rol alır ve o rolün belirli bir aksiyonu yapıp
// yapamayacağını boolean olarak döndürür.
//
// Yetki Hiyerarşisi:
//   super_admin > business_owner > business_manager > customer
//
// business_owner = sahip (tüm yetkiler)
// business_manager = yönetici (sahibin atadığı, kısıtlı yetkiler)

function roleWeight(role: string): number {
  switch (role) {
    case 'super_admin':      return 100
    case 'business_owner':   return 80
    case 'business_manager': return 60
    case 'customer':         return 10
    default:                 return 0
  }
}

/** Rezervasyon silebilir mi? (super_admin + business_owner) */
export function canDeleteReservation(role: string): boolean {
  return roleWeight(role) >= 80
}

/** Çalışan (personel) yönetebilir mi? (super_admin + business_owner) */
export function canManageStaff(role: string): boolean {
  return roleWeight(role) >= 80
}

/** İşletme ayarlarını düzenleyebilir mi? (super_admin + business_owner + business_manager) */
export function canEditSettings(role: string): boolean {
  return roleWeight(role) >= 60
}

/** Raporları görüntüleyebilir mi? (super_admin + business_owner + business_manager) */
export function canViewReports(role: string): boolean {
  return roleWeight(role) >= 60
}

/** Masa krokisini yönetebilir mi? (super_admin + business_owner) */
export function canManageTables(role: string): boolean {
  return roleWeight(role) >= 80
}

/** Hizmetleri yönetebilir mi? (super_admin + business_owner + business_manager) */
export function canManageServices(role: string): boolean {
  return roleWeight(role) >= 60
}

/** Abonelik/ödemeleri görüntüleyebilir mi? (super_admin + business_owner) */
export function canViewSubscription(role: string): boolean {
  return roleWeight(role) >= 80
}

/** Misafir CRM verilerini görebilir mi? (super_admin + business_owner + business_manager) */
export function canViewGuests(role: string): boolean {
  return roleWeight(role) >= 60
}
