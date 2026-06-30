'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import KrokiEditor from '../../../../src/components/kroki/KrokiEditor'

export default function KrokiEditorPage({
  restaurantId,
  slug,
  initialData,
}: {
  restaurantId: string
  slug: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any[]
}) {
  const router = useRouter()
  const toast = useToast()
  const [saving, setSaving] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleSave(data: any[]) {
    setSaving(true)
    try {
      const res = await fetch('/api/panel/kroki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId, kroki_data: data }),
      })
      if (!res.ok) throw new Error('Kaydedilemedi')
      toast.show('Kroki kaydedildi ✅', 'success')
      router.refresh()
    } catch {
      toast.show('Kaydedilemedi', 'error')
    }
    setSaving(false)
  }

  return <KrokiEditor initialData={initialData} restaurantId={restaurantId} onSave={handleSave} />
}
