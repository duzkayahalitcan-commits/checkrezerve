import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

async function checkAdmin() {
  const adminSecret   = process.env.ADMIN_SECRET ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  if (!adminSecret || !adminPassword) return null
  const jar = await cookies()
  const token = jar.get('cr_admin')?.value ?? ''
  if (!token) return null
  const expected = createHmac('sha256', adminSecret).update(adminPassword).digest('base64')
  return token === expected ? 'admin' : null
}

// POST /api/admin/audit-logs — yeni log kaydı oluştur
export async function POST(req: NextRequest) {
  const adminId = await checkAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, target_type, target_id, metadata } = await req.json()
  if (!action || !target_type) {
    return NextResponse.json({ error: 'action ve target_type gerekli' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db.from('admin_audit_logs').insert({
    admin_id: adminId,
    action,
    target_type,
    target_id: target_id ?? null,
    metadata: metadata ?? {},
  })

  if (error) {
    console.error('[audit-logs]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// GET /api/admin/audit-logs — logları listele
export async function GET(req: NextRequest) {
  const adminId = await checkAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10), 0)
  const action = searchParams.get('action')

  const db = getSupabaseAdmin()
  let query = db
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (action) query = query.eq('action', action)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ logs: data ?? [] })
}
