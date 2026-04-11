import { Suspense }    from 'react'
import LoginForm        from './LoginForm'

export const metadata = { title: 'Restoran Girişi — checkrezerve' }

export default function PanelLoginPage() {
  return (
    <main className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-white tracking-tight">
            checkrezerve
          </div>
          <p className="text-stone-400 text-sm mt-1">Restoran Paneli</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <h1 className="text-white font-semibold mb-5">Giriş Yap</h1>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
