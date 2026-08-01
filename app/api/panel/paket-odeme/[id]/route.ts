import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { odenen_miktar } = body

  if (!odenen_miktar || odenen_miktar <= 0) {
    return NextResponse.json({ error: 'odenen_miktar required and must be > 0' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const { data: mp } = await db
    .from('musteri_paketleri')
    .select('odenen_tutar, toplam_tutar, odeme_durumu')
    .eq('id', id)
    .single()

  if (!mp) return NextResponse.json({ error: 'Kayit bulunamadi' }, { status: 404 })

  const yeniOdenen = (mp.odenen_tutar ?? 0) + odenen_miktar
  const yeniDurum = mp.toplam_tutar && yeniOdenen >= mp.toplam_tutar ? 'odendi' : mp.odeme_durumu === 'odendi' ? 'odendi' : 'bekliyor'

  const { error } = await db
    .from('musteri_paketleri')
    .update({
      odenen_tutar: yeniOdenen,
      odeme_durumu: yeniDurum,
      son_odeme_tarihi: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, odenen_tutar: yeniOdenen, odeme_durumu: yeniDurum })
}
