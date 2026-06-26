'use server'

import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type LoginState = { error: string | null }

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email    = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const from     = (formData.get('from') as string) || '/admin'

  if (!email || !password) {
    return { error: 'E-posta ve şifre gerekli.' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey || !serviceKey) {
    return { error: 'Supabase yapılandırması eksik.' }
  }

  // 1. Supabase Auth ile giriş yap
  const anonClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    await new Promise(r => setTimeout(r, 400)) // brute-force gecikmesi
    return { error: 'E-posta veya şifre hatalı.' }
  }

  // 2. Profil tablosundan rol kontrolü — sadece super_admin
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile || profile.role !== 'super_admin') {
    return {
      error: 'Bu panele erişim yetkiniz yok. (super_admin rolü gerekli)',
    }
  }

  // 3. Session token oluştur — "userId:HMAC(userId)"
  // Middleware aynı HMAC'i hesaplayarak doğrulayabilir (email gerekmez)
  const adminSecret = process.env.ADMIN_SECRET ?? 'checkrezerve-fallback-secret'
  const token = createHmac('sha256', adminSecret)
    .update(authData.user.id)
    .digest('base64')

  const cookiePayload = `${authData.user.id}:${token}`

  const jar = await cookies()
  jar.set('cr_admin', cookiePayload, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 7,  // 7 gün
    path:     '/',
  })

  redirect(from)
}
