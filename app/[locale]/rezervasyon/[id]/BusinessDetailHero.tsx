'use client'
import { motion } from 'motion/react'
import { Link } from '@/i18n/navigation'
import FavoriteToggle from './FavoriteToggle'

interface Props {
  restaurantId: string
  name: string
  icon: string
  label: string
  address: string | null
  phone: string | null
  description: string | null
  backLabel: string
  rating: number | null
  coverImage: string | null
}

export default function BusinessDetailHero({ restaurantId, name, icon, label, address, phone, description, backLabel, rating, coverImage }: Props) {
  return (
    <div className="pt-24 pb-6 bg-zinc-900 text-white overflow-hidden relative">
      {coverImage && (
        <>
          <img
            src={coverImage}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-zinc-900/40" />
        </>
      )}
      <div className="mx-auto max-w-3xl px-6 relative z-10">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/rezervasyon" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← {backLabel}
          </Link>
        </motion.div>

        <motion.div
          className="flex items-center gap-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl shrink-0"
            initial={{ scale: 0.5, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
          >
            {icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold">
              {name}
              {rating !== null && (
                <span className="ml-3 inline-flex items-center gap-1 text-amber-400 text-lg font-bold">⭐ {rating.toFixed(1)}</span>
              )}
            </h1>
            <span className="inline-block bg-red-600/25 text-red-300 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1">
              {label}
            </span>
          </div>
          <FavoriteToggle restaurantId={restaurantId} />
        </motion.div>

        {(address || phone) && (
          <motion.div
            className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {address && <span>📍 {address}</span>}
            {phone && (
              <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                📞 {phone}
              </a>
            )}
          </motion.div>
        )}

        {description && (
          <motion.p
            className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  )
}
