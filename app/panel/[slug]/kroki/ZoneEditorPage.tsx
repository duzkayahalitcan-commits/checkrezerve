'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import ZoneEditor from '../../../../src/components/kroki/ZoneEditor'
import type { KrokiZone } from '@/src/types/kroki-zone'

export default function ZoneEditorPage({
  restaurantId,
  initialZones,
}: {
  restaurantId: string
  slug: string
  initialZones: KrokiZone[]
}) {
  const router = useRouter()
  const toast = useToast()

  async function handleSave(zones: KrokiZone[]) {
    try {
      const res = await fetch('/api/panel/kroki-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId, kroki_zones: zones }),
      })
      if (!res.ok) throw new Error('Kaydedilemedi')
      toast.show('Bölgeler kaydedildi ✅', 'success')
      router.refresh()
    } catch {
      toast.show('Bölgeler kaydedilemedi', 'error')
    }
  }

  return (
    <ZoneEditor
      restaurantId={restaurantId}
      initialZones={initialZones}
      onSave={handleSave}
    />
  )
}
