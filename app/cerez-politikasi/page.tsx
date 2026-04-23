import type { Metadata } from 'next'
import Link from 'next/link'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'Çerez Politikası — checkrezerve',
  description: 'CheckRezerve Teknoloji çerez aydınlatma metni ve çerez politikası.',
}

export default function CerezPolitikasiPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">← Ana Sayfa</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/cerez-politikasi" />

          <article className="flex-1 min-w-0 prose prose-zinc max-w-none">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">Çerez Aydınlatma Metni</h1>
            <p className="text-sm text-zinc-400 mb-8">Son güncelleme: 23 Nisan 2026</p>

            <h2>1. Çerez Nedir?</h2>
            <p>
              Çerezler, ziyaret ettiğiniz web sitelerinin tarayıcınıza kaydettiği küçük metin
              dosyalarıdır. Bu dosyalar, sitenin sizi tanımasına ve tercihlerinizi hatırlamasına
              yardımcı olur. Çerezler, oturum çerezi (tarayıcı kapatıldığında silinen) veya kalıcı
              çerez (belirli bir süre saklanan) olarak ikiye ayrılır.
            </p>

            <h2>2. Kullandığımız Çerez Türleri</h2>

            <h3>Zorunlu Çerezler</h3>
            <p>
              Sitenin temel işlevlerinin çalışması için gereklidir. Bu çerezler devre dışı
              bırakılamaz. Oturum yönetimi, güvenlik doğrulaması ve sayfa yönlendirmeleri bu
              kategori kapsamındadır.
            </p>

            <h3>Performans Çerezleri</h3>
            <p>
              Siteyi nasıl kullandığınızı anlamamızı sağlar. Google Analytics gibi araçlar
              aracılığıyla ziyaret sayısı, sayfa görüntülenme süresi ve hata raporları toplanır.
              Toplanan veriler anonimleştirilir.
            </p>

            <h3>İşlevsel Çerezler</h3>
            <p>
              Tercihlerinizi hatırlar. Dil seçimi, oturum bilgisi ve kişiselleştirme seçenekleri
              bu çerezler sayesinde korunur. Devre dışı bırakılmaları durumunda bazı özellikler
              düzgün çalışmayabilir.
            </p>

            <h3>Pazarlama Çerezleri</h3>
            <p>
              İlgilenebileceğiniz içerikleri ve reklamları göstermek için kullanılır. Üçüncü taraf
              reklam ağlarıyla paylaşılabilir. Bu çerezlere onay vermek zorunlu değildir.
            </p>

            <h2>3. Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
            <p>
              Tarayıcınızın ayarlar menüsünden çerezleri yönetebilir, silebilir veya devre dışı
              bırakabilirsiniz. Yaygın tarayıcılar için yönlendirme:
            </p>
            <ul>
              <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
              <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerez Yönetimi</li>
              <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
            </ul>
            <p>
              Zorunlu çerezleri devre dışı bırakmak sitenin düzgün çalışmamasına yol açabilir.
            </p>

            <h2>4. İletişim</h2>
            <p>
              Çerez politikamız hakkında sorularınız için{' '}
              <a href="mailto:info@checkrezerve.com" className="text-red-600">
                info@checkrezerve.com
              </a>{' '}
              adresine yazabilirsiniz.
            </p>

            <div className="not-prose mt-10 p-5 bg-zinc-50 rounded-xl border border-zinc-200 text-sm text-zinc-600 space-y-1">
              <p><strong>Veri Sorumlusu:</strong> CheckRezerve Teknoloji</p>
              <p>
                <strong>E-posta:</strong>{' '}
                <a href="mailto:info@checkrezerve.com" className="text-red-600">
                  info@checkrezerve.com
                </a>
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
