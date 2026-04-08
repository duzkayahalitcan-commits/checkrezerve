import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#18181b',
          borderRadius: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          gap: 4,
        }}
      >
        <div style={{ fontSize: 64, lineHeight: 1 }}>📅</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
          check
        </div>
      </div>
    ),
    { ...size }
  )
}
