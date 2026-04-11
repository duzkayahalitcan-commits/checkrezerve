import { cookies }  from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const jar = await cookies()
  jar.delete('cr_panel')
  return NextResponse.redirect(new URL('/panel/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
}
