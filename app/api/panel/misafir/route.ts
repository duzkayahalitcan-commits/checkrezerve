import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getPanelApiSession } from '@/lib/panel-auth'

// Gece kararı #7: Misafir etiketi ve notu önceden tarayıcıdan anon client ile yazılıyordu
// (RLS auth.uid() istediği için çoğu oturumda sessizce başarısız). Artık sunucuda, tenant kontrollü.
//   POST  { guest_id, tag_id, action: 'add' | 'remove' }  → etiket
//   PATCH { guest_id, notes }                              → not

async function ownGuest(guestId: unknown, restaurantId: string) {
  if (typeof guestId !== 'string') return false
  const { data } = await getSupabaseAdmin().from('guests').select('id')
    .eq('id', guestId).eq('restaurant_id', restaurantId).maybeSingle()
  return !!data
}

export async function POST(req: NextRequest) {
  const session = await getPanelApiSession(req)
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  const { guest_id, tag_id, action } = await req.json().catch(() => ({}))
  if (!['add', 'remove'].includes(action) || typeof tag_id !== 'string') {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }
  const db = getSupabaseAdmin()
  const { data: tag } = await db.from('guest_tags').select('id')
    .eq('id', tag_id).eq('restaurant_id', session.restaurantId).maybeSingle()
  if (!tag || !(await ownGuest(guest_id, session.restaurantId))) {
    return NextResponse.json({ error: 'Misafir veya etiket bulunamadı.' }, { status: 404 })
  }
  const { error } = action === 'add'
    ? await db.from('guest_tag_assignments').upsert({ guest_id, tag_id }, { onConflict: 'guest_id,tag_id', ignoreDuplicates: true })
    : await db.from('guest_tag_assignments').delete().eq('guest_id', guest_id).eq('tag_id', tag_id)
  if (error) {
    console.error('[panel/misafir POST]', error)
    return NextResponse.json({ error: 'Etiket güncellenemedi.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const session = await getPanelApiSession(req)
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  const { guest_id, notes } = await req.json().catch(() => ({}))
  if (typeof notes !== 'string' || notes.length > 2000) {
    return NextResponse.json({ error: 'Not en fazla 2000 karakter olabilir.' }, { status: 400 })
  }
  if (!(await ownGuest(guest_id, session.restaurantId))) {
    return NextResponse.json({ error: 'Misafir bulunamadı.' }, { status: 404 })
  }
  const { error } = await getSupabaseAdmin().from('guests')
    .update({ notes: notes.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', guest_id).eq('restaurant_id', session.restaurantId)
  if (error) {
    console.error('[panel/misafir PATCH]', error)
    return NextResponse.json({ error: 'Not kaydedilemedi.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
