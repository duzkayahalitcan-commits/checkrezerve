import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'İletişim — CheckRezerve',
  description: 'CheckRezerve ile iletişime geçin. Demo talep edin, fiyat sorun veya destek alın.',
}

export default async function IletisimPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="pt-28 pb-16 text-white text-center relative" style={{backgroundImage:"linear-gradient(135deg,rgba(13,18,26,0.75) 0%,rgba(13,80,60,0.65) 100%),url('/images/feature-iletisim.jpg')",backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className="mx-auto max-w-2xl px-6 relative z-10">
          <span className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300 font-medium mb-6">
            {t('heroBadge')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-white/70 text-lg">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-start">

            {/* Left: Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">{t('leftTitle')}</h2>
              <p className="text-zinc-600 leading-relaxed mb-8">
                {t('leftSubtitle')}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg shrink-0">
                    ✉️
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('emailLabel')}</div>
                    <div className="text-sm font-medium text-zinc-800">info@checkrezerve.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-lg shrink-0">
                    💬
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('whatsappLabel')}</div>
                    <a
                      href="https://wa.me/905555555555"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
                    >
                      {t('whatsappLink')}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg shrink-0">
                    📍
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('addressLabel')}</div>
                    <div className="text-sm font-medium text-zinc-800">{t('addressValue')}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {[
                  { icon: '📸', label: 'Instagram', href: '#' },
                  { icon: '💼', label: 'LinkedIn', href: '#' },
                  { icon: '🐦', label: 'Twitter/X', href: '#' },
                ].map(s => (
                  <a key={s.label} href={s.href}
                    className="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-red-600 hover:text-white text-zinc-600 flex items-center justify-center text-sm transition-all duration-200"
                    title={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>

              <div className="mt-10 rounded-2xl bg-zinc-50 border border-zinc-100 p-6">
                <h3 className="font-bold text-zinc-900 mb-2 text-sm">{t('quickReplyTitle')}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {t('quickReplyDesc')}
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
