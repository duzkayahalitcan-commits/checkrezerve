import { Suspense } from 'react'
import Image from 'next/image'
import LoginForm from './LoginForm'

export const metadata = { title: 'İşletme Girişi — checkrezerve' }

export default function PanelLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">

      {/* Arka plan görseli — fixed, tüm sayfa */}
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

      <div className="w-full max-w-sm">

        {/* Logo + başlık */}
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
          <p className="text-white/60 text-sm mt-1">İşletme Paneli</p>
        </div>

        {/* Form kartı */}
        <div className="bg-stone-900/80 backdrop-blur-sm border border-stone-700 rounded-2xl p-6">
          <h1 className="text-white font-semibold mb-5">Giriş Yap</h1>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

      </div>
    </main>
  )
}
