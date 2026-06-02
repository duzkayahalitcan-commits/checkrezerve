import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/panel/reset-password', origin))
  }

  // OAuth callback — Supabase client-side session'ı handle eder
  return NextResponse.redirect(new URL('/panel/login', origin))
}
