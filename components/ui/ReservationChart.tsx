'use client'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

interface DataPoint {
  label: string
  count: number
}

interface Props {
  data:   DataPoint[]
  color?: string
  title?: string
}

export default function ReservationChart({ data, color = '#E53935', title }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-zinc-400">
        Henüz veri yok
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
      {title && <p className="text-sm font-semibold text-zinc-700 mb-4">{title}</p>}
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#a1a1aa' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#a1a1aa' }}
            axisLine={false} tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 12 }}
            cursor={{ stroke: color, strokeWidth: 1.5, strokeDasharray: '4 2' }}
            formatter={(v) => [Number(v ?? 0), 'Rezervasyon']}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#grad)"
            dot={{ fill: color, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
