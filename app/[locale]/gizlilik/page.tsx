import type { Metadata } from 'next'
import Link from 'next/link'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'CheckRezerve Gizlilik Politikası',
  description: 'CheckRezerve uygulamasının kişisel verilerin korunmasına ilişkin gizlilik politikası.',
}

export default function GizlilikPage() {
  const guncelleme = '10 Nisan 2026'
  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">← Ana Sayfa</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/gizlilik" />

          <article className="flex-1 min-w-0 prose prose-zinc max-w-none">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">CheckRezerve Gizlilik Politikası</h1>
            <p className="text-sm text-zinc-400 mb-8">Son güncelleme: {guncelleme}</p>

            <h2 className="font-bold">1. Veri Sorumlusu</h2>
            <p>
              Bu gizlilik politikası, <strong>CheckRezerve</strong> uygulaması (bundan sonra &ldquo;Uygulama&rdquo;) tarafından işlenen kişisel verilere ilişkindir. Uygulama, restoranların online rezervasyon almalarını sağlamak amacıyla geliştirilmiştir.
            </p>

            <h2 className="font-bold">2. Toplanan Veriler</h2>
            <p>Uygulama aşağıdaki kişisel verileri işlemektedir:</p>
            <ul className="list-disc pl-5">
              <li><strong>Ad ve Soyad:</strong> Rezervasyon sahibini tanımlamak için.</li>
              <li><strong>Telefon Numarası:</strong> Onay ve hatırlatma bildirimleri göndermek için.</li>
              <li><strong>Rezervasyon Bilgileri:</strong> Tarih, saat, kişi sayısı, özel istekler.</li>
              <li><strong>Mesaj İçerikleri:</strong> Yalnızca AI özelliği kullanıldığında WhatsApp/SMS mesajları analiz edilir.</li>
            </ul>

            <h2 className="font-bold">3. Verilerin Kullanım Amacı</h2>
            <ul className="list-disc pl-5">
              <li>Rezervasyon oluşturulması ve yönetilmesi.</li>
              <li>Onay ve hatırlatma bildirimleri (SMS / WhatsApp).</li>
              <li>Restoran doluluk ve raporlama analizleri (kişisel veri içermez).</li>
            </ul>

            <h2 className="font-bold">4. Verilerin Paylaşımı</h2>
            <p>
              Kişisel verileriniz üçüncü taraflarla ticari amaçla paylaşılmamaktadır.
              Yalnızca aşağıdaki alt işlemcilerle hizmet sunumu amacıyla paylaşılabilir:
            </p>
            <ul className="list-disc pl-5">
              <li><strong>Supabase Inc.</strong> — Veritabanı altyapısı (ABD, veri işleme anlaşması mevcuttur).</li>
              <li><strong>Twilio Inc.</strong> — SMS ve WhatsApp bildirimleri (ABD, SCCs kapsamında işlenir).</li>
              <li><strong>Anthropic PBC</strong> — Yapay zeka mesaj analizi (ABD; mesaj içerikleri 0 gün saklanır).</li>
            </ul>

            <h2 className="font-bold">5. Veri Saklama Süresi</h2>
            <p>
              Rezervasyon verileri, ilgili restoranın talebi veya yasal yükümlülükler gerektirmedikçe <strong>2 yıl</strong> süreyle saklanır. SMS/WhatsApp bildirim logları <strong>90 gün</strong> sonra silinir.
            </p>

            <h2 className="font-bold">6. Veri Güvenliği</h2>
            <p>
              Tüm veriler TLS/SSL şifreli bağlantı üzerinden iletilir. Veritabanı erişimi,
              hizmet rolü anahtarları aracılığıyla kısıtlanmıştır. Admin ve restoran panelleri
              kimlik doğrulama gerektirmektedir.
            </p>

            <h2 className="font-bold">7. İlgili Kişi Hakları (KVKK Madde 11)</h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-5">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme.</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme.</li>
              <li>Yanlış veya eksik bilgilerin düzeltilmesini isteme.</li>
              <li>Kişisel verilerinizin silinmesini talep etme.</li>
              <li>İşlemenin kısıtlanmasını isteme.</li>
              <li>Veri taşınabilirliği hakkı.</li>
            </ul>
            <p>
              Haklarınızı kullanmak için{' '}
              <a href="mailto:kvkk@checkrezerve.com">kvkk@checkrezerve.com</a>{' '}
              adresine yazabilirsiniz. Talepler <strong>30 gün</strong> içinde yanıtlanır.
            </p>

            <h2 className="font-bold">8. Çerezler (Cookies)</h2>
            <p>
              Uygulama yalnızca oturum yönetimi için <code>httpOnly</code> güvenli çerezler kullanır.
              Herhangi bir analitik veya reklam çerezi kullanılmamaktadır.
            </p>

            <h2 className="font-bold">9. Değişiklikler</h2>
            <p>
              Bu politika önemli değişikliklerde güncellenecek ve uygulama üzerinden duyurulacaktır.
              Güncel tarih her zaman sayfanın üst kısmında belirtilir.
            </p>

            <h2 className="font-bold">10. İletişim</h2>
            <p>
              Sorularınız için:{' '}
              <a href="mailto:info@checkrezerve.com" className="text-red-600">info@checkrezerve.com</a>
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
