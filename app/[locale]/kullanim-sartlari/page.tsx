import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Kullanım Şartları — checkrezerve',
  description: 'checkrezerve uygulamasının kullanım koşulları ve hizmet sözleşmesi.',
}

export default function KullanimSartlariPage() {
  const guncelleme = '10 Nisan 2026'
  return (
    <main className="min-h-screen bg-white text-stone-800 px-4 py-12">
      <article className="max-w-2xl mx-auto prose prose-stone">
        <h1>Kullanım Şartları</h1>
        <p className="text-sm text-stone-500">Son güncelleme: {guncelleme}</p>

        <h2>1. Taraflar ve Kapsam</h2>
        <p>
          Bu Kullanım Şartları (&ldquo;Şartlar&rdquo;), <strong>checkrezerve</strong> uygulamasını
          kullanan restoran işletmecileri (&ldquo;İşletmeci&rdquo;) ve rezervasyon yapan
          müşteriler (&ldquo;Son Kullanıcı&rdquo;) ile uygulama sahibi arasındaki ilişkiyi düzenler.
          Uygulamayı kullanmaya başladığınızda bu Şartları kabul etmiş sayılırsınız.
        </p>

        <h2>2. Hizmetin Tanımı</h2>
        <p>
          checkrezerve; restoranlara özel rezervasyon alma, yönetim ve bildirim hizmetleri sunan
          bir web uygulamasıdır. Yapay zeka destekli mesaj analizi, SMS/WhatsApp bildirimleri ve
          admin/restoran paneli bu hizmet kapsamındadır.
        </p>

        <h2>3. Hesap Güvenliği</h2>
        <ul>
          <li>Restoran ve admin hesap şifreleri gizli tutulmalıdır.</li>
          <li>Hesabınıza yetkisiz erişim fark ettiğinizde derhal bildiriniz.</li>
          <li>Hesap bilgilerini üçüncü kişilerle paylaşmak yasaktır.</li>
        </ul>

        <h2>4. Kabul Edilebilir Kullanım</h2>
        <p>Aşağıdaki kullanımlar kesinlikle yasaktır:</p>
        <ul>
          <li>Sahte rezervasyon oluşturulması.</li>
          <li>Sisteme yetkisiz erişim veya zarar verme girişimi.</li>
          <li>Spam amaçlı bildirim gönderilmesi.</li>
          <li>Müşteri verilerinin izinsiz üçüncü taraflarla paylaşılması.</li>
          <li>Türk Ceza Kanunu ve ilgili mevzuata aykırı faaliyetler.</li>
        </ul>

        <h2>5. Veri Sorumluluğu</h2>
        <p>
          İşletmeci, topladığı müşteri verilerini (ad, telefon, rezervasyon bilgileri)
          6698 sayılı KVKK kapsamında işlemekle yükümlüdür.
          checkrezerve, işletmeci adına teknik altyapı sağlar; verilerin hukuka uygun
          kullanımından işletmeci sorumludur.
        </p>

        <h2>6. Müşteri Bildirimleri</h2>
        <p>
          Sistem; rezervasyon onayı ve hatırlatma mesajları için müşteri telefon numarasına
          SMS veya WhatsApp mesajı gönderebilir. Müşteriler, rezervasyon formu aracılığıyla
          bu iletişime örtük onay vermiş sayılır. Rıza kaydı işletmecinin sorumluluğundadır.
        </p>

        <h2>7. Yapay Zeka (AI) Kullanımı</h2>
        <p>
          AI özelliği, mesajı analiz ederek rezervasyon bilgilerini çıkarmak amacıyla
          Anthropic API&apos;sine iletir. Mesajlar Anthropic tarafından saklanmaz (sıfır veri tutma
          politikası). AI analiz sonuçları tavsiye niteliğinde olup kullanıcı doğrulaması önerilir.
        </p>

        <h2>8. Hizmet Sürekliliği ve Sorumluluk Sınırı</h2>
        <p>
          checkrezerve, hizmetin kesintisiz süreceğini garanti etmez. Planlı bakımlar önceden
          duyurulur. Sistem hatalarından kaynaklanan dolaylı zararlar (kayıp rezervasyon, müşteri
          kaybı vb.) için azami sorumluluk, hizmetin kullanıldığı aylık ücretle sınırlıdır.
        </p>

        <h2>9. Fikri Mülkiyet</h2>
        <p>
          Uygulama yazılımı, arayüzü ve markalama öğeleri checkrezerve&apos;e aittir.
          İzinsiz kopyalama, dağıtma veya türev eser oluşturma yasaktır.
        </p>

        <h2>10. Fesih</h2>
        <p>
          Şartlara aykırılık halinde hesap askıya alınabilir veya silinebilir.
          İşletmeci, 30 gün önceden yazılı bildirimde bulunarak hesabını kapatabilir.
          Kapanış sonrasında veriler 30 gün içinde silinir, yasal yükümlülükler saklıdır.
        </p>

        <h2>11. Değişiklikler</h2>
        <p>
          Şartlarda yapılan önemli değişiklikler 15 gün önceden e-posta veya uygulama
          bildirimi ile duyurulur. Değişiklik sonrası kullanıma devam edilmesi kabul anlamına gelir.
        </p>

        <h2>12. Uygulanacak Hukuk ve Yetki</h2>
        <p>
          Bu Şartlar Türk Hukuku&apos;na tabidir. Uyuşmazlıklarda <strong>İstanbul</strong> Mahkemeleri
          ve İcra Daireleri yetkilidir.
        </p>

        <h2>13. İletişim</h2>
        <p>
          <a href="mailto:info@checkrezerve.com">info@checkrezerve.com</a>
        </p>
      </article>
    </main>
  )
}
