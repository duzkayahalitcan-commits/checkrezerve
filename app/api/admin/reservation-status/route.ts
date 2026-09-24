import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

// Gece kararı #7: admin rezervasyon durum değişikliği önceden tarayıcıdan anon client ile yapılıyordu.
async function checkAdmin() {
  const adminSecret   = process.env.ADMIN_SECRET ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  if (!adminSecret || !adminPassword) return false
  const token = (await cookies()).get('cr_admin')?.value ?? ''
  if (!token) return false
  return token === createHmac('sha256', adminSecret).update(adminPassword).digest('base64')
}

const VALID = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show']

// PATCH { id, status }
export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json().catch(() => ({}))
  if (typeof id !== 'string' || !VALID.includes(status)) {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }
  const { data, error } = await getSupabaseAdmin().from('reservations').update({ status }).eq('id', id).select('id')
  if (error) {
    console.error('[admin/reservation-status]', error)
    return NextResponse.json({ error: 'Durum güncellenemedi.' }, { status: 500 })
  }
  if (!data?.length) return NextResponse.json({ error: 'Rezervasyon bulunamadı.' }, { status: 404 })
  return NextResponse.json({ success: true })
}
