import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

// POST /api/panel/seans-dus { reservation_id }
// Rezervasyonun musteri_paket_id'si varsa ve seans_dusuldu=false ise:
// - kalan_seans-1
// - seans_dusuldu=true
// - kalan_seans 0 olursa durum=bitti
// - kalan_seans<=2 ise response'a uyari flag ekle

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { reservation_id } = body
  if (!reservation_id) return NextResponse.json({ error: 'reservation_id required' }, { status: 400 })

  const db = getSupabaseAdmin()

  // Rezervasyonu ve paket bilgisini al
  const { data: reservation } = await db
    .from('reservations')
    .select('musteri_paket_id, seans_dusuldu')
    .eq('id', reservation_id)
    .single()

  if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
  if (!reservation.musteri_paket_id) return NextResponse.json({ error: 'Bu rezervasyon bir pakete bagli degil' }, { status: 400 })
  if (reservation.seans_dusuldu) return NextResponse.json({ error: 'Bu rezervasyon icin seans zaten dusulmus' }, { status: 400 })

  // musteri_paketi'ni guncelle
  const { data: mp } = await db
    .from('musteri_paketleri')
    .select('kalan_seans, durum')
    .eq('id', reservation.musteri_paket_id)
    .single()

  if (!mp) return NextResponse.json({ error: 'Musteri paketi bulunamadi' }, { status: 404 })
  if (mp.durum !== 'aktif') return NextResponse.json({ error: 'Paket aktif degil' }, { status: 400 })

  const yeniKalan = Math.max(0, (mp.kalan_seans ?? 1) - 1)
  const yeniDurum = yeniKalan === 0 ? 'bitti' : 'aktif'

  const { error: mpError } = await db
    .from('musteri_paketleri')
    .update({ kalan_seans: yeniKalan, durum: yeniDurum, updated_at: new Date().toISOString() })
    .eq('id', reservation.musteri_paket_id)

  if (mpError) return NextResponse.json({ error: mpError.message }, { status: 500 })

  // Rezervasyonu isaretle
  const { error: resError } = await db
    .from('reservations')
    .update({ seans_dusuldu: true })
    .eq('id', reservation_id)

  if (resError) return NextResponse.json({ error: resError.message }, { status: 500 })

  const response: Record<string, unknown> = {
    success: true,
    kalan_seans: yeniKalan,
    durum: yeniDurum,
  }

  if (yeniKalan <= 2 && yeniKalan > 0) {
    response.uyari = true
    response.uyari_mesaji = `Kalan seans sayisi ${yeniKalan}. Yenileme vakti geldi.`
  }

  return NextResponse.json(response)
}
