import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Blog — CheckRezerve',
  description: 'Rezervasyon yönetimi, no-show azaltma ve sektör trendleri hakkında içerikler.',
}

const POSTS = [
  {
    emoji: '🚫',
    tag: 'No-Show',
    title: 'No-Show Nedir ve Restoranlar Nasıl Önleyebilir?',
    excerpt: 'Haber vermeden gelmeyen müşteri sorunu Türkiye\'deki restoranların büyük bölümünü etkiliyor. Ön ödeme sistemi ve otomatik onay ile bu sorunu nasıl çözebilirsiniz?',
    readTime: '5 dk okuma',
    date: 'Nisan 2025',
  },
  {
    emoji: '🤖',
    tag: 'Yapay Zeka',
    title: 'Restoran Rezervasyonunda Yapay Zekanın Geleceği',
    excerpt: 'Sesli AI asistanlar, tahmine dayalı doluluk analizi ve kişiselleştirilmiş misafir deneyimi — 2025 ve sonrası için rezervasyon teknolojisi nereye gidiyor?',
    readTime: '7 dk okuma',
    date: 'Mart 2025',
  },
  {
    emoji: '💆',
    tag: 'Spa & Güzellik',
    title: 'Spa İşletmelerinde Dijital Dönüşüm Rehberi',
    excerpt: 'Kâğıt defter ve telefon defterinden dijital rezervasyon sistemine geçiş. Spa işletmelerinin karşılaştığı 5 sorun ve pratik çözümleri.',
    readTime: '4 dk okuma',
    date: 'Şubat 2025',
  },
  {
    emoji: '📊',
    tag: 'Operasyon',
    title: 'Rezervasyon Verisiyle İşletmenizi Nasıl Büyütürsünüz?',
    excerpt: 'Doluluk oranı, iptal trendi ve müşteri tercih analizleri — doğru verileri okuyarak nasıl daha fazla gelir elde edebilirsiniz?',
    readTime: '6 dk okuma',
    date: 'Ocak 2025',
  },
  {
    emoji: '✂️',
    tag: 'Kuaför & Berber',
    title: 'Kuaför Salonunda Son Dakika İptallerini Azaltmanın 5 Yolu',
    excerpt: 'Son dakika iptalleri ve gelmeyen müşteriler kuaför salonları için büyük gelir kaybı anlamına gelir. İşte bunu önlemenin pratik yolları.',
    readTime: '4 dk okuma',
    date: 'Aralık 2024',
  },
  {
    emoji: '💳',
    tag: 'Ön Ödeme',
    title: 'Ön Ödeme Sistemi: Müşteri İlişkilerini Bozmadan Nasıl Uygulanır?',
    excerpt: 'Ön ödeme istemek müşterileri kaçırır mı? Araştırmalar aksini söylüyor. Doğru iletişimle ön ödemeyi müşteri güvenine dönüştürün.',
    readTime: '5 dk okuma',
    date: 'Kasım 2024',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="pt-28 pb-16 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white text-center">
        <div className="mx-auto max-w-2xl px-6">
          <span className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300 font-medium mb-6">
            Blog
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Rezervasyon & İşletme<br />Dünyasından Yazılar
          </h1>
          <p className="text-white/70 text-lg">
            Sektör trendleri, operasyonel ipuçları ve CheckRezerve güncellemeleri.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map(post => (
              <article key={post.title}
                className="rounded-2xl border border-zinc-100 bg-white hover:border-red-100 hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
                <div className="h-44 bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center text-5xl group-hover:from-red-50 group-hover:to-orange-50 transition-colors">
                  {post.emoji}
                </div>
                <div className="p-6">
                  <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                    {post.tag}
                  </span>
                  <h2 className="font-bold text-zinc-900 mb-3 leading-snug group-hover:text-red-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>⏱ {post.readTime}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="text-zinc-400 text-sm mb-4">Daha fazla içerik yakında eklenecek.</p>
            <Link href="/iletisim"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 hover:border-red-400 hover:text-red-600 px-6 py-3 text-sm font-semibold text-zinc-700 transition-all">
              Konuk Yazar Olmak İster misiniz?
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
