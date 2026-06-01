'use client'
import { motion } from 'motion/react'
import { type LucideIcon } from 'lucide-react'
import CountUp from '@/components/CountUp'

interface Props {
  label:    string
  value:    number
  suffix?:  string
  prefix?:  string
  icon:     LucideIcon
  color?:   string  // tailwind text-* class
  change?:  number  // % change vs prev period
  index?:   number
}

export default function StatCard({ label, value, suffix, prefix, icon: Icon, color = 'text-red-600', change, index = 0 }: Props) {
  const positive = change !== undefined && change >= 0

  return (
    <motion.div
      className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {positive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-zinc-900 tracking-tight">
        <CountUp to={value} suffix={suffix} prefix={prefix} duration={1.0} />
      </p>
      <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
    </motion.div>
  )
}
