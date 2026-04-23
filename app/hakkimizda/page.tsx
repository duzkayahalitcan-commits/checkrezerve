import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Hakkımızda — CheckRezerve',
  description: 'CheckRezerve ekibi, hikâyemiz ve misyonumuz. Rezervasyon yönetimini kolaylaştırmak için buradayız.',
}

const VALUES = [
  { icon: '🎯', title: 'Müşteri Odaklılık', desc: 'Her özelliği gerçek işletme sahiplerinin geri bildirimiyle şekillendiriyoruz.' },
  { icon: '🔒', title: 'Güvenilirlik', desc: 'Söz verdiğimiz her özelliği zamanında teslim etmek önceliğimizdir.' },
  { icon: '⚡', title: 'Hız & Verimlilik', desc: 'İşletmeniz için her dakika değerlidir. Sistemimiz buna göre tasarlandı.' },
  { icon: '🌱', title: 'Sürekli Gelişim', desc: 'Durağan kalmak yok. Her ay yeni özellikler, her gün daha iyi bir platform.' },
]

const TEAM = [
  { initials: 'AY', name: 'Ahmet Yılmaz', role: 'Kurucu & CEO', bio: '10 yıl F&B sektörü deneyimi. İlk CheckRezerve fikrini geliştiren kişi.' },
  { initials: 'ZK', name: 'Zeynep Kaya', role: 'Kurucu & Ürün', bio: 'SaaS ürün yönetimi uzmanı. Kullanıcı deneyimi ve büyüme odaklı.' },
  { initials: 'CD', name: 'Can Demir', role: 'CTO', bio: 'Full-stack mühendis. Altyapı ve AI entegrasyonlarından sorumlu.' },
]

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-28 pb-16 text-white text-center relative" style={{backgroundImage:"linear-gradient(135deg,rgba(13,18,26,0.85) 0%,rgba(13,110,110,0.60) 100%),url('/about-office.jpg')",backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className="mx-auto max-w-3xl px-6 relative z-10">
          <span className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300 font-medium mb-6">
            Hakkımızda
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Rezervasyonu Kolaylaştırmak<br />İçin Buradayız
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            CheckRezerve, işletme sahiplerinin &ldquo;rezervasyon yönetimi neden bu kadar zahmetli?&rdquo; sorusundan doğdu. Küçük ama kararlı bir ekibiz.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-2xl font-bold text-red-600 mb-5">Hikâyemiz</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                2024 yılı sonunda İstanbul&apos;da, bir restoran sahibinin &ldquo;müşteri rezervasyon yaptı ama gelmedi, ne yapacağım?&rdquo; sorusuyla başladı her şey. O kişi bizim ilk danışmanımız oldu; birlikte hem sorunu hem çözümü derinlemesine anladık.
              </p>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Mevcut çözümler ya çok pahalıydı ya da Türk işletme dinamiklerine yabancıydı. Sıfırdan, yerli işletmelerin gerçek sorunlarını çözen bir platform kurmaya karar verdik.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Bugün elimizde sağlam bir ürün var ve onu doğru insanlarla buluşturuyoruz. Büyük rakamlar söylemiyoruz — dürüst olmayı tercih ediyoruz. Birlikte büyüyeceğimize inanıyoruz.
              </p>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl bg-red-50 border border-red-100 p-6">
                <h3 className="font-bold text-zinc-900 mb-2">Misyonumuz</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Türkiye&apos;deki her ölçekten işletmenin dünya standartlarında bir rezervasyon deneyimi sunabilmesini sağlamak. Karmaşık teknolojiyi sade, erişilebilir ve uygun fiyatlı hale getirmek.
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-6">
                <h3 className="font-bold text-zinc-900 mb-2">Vizyonumuz</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  2027&apos;ye kadar Türkiye&apos;nin en güvenilir rezervasyon yönetim platformu olmak; ardından Orta Doğu ve Balkan pazarlarına açılmak.
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-900 text-white p-6">
                <div className="text-2xl font-bold mb-1">Yeni Bir Başlangıç</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Erken aşamadayız ve hızla büyüyoruz. Pilot müşterilerimizle birlikte her gün daha güçlü bir platform inşa ediyoruz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-3">Değerlerimiz</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">Bizi Biz Yapan İlkeler</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl border border-zinc-100 p-6 text-center hover:border-red-100 hover:shadow-sm transition-all">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-zinc-900 mb-2 text-sm">{v.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-3">Ekibimiz</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Arkamızdaki İnsanlar</h2>
          <p className="text-zinc-500 max-w-xl mx-auto mb-12">Küçük ama tutkulu bir ekibiz. Her birimiz işletme yönetimi ve teknoloji alanında deneyimliyiz.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {TEAM.map(m => (
              <div key={m.name} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-400 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {m.initials}
                </div>
                <h3 className="font-bold text-zinc-900 mb-1">{m.name}</h3>
                <p className="text-xs font-semibold text-red-600 mb-3">{m.role}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Photo */}
      <div className="w-full h-80 overflow-hidden">
        <Image
          src="/about-office.jpg"
          alt="Ofisimiz"
          width={1440}
          height={320}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* CTA */}
      <section className="py-20 bg-zinc-900 text-white text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold mb-4">Birlikte Büyüyelim</h2>
          <p className="text-white/60 mb-8 leading-relaxed">İşletmenizi CheckRezerve ile tanıştırın. İlk 14 gün ücretsiz, kurulum dakikalar içinde.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/kayit"
              className="rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 font-semibold text-white transition-colors">
              Ücretsiz Başlayın →
            </Link>
            <Link href="/iletisim"
              className="rounded-full border border-white/30 hover:border-white/60 px-8 py-4 font-semibold text-white transition-colors">
              Bize Yazın
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
