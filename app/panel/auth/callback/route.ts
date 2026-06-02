import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/panel/reset-password', req.url))
  }

  if (code) {
    // OAuth code exchange is handled client-side by Supabase JS.
    // Redirect to panel; the client picks up the session from the URL fragment.
    return NextResponse.redirect(new URL('/panel', req.url))
  }

  return NextResponse.redirect(new URL('/panel/login', req.url))
}
