import Link from 'next/link'

export default function MarketingFooter() {
  return (
    <footer className="bg-zinc-900 text-white py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">CR</span>
              </div>
              <span className="text-base font-bold">CheckRezerve</span>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">CheckRezerve Hakkında</h3>
            <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
              <Link href="/hakkimizda" className="hover:text-white transition-colors">Neden CheckRezerve?</Link>
              <Link href="/hakkimizda" className="hover:text-white transition-colors">Başarı Hikayeleri</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Kullanım Alanları</h3>
            <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
              <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Restoran &amp; Kafe</Link>
              <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Kuaför &amp; Berber</Link>
              <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Spa &amp; Güzellik</Link>
              <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Otel &amp; Konaklama</Link>
              <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Etkinlik Mekanları</Link>
              <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Spor &amp; Fitness</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Özellikler</h3>
            <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
              <Link href="/ozellikler" className="hover:text-white transition-colors">Ön Ödeme Sistemi</Link>
              <Link href="/ozellikler" className="hover:text-white transition-colors">Rezervasyon Yönetimi</Link>
              <Link href="/ozellikler" className="hover:text-white transition-colors">SMS Hatırlatmalar</Link>
              <Link href="/ozellikler" className="hover:text-white transition-colors">Müşteri Yönetimi</Link>
              <Link href="/ozellikler" className="hover:text-white transition-colors">Online Rezervasyon</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Yasal</h3>
            <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
              <Link href="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link>
              <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
              <Link href="/kvkk" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</Link>
              <Link href="/cerez-politikasi" className="hover:text-white transition-colors">Çerez Politikası</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 text-center">
          <p className="text-sm text-zinc-500">© 2026 CheckRezerve. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
