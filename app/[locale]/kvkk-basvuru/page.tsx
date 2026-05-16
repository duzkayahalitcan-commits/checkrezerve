'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import LegalSidebar from '@/components/LegalSidebar'

type YanıtYontemi = 'adres' | 'eposta' | 'elden' | ''
type IliskiTipi =
  | 'rezervasyon_musterisi'
  | 'isletme_sahibi'
  | 'ziyaretci'
  | 'diger'

interface FormState {
  adSoyad: string
  tcKimlik: string
  yabanciKimlik: string
  telefon: string
  eposta: string
  adres: string
  iliskiTipi: IliskiTipi | ''
  digerIliski: string
  talepDetayi: string
  yanıtYontemi: YanıtYontemi
}

const INITIAL: FormState = {
  adSoyad: '', tcKimlik: '', yabanciKimlik: '', telefon: '',
  eposta: '', adres: '', iliskiTipi: '', digerIliski: '',
  talepDetayi: '', yanıtYontemi: '',
}

export default function KvkkBasvuruPage() {
  const t = useTranslations('kvkkForm')
  const tLegal = useTranslations('legal')
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.adSoyad.trim()) { setError(t('errorNameRequired')); return }
    if (!form.talepDetayi.trim()) { setError(t('errorRequestRequired')); return }

    setSubmitting(true)

    const sirketIliskisi = form.iliskiTipi === 'diger'
      ? `Diğer: ${form.digerIliski}`
      : form.iliskiTipi

    const { error: dbErr } = await supabase.from('kvkk_applications').insert({
      ad_soyad:        form.adSoyad,
      tc_kimlik:       form.tcKimlik || null,
      yabanci_kimlik:  form.yabanciKimlik || null,
      telefon:         form.telefon || null,
      eposta:          form.eposta || null,
      adres:           form.adres || null,
      sirket_iliskisi: sirketIliskisi || null,
      talep_detayi:    form.talepDetayi,
      yanit_yontemi:   form.yanıtYontemi || null,
      durum:           'beklemede',
    })

    setSubmitting(false)
    if (dbErr) {
      setError(t('errorSubmit'))
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mb-3">{t('successTitle')}</h1>
          <p className="text-zinc-500 text-sm mb-6">
            {t('successDesc')}
          </p>
          <Link href="/" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            {t('backHome')}
          </Link>
        </div>
      </main>
    )
  }

  const inputCls = "w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
  const labelCls = "block text-xs font-semibold text-zinc-500 mb-1.5"
  const sectionCls = "mb-8"
  const sectionTitleCls = "text-base font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100"

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">{tLegal('backHome')}</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/kvkk-basvuru" />

          <div className="flex-1 min-w-0">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 text-sm text-red-800">
          <strong>{t('infoLabel')}:</strong> {t('infoText')}
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 mb-8">{t('pageTitle')}</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 md:p-8 space-y-8">

          {/* Bölüm A */}
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>{t('sectionA')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('fullName')} <span className="text-red-500">*</span></label>
                <input type="text" value={form.adSoyad} onChange={set('adSoyad')} required className={inputCls} placeholder={t('fullName')} />
              </div>
              <div>
                <label className={labelCls}>{t('tcId')}</label>
                <input type="text" value={form.tcKimlik} onChange={set('tcKimlik')} maxLength={11} className={inputCls} placeholder={t('tcIdPlaceholder')} />
              </div>
              <div>
                <label className={labelCls}>{t('foreignId')}</label>
                <input type="text" value={form.yabanciKimlik} onChange={set('yabanciKimlik')} className={inputCls} placeholder={t('foreignIdPlaceholder')} />
              </div>
              <div>
                <label className={labelCls}>{t('phone')}</label>
                <input type="tel" value={form.telefon} onChange={set('telefon')} className={inputCls} placeholder="+90 5xx xxx xx xx" />
              </div>
              <div>
                <label className={labelCls}>{t('email')}</label>
                <input type="email" value={form.eposta} onChange={set('eposta')} className={inputCls} placeholder="ornek@mail.com" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('address')}</label>
                <textarea value={form.adres} onChange={set('adres')} rows={2} className={inputCls} placeholder={t('addressPlaceholder')} />
              </div>
            </div>
          </div>

          {/* Bölüm B */}
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>{t('sectionB')}</h2>
            <div className="space-y-3">
              {[
                { val: 'rezervasyon_musterisi', label: t('relReservationCustomer') },
                { val: 'isletme_sahibi',        label: t('relBusinessOwner') },
                { val: 'ziyaretci',             label: t('relVisitor') },
                { val: 'diger',                 label: t('relOther') },
              ].map(opt => (
                <label key={opt.val} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="iliskiTipi"
                    value={opt.val}
                    checked={form.iliskiTipi === opt.val}
                    onChange={e => setForm(prev => ({ ...prev, iliskiTipi: e.target.value as IliskiTipi }))}
                    className="accent-red-600"
                  />
                  <span className="text-sm text-zinc-700">{opt.label}</span>
                </label>
              ))}
            </div>

            {form.iliskiTipi === 'diger' && (
              <div className="mt-4 pl-6">
                <label className={labelCls}>{t('explain')}</label>
                <input type="text" value={form.digerIliski} onChange={set('digerIliski')} className={inputCls} placeholder={t('explainPlaceholder')} />
              </div>
            )}
          </div>

          {/* Bölüm C */}
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>{t('sectionC')} <span className="text-red-500">*</span></h2>
            <textarea
              value={form.talepDetayi}
              onChange={set('talepDetayi')}
              required
              rows={6}
              className={inputCls}
              placeholder={t('requestPlaceholder')}
            />
          </div>

          {/* Bölüm D */}
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>{t('sectionD')}</h2>
            <div className="space-y-3">
              {[
                { val: 'adres',  label: t('replyByAddress') },
                { val: 'eposta', label: t('replyByEmail') },
                { val: 'elden',  label: t('replyInPerson') },
              ].map(opt => (
                <label key={opt.val} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="yanıtYontemi"
                    value={opt.val}
                    checked={form.yanıtYontemi === opt.val}
                    onChange={e => setForm(prev => ({ ...prev, yanıtYontemi: e.target.value as YanıtYontemi }))}
                    className="accent-red-600"
                  />
                  <span className="text-sm text-zinc-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            {submitting ? t('submitting') : t('submit')}
          </button>

          <p className="text-xs text-zinc-400 text-center">
            {t('footerNote')}{' '}
            <Link href="/kvkk" className="text-red-600 hover:underline">{t('footerKvkkLink')}</Link>{' '}
            {t('footerNoteEnd')}
          </p>
        </form>
          </div>
        </div>
      </div>
    </main>
  )
}
