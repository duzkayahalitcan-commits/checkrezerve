import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// Node.js runtime — next/og default
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const w = Number(searchParams.get('w') ?? 1170)
  const h = Number(searchParams.get('h') ?? 2532)

  return new ImageResponse(
    (
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          gap:             28,
          background:      'linear-gradient(160deg, #1c1917 0%, #292524 55%, #3b1a08 100%)',
        }}
      >
        {/* App icon */}
        <div
          style={{
            width:           120,
            height:          120,
            borderRadius:    28,
            background:      'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            boxShadow:       '0 32px 64px rgba(245,158,11,0.35)',
          }}
        >
          <span style={{ fontSize: 64, fontWeight: 900, color: 'white' }}>C</span>
        </div>

        {/* App name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>
            checkrezerve
          </span>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
            Rezervasyon Yönetimi
          </span>
        </div>
      </div>
    ),
    { width: w, height: h }
  )
}
