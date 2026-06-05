import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const jar = await cookies()
  jar.delete('cr_panel')
  return NextResponse.redirect(new URL('/panel/login', 'https://checkrezerve.com'))
}
