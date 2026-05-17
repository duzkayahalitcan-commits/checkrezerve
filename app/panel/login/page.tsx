export const dynamic = 'force-dynamic'

import { Suspense }           from 'react'
import Image                  from 'next/image'
import { getTranslations }    from 'next-intl/server'
import type { Metadata }      from 'next'
import LoginForm              from './LoginForm'
import PanelLangSelector      from '../_components/PanelLangSelector'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('panel')
  return { title: t('pageTitle') }
}

export default async function PanelLoginPage() {
  const t = await getTranslations('panel')

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">

      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/bg-emerald.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
      </div>

      {/* Dil seçici — sağ üst */}
      <div className="fixed top-4 right-4 z-10">
        <PanelLangSelector />
      </div>

      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Image
            src="/images/logo-checkrezerve.jpg"
            alt="CheckRezerve"
            width={72}
            height={72}
            className="rounded-2xl mx-auto mb-3 shadow-xl"
          />
          <div className="text-2xl font-bold text-white tracking-tight">
            checkrezerve
          </div>
          <p className="text-white/60 text-sm mt-1">{t('businessPanel')}</p>
        </div>

        <div className="bg-stone-900/80 backdrop-blur-sm border border-stone-700 rounded-2xl p-6">
          <h1 className="text-white font-semibold mb-5">{t('login')}</h1>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

      </div>
    </main>
  )
}
