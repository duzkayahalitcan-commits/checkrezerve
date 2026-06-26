'use client'

import { useState, useEffect, useRef } from 'react'

type BusyTimesResponse = {
  times: string[]
}

/**
 * Belirtilen restaurant için belirtilen tarihte dolu olan saat slotlarını
 * /api/rezervasyon/musait endpoint'inden çeker.
 * - restaurantId değişirse veya date değişirse otomatik yeniden sorgular.
 * - Aynı anda çoklu sorguyu engeller (abort controller).
 */
export function useAvailability(restaurantId: string | null, date: string | null) {
  const [busyTimes, setBusyTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!restaurantId || !date) {
      setBusyTimes([])
      return
    }

    // Önceki isteği iptal et
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)

    const params = new URLSearchParams({ business_id: restaurantId, date })
    fetch(`/api/rezervasyon/musait?${params}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(res => res.json() as Promise<BusyTimesResponse>)
      .then(data => {
        if (!controller.signal.aborted) {
          setBusyTimes(data.times ?? [])
        }
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[useAvailability]', err)
        if (!controller.signal.aborted) setBusyTimes([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [restaurantId, date])

  const isBusy = (time: string) => busyTimes.includes(time)

  return { busyTimes, loading, isBusy }
}
