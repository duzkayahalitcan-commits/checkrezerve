// Admin login artık /api/admin/login API route üzerinden fetch ile yapılıyor.
// Bu dosya sadece tip tanımı için kaldı.
export type LoginState = { error: string | null; success?: boolean; redirectUrl?: string }
