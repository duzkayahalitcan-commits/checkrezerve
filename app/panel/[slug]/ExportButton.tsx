'use client'

import { useState } from 'react'

export default function ExportButton({
  restaurantId,
  weekStart,
  weekEnd,
}: {
  restaurantId: string
  weekStart:    string
  weekEnd:      string
}) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/panel-export?restaurantId=${restaurantId}&weekStart=${weekStart}&weekEnd=${weekEnd}`,
      )
      if (!res.ok) {
        const { error } = await res.json() as { error: string }
        alert(error ?? 'Export başarısız.')
        return
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `rezervasyonlar_${weekStart}_${weekEnd}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700
                 disabled:opacity-50 border border-stone-700 text-stone-200
                 text-sm font-medium rounded-lg px-4 py-2 transition"
    >
      {loading ? (
        <span className="animate-spin text-base">⟳</span>
      ) : (
        <span>↓</span>
      )}
      CSV İndir
    </button>
  )
}
