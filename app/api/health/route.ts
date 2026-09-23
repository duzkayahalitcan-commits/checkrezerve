// S2-T3: Health endpoint — DB bağlantısını da doğrular
import { getSupabaseAdmin } from '@/lib/supabase'
import { redisHealth } from '@/lib/rate-limit'

// OB-03: DB kritik (hata → 503). Redis ve SMS sağlayıcı bilgi amaçlı raporlanır; sorunluysa
// status 'degraded' olur ama 200 döner (uptime alarmı sadece DB/uygulama çöküşünde çalsın).
function smsProviderStatus(): { provider: string; configured: boolean } {
  const provider = process.env.SMS_PROVIDER ?? 'disabled'
  const env = process.env
  const configured =
    provider === 'netgsm' ? !!(env.NETGSM_USERCODE && env.NETGSM_PASSWORD)
    : provider === 'whatsapp' || provider === 'twilio' ? !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN)
    : provider === 'mock'
  return { provider, configured }
}

export async function GET() {
  const start = Date.now()
  try {
    const db = getSupabaseAdmin()
    const { error } = await db
      .from('restaurants')
      .select('id')
      .limit(1)
      .single()
    if (error && error.code !== 'PGRST116') throw error  // PGRST116 = no rows, still healthy
    const redis = await redisHealth()
    const sms = smsProviderStatus()
    const degraded = redis === 'error' || !sms.configured
    return Response.json({
      status: degraded ? 'degraded' : 'ok',
      db: 'connected',
      redis,
      sms,
      latency_ms: Date.now() - start,
      ts: new Date().toISOString(),
    })
  } catch (err) {
    return Response.json({
      status: 'error',
      db: 'unreachable',
      ts: new Date().toISOString(),
    }, { status: 503 })
  }
}
