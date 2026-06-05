'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Send, CheckCircle2 } from 'lucide-react'

const buildSchema = (t: (k: string) => string) =>
  z.object({
    firstName:    z.string().min(2, t('errorRequired')),
    lastName:     z.string().min(2, t('errorRequired')),
    email:        z.string().email(t('errorEmail')),
    businessName: z.string().min(2, t('errorRequired')),
    message:      z.string().min(10, t('errorRequired')),
    newsletter:   z.boolean().optional(),
    kvkk:         z.literal(true, { error: () => ({ message: t('errorKvkk') }) }),
  })

type FormValues = {
  firstName: string
  lastName: string
  email: string
  businessName: string
  message: string
  newsletter?: boolean
  kvkk: true
}

const INPUT_BASE =
  'w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
const INPUT_ERROR =
  'border-red-400 focus:border-red-400 focus:ring-red-400/30'

export default function ContactForm() {
  const t = useTranslations('contact')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const schema = buildSchema(t)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
  })

  async function onSubmit(_data: FormValues) {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 900))
    setSubmitting(false)
    setSent(true)
    reset()
    setTimeout(() => setSent(false), 6000)
  }

  if (sent) {
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
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-5" noValidate>

      {/* Ad / Soyad */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
            {t('formFirstName')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('firstName')}
            placeholder="Ahmet"
            className={`${INPUT_BASE} ${errors.firstName ? INPUT_ERROR : ''}`}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500">{errors.firstName.message as string}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
            {t('formLastName')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('lastName')}
            placeholder="Yılmaz"
            className={`${INPUT_BASE} ${errors.lastName ? INPUT_ERROR : ''}`}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-500">{errors.lastName.message as string}</p>
          )}
        </div>
      </div>

      {/* E-posta */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
          {t('formEmail')} <span className="text-red-500">*</span>
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="ahmet@isletme.com"
          className={`${INPUT_BASE} ${errors.email ? INPUT_ERROR : ''}`}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message as string}</p>
        )}
      </div>

      {/* İşletme Adı */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
          {t('formBusinessName')} <span className="text-red-500">*</span>
        </label>
        <input
          {...register('businessName')}
          placeholder="Örn: Zeytin Restoran"
          className={`${INPUT_BASE} ${errors.businessName ? INPUT_ERROR : ''}`}
        />
        {errors.businessName && (
          <p className="mt-1 text-xs text-red-500">{errors.businessName.message as string}</p>
        )}
      </div>

      {/* Mesaj */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
          {t('formMessage')} <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={4}
          placeholder={t('formMessagePlaceholder')}
          className={`${INPUT_BASE} resize-none ${errors.message ? INPUT_ERROR : ''}`}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message.message as string}</p>
        )}
      </div>

      {/* Newsletter */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          {...register('newsletter')}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-red-600 rounded"
        />
        <span className="text-sm text-zinc-600 leading-snug">{t('formNewsletter')}</span>
      </label>

      {/* KVKK */}
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            {...register('kvkk')}
            type="checkbox"
            className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-red-600 rounded ${errors.kvkk ? 'outline outline-1 outline-red-500' : ''}`}
          />
          <span className="text-sm text-zinc-600 leading-snug">
            <Link href="/kvkk" target="_blank" className="font-semibold text-red-600 underline underline-offset-2 hover:text-red-700">
              {t('formKvkkLink')}
            </Link>
            {"'ni okudum ve kabul ediyorum"}
          </span>
        </label>
        {errors.kvkk && (
          <p className="mt-1 text-xs text-red-500">{errors.kvkk.message as string}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {t('formSubmit')}
      </button>
    </form>
  )
}
