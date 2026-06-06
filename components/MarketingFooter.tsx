'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function MarketingFooter() {
  const t = useTranslations('footer')
  return (
    <footer className="bg-zinc-900 text-white py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          <div>
            <div className="flex items-center gap-2 mb-5">
              <Image src="/logo-icon.png" alt="CheckRezerve" width={32} height={32} className="rounded-xl brightness-0 invert" />
              <span className="text-base font-bold">CheckRezerve</span>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">{t('about')}</h3>
            <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
              <Link href="/hakkimizda" className="hover:text-white transition-colors">{t('whyUs')}</Link>
              <Link href="/hakkimizda" className="hover:text-white transition-colors">{t('successStories')}</Link>
              <Link href="/blog" className="hover:text-white transition-colors">{t('blog')}</Link>
              <Link href="/iletisim" className="hover:text-white transition-colors">{t('contact')}</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">{t('useCases')}</h3>
            <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
              <Link href={"/kullanim-alanlari?sektor=restoran" as any} className="hover:text-white transition-colors">{t('useCaseRestaurant')}</Link>
              <Link href={"/kullanim-alanlari?sektor=kuafor" as any} className="hover:text-white transition-colors">{t('useCaseBarber')}</Link>
              <Link href={"/kullanim-alanlari?sektor=spa" as any} className="hover:text-white transition-colors">{t('useCaseSpa')}</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">{t('features')}</h3>
            <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
              <Link href="/ozellikler" className="hover:text-white transition-colors">{t('featurePrepayment')}</Link>
              <Link href="/ozellikler" className="hover:text-white transition-colors">{t('featureReservation')}</Link>
              <Link href="/ozellikler" className="hover:text-white transition-colors">{t('featureSms')}</Link>
              <Link href="/ozellikler" className="hover:text-white transition-colors">{t('featureCustomer')}</Link>
              <Link href="/ozellikler" className="hover:text-white transition-colors">{t('featureOnline')}</Link>
              <Link href="/sss" className="hover:text-white transition-colors">SSS</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">{t('legal')}</h3>
            <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
              <Link href="/kullanim-kosullari" className="hover:text-white transition-colors">{t('terms')}</Link>
              <Link href="/gizlilik" className="hover:text-white transition-colors">{t('privacy')}</Link>
              <Link href="/kvkk" className="hover:text-white transition-colors">{t('kvkk')}</Link>
              <Link href="/cerez-politikasi" className="hover:text-white transition-colors">{t('cookies')}</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 text-center">
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} CheckRezerve. {t('rights')}</p>
        </div>
      </div>
    </footer>
  )
}
