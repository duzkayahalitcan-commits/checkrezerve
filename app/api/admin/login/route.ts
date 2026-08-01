import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; from?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const email = body.email?.trim()
  const password = body.password?.trim()
  const from = body.from || '/admin'

  if (!email || !password) {
    return NextResponse.json({ error: 'E-posta ve şifre gerekli.' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey || !serviceKey) {
    return NextResponse.json({ error: 'Sunucu yapılandırması eksik.' }, { status: 500 })
  }

  try {
    const anonClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      await new Promise(r => setTimeout(r, 400))
      return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 })
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile || profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Bu panele erişim yetkiniz yok. (super_admin rolü gerekli)' },
        { status: 403 }
      )
    }

    // Cookie format'ı proxy.ts ile uyumlu: HMAC(ADMIN_SECRET, ADMIN_PASSWORD)
    // S1-T3: fallback yok — env zorunlu
    const adminSecret = process.env.ADMIN_SECRET!
    const adminPassword = process.env.ADMIN_PASSWORD!
    const token = createHmac('sha256', adminSecret).update(adminPassword).digest('base64')

    const res = NextResponse.json({ success: true, redirectUrl: from, token })

    res.cookies.set('cr_admin', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    })

    return res
  } catch (err) {
    console.error('[admin/login]', err)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
