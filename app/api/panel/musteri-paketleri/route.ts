import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

export async function GET(req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('musteri_paketleri')
    .select(`
      *,
      paketler!inner(ad),
      calisanlar!left(name)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []).map((r: Record<string, unknown>) => {
    const pkt = r.paketler as Record<string, unknown> | undefined
    const cls = r.calisanlar as Record<string, unknown> | null | undefined
    const kalan = (r.kalan_seans as number) ?? 0
    const toplam = (r.toplam_seans as number) ?? 1
    return {
      ...r,
      paket_adi: (pkt?.ad as string) ?? '?',
      calisan_adi: cls?.name as string | null ?? null,
      kalan_oran: kalan / toplam,
    }
  })

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { restaurant_id, paket_id, musteri_adi, musteri_telefon, calisan_id } = body
  if (!restaurant_id || !paket_id || !musteri_adi) {
    return NextResponse.json({ error: 'restaurant_id, paket_id, musteri_adi required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Paket bilgilerini al
  const { data: paket } = await db.from('paketler').select('seans_sayisi, gecerlilik_gun').eq('id', paket_id).single()
  if (!paket) return NextResponse.json({ error: 'Paket bulunamadi' }, { status: 404 })

  const now = new Date()
  const bitisTarihi = new Date(now)
  bitisTarihi.setDate(bitisTarihi.getDate() + paket.gecerlilik_gun)

  const { data, error } = await db
    .from('musteri_paketleri')
    .insert({
      restaurant_id,
      paket_id,
      musteri_adi,
      musteri_telefon: musteri_telefon ?? null,
      toplam_seans: paket.seans_sayisi,
      kalan_seans: paket.seans_sayisi,
      baslangic_tarihi: now.toISOString().slice(0, 10),
      bitis_tarihi: bitisTarihi.toISOString().slice(0, 10),
      durum: 'aktif',
      calisan_id: calisan_id ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, action } = body
  if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 })

  const db = getSupabaseAdmin()

  if (action === 'yenile') {
    // Eski kaydi bitti yap, yeni kayit ac
    const { data: old } = await db.from('musteri_paketleri').select('*').eq('id', id).single()
    if (!old) return NextResponse.json({ error: 'Kayit bulunamadi' }, { status: 404 })

    await db.from('musteri_paketleri').update({ durum: 'bitti', updated_at: new Date().toISOString() }).eq('id', id)

    const { data: paket } = await db.from('paketler').select('seans_sayisi, gecerlilik_gun').eq('id', old.paket_id).single()
    if (!paket) return NextResponse.json({ error: 'Paket bulunamadi' }, { status: 404 })

    const now = new Date()
    const bitisTarihi = new Date(now)
    bitisTarihi.setDate(bitisTarihi.getDate() + paket.gecerlilik_gun)

    const { data: newRow, error } = await db
      .from('musteri_paketleri')
      .insert({
        restaurant_id: old.restaurant_id,
        paket_id: old.paket_id,
        musteri_adi: old.musteri_adi,
        musteri_telefon: old.musteri_telefon,
        toplam_seans: paket.seans_sayisi,
        kalan_seans: paket.seans_sayisi,
        baslangic_tarihi: now.toISOString().slice(0, 10),
        bitis_tarihi: bitisTarihi.toISOString().slice(0, 10),
        durum: 'aktif',
        calisan_id: old.calisan_id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(newRow)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
