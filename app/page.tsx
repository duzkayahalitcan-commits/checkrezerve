export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CR</span>
            </div>
            <span className="text-base font-bold tracking-tight">checkrezerve</span>
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-zinc-500">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Özellikler</a>
            <a href="#how" className="hover:text-zinc-900 transition-colors">Nasıl Çalışır</a>
            <a href="#pricing" className="hover:text-zinc-900 transition-colors">Fiyatlar</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#contact" className="hidden sm:block text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
              Giriş Yap
            </a>
            <a
              href="#join"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              Sisteme Katıl
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 text-center">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Sistem aktif · Yeni restoranlar kabul ediliyor
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-none text-zinc-900">
            Rezervasyon almak<br />
            <span className="bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              artık çok kolay.
            </span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-zinc-500 leading-relaxed">
            Restoranınıza özel bir link oluşturun. Müşterileriniz tıklar, tarih seçer, rezervasyon tamamlanır.
            Telefon kalabalığı bitti.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <a
              id="join"
              href="mailto:merhaba@checkrezerve.com?subject=Sisteme Katılmak İstiyorum"
              className="w-full sm:w-auto rounded-full bg-zinc-900 px-8 py-4 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors shadow-lg shadow-zinc-900/10"
            >
              Hemen Sisteme Katıl →
            </a>
            <a
              href="/nusret"
              className="w-full sm:w-auto rounded-full border border-zinc-200 px-8 py-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Demo'yu Gör
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-8 pt-8 border-t border-zinc-100 w-full">
            {[
              { value: '500+', label: 'Aktif restoran' },
              { value: '12.000+', label: 'Aylık rezervasyon' },
              { value: '%0', label: 'Mükerrer kayıt' },
              { value: '4.9★', label: 'Restoran puanı' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-zinc-900">{value}</span>
                <span className="text-xs text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live mockup */}
      <section className="pb-24 px-6">
        <div className="mx-auto max-w-sm sm:max-w-md">
          <div className="rounded-3xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-6 shadow-2xl shadow-zinc-900/5">
            {/* Browser bar */}
            <div className="flex items-center gap-1.5 mb-5 pb-4 border-b border-zinc-100">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <div className="ml-2 flex-1 rounded-full bg-zinc-100 px-3 py-1 text-[10px] text-zinc-400 font-mono">
                checkrezerve.com/restoraniniz
              </div>
            </div>
            {/* Mock form */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-base font-bold text-zinc-900">Nusret Steakhouse</p>
                <p className="text-xs text-zinc-400 mt-0.5">Bağcılar, İstanbul</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Ad Soyad', placeholder: 'Ahmet Yılmaz' },
                  { label: 'Telefon', placeholder: '0532 000 00 00' },
                  { label: 'Tarih', placeholder: '08.04.2026' },
                  { label: 'Saat', placeholder: '20:00' },
                ].map(({ label, placeholder }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-zinc-500">{label}</span>
                    <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-400">
                      {placeholder}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-zinc-900 py-3 text-center text-xs font-semibold text-white">
                Rezervasyon Yap
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-zinc-400 mt-4">
            👆 Gerçek rezervasyon formu böyle görünür
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-zinc-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Restoranınıza özel her şey
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Telefonda kayıt alma, kağıda yazma, unutulan rezervasyon devri kapandı.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: '🔗',
                title: 'Kişisel Rezervasyon Linki',
                desc: 'checkrezerve.com/restoraniniz — Instagram bio\'nuzdan menünüze kadar her yere koyun.',
              },
              {
                icon: '🚫',
                title: 'Akıllı Mükerrer Engeli',
                desc: 'Aynı numara, aynı gün için iki kez rezervasyon yapamaz. Hiçbir çakışma yaşanmaz.',
              },
              {
                icon: '📱',
                title: '100% Mobil Uyumlu',
                desc: 'Müşterileriniz telefondan 20 saniyede rezervasyon tamamlar. Uygulama indirmesi gerekmez.',
              },
              {
                icon: '✅',
                title: 'Anında Onay',
                desc: '"Rezervasyonunuz Alındı!" — Form gönderilince müşteri anında onay görür.',
              },
              {
                icon: '📊',
                title: 'Rezervasyon Paneli',
                desc: 'Tüm rezervasyonları tek ekranda görün. Tarih, saat, kişi sayısı — hepsi sıralı.',
              },
              {
                icon: '🛡️',
                title: 'Güvenli Altyapı',
                desc: 'Veriler Supabase ile şifrelenmiş PostgreSQL\'de saklanır. KVKK uyumlu.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-2xl bg-white border border-zinc-100 p-6 hover:border-zinc-200 hover:shadow-sm transition-all"
              >
                <span className="text-3xl">{icon}</span>
                <h3 className="font-semibold text-zinc-900">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bugün başlayın</h2>
            <p className="text-zinc-500">Teknik bilgi gerekmez. 10 dakikada canlı.</p>
          </div>
          <div className="relative">
            {/* connector line */}
            <div className="hidden sm:block absolute top-8 left-[calc(16.67%-1px)] right-[calc(16.67%-1px)] h-px bg-zinc-200" />
            <div className="grid sm:grid-cols-3 gap-10">
              {[
                {
                  step: '1',
                  title: 'Formu doldurun',
                  desc: '"Sisteme Katıl" butonuna tıklayın, restoran bilgilerinizi gönderin.',
                },
                {
                  step: '2',
                  title: 'Linkinizi alın',
                  desc: '24 saat içinde checkrezerve.com/restoraniniz adresiniz aktif olur.',
                },
                {
                  step: '3',
                  title: 'Rezervasyon alın',
                  desc: 'Linki paylaşın, müşterileriniz rezervasyon yapmaya başlasın.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center gap-4">
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-900/10">
                    <span className="text-xl font-bold text-white">{step}</span>
                  </div>
                  <h3 className="font-semibold text-zinc-900">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-zinc-900 text-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Restoranlar ne diyor?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                quote: 'Artık rezervasyon için telefona koşmuyoruz. Sabah panele bakıyoruz, hepsi orada.',
                name: 'Mehmet K.',
                restaurant: 'Kapadokya Restaurant, Nevşehir',
              },
              {
                quote: '"Zaten rezervasyon yaptım" diyen müşteri kalmadı. Sistem hepsini engelliyor.',
                name: 'Ayşe T.',
                restaurant: 'Bosphorus Balık, İstanbul',
              },
              {
                quote: 'Instagram bio\'muza koyduk, ayda 200+ rezervasyon geliyor. Sıfır efor.',
                name: 'Kerim Ö.',
                restaurant: 'Anatolia Grill, Ankara',
              },
            ].map(({ quote, name, restaurant }) => (
              <div key={name} className="flex flex-col gap-4 rounded-2xl bg-white/5 border border-white/10 p-6">
                <p className="text-sm text-zinc-300 leading-relaxed">"{quote}"</p>
                <div className="mt-auto">
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-zinc-500">{restaurant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Şeffaf fiyatlandırma</h2>
            <p className="text-zinc-500">Komisyon yok. Saklı ücret yok. İstediğin zaman iptal.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                name: 'Başlangıç',
                price: 'Ücretsiz',
                sub: 'sonsuza kadar',
                features: [
                  '1 restoran profili',
                  'Sınırsız rezervasyon',
                  'Mükerrer kayıt engeli',
                  'Mobil uyumlu form',
                ],
                cta: 'Hemen Başla',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '₺499',
                sub: '/ ay',
                badge: 'Popüler',
                features: [
                  'Sınırsız restoran',
                  'Yönetim paneli',
                  'SMS & e-posta bildirimi',
                  'Özel alan adı desteği',
                  'Öncelikli destek',
                ],
                cta: 'Pro\'ya Geç',
                highlight: true,
              },
            ].map(({ name, price, sub, badge, features, cta, highlight }) => (
              <div
                key={name}
                className={`relative flex flex-col gap-6 rounded-2xl border p-8 ${
                  highlight
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xl shadow-zinc-900/20'
                    : 'border-zinc-200 bg-white text-zinc-900'
                }`}
              >
                {badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-white">
                    {badge}
                  </span>
                )}
                <div>
                  <p className={`text-sm font-medium mb-2 ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>{name}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className={`text-sm ${highlight ? 'text-zinc-400' : 'text-zinc-400'}`}>{sub}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {features.map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${highlight ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      <span className={`text-xs ${highlight ? 'text-emerald-400' : 'text-emerald-600'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={highlight ? '#join' : '#join'}
                  className={`rounded-full py-3.5 text-center text-sm font-semibold transition-colors ${
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
      <section id="contact" className="py-24 px-6 bg-zinc-50">
        <div className="mx-auto max-w-2xl text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Restoranınızı sisteme ekleyelim.
          </h2>
          <p className="text-zinc-500 max-w-md">
            Hemen başvurun, 24 saat içinde rezervasyon linkiniz hazır olsun.
            Teknik bilgi gerekmez.
          </p>
          <a
            href="mailto:merhaba@checkrezerve.com?subject=Sisteme Katılmak İstiyorum&body=Restoran Adı:%0D%0ATelefon:%0D%0AŞehir:"
            className="rounded-full bg-zinc-900 px-8 py-4 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors shadow-lg shadow-zinc-900/10"
          >
            Hemen Sisteme Katıl →
          </a>
          <p className="text-xs text-zinc-400">
            veya <a href="tel:+90XXXXXXXXXX" className="underline underline-offset-2">bizi arayın</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-10 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">CR</span>
              </div>
              <span className="text-sm font-bold">checkrezerve</span>
            </div>
            <p className="text-xs text-zinc-400 text-center">
              Türkiye'nin restoran rezervasyon altyapısı. © 2026 Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 text-xs text-zinc-400">
              <a href="#" className="hover:text-zinc-700 transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-zinc-700 transition-colors">KVKK</a>
              <a href="#" className="hover:text-zinc-700 transition-colors">İletişim</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
