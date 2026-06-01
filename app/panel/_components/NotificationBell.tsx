'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function NotificationBell({ restaurantId }: { restaurantId: string }) {
  const [count, setCount]     = useState(0)
  const [ringing, setRinging] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return

    const client  = createClient(url, key)
    const channel = client
      .channel(`bell-${restaurantId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reservations',
        filter: `restaurant_id=eq.${restaurantId}`,
      }, (payload) => {
        const incoming = payload.new as { status?: string }
        if (incoming.status === 'pending') {
          setCount(c => c + 1)
          setRinging(true)
          setTimeout(() => setRinging(false), 900)
        }
      })
      .subscribe()

    return () => { client.removeChannel(channel) }
  }, [restaurantId])

  return (
    <motion.div
      className="relative flex-shrink-0"
      animate={ringing ? {
        rotate: [0, -18, 18, -12, 12, -6, 6, 0],
      } : {}}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
    >
      <Bell
        size={17}
        className={`transition-colors ${count > 0 ? 'text-amber-400' : 'text-stone-500'}`}
      />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white
                       text-[9px] font-bold rounded-full flex items-center justify-center px-0.5
                       leading-none pointer-events-none"
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
