'use client'

import { useState } from 'react'

type SmsLog = {
  id: string
  to_number: string
  body: string
  provider: string
  status: string
  created_at: string
}

export function SmsLog({ logs }: { logs: SmsLog[] }) {
  const [open, setOpen] = useState(false)

  if (logs.length === 0) return null

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
        Mock SMS Logu ({logs.length})
        <span className="text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-yellow-500/15 bg-yellow-500/5 p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-yellow-400">{log.to_number}</span>
                <span className="text-xs text-stone-600">
                  {new Date(log.created_at).toLocaleString('tr-TR')}
                </span>
              </div>
              <p className="text-xs text-stone-400 whitespace-pre-wrap">{log.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
