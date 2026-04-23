'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type YanıtYontemi = 'adres' | 'eposta' | 'elden' | ''
type IliskiTipi =
  | 'ziyaretci'
  | 'tedarikci'
  | 'eski_calisan'
  | 'ucuncu_firma'
  | 'calisan'
  | 'is_basvurusu'
  | 'diger'

interface FormState {
  adSoyad: string
  tcKimlik: string
  yabanciKimlik: string
  telefon: string
  eposta: string
  adres: string
  iliskiTipi: IliskiTipi | ''
  calisılanYillar: string
  calisanFirma: string
  birim: string
  digerIliski: string
  talepDetayi: string
  yanıtYontemi: YanıtYontemi
}

const INITIAL: FormState = {
  adSoyad: '', tcKimlik: '', yabanciKimlik: '', telefon: '',
  eposta: '', adres: '', iliskiTipi: '', calisılanYillar: '',
  calisanFirma: '', birim: '', digerIliski: '', talepDetayi: '',
  yanıtYontemi: '',
}

export default function KvkkBasvuruPage() {
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

    if (!form.adSoyad.trim()) { setError('Ad Soyad zorunludur.'); return }
    if (!form.talepDetayi.trim()) { setError('Talep detayı zorunludur.'); return }

    setSubmitting(true)

    const sirketIliskisi = form.iliskiTipi === 'eski_calisan'
      ? `Eski Çalışan (${form.calisılanYillar})`
      : form.iliskiTipi === 'ucuncu_firma'
      ? `Üçüncü Kişi Firma Çalışanı — ${form.calisanFirma} / ${form.birim}`
      : form.iliskiTipi === 'diger'
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
      setError('Başvurunuz gönderilemedi. Lütfen tekrar deneyin veya info@checkrezerve.com adresine e-posta gönderin.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mb-3">Başvurunuz Alındı</h1>
          <p className="text-zinc-500 text-sm mb-6">
            KVKK kapsamındaki talebiniz başarıyla iletildi. 30 gün içinde yanıtlanacaktır.
          </p>
          <Link href="/" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    )
  }

  const inputCls = "w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
  const labelCls = "block text-xs font-semibold text-zinc-500 mb-1.5"
  const sectionCls = "mb-8"
  const sectionTitleCls = "text-base font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100"

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-emerald-700 hover:underline">← Ana Sayfa</Link>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8 text-sm text-emerald-800">
          <strong>Bilgi:</strong> Bu form, 6698 sayılı KVKK&apos;nın 11. maddesinde sayılan
          haklarınızı kullanmak amacıyla CheckRezerve Teknoloji&apos;ye başvuruda bulunmanızı
          sağlar. Talebiniz <strong>30 gün</strong> içinde yanıtlanacaktır.
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 mb-8">KVKK Başvuru Formu</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 md:p-8 space-y-8">

          {/* Bölüm A */}
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>A — Başvuru Sahibi İletişim Bilgileri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Ad Soyad <span className="text-red-500">*</span></label>
                <input type="text" value={form.adSoyad} onChange={set('adSoyad')} required className={inputCls} placeholder="Ad Soyad" />
              </div>
              <div>
                <label className={labelCls}>TC Kimlik No</label>
                <input type="text" value={form.tcKimlik} onChange={set('tcKimlik')} maxLength={11} className={inputCls} placeholder="11 haneli TC Kimlik No" />
              </div>
              <div>
                <label className={labelCls}>Yabancılar için Uyruk / Pasaport No</label>
                <input type="text" value={form.yabanciKimlik} onChange={set('yabanciKimlik')} className={inputCls} placeholder="Pasaport / Kimlik No" />
              </div>
              <div>
                <label className={labelCls}>Telefon Numarası</label>
                <input type="tel" value={form.telefon} onChange={set('telefon')} className={inputCls} placeholder="+90 5xx xxx xx xx" />
              </div>
              <div>
                <label className={labelCls}>E-posta</label>
                <input type="email" value={form.eposta} onChange={set('eposta')} className={inputCls} placeholder="ornek@mail.com" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Adres</label>
                <textarea value={form.adres} onChange={set('adres')} rows={2} className={inputCls} placeholder="Açık adresiniz" />
              </div>
            </div>
          </div>

          {/* Bölüm B */}
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>B — CheckRezerve ile Olan İlişkiniz</h2>
            <div className="space-y-3">
              {[
                { val: 'ziyaretci',    label: 'Ziyaretçi' },
                { val: 'tedarikci',    label: 'Tedarikçi / Müşteri' },
                { val: 'eski_calisan', label: 'Eski Çalışan' },
                { val: 'ucuncu_firma', label: 'Üçüncü Kişi Firma Çalışanı' },
                { val: 'calisan',      label: 'Mevcut Çalışan' },
                { val: 'is_basvurusu',label: 'İş Başvurusu / Özgeçmiş Paylaşımı Yaptım' },
                { val: 'diger',        label: 'Diğer' },
              ].map(opt => (
                <label key={opt.val} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="iliskiTipi"
                    value={opt.val}
                    checked={form.iliskiTipi === opt.val}
                    onChange={e => setForm(prev => ({ ...prev, iliskiTipi: e.target.value as IliskiTipi }))}
                    className="accent-emerald-600"
                  />
                  <span className="text-sm text-zinc-700">{opt.label}</span>
                </label>
              ))}
            </div>

            {form.iliskiTipi === 'eski_calisan' && (
              <div className="mt-4 pl-6">
                <label className={labelCls}>Çalıştığım Yıllar</label>
                <input type="text" value={form.calisılanYillar} onChange={set('calisılanYillar')} className={inputCls} placeholder="Örn: 2020-2023" />
              </div>
            )}

            {form.iliskiTipi === 'ucuncu_firma' && (
              <div className="mt-4 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Firma Adı</label>
                  <input type="text" value={form.calisanFirma} onChange={set('calisanFirma')} className={inputCls} placeholder="Firma adı" />
                </div>
                <div>
                  <label className={labelCls}>Pozisyon / Birim</label>
                  <input type="text" value={form.birim} onChange={set('birim')} className={inputCls} placeholder="Pozisyon veya birim" />
                </div>
              </div>
            )}

            {form.iliskiTipi === 'diger' && (
              <div className="mt-4 pl-6">
                <label className={labelCls}>Açıklayınız</label>
                <input type="text" value={form.digerIliski} onChange={set('digerIliski')} className={inputCls} placeholder="İlişkinizi açıklayın" />
              </div>
            )}
          </div>

          {/* Bölüm C */}
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>C — KVKK Kapsamındaki Talebiniz <span className="text-red-500">*</span></h2>
            <textarea
              value={form.talepDetayi}
              onChange={set('talepDetayi')}
              required
              rows={6}
              className={inputCls}
              placeholder="KVKK 11. madde kapsamında kullanmak istediğiniz hakkı ve talebinizin detayını açıklayınız..."
            />
          </div>

          {/* Bölüm D */}
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>D — Yanıt Bildirim Yöntemi</h2>
            <div className="space-y-3">
              {[
                { val: 'adres',  label: 'Adresime gönderilmesini istiyorum' },
                { val: 'eposta', label: 'E-posta adresime gönderilmesini istiyorum' },
                { val: 'elden',  label: 'Elden teslim almak istiyorum' },
              ].map(opt => (
                <label key={opt.val} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="yanıtYontemi"
                    value={opt.val}
                    checked={form.yanıtYontemi === opt.val}
                    onChange={e => setForm(prev => ({ ...prev, yanıtYontemi: e.target.value as YanıtYontemi }))}
                    className="accent-emerald-600"
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
          </button>

          <p className="text-xs text-zinc-400 text-center">
            Başvurunuz 30 gün içinde yanıtlanacaktır.{' '}
            <Link href="/kvkk" className="text-emerald-700 hover:underline">KVKK Politikamızı</Link>{' '}
            okuyabilirsiniz.
          </p>
        </form>
      </div>
    </main>
  )
}
