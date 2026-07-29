import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

async function checkAdmin() {
  const adminSecret   = process.env.ADMIN_SECRET ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  if (!adminSecret || !adminPassword) return false
  const jar = await cookies()
  const token = jar.get('cr_admin')?.value ?? ''
  if (!token) return false
  const expected = createHmac('sha256', adminSecret).update(adminPassword).digest('base64')
  return token === expected
}

function hashPassword(password: string): string {
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret-change-me'
  return createHmac('sha256', secret).update(password).digest('hex')
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { restaurant_id, username, password, role } = await req.json()
  if (!restaurant_id || !username || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password too short' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db
    .from('restaurant_users')
    .insert({ restaurant_id, username, password_hash: hashPassword(password), role: role ?? 'business_manager' })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
