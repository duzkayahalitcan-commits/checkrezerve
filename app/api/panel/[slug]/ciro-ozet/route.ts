import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { resolveApiSession } from '@/lib/panel-auth'

export const revalidate = 300

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')

  // S1-T4: auth zorunlu — panel oturumu veya mobil JWT
  const session = await resolveApiSession(req, await cookies())
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (restaurantId && session.restaurantId !== restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })

  const db = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)
  const now = new Date()
  const ayBaslangic = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const gecenAyBaslangic = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10)
  const gecenAyBitis = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10)
  const haftaBaslangic = new Date(now)
  haftaBaslangic.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  const haftaStr = haftaBaslangic.toISOString().slice(0, 10)

  const [{ data: bugun }, { data: hafta }, { data: ay }, { data: gecenAy }] = await Promise.all([
    db.from('reservations').select('price_paid').eq('restaurant_id', restaurantId).eq('reserved_date', today).eq('status', 'completed'),
    db.from('reservations').select('price_paid').eq('restaurant_id', restaurantId).gte('reserved_date', haftaStr).lte('reserved_date', today).eq('status', 'completed'),
    db.from('reservations').select('price_paid').eq('restaurant_id', restaurantId).gte('reserved_date', ayBaslangic).lte('reserved_date', today).eq('status', 'completed'),
    db.from('reservations').select('price_paid').eq('restaurant_id', restaurantId).gte('reserved_date', gecenAyBaslangic).lte('reserved_date', gecenAyBitis).eq('status', 'completed'),
  ])

  const bugunCiro = (bugun ?? []).reduce((s, r) => s + ((r.price_paid as number) ?? 0), 0)
  const haftaCiro = (hafta ?? []).reduce((s, r) => s + ((r.price_paid as number) ?? 0), 0)
  const ayCiro = (ay ?? []).reduce((s, r) => s + ((r.price_paid as number) ?? 0), 0)
  const gecenAyCiro = (gecenAy ?? []).reduce((s, r) => s + ((r.price_paid as number) ?? 0), 0)

  const { count: ayRezervasyon } = await db
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)
    .gte('reserved_date', ayBaslangic)
    .lte('reserved_date', today)
    .neq('status', 'cancelled')

  const degisimYuzde = gecenAyCiro > 0 ? Math.round(((ayCiro - gecenAyCiro) / gecenAyCiro) * 100) : null

  return NextResponse.json({
    bugun_ciro: bugunCiro,
    bu_hafta_ciro: haftaCiro,
    bu_ay_ciro: ayCiro,
    bu_ay_rezervasyon: ayRezervasyon ?? 0,
    gecen_ay_ciro: gecenAyCiro,
    degisim_yuzde: degisimYuzde,
  })
}
