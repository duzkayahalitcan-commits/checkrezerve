import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { canViewReports } from '@/lib/roles'

export const dynamic = 'force-dynamic'

// GET /api/panel/calisan-gelir?restaurant_id=<uuid>&month=YYYY-MM
// Çalışan bazlı gelir raporu. GÜVENLİK FİX:
//  - Yalnızca panel (cr_panel cookie / verifySession) ile korunur
//  - Sadece rapor görebilen roller (owner/manager/super_admin)
//  - restaurant_id, session.restaurantId ile eşleşmek ZORUNDA
//    (kendi isletmesinin dışındaki veriye erişim reddedilir)
export async function GET(req: NextRequest) {
  // 1) Panel auth — geçerli oturum yoksa 401
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2) RBAC — rapor görme yetkisi yoksa 403
  if (!canViewReports(session.role ?? '')) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  // 3) restaurant_id zorunlu
  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })

  // 4) Tenant izolasyonu — kullanıcı yalnızca KENDİ isletmesini sorgulayabilir
  if (restaurantId !== session.restaurantId) {
    return NextResponse.json({ error: 'Bu isletmeye erişim yetkiniz yok' }, { status: 403 })
  }

  const month = req.nextUrl.searchParams.get('month')
  const targetMonth = month ?? new Date().toISOString().slice(0, 7)

  const db = getSupabaseAdmin()

  const { data, error } = await db
    .from('calisanlar')
    .select(`
      id, ad,
      reservations!left(
        id, price_paid, reserved_date, status
      )
    `)
    .eq('restaurant_id', restaurantId)
    .eq('aktif', true)
    .order('ad')

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
