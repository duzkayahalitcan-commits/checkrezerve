import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'

export const metadata: Metadata = {
  title: 'Blog — CheckRezerve',
  description: 'Rezervasyon yönetimi, no-show azaltma ve restoran operasyonları hakkında içerikler.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="pt-28 pb-16 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 mb-5 leading-tight">
            Blog
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Rezervasyon yönetimi, no-show azaltma ve restoran operasyonları üzerine içerikler
            yakında burada olacak.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-16 text-center">
            <div className="text-5xl mb-5">✍️</div>
            <h2 className="text-xl font-bold text-zinc-700 mb-3">İçerikler Hazırlanıyor</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8">
              Restoran yöneticilerine yönelik pratik ipuçları, sektör trendleri ve no-show azaltma
              stratejileri yakında yayında.
            </p>
            <Link href="/"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-6 py-3 text-sm font-semibold text-white transition-colors">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-zinc-900 text-white py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">CR</span>
            </div>
            <span className="text-sm font-bold">CheckRezerve</span>
          </Link>
          <p className="text-xs text-zinc-500">© 2026 CheckRezerve Teknoloji</p>
        </div>
      </footer>
    </div>
  )
}
