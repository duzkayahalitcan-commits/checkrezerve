// S1-T3: Sunucu başlangıcında kritik env değişkenlerini doğrula.
// Eksik env varsa process boot'ta fail eder (production'da).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env')
    validateEnv()
  }
}
