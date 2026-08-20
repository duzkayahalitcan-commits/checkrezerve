import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

export async function POST(req: NextRequest) {
  const session = verifySession((await cookies()).get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    restaurant_id?: string
    conversation_id?: string
    answer?: string
  }

  const restaurantId = body.restaurant_id ?? session.restaurantId
  if (restaurantId !== session.restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!body.conversation_id || !body.answer?.trim()) {
    return NextResponse.json({ error: 'conversation_id and answer required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // 1) Genel bilgi satırı ekle (ozellik_kodu = genel_bilgi_ + timestamp)
  const kod = `genel_bilgi_${Date.now()}`
  const { error: upsertErr } = await db
    .from('isletme_ozellikleri')
    .upsert(
      {
        restaurant_id: restaurantId,
        ozellik_kodu: kod,
        durum: 'var',
        notu: body.answer.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'restaurant_id,ozellik_kodu' }
    )
  if (upsertErr) {
    // Tablo yoksa sessizce — sadece is_unknown güncellemesi yine de yapılsın
    console.error('[ozellikler/reply] upsert error:', upsertErr.message)
  }

  // 2) İlgili konuşmayı "yanıtlandı" olarak işaretle
  const { error: updErr } = await db
    .from('conversations')
    .update({ is_unknown: false })
    .eq('id', body.conversation_id)
    .eq('restaurant_id', restaurantId)

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, kod })
}
