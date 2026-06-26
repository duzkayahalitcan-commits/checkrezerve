import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

async function checkAdmin() {
  const secret = process.env.ADMIN_SECRET ?? ''
  if (!secret) return null
  const jar = await cookies()
  const raw = jar.get('cr_admin')?.value ?? ''
  if (!raw) return null
  const colonIdx = raw.indexOf(':')
  if (colonIdx < 1) return null
  const userId = raw.slice(0, colonIdx)
  const token  = raw.slice(colonIdx + 1)
  if (!userId || !token) return null
  const expected = createHmac('sha256', secret).update(userId).digest('base64')
  return token === expected ? userId : null
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
