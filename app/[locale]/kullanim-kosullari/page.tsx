import type { Metadata } from 'next'
import Link from 'next/link'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları — checkrezerve',
  description: 'CheckRezerve Teknoloji kullanım koşulları ve gizlilik politikası.',
}

export default function KullanimKosullariPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">← Ana Sayfa</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/kullanim-kosullari" />

          <article className="flex-1 min-w-0 prose prose-zinc max-w-none">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">
              Kullanım Koşulları &amp; Gizlilik Politikası
            </h1>
            <p className="text-sm text-zinc-400 mb-8">Son güncelleme: 23 Nisan 2026</p>

            <h2>1. Genel</h2>
            <p>
              <strong>CheckRezerve Teknoloji</strong> tarafından sunulan{' '}
              <strong>checkrezerve.com</strong> platformunu kullanarak bu koşulları kabul etmiş
              sayılırsınız. Bu koşulları kabul etmiyorsanız platformu kullanmayı lütfen
              sonlandırınız.
            </p>

            <h2>2. Hizmet Tanımı</h2>
            <p>
              CheckRezerve, işletmelere yönelik online rezervasyon ve yönetim platformudur.
              Hizmetlerimiz; rezervasyon yönetimi, çalışan takibi, e-posta bildirimleri ve
              istatistik raporlarını kapsar. Hizmet kapsamı önceden bildirilerek genişletilebilir
              veya daraltılabilir.
            </p>

            <h2>3. Kullanıcı Yükümlülükleri</h2>
            <ul>
              <li>Platformu yalnızca yasal amaçlarla kullanmalısınız.</li>
              <li>Sistemi kötüye kullanmak, zarar vermek veya yetkisiz erişim sağlamak yasaktır.</li>
              <li>Sahte bilgi girmek veya başkası adına işlem yapmak yasaktır.</li>
              <li>
                Müşteri verilerini 6698 sayılı KVKK kapsamında işlemek işletme kullanıcısının
                sorumluluğundadır.
              </li>
            </ul>

            <h2>4. Ücretlendirme</h2>
            <p>
              Fiyatlar, platformun <strong>/fiyatlar</strong> sayfasında belirtilmektedir.
              Fiyatlar KDV hariçtir. CheckRezerve, fiyatları önceden bildirerek değiştirme
              hakkını saklı tutar.
            </p>

            <h2>5. Sorumluluk Sınırlaması</h2>
            <p>
              CheckRezerve, üçüncü taraf hizmetlerinden (Supabase, Twilio, e-posta altyapı sağlayıcısı (Resend) vb.)
              kaynaklanan kesintiler veya veri kayıpları nedeniyle sorumluluk kabul etmez.
              Platform &ldquo;olduğu gibi&rdquo; sunulmaktadır; belirli bir amaca uygunluk
              garantisi verilmemektedir.
            </p>

            <h2>6. Fikri Mülkiyet</h2>
            <p>
              Platform üzerindeki tüm içerik, logo, yazılım ve tasarım{' '}
              <strong>CheckRezerve Teknoloji</strong>&apos;ye aittir. İzinsiz kopyalanması,
              dağıtılması veya değiştirilmesi yasaktır.
            </p>

            <h2>7. Değişiklikler</h2>
            <p>
              Bu koşullar önceden bildirilerek güncellenebilir. Güncellemeler sayfada yayımlandığı
              andan itibaren geçerlidir. Platformu kullanmaya devam etmeniz güncel koşulları
              kabul ettiğiniz anlamına gelir.
            </p>

            <h2>8. İletişim</h2>
            <p>
              Kullanım koşullarına ilişkin sorularınız için{' '}
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
