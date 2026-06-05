'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type FormState = {
  ad: string
  soyad: string
  isEmail: string
  isletme: string
  mesaj: string
  newsletter: boolean
}

const inputClass =
  'w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 transition-all duration-200'

const labelClass = 'block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5'

export default function IletisimPage() {
  const [form, setForm] = useState<FormState>({
    ad: '',
    soyad: '',
    isEmail: '',
    isletme: '',
    mesaj: '',
    newsletter: false,
  })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-icon.png"
              alt="CheckRezerve"
              width={32}
              height={32}
              className="rounded-xl"
            />
            <span className="font-bold text-zinc-900">CheckRezerve</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-600">
            <Link href="/ozellikler" className="hover:text-zinc-900 transition-colors">Özellikler</Link>
            <Link href="/kullanim-alanlari" className="hover:text-zinc-900 transition-colors">Kullanım Alanları</Link>
            <Link href="/pricing" className="hover:text-zinc-900 transition-colors">Fiyatlandırma</Link>
            <Link href="/hakkimizda" className="hover:text-zinc-900 transition-colors">Hakkımızda</Link>
          </nav>
          <Link
            href="/kayit"
            className="hidden sm:inline-flex items-center bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 active:scale-[0.97]"
          >
            Demo Talebi
          </Link>
        </div>
      </header>

      {/* ── Section 1: Hero ── */}
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="inline-block bg-red-50 border border-red-100 text-red-600 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
            İletişim
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 leading-tight mb-4">
            Bizimle İletişime Geçin
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            İhtiyaçlarınızı görüşmek ve işbirliği fırsatlarını keşfetmek için buradayız.
          </p>
        </div>
      </section>

      {/* ── Section 2: Two Column ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Left: Contact Form Card */}
            <div className="bg-white shadow-md rounded-2xl p-8 border border-zinc-200">
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="font-bold text-green-800 text-lg mb-2">Mesajınız Alındı!</h3>
                  <p className="text-green-700 text-sm">En kısa sürede sizinle iletişime geçeceğiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Row 1: Ad + Soyad */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Ad</label>
                      <input
                        type="text"
                        required
                        value={form.ad}
                        onChange={e => setForm(f => ({ ...f, ad: e.target.value }))}
                        placeholder="Adınız"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Soyad</label>
                      <input
                        type="text"
                        required
                        value={form.soyad}
                        onChange={e => setForm(f => ({ ...f, soyad: e.target.value }))}
                        placeholder="Soyadınız"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Row 2: Email + İşletme */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>İş E-postası</label>
                      <input
                        type="email"
                        required
                        value={form.isEmail}
                        onChange={e => setForm(f => ({ ...f, isEmail: e.target.value }))}
                        placeholder="isim@isletme.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>İşletme Adı</label>
                      <input
                        type="text"
                        required
                        value={form.isletme}
                        onChange={e => setForm(f => ({ ...f, isletme: e.target.value }))}
                        placeholder="İşletmenizin adı"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Mesaj */}
                  <div>
                    <label className={labelClass}>Mesajınız</label>
                    <textarea
                      required
                      rows={5}
                      value={form.mesaj}
                      onChange={e => setForm(f => ({ ...f, mesaj: e.target.value }))}
                      placeholder="Nasıl yardımcı olabiliriz?"
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Newsletter checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={e => setForm(f => ({ ...f, newsletter: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded border-zinc-300 accent-red-600"
                    />
                    <span className="text-xs text-zinc-500 leading-relaxed">
                      E-posta ile haber ve güncellemeler almak istiyorum
                    </span>
                  </label>

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-zinc-400">
                      Bu formu göndererek{' '}
                      <Link href="/gizlilik" className="hover:text-zinc-600 underline underline-offset-2 transition-colors">
                        Gizlilik Politikamızı
                      </Link>{' '}
                      kabul etmiş olursunuz.
                    </p>
                    <button
                      type="submit"
                      className="shrink-0 bg-zinc-900 hover:bg-zinc-700 active:scale-[0.97] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
                    >
                      Gönder →
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Features + Pills */}
            <div className="flex flex-col gap-8">
              {/* Feature 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg shrink-0">
                  📅
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-1">Anında rezervasyon onayı</h3>
                  <p className="text-sm text-zinc-500">SMS ve e-posta onayları otomatik gönderilir.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg shrink-0">
                  📊
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-1">Takvim ve personel yönetimi</h3>
                  <p className="text-sm text-zinc-500">Tüm randevularınızı tek ekrandan yönetin.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg shrink-0">
                  🔒
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-1">KVKK uyumlu, Türkiye&apos;ye özel</h3>
                  <p className="text-sm text-zinc-500">Komisyon yok, veri kilidi yok, tam kontrol sizde.</p>
                </div>
              </div>

              <hr className="border-zinc-100" />

              {/* Business Type Pills */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  İşletme Türleri
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Kuaför', 'Berber', 'Spa & Güzellik', 'Klinik', 'Restoran'].map((pill) => (
                    <span
                      key={pill}
                      className="bg-zinc-100 text-zinc-700 text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 3: Quick Links ── */}
      <section className="bg-zinc-50 border-y border-zinc-100 py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-wider text-zinc-400 mb-3">Hızlı Bağlantılar</p>
          <h2 className="text-3xl font-extrabold text-zinc-900">Başka bir şey mi arıyorsunuz?</h2>
          <p className="text-zinc-500 mt-2 mb-12">İhtiyacınıza göre doğru kaynağa yönlendirelim.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

            {/* Item 1: Belgeler */}
            <div className="p-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-lg mb-4">
                📖
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1">Belgeler</h3>
              <p className="text-sm text-zinc-500 mb-3 leading-relaxed">
                Entegrasyon rehberleri ve API dökümantasyonu.
              </p>
              <Link
                href="#"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Dokümantasyon →
              </Link>
            </div>

            {/* Item 2: Canlı Destek */}
            <div className="p-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-lg mb-4">
                💬
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1">Canlı Destek</h3>
              <p className="text-sm text-zinc-500 mb-3 leading-relaxed">
                Destek ekibimiz hafta içi 09:00–18:00 arası.
              </p>
              <Link
                href="#"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Destek portalı →
              </Link>
            </div>

            {/* Item 3: Hakkımızda */}
            <div className="p-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-lg mb-4">
                🏢
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1">Hakkımızda</h3>
              <p className="text-sm text-zinc-500 mb-3 leading-relaxed">
                Misyonumuzu ve ekibimizi öğrenin.
              </p>
              <Link
                href="/hakkimizda"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Daha fazla →
              </Link>
            </div>

            {/* Item 4: İş Ortağı Ol */}
            <div className="p-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-lg mb-4">
                🤝
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1">İş Ortağı Ol</h3>
              <p className="text-sm text-zinc-500 mb-3 leading-relaxed">
                Reseller veya entegrasyon ortağı olarak başvurun.
              </p>
              <Link
                href="#"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Başvur →
              </Link>
            </div>

            {/* Item 5: Genel İletişim */}
            <div className="p-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-lg mb-4">
                ✉️
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1">Genel İletişim</h3>
              <p className="text-sm text-zinc-500 mb-3 leading-relaxed">
                Soru ve önerileriniz için bize ulaşın.
              </p>
              <Link
                href="mailto:info@checkrezerve.com"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                info@checkrezerve.com
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 4: Community ── */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block bg-red-50 border border-red-100 text-red-600 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              Topluluk
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-900">Topluluğa Katılın</h2>
            <p className="text-zinc-500 mt-2">Güncel haberler, ipuçları ve destek için bizi takip edin.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* WhatsApp */}
            <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-lg">
                💬
              </div>
              <h3 className="font-semibold text-zinc-900">WhatsApp</h3>
              <p className="text-sm text-zinc-500 flex-1">
                Topluluk grubuna katılın, sorularınızı anında yanıtlayalım.
              </p>
              <Link
                href="#"
                className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Gruba Katıl →
              </Link>
            </div>

            {/* X (Twitter) */}
            <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                𝕏
              </div>
              <h3 className="font-semibold text-zinc-900">X (Twitter)</h3>
              <p className="text-sm text-zinc-500 flex-1">
                Sektör haberleri ve ürün güncellemeleri için takip edin.
              </p>
              <Link
                href="#"
                className="text-sm font-medium text-zinc-900 hover:text-zinc-700 transition-colors"
              >
                Takip Et →
              </Link>
            </div>

            {/* LinkedIn */}
            <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                in
              </div>
              <h3 className="font-semibold text-zinc-900">LinkedIn</h3>
              <p className="text-sm text-zinc-500 flex-1">
                Profesyonel ağımıza katılın, başarı hikâyelerini keşfedin.
              </p>
              <Link
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Bağlan →
              </Link>
            </div>

            {/* Instagram */}
            <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg">
                📸
              </div>
              <h3 className="font-semibold text-zinc-900">Instagram</h3>
              <p className="text-sm text-zinc-500 flex-1">
                Müşteri hikayeleri ve görsel içerikler için takip edin.
              </p>
              <Link
                href="#"
                className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
              >
                Takip Et →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 5: CTA ── */}
      <section className="bg-zinc-900 text-white py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-extrabold mb-4">Başlamaya Hazır mısınız?</h2>
          <p className="text-white/70 text-lg mb-8">
            Ücretsiz hesap oluşturun, 14 gün tüm özellikleri deneyin.
          </p>
          <Link
            href="/kayit"
            className="bg-white text-zinc-900 hover:bg-zinc-100 font-semibold px-8 py-4 rounded-xl transition-colors duration-200 inline-block"
          >
            Ücretsiz Deneyin →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Col 1: Logo + Hakkında */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Image
                  src="/logo-icon.png"
                  alt="CheckRezerve"
                  width={32}
                  height={32}
                  className="rounded-xl brightness-0 invert"
                />
                <span className="text-base font-bold text-white">CheckRezerve</span>
              </div>
              <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
                <Link href="/hakkimizda" className="hover:text-white transition-colors">Neden CheckRezerve?</Link>
                <Link href="/hakkimizda" className="hover:text-white transition-colors">Başarı Hikayeleri</Link>
                <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
              </div>
            </div>

            {/* Col 2: Kullanım Alanları */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Kullanım Alanları</h3>
              <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
                <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Restoran</Link>
                <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Kuaför &amp; Berber</Link>
                <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Spa &amp; Güzellik</Link>
              </div>
            </div>

            {/* Col 3: Özellikler */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Özellikler</h3>
              <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
                <Link href="/ozellikler" className="hover:text-white transition-colors">Ön Ödeme</Link>
                <Link href="/ozellikler" className="hover:text-white transition-colors">Online Rezervasyon</Link>
                <Link href="/ozellikler" className="hover:text-white transition-colors">SMS Bildirimleri</Link>
                <Link href="/ozellikler" className="hover:text-white transition-colors">Müşteri Yönetimi</Link>
              </div>
            </div>

            {/* Col 4: Hukuki */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Hukuki</h3>
              <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
                <Link href="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link>
                <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
                <Link href="/kvkk" className="hover:text-white transition-colors">KVKK</Link>
                <Link href="/cerez-politikasi" className="hover:text-white transition-colors">Çerez Politikası</Link>
              </div>
            </div>

          </div>

          <div className="border-t border-zinc-800 pt-8 text-center">
            <p className="text-sm text-zinc-500">
              © 2026 CheckRezerve. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
