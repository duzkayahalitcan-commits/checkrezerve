'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const features = [
  {
    icon: '🚀',
    title: 'Hızlı Kurulum',
    desc: '24 saat içinde sisteminizi kurun ve müşteri almaya başlayın.',
  },
  {
    icon: '💳',
    title: 'Komisyonsuz',
    desc: 'Her rezervasyondan kesinti yok. Kazancınızın tamamı sizin.',
  },
  {
    icon: '🤖',
    title: 'AI Destekli',
    desc: 'Sesli asistan ve otomatik hatırlatmalar ile müşteri kaybetmeyin.',
  },
]

const clientPills = [
  'Bella Kuaför',
  'Mavi Restoran',
  'Zen Spa',
  'Dr. Ayşe Klinik',
  'FitLife Spor',
  'Güneş Berber',
]

const quickLinks = [
  {
    title: 'Ürün',
    items: [
      { label: 'Özellikler', href: '/ozellikler' },
      { label: 'Fiyatlandırma', href: '/pricing' },
      { label: 'Güvenlik', href: '/gizlilik' },
      { label: 'Yol Haritası', href: '/' },
    ],
  },
  {
    title: 'Kullanım Alanları',
    items: [
      { label: 'Restoran', href: '/kullanim-alanlari' },
      { label: 'Kuaför', href: '/kullanim-alanlari' },
      { label: 'Güzellik Merkezi', href: '/kullanim-alanlari' },
      { label: 'Klinik', href: '/kullanim-alanlari' },
      { label: 'Spor Merkezi', href: '/kullanim-alanlari' },
    ],
  },
  {
    title: 'Şirket',
    items: [
      { label: 'Hakkımızda', href: '/hakkimizda' },
      { label: 'Blog', href: '/blog' },
      { label: 'Basın', href: '/hakkimizda' },
      { label: 'Kariyer', href: '/hakkimizda' },
    ],
  },
  {
    title: 'Destek',
    items: [
      { label: 'Yardım Merkezi', href: '/iletisim' },
      { label: 'İletişim', href: '/iletisim' },
      { label: 'Demo Talebi', href: '/iletisim' },
      { label: 'WhatsApp Destek', href: '#' },
    ],
  },
  {
    title: 'Hukuki',
    items: [
      { label: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
      { label: 'Gizlilik Politikası', href: '/gizlilik' },
      { label: 'KVKK', href: '/kvkk' },
      { label: 'Çerez Politikası', href: '/cerez-politikasi' },
    ],
  },
]

const communityCards = [
  {
    platform: 'WhatsApp',
    cardClass: 'bg-green-50 border-green-100',
    iconClass: 'bg-green-500',
    labelClass: 'text-green-700',
    btnClass: 'bg-green-500 hover:bg-green-600 text-white',
    icon: '💬',
    desc: 'Anında destek ve güncel duyurular için WhatsApp topluluğumuza katılın.',
    cta: 'Gruba Katıl',
    href: '#',
  },
  {
    platform: 'X',
    cardClass: 'bg-zinc-50 border-zinc-200',
    iconClass: 'bg-zinc-900',
    labelClass: 'text-zinc-900',
    btnClass: 'bg-zinc-900 hover:bg-zinc-700 text-white',
    icon: '✕',
    desc: 'Sektör ipuçları ve güncellikler için bizi X\'te takip edin.',
    cta: 'Takip Et',
    href: '#',
  },
  {
    platform: 'LinkedIn',
    cardClass: 'bg-blue-50 border-blue-100',
    iconClass: 'bg-blue-600',
    labelClass: 'text-blue-700',
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: 'in',
    desc: 'Profesyonel ağımıza katılın ve başarı hikâyelerini keşfedin.',
    cta: 'Bağlan',
    href: '#',
  },
  {
    platform: 'Instagram',
    cardClass: 'bg-pink-50 border-pink-100',
    iconClass: 'bg-gradient-to-br from-purple-500 to-pink-500',
    labelClass: 'text-pink-600',
    btnClass: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white',
    icon: '📸',
    desc: 'Müşteri hikayeleri ve ürün güncellemeleri için Instagram\'ı takip edin.',
    cta: 'Takip Et',
    href: '#',
  },
]

const footerLinks = [
  {
    title: 'Hakkında',
    items: [
      { label: 'Neden CheckRezerve?', href: '/hakkimizda' },
      { label: 'Başarı Hikayeleri', href: '/hakkimizda' },
      { label: 'Blog', href: '/blog' },
      { label: 'İletişim', href: '/iletisim' },
    ],
  },
  {
    title: 'Kullanım Alanları',
    items: [
      { label: 'Restoran', href: '/kullanim-alanlari' },
      { label: 'Kuaför & Berber', href: '/kullanim-alanlari' },
      { label: 'Spa & Güzellik', href: '/kullanim-alanlari' },
    ],
  },
  {
    title: 'Özellikler',
    items: [
      { label: 'Ön Ödeme Sistemi', href: '/ozellikler' },
      { label: 'Online Rezervasyon', href: '/ozellikler' },
      { label: 'SMS Bildirimleri', href: '/ozellikler' },
      { label: 'Müşteri Yönetimi', href: '/ozellikler' },
      { label: 'Sesli Asistan', href: '/ozellikler' },
    ],
  },
  {
    title: 'Hukuki',
    items: [
      { label: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
      { label: 'Gizlilik Politikası', href: '/gizlilik' },
      { label: 'KVKK', href: '/kvkk' },
      { label: 'Çerez Politikası', href: '/cerez-politikasi' },
    ],
  },
]

type FormState = {
  ad: string
  soyad: string
  isEmail: string
  isletme: string
  mesaj: string
  kvkk: boolean
}

export default function IletisimPage() {
  const [form, setForm] = useState<FormState>({
    ad: '',
    soyad: '',
    isEmail: '',
    isletme: '',
    mesaj: '',
    kvkk: false,
  })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 transition-all duration-200'

  const labelClass = 'block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5'

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
            className="hidden sm:inline-flex items-center bg-red-600 hover:bg-red-700 active:scale-[0.97] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
          >
            Demo Talebi
          </Link>
        </div>
      </header>

      {/* ── Hero: Two-column ── */}
      <section className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: Contact Form */}
            <div>
              <span className="inline-block bg-red-50 border border-red-100 text-red-600 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                İletişim
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 leading-tight mb-4">
                Sizinle Tanışmak<br />
                <span className="text-red-600">İstiyoruz</span>
              </h1>
              <p className="text-zinc-600 text-lg leading-relaxed mb-10">
                Demo talebi, fiyat sorusu veya herhangi bir konuda bize yazın. 24 saat içinde dönüş yaparız.
              </p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="font-bold text-green-800 text-lg mb-2">Mesajınız Alındı!</h3>
                  <p className="text-green-700 text-sm">En kısa sürede sizinle iletişime geçeceğiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-8 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
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

                  <div>
                    <label className={labelClass}>Mesajınız</label>
                    <textarea
                      required
                      value={form.mesaj}
                      onChange={e => setForm(f => ({ ...f, mesaj: e.target.value }))}
                      placeholder="Nasıl yardımcı olabiliriz?"
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.kvkk}
                      onChange={e => setForm(f => ({ ...f, kvkk: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded border-zinc-300 accent-red-600"
                    />
                    <span className="text-xs text-zinc-500 leading-relaxed">
                      <Link href="/kvkk" className="text-red-600 hover:underline">KVKK Aydınlatma Metni</Link>
                      {`'ni ve `}
                      <Link href="/gizlilik" className="text-red-600 hover:underline">Gizlilik Politikası</Link>
                      {`'nı okudum, onaylıyorum.`}
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm"
                  >
                    Mesaj Gönder →
                  </button>
                </form>
              )}
            </div>

            {/* Right: Features + Client Pills */}
            <div className="lg:pt-16">
              <div className="space-y-6 mb-10">
                {features.map((feat) => (
                  <div key={feat.title} className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl shrink-0">
                      {feat.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 mb-1">{feat.title}</h3>
                      <p className="text-sm text-zinc-600 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                  Güvenilir İşletmeler
                </p>
                <div className="flex flex-wrap gap-2">
                  {clientPills.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        {name[0]}
                      </span>
                      {name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-zinc-400 mt-4">+500 işletme CheckRezerve ile büyüyor</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Quick Links Grid (5-column) ── */}
      <section className="py-16 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-10">Hızlı Bağlantılar</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {quickLinks.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-zinc-600 hover:text-red-600 transition-colors duration-150"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community Cards (4-column) ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block bg-red-50 border border-red-100 text-red-600 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              Topluluk
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-900">Bizi Takip Edin</h2>
            <p className="text-zinc-600 mt-3">Güncel kalın, topluluğumuza katılın.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityCards.map((c) => (
              <div
                key={c.platform}
                className={`${c.cardClass} border rounded-2xl p-6 flex flex-col transition-shadow duration-200 hover:shadow-md`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${c.iconClass} flex items-center justify-center text-white font-bold mb-4`}
                >
                  {c.icon}
                </div>
                <h3 className={`font-bold text-base mb-2 ${c.labelClass}`}>{c.platform}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-5 flex-1">{c.desc}</p>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${c.btnClass} text-sm font-semibold py-2.5 px-4 rounded-xl text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                >
                  {c.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 px-6 bg-zinc-900 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
            Hemen Başlayın
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Rezervasyon Yönetimini<br />
            <span className="text-red-400">Kolaylaştırın</span>
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Binlerce işletmenin tercih ettiği komisyonsuz rezervasyon sistemini deneyin. Kredi kartı gerekmez.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/kayit"
              className="bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
            >
              Ücretsiz Dene
            </Link>
            <Link
              href="/iletisim"
              className="border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200"
            >
              Demo Talebi Al
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-white/50 text-sm">
            <span>✓ 14 gün ücretsiz</span>
            <span>✓ Kurulum ücretsiz</span>
            <span>✓ İstediğinizde iptal</span>
          </div>
        </div>
      </section>

      {/* ── Footer (4-column) ── */}
      <footer className="bg-zinc-900 text-white border-t border-zinc-800 py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Image
                  src="/logo-icon.png"
                  alt="CheckRezerve"
                  width={32}
                  height={32}
                  className="rounded-xl brightness-0 invert"
                />
                <span className="text-base font-bold">CheckRezerve</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                {footerLinks[0].title}
              </h3>
              <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
                {footerLinks[0].items.map((item) => (
                  <Link key={item.label} href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {footerLinks.slice(1).map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">{col.title}</h3>
                <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
                  {col.items.map((item) => (
                    <Link key={item.label} href={item.href} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-800 text-center">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} CheckRezerve. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
