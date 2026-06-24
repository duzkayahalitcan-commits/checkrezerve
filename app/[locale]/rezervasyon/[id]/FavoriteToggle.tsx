'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import FavoriteButton from '@/components/ui/FavoriteButton'

export default function FavoriteToggle({ restaurantId }: { restaurantId: string }) {
  const router = useRouter()
  const [initialFaved, setInitialFaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)
      const { data } = await supabase
        .from('user_favorites')
        .select('restaurant_id')
        .eq('user_id', session.user.id)
        .eq('restaurant_id', restaurantId)
        .maybeSingle()
      setInitialFaved(!!data)
    })
  }, [restaurantId])

  const handleChange = async (faved: boolean) => {
    if (!userId) {
      router.push('/giris')
      return
    }
    if (faved) {
      await supabase.from('user_favorites').upsert({ user_id: userId, restaurant_id: restaurantId })
    } else {
      await supabase.from('user_favorites').delete()
        .eq('user_id', userId).eq('restaurant_id', restaurantId)
    }
  }

  return (
    <FavoriteButton
      initialFaved={initialFaved}
      onChange={handleChange}
      size="lg"
      className="border border-white/20 shadow-sm"
    />
  )
}
