import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

async function checkAdmin() {
  const adminPw = process.env.ADMIN_PASSWORD ?? ''
  const secret = process.env.ADMIN_SECRET ?? ''
  const expected = createHmac('sha256', secret).update(adminPw).digest('base64')
  const jar = await cookies()
  const raw = jar.get('cr_admin')?.value ?? ''
  return raw === expected
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { restaurant_id, feature, enabled } = await req.json()
  if (!restaurant_id || !feature || enabled === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db
    .from('feature_flags')
    .upsert({ restaurant_id, feature, enabled }, { onConflict: 'restaurant_id,feature' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
