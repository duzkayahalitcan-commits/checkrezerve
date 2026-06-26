import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

async function checkAdmin() {
  const secret = process.env.ADMIN_SECRET ?? ''
  if (!secret) return false
  const jar = await cookies()
  const raw = jar.get('cr_admin')?.value ?? ''
  if (!raw) return false
  const colonIdx = raw.indexOf(':')
  if (colonIdx < 1) return false
  const userId = raw.slice(0, colonIdx)
  const token  = raw.slice(colonIdx + 1)
  if (!userId || !token) return false
  const expected = createHmac('sha256', secret).update(userId).digest('base64')
  return token === expected
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('feature_flags')
    .select('*, restaurants(name, slug)')
    .order('restaurant_id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
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
