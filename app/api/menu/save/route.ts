import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { canManageServices } from '@/lib/roles'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type MenuItem = {
  ad: string
  fiyat?: number | null
  sure_dakika?: number | null
  kategori?: string | null
  renk?: string | null
}

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canManageServices(session.role)) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  const body = await req.json()
  const items: MenuItem[] = Array.isArray(body.items) ? body.items : []
  if (items.length === 0) {
    return NextResponse.json({ error: 'Kaydedilecek hizmet yok' }, { status: 400 })
  }
  if (items.length > 200) {
    return NextResponse.json({ error: 'Tek seferde en fazla 200 hizmet kaydedilebilir' }, { status: 400 })
  }

  // Yalnızca gerçek DB kolonları — calisan_id null (EK IS 3: admin isterse manuel atar)
  const rows = items
    .map((it) => ({
      restaurant_id: session.restaurantId,
      ad: String(it.ad ?? '').trim().slice(0, 200),
      fiyat: it.fiyat != null ? Number(it.fiyat) : null,
      sure_dakika: it.sure_dakika != null ? Number(it.sure_dakika) : null,
      kategori: it.kategori ? String(it.kategori).slice(0, 100) : null,
      renk: it.renk ? String(it.renk).slice(0, 20) : null,
      aktif: true,
      calisan_id: null,
    }))
    .filter(r => r.ad)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Geçerli hizmet adı yok' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db.from('hizmetler').insert(rows).select()
  if (error) {
    console.error('[menu/save]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ inserted: data?.length ?? rows.length })
}
