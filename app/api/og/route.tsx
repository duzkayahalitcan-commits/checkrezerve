import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title   = searchParams.get('title') ?? 'CheckRezerve'
  const type    = searchParams.get('type') ?? 'Online Booking'
  const address = searchParams.get('address') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #2B1B17 0%, #E53935 100%)',
          padding: 48,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 24,
            padding: '6px 16px',
            fontSize: 14,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 600,
          }}>
            {type}
          </div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>
          {title.length > 32 ? title.slice(0, 32) + '…' : title}
        </div>
        {address && (
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
            📍 {address.length > 60 ? address.slice(0, 60) + '…' : address}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>CheckRezerve</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>— Online Rezervasyon</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
