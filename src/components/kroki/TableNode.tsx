'use client'

import { C } from './KrokiEditor'

interface TableType {
  id: string
  w: number
  h: number
  img?: boolean
}

export default function TableNode({
  type,
  selected,
  label,
  imgSrc,
}: {
  type: TableType
  selected: boolean
  label: string
  imgSrc?: string
}) {
  const { w, h } = type
  const pad = 16

  return (
    <g>
      {imgSrc ? (
        <image
          href={imgSrc}
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          preserveAspectRatio="xMidYMid meet"
          style={{ mixBlendMode: 'multiply' as const }}
        />
      ) : (
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={4}
          fill={selected ? '#E5393550' : '#5D403080'}
          stroke={selected ? C.red : C.goldDim}
          strokeWidth={1.5}
        />
      )}
      <rect x={-20} y={-11} width={40} height={22} rx={5} fill={selected ? C.red : '#00000085'} />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill="#fff"
        fontFamily="DM Sans,sans-serif"
      >
        {label}
      </text>
      {selected && (
        <rect
          x={-w / 2 - pad}
          y={-h / 2 - pad}
          width={w + pad * 2}
          height={h + pad * 2}
          rx={10}
          fill="none"
          stroke={C.red}
          strokeWidth={2}
          strokeDasharray="7,3"
          opacity={0.85}
        />
      )}
    </g>
  )
}
