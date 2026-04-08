import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Admin Girişi',
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams
  const redirectTo = from ?? '/admin'

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-900/40">
            <span className="text-2xl font-black text-white">C</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">checkrezerve</h1>
            <p className="text-xs text-stone-500 mt-0.5">Admin Paneli</p>
          </div>
        </div>

        {/* Kart */}
        <div className="bg-white/5 border border-white/8 rounded-3xl p-6">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  )
}
