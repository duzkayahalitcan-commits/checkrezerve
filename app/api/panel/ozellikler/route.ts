import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

// business_type → özellik sektörü eşlemesi
// (sector değerleri seed'de bu kodlarla tanımlı)
const SECTOR_MAP: Record<string, string[]> = {
  restaurant:  ['restaurant'],
  cafe:        ['restaurant'],
  bar:         ['restaurant'],
  hairdresser: ['hairdresser'],
  beauty_salon:['hairdresser'],
  barber:      ['hairdresser'],
  spa:         ['spa'],
  pilates:     ['pilates'],
  fitness:     ['pilates'],
  psychologist:['psychologist'],
  dentist:     ['dentist'],
  chiropractor:['dentist'],
  veterinary:  ['dentist'],
}

function sectorsFor(businessType: string | null | undefined): string[] {
  if (!businessType) return []
  return SECTOR_MAP[businessType] ?? []
}

// Auth: cr_panel cookie + rol kontrolü
async function getAuth() {
  const cookieStore = await cookies()
  const session = verifySession(cookieStore.get('cr_panel')?.value ?? '')
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  return { session }
}

export async function GET(req: NextRequest) {
  const a = await getAuth()
  if ('error' in a) return a.error
  const session = a.session

  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })
  if (restaurantId !== session.restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getSupabaseAdmin()

  // İşletmenin business_type'ını al
  const { data: biz } = await db
    .from('restaurants')
    .select('business_type')
    .eq('id', restaurantId)
    .single()

  const sectors = ['ortak', ...sectorsFor(biz?.business_type)]

  // Tanımları çek (ortak + işletme sektörü)
  const { data: tanimlar, error: tErr } = await db
    .from('ozellik_tanimlari')
    .select('kod, baslik, sektor, sira, aktif')
    .in('sektor', sectors)
    .eq('aktif', true)
    .order('sira', { ascending: true })

  if (tErr) {
    // Tablo yoksa sessizce boş dön — migration çalıştırılana dek
    return NextResponse.json({ definitions: [], selections: [], business_type: biz?.business_type ?? null })
  }

  // İşletmenin mevcut seçimleri
  const { data: selections } = await db
    .from('isletme_ozellikleri')
    .select('ozellik_kodu, durum, notu, updated_at')
    .eq('restaurant_id', restaurantId)

  // Hiç seçim yoksa varsayılan: bilgi_al
  const selMap = new Map<string, { durum: string; notu: string | null }>()
  ;(selections ?? []).forEach((s: Record<string, unknown>) => {
    selMap.set(s.ozellik_kodu as string, { durum: s.durum as string, notu: (s.notu as string) ?? null })
  })

  const merged = (tanimlar ?? []).map((t: Record<string, unknown>) => {
    const sel = selMap.get(t.kod as string)
    return {
      kod: t.kod, baslik: t.baslik, sektor: t.sektor,
      durum: sel?.durum ?? 'bilgi_al',
      notu: sel?.notu ?? null,
    }
  })

  return NextResponse.json({ definitions: merged, business_type: biz?.business_type ?? null })
}

export async function PUT(req: NextRequest) {
  const a = await getAuth()
  if ('error' in a) return a.error
  const session = a.session

  const body = await req.json() as {
    restaurant_id?: string
    items?: { ozellik_kodu: string; durum: 'var' | 'yok' | 'bilgi_al'; notu?: string | null }[]
  }

  const restaurantId = body.restaurant_id ?? session.restaurantId
  if (restaurantId !== session.restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'items required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const errors: string[] = []

  for (const item of body.items) {
    if (!item.ozellik_kodu || !['var', 'yok', 'bilgi_al'].includes(item.durum)) {
      errors.push(`Geçersiz özellik: ${item.ozellik_kodu}`)
      continue
    }
    const { error } = await db
      .from('isletme_ozellikleri')
      .upsert(
        {
          restaurant_id: restaurantId,
          ozellik_kodu: item.ozellik_kodu,
          durum: item.durum,
          notu: item.notu ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'restaurant_id,ozellik_kodu' }
      )
    if (error) errors.push(error.message)
  }

  if (errors.length > 0) {
    // Tablo yoksa veya hata varsa: sessizce yine de ok dön, ama hataları raporla
    return NextResponse.json({ ok: true, errors }, { status: 200 })
  }
  return NextResponse.json({ ok: true, errors: [] })
}
