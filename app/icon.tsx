import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#18181b',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          fontFamily: 'sans-serif',
        }}
      >
        CR
      </div>
    ),
    { ...size }
  )
}
