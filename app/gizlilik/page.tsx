import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Gizlilik Politikası — checkrezerve',
  description: 'checkrezerve uygulamasının kişisel verilerin korunmasına ilişkin gizlilik politikası.',
}

export default function GizlilikPage() {
  const guncelleme = '10 Nisan 2026'
  return (
    <main className="min-h-screen bg-white text-stone-800 px-4 py-12">
      <article className="max-w-2xl mx-auto prose prose-stone">
        <h1>Gizlilik Politikası</h1>
        <p className="text-sm text-stone-500">Son güncelleme: {guncelleme}</p>

        <h2>1. Veri Sorumlusu</h2>
        <p>
          Bu gizlilik politikası, <strong>checkrezerve</strong> uygulaması (bundan sonra
          &ldquo;Uygulama&rdquo;) tarafından işlenen kişisel verilere ilişkindir.
          Uygulama, restoranların online rezervasyon almalarını sağlamak amacıyla geliştirilmiştir.
        </p>

        <h2>2. Toplanan Veriler</h2>
        <p>Uygulama aşağıdaki kişisel verileri işlemektedir:</p>
        <ul>
          <li><strong>Ad ve Soyad:</strong> Rezervasyon sahibini tanımlamak için.</li>
          <li><strong>Telefon Numarası:</strong> Onay ve hatırlatma bildirimleri göndermek için.</li>
          <li><strong>Rezervasyon Bilgileri:</strong> Tarih, saat, kişi sayısı, özel istekler.</li>
          <li><strong>Mesaj İçerikleri:</strong> Yalnızca AI özelliği kullanıldığında WhatsApp/SMS mesajları analiz edilir.</li>
        </ul>

        <h2>3. Verilerin Kullanım Amacı</h2>
        <ul>
          <li>Rezervasyon oluşturulması ve yönetilmesi.</li>
          <li>Onay ve hatırlatma bildirimleri (SMS / WhatsApp).</li>
          <li>Restoran doluluk ve raporlama analizleri (kişisel veri içermez).</li>
        </ul>

        <h2>4. Verilerin Paylaşımı</h2>
        <p>
          Kişisel verileriniz üçüncü taraflarla ticari amaçla paylaşılmamaktadır.
          Yalnızca aşağıdaki alt işlemcilerle hizmet sunumu amacıyla paylaşılabilir:
        </p>
        <ul>
          <li><strong>Supabase Inc.</strong> — Veritabanı altyapısı (ABD, veri işleme anlaşması mevcuttur).</li>
          <li><strong>Twilio Inc.</strong> — SMS ve WhatsApp bildirimleri (ABD, SCCs kapsamında işlenir).</li>
          <li><strong>Anthropic PBC</strong> — Yapay zeka mesaj analizi (ABD; mesaj içerikleri 0 gün saklanır).</li>
        </ul>

        <h2>5. Veri Saklama Süresi</h2>
        <p>
          Rezervasyon verileri, ilgili restoranın talebi veya yasal yükümlülükler gerektirmedikçe
          <strong> 2 yıl</strong> süreyle saklanır. SMS/WhatsApp bildirim logları <strong>90 gün</strong>
          sonra silinir.
        </p>

        <h2>6. Veri Güvenliği</h2>
        <p>
          Tüm veriler TLS/SSL şifreli bağlantı üzerinden iletilir. Veritabanı erişimi,
          hizmet rolü anahtarları aracılığıyla kısıtlanmıştır. Admin ve restoran panelleri
          kimlik doğrulama gerektirmektedir.
        </p>

        <h2>7. İlgili Kişi Hakları (KVKK Madde 11)</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:
        </p>
        <ul>
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

        <h2>8. Çerezler (Cookies)</h2>
        <p>
          Uygulama yalnızca oturum yönetimi için <code>httpOnly</code> güvenli çerezler kullanır.
          Herhangi bir analitik veya reklam çerezi kullanılmamaktadır.
        </p>

        <h2>9. Değişiklikler</h2>
        <p>
          Bu politika önemli değişikliklerde güncellenecek ve uygulama üzerinden duyurulacaktır.
          Güncel tarih her zaman sayfanın üst kısmında belirtilir.
        </p>

        <h2>10. İletişim</h2>
        <p>
          Sorularınız için:{' '}
          <a href="mailto:info@checkrezerve.com">info@checkrezerve.com</a>
        </p>
      </article>
    </main>
  )
}
