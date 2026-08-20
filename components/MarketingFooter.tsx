'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function MarketingFooter() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-zinc-900 text-white px-6 pt-20 pb-10">
      <div className="mx-auto max-w-6xl">
        {/* Statement — a closing line, not a sitemap */}
        <p className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] max-w-[18ch]">
          {t('statement')}
        </p>

        <div className="mt-14 pt-8 border-t border-zinc-800 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {/* Colophon / legal — dense small type, not a column list */}
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/logo-icon.png"
                alt="CheckRezerve"
                width={22}
                height={22}
                className="rounded-md brightness-0 invert"
              />
              <span className="text-sm font-bold text-white">CheckRezerve</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 max-w-sm">
              {t('colophon')}
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              © {year} CheckRezerve. {t('rights')}
            </p>
          </div>

          {/* Minimal inline links — legal reads as a footnote, not a nav */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
            <Link href="/hakkimizda" className="hover:text-white transition-colors">{t('whyUs')}</Link>
            <Link href="/iletisim" className="hover:text-white transition-colors">{t('contact')}</Link>
            <Link href="/blog" className="hover:text-white transition-colors">{t('blog')}</Link>
            <span className="text-zinc-700" aria-hidden>·</span>
            <Link href="/kullanim-kosullari" className="hover:text-white transition-colors">{t('terms')}</Link>
            <Link href="/gizlilik" className="hover:text-white transition-colors">{t('privacy')}</Link>
            <Link href="/kvkk" className="hover:text-white transition-colors">{t('kvkk')}</Link>
            <Link href="/cerez-politikasi" className="hover:text-white transition-colors">{t('cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
