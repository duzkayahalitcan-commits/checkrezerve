import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  const month = req.nextUrl.searchParams.get('month')

  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })

  const targetMonth = month ?? new Date().toISOString().slice(0, 7)

  const db = getSupabaseAdmin()

  const { data, error } = await db
    .from('calisanlar')
    .select(`
      id, name, ad,
      reservations!left(
        id, price_paid, reserved_date, status
      )
    `)
    .eq('restaurant_id', restaurantId)
    .eq('aktif', true)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []).map((calisan: Record<string, unknown>) => {
    const reservations = (calisan.reservations as Record<string, unknown>[] | undefined) ?? []
    const completed = reservations.filter((r: Record<string, unknown>) => {
      return r.status === 'completed' && (r.reserved_date as string ?? '').startsWith(targetMonth)
    })
    const toplamSeans = completed.length
    const toplamGelir = completed.reduce((s: number, r: Record<string, unknown>) => s + ((r.price_paid as number) ?? 0), 0)
    return {
      id: calisan.id as string,
      calisan_adi: (calisan.ad ?? calisan.name ?? '') as string,
      toplam_seans: toplamSeans,
      toplam_gelir: toplamGelir,
      ortalama_gelir: toplamSeans > 0 ? Math.round(toplamGelir / toplamSeans) : 0,
    }
  }).sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.toplam_gelir as number) - (a.toplam_gelir as number))

  return NextResponse.json(rows)
}
