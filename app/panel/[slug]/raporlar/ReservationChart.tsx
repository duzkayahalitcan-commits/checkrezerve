'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DayData = { label: string; count: number }

export default function ReservationChart({ data }: { data: DayData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
        <XAxis dataKey="label" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#1c1917', border: '1px solid #292524', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#d6d3d1' }}
          itemStyle={{ color: '#fbbf24' }}
        />
        <Bar dataKey="count" name="Rezervasyon" fill="#E53935" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
