'use client'

import { useState, useTransition } from 'react'
import { Loader2, Bot } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/Toast'

interface Props {
  restaurantId: string
  aiAssistantEnabled: boolean
  aiAssistantName: string | null
}

export default function AssistantConfig({
  restaurantId,
  aiAssistantEnabled,
  aiAssistantName,
}: Props) {
  const toast = useToast()
  const t = useTranslations('panel.voiceSettings')
  const [isPending, startTransition] = useTransition()
  const [enabled, setEnabled] = useState(aiAssistantEnabled)
  const [name, setName] = useState(aiAssistantName ?? '')
  const [savedName, setSavedName] = useState(aiAssistantName ?? '')

  function save() {
    startTransition(async () => {
      try {
        const res = await fetch('/api/panel-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurant_id: restaurantId,
            ai_assistant_enabled: enabled,
            ai_assistant_name: name.trim() || null,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? t('saveError'))
        }
        setSavedName(name.trim())
        toast.show(t('saved'), 'success')
      } catch (e) {
        toast.show(e instanceof Error ? e.message : t('saveError'), 'error')
      }
    })
  }

  const dirty = enabled !== aiAssistantEnabled || name.trim() !== (aiAssistantName ?? '')

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-800">
        <h2 className="text-sm font-bold text-white flex items-center gap-2"><Bot size={15} /> {t('assistantTitle')}</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          {t('assistantSubtitle')}
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Asistanı Aktif Et */}
        <div className="flex items-center justify-between bg-stone-800/30 rounded-xl px-4 py-3">
          <div>
            <span className="text-sm text-white block">{t('enableToggle')}</span>
            <span className="text-xs text-stone-500">
              {t('enableDesc')}
            </span>
          </div>
          <button
            onClick={() => setEnabled(v => !v)}
            disabled={isPending}
            aria-label={t('enableToggle')}
            className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
              enabled ? 'bg-emerald-500' : 'bg-stone-700'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Asistan adı */}
        <div>
          <label className="text-xs text-stone-400 mb-1 block">{t('assistantName')}</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('assistantNamePlaceholder')}
            maxLength={20}
            disabled={!enabled}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 disabled:opacity-50"
          />
          {name.trim() && (
            <p className="text-xs text-stone-500 mt-1">💬 {t('assistantNameHint', { name: name.trim() })}</p>
          )}
        </div>

        {/* Kaydet */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={save}
            disabled={isPending || !enabled || !dirty}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-5 py-2 text-sm transition"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? t('saving') : t('save')}
          </button>
          {!enabled && <span className="text-xs text-stone-500">{t('disabledNameWarn')}</span>}
          {enabled && savedName && <span className="text-xs text-stone-500">{t('activeName', { name: savedName || '—' })}</span>}
        </div>
      </div>
    </div>
  )
}
