// S1-T3: Production ortam değişkenleri doğrulayıcı.
// Eksik kritik env varsa uygulama başlamaz — fallback'e güvenilmez.

const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_SECRET',
  'ADMIN_PASSWORD',
  'CRON_SECRET',
  'ANTHROPIC_API_KEY',
  'N8N_DB_PASSWORD',
] as const

export function validateEnv() {
  const missing = REQUIRED.filter(k => !process.env[k])
  if (missing.length > 0)
    throw new Error(`[CheckRezerve] Eksik env: ${missing.join(', ')}`)
}

if (process.env.NODE_ENV === 'production') validateEnv()
