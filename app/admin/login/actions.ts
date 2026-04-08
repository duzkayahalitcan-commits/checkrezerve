'use server'

import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

function makeToken(password: string, secret: string): string {
  return createHmac('sha256', secret).update(password).digest('base64')
}

export type LoginState = { error: string | null }

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password    = (formData.get('password') as string) ?? ''
  const adminPw     = process.env.ADMIN_PASSWORD  ?? ''
  const adminSecret = process.env.ADMIN_SECRET    ?? 'checkrezerve-fallback-secret'
  const from        = (formData.get('from')       as string) || '/admin'

  if (!adminPw) {
    // Geliştirme: şifre tanımlı değil → direkt geç
    redirect(from)
  }

  if (password !== adminPw) {
    // Kaba kuvvet saldırısını yavaşlatmak için sabit 400ms bekleme
    await new Promise((r) => setTimeout(r, 400))
    return { error: 'Şifre yanlış. Tekrar dene.' }
  }

  const token = makeToken(adminPw, adminSecret)
  const jar   = await cookies()

  jar.set('cr_admin', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 7,  // 7 gün
    path:     '/',
  })

  redirect(from)
}
