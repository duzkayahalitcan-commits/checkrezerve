import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

// NOT: musteri_paketleri.musteri_id -> profiles.id FK
// Kalan = toplam_seans - kullanilan_seans (DB'deki kalan_seans kolonu kullanilmaz)
// Durum: kullanilan >= toplam || bitis gecmis || !aktif -> bitti

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
      profiles!left(email),
      calisanlar!left(name)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = new Date().toISOString().slice(0, 10)
  const rows = (data ?? []).map((r: Record<string, unknown>) => {
    const pkt = r.paketler as Record<string, unknown> | undefined
    const prof = r.profiles as Record<string, unknown> | null | undefined
    const cls = r.calisanlar as Record<string, unknown> | null | undefined
    const toplam = (r.toplam_seans as number) ?? 0
    const kullanilan = (r.kullanilan_seans as number) ?? 0
    const kalan = Math.max(0, toplam - kullanilan)
    const aktif = (r.aktif as boolean) ?? true
    const bitis = (r.bitis_tarihi as string | null) ?? null
    const bitisGecti = bitis ? bitis < today : false
    const durum = (kullanilan >= toplam || bitisGecti || !aktif) ? 'bitti' : 'aktif'

    return {
      ...r,
      paket_adi: (pkt?.ad as string) ?? '?',
      musteri_adi: (prof?.email as string) ?? 'Misafir',
      musteri_email: (prof?.email as string | null) ?? null,
      calisan_adi: cls?.name as string | null ?? null,
      kalan_seans: kalan,
      kalan_oran: toplam > 0 ? kalan / toplam : 0,
      durum,
    }
  })

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { restaurant_id, paket_id, musteri_id, calisan_id } = body
  if (!restaurant_id || !paket_id || !musteri_id) {
    return NextResponse.json({ error: 'restaurant_id, paket_id, musteri_id required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const { data: paket } = await db.from('paketler').select('toplam_seans, gecerlilik_gun').eq('id', paket_id).single()
  if (!paket) return NextResponse.json({ error: 'Paket bulunamadi' }, { status: 404 })

  const now = new Date()
  const bitisTarihi = new Date(now)
  bitisTarihi.setDate(bitisTarihi.getDate() + paket.gecerlilik_gun)

  const { data, error } = await db
    .from('musteri_paketleri')
    .insert({
      restaurant_id,
      paket_id,
      musteri_id,
      toplam_seans: paket.toplam_seans,
      kullanilan_seans: 0,
      baslangic_tarihi: now.toISOString().slice(0, 10),
      bitis_tarihi: bitisTarihi.toISOString().slice(0, 10),
      aktif: true,
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
    const { data: old } = await db.from('musteri_paketleri').select('*').eq('id', id).single()
    if (!old) return NextResponse.json({ error: 'Kayit bulunamadi' }, { status: 404 })

    // Eski kaydi kapat
    await db.from('musteri_paketleri').update({ aktif: false, updated_at: new Date().toISOString() }).eq('id', id)

    const { data: paket } = await db.from('paketler').select('toplam_seans, gecerlilik_gun').eq('id', old.paket_id).single()
    if (!paket) return NextResponse.json({ error: 'Paket bulunamadi' }, { status: 404 })

    const now = new Date()
    const bitisTarihi = new Date(now)
    bitisTarihi.setDate(bitisTarihi.getDate() + paket.gecerlilik_gun)

    const { data: newRow, error } = await db
      .from('musteri_paketleri')
      .insert({
        restaurant_id: old.restaurant_id,
        paket_id: old.paket_id,
        musteri_id: old.musteri_id,
        toplam_seans: paket.toplam_seans,
        kullanilan_seans: 0,
        baslangic_tarihi: now.toISOString().slice(0, 10),
        bitis_tarihi: bitisTarihi.toISOString().slice(0, 10),
        aktif: true,
        calisan_id: old.calisan_id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(newRow)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
