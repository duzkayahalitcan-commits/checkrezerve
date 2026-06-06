'use client'
import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Send, CheckCircle2 } from 'lucide-react'
import { submitContact, type ContactState } from './actions'

const initial: ContactState = { error: null, success: false }

const INPUT_BASE =
  'w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400'

export default function ContactForm() {
  const t = useTranslations('contact')
  const [state, formAction, pending] = useActionState(submitContact, initial)

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">{t('formSuccessTitle')}</h3>
        <p className="max-w-xs text-sm text-zinc-500 leading-relaxed">{t('formSuccessDesc')}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>

      {/* Ad / Soyad */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
            {t('formFirstName')} <span className="text-red-500">*</span>
          </label>
          <input
            name="firstName"
            required
            minLength={2}
            placeholder="Ahmet"
            className={INPUT_BASE}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
            {t('formLastName')} <span className="text-red-500">*</span>
          </label>
          <input
            name="lastName"
            required
            minLength={2}
            placeholder="Yılmaz"
            className={INPUT_BASE}
          />
        </div>
      </div>

      {/* E-posta */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
          {t('formEmail')} <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="ahmet@isletme.com"
          className={INPUT_BASE}
        />
      </div>

      {/* İşletme Adı */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
          {t('formBusinessName')} <span className="text-red-500">*</span>
        </label>
        <input
          name="businessName"
          required
          minLength={2}
          placeholder="Örn: Zeytin Restoran"
          className={INPUT_BASE}
        />
      </div>

      {/* Mesaj */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
          {t('formMessage')} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          minLength={10}
          rows={4}
          placeholder={t('formMessagePlaceholder')}
          className={`${INPUT_BASE} resize-none`}
        />
      </div>

      {/* Newsletter */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          name="newsletter"
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-red-600 rounded"
        />
        <span className="text-sm text-zinc-600 leading-snug">{t('formNewsletter')}</span>
      </label>

      {/* KVKK */}
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            name="kvkk"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-red-600 rounded"
          />
          <span className="text-sm text-zinc-600 leading-snug">
            <Link href="/kvkk" target="_blank" className="font-semibold text-red-600 underline underline-offset-2 hover:text-red-700">
              {t('formKvkkLink')}
            </Link>
            {"'ni okudum ve kabul ediyorum"}
          </span>
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {t('formSubmit')}
      </button>
    </form>
  )
}
