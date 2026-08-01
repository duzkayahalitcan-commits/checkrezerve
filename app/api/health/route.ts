// S2-T3: Health endpoint — DB bağlantısını da doğrular
import { getSupabaseAdmin } from '@/lib/supabase'

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
    return Response.json({
      status: 'ok',
      db: 'connected',
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
