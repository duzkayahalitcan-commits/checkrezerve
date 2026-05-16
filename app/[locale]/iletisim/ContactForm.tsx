'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function ContactForm() {
  const t = useTranslations('contact')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8">
      {sent ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">✓</div>
          <h3 className="font-bold text-zinc-900">{t('formSuccessTitle')}</h3>
          <p className="text-sm text-zinc-500">{t('formSuccessDesc')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t('formName')}</label>
              <input type="text" required placeholder="Ahmet Yılmaz"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:border-red-400 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t('formEmail')}</label>
              <input type="email" required placeholder="ahmet@isletme.com"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:border-red-400 transition-colors" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t('formPhone')}</label>
              <input type="tel" placeholder="0532 XXX XX XX"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:border-red-400 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t('formBusinessType')}</label>
              <select className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:border-red-400 transition-colors">
                <option value="">{t('formSelectType')}</option>
                <option>{t('formTypeRestaurant')}</option>
                <option>{t('formTypeCafe')}</option>
                <option>{t('formTypeSpa')}</option>
                <option>{t('formTypeBarber')}</option>
                <option>{t('formTypeHotel')}</option>
                <option>{t('formTypeEvent')}</option>
                <option>{t('formTypeFitness')}</option>
                <option>{t('formTypeOther')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t('formMessage')}</label>
            <textarea rows={4} placeholder={t('formMessagePlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:border-red-400 transition-colors resize-none" />
          </div>
          <button type="submit"
            className="w-full rounded-xl bg-red-600 hover:bg-red-700 py-3.5 text-sm font-semibold text-white transition-colors">
            {t('formSubmit')}
          </button>
        </form>
      )}
    </div>
  )
}
