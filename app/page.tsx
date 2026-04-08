export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <span className="text-lg font-bold tracking-tight">checkrezerve</span>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-zinc-600">
            <a href="#how" className="hover:text-zinc-900 transition-colors">Nasıl Çalışır</a>
            <a href="#features" className="hover:text-zinc-900 transition-colors">Özellikler</a>
            <a href="#pricing" className="hover:text-zinc-900 transition-colors">Fiyatlar</a>
          </nav>
          <a
            href="#demo"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Ücretsiz Başla
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-600">
            🇹🇷 Türkiye'nin restoran rezervasyon altyapısı
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight text-zinc-900">
            Rezervasyon almak<br />
            <span className="text-zinc-400">hiç bu kadar kolay olmamıştı.</span>
          </h1>
          <p className="max-w-xl text-lg text-zinc-500 leading-relaxed">
            Restoranınıza özel bir link. Müşterileriniz tıklar, tarih ve saat seçer, rezervasyon tamam.
            Tekrar aramasına gerek yok.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <a
              id="demo"
              href="/nusret"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              Demo Restoranı Gör →
            </a>
            <a
              href="#how"
              className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Nasıl Çalışır?
            </a>
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className="pb-24 px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-zinc-400 font-mono">checkrezerve.com/nusret</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-8 w-48 rounded-lg bg-zinc-200 animate-pulse" />
            <div className="h-4 w-32 rounded bg-zinc-100" />
            <div className="mt-2 grid grid-cols-2 gap-3">
              {['Ad Soyad', 'Telefon', 'Tarih', 'Saat'].map((label) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="h-3 w-16 rounded bg-zinc-200" />
                  <div className="h-10 rounded-xl border border-zinc-200 bg-white" />
                </div>
              ))}
            </div>
            <div className="mt-2 h-12 rounded-xl bg-zinc-900" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-zinc-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-16">3 adımda hazır</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Restoranınızı ekleyin', desc: 'Ad, adres ve kapasiteyi girin. Dakikalar içinde hazır.' },
              { step: '02', title: 'Linki paylaşın', desc: 'checkrezerve.com/restoraniniz linkini Instagram, Google ya da menünüze koyun.' },
              { step: '03', title: 'Rezervasyonlar gelsin', desc: 'Müşteriler formu doldurur. Siz panelden takip edersiniz.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-3">
                <span className="text-4xl font-bold text-zinc-200">{step}</span>
                <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-16">Her şey dahil</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: '🔗', title: 'Kişisel Rezervasyon Linki', desc: 'Her restorana özel URL. Paylaşması kolay, kullanması basit.' },
              { icon: '🚫', title: 'Mükerrer Kayıt Engeli', desc: 'Aynı gün aynı numara ile iki kez rezervasyon yapılamaz.' },
              { icon: '📱', title: 'Mobil Uyumlu', desc: 'Müşterileriniz telefondan saniyeler içinde rezervasyon yapabilir.' },
              { icon: '⚡', title: 'Anında Onay', desc: 'Form gönderilince müşteri anında "Rezervasyonunuz Alındı" görür.' },
              { icon: '🗓️', title: 'Tarih & Saat Seçimi', desc: 'Geçmiş tarih seçilemiyor. Hata payı sıfır.' },
              { icon: '📊', title: 'Kolay Yönetim', desc: 'Tüm rezervasyonları tek panelden görüntüleyin ve yönetin.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-zinc-100 p-6 hover:border-zinc-200 transition-colors">
                <span className="text-2xl">{icon}</span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-zinc-900">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-zinc-50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Basit fiyatlandırma</h2>
          <p className="text-zinc-500 mb-12">Gizli ücret yok. İstediğin zaman iptal.</p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                name: 'Başlangıç',
                price: 'Ücretsiz',
                sub: 'Sonsuza kadar',
                features: ['1 restoran', 'Sınırsız rezervasyon', 'Temel form'],
                cta: 'Hemen Başla',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '₺499',
                sub: '/ ay',
                features: ['Sınırsız restoran', 'SMS bildirimi', 'Yönetim paneli', 'Öncelikli destek'],
                cta: 'Pro\'ya Geç',
                highlight: true,
              },
            ].map(({ name, price, sub, features, cta, highlight }) => (
              <div
                key={name}
                className={`flex flex-col gap-6 rounded-2xl border p-8 text-left ${
                  highlight ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-900'
                }`}
              >
                <div>
                  <p className={`text-sm font-medium mb-1 ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>{name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{price}</span>
                    <span className={`text-sm ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>{sub}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {features.map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${highlight ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      <span>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#demo"
                  className={`rounded-full py-3 text-center text-sm font-semibold transition-colors ${
                    highlight
                      ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                      : 'bg-zinc-900 text-white hover:bg-zinc-700'
                  }`}
                >
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl font-bold">Restoranınız için hemen başlayın.</h2>
          <p className="text-zinc-500">Kurulum gerektirmez. Kredi kartı istenmez.</p>
          <a
            href="/nusret"
            className="rounded-full bg-zinc-900 px-8 py-4 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            Demo Restoranı Dene →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <span>© 2026 checkrezerve. Tüm hakları saklıdır.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-700 transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-zinc-700 transition-colors">Kullanım Koşulları</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
