import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Başvuru Formu KVKK Aydınlatma Metni — checkrezerve',
  description:
    'CheckRezerve Teknoloji işletme başvuru formu kapsamında kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni.',
}

export default function BasvuruFormuAydinlatmaPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-800 px-4 py-12">
      <article className="max-w-2xl mx-auto prose prose-zinc">
        <div className="not-prose mb-8">
          <Link href="/" className="text-sm text-emerald-700 hover:underline">← Ana Sayfa</Link>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 mb-1">
          Başvuru Formu KVKK Aydınlatma Metni
        </h1>
        <p className="text-sm text-zinc-400 mb-8">Son güncelleme: 23 Nisan 2026</p>

        <p>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun (&ldquo;KVKK&rdquo;)
          10. maddesi uyarınca hazırlanmış olup checkrezerve.com üzerindeki işletme başvuru
          formunu dolduran kişileri bilgilendirmeye yönelik aydınlatma metnidir.
        </p>

        <h2>a) Veri Sorumlusu</h2>
        <p>
          Veri sorumlusu <strong>CheckRezerve Teknoloji</strong>&apos;dir.
          İletişim:{' '}
          <a href="mailto:info@checkrezerve.com" className="text-emerald-700">
            info@checkrezerve.com
          </a>
        </p>

        <h2>b) Hangi Amaçla İşleneceği</h2>
        <p>
          Başvuru formunuz aracılığıyla paylaştığınız kişisel veriler aşağıdaki amaçlarla
          işlenmektedir:
        </p>
        <ul>
          <li>İşletmenizin CheckRezerve platformuna uygunluğunun değerlendirilmesi</li>
          <li>Başvurunuza ilişkin geri dönüş ve bilgilendirme yapılması</li>
          <li>Hizmet teklifinin hazırlanması ve sunulması</li>
          <li>Müşteri ilişkileri yönetimi süreçlerinin yürütülmesi</li>
        </ul>

        <h2>c) Toplama Yöntemleri ve Hukuki Sebepleri</h2>
        <p>
          Kişisel verileriniz, checkrezerve.com üzerindeki çevrimiçi başvuru formu aracılığıyla
          elektronik ortamda toplanmaktadır. İşlemenin hukuki dayanakları şunlardır:
        </p>
        <ul>
          <li>
            <strong>Sözleşmenin kurulması veya ifası:</strong> Başvurunuzu değerlendirerek
            hizmet sunmak için gereklidir (KVKK m.5/2-c).
          </li>
          <li>
            <strong>Meşru menfaat:</strong> İşletme ilişkisini sürdürmek ve hizmet kalitesini
            artırmak amacıyla (KVKK m.5/2-f).
          </li>
          <li>
            <strong>Açık rıza:</strong> Ticari elektronik ileti gönderimi gibi ek faaliyetler
            için (KVKK m.5/1).
          </li>
        </ul>

        <h2>d) Veri Kategorileri</h2>
        <ul>
          <li>
            <strong>Kimlik:</strong> Ad, soyad
          </li>
          <li>
            <strong>İletişim:</strong> E-posta adresi, telefon numarası
          </li>
          <li>
            <strong>Diğer:</strong> İşletme adı, faaliyet sektörü, şehir
          </li>
        </ul>

        <h2>e) Kimlere Aktarılabileceği</h2>
        <p>
          Başvuru formu aracılığıyla toplanan kişisel veriler üçüncü taraflara ticari amaçla
          aktarılmaz. Veriler yalnızca teknik altyapı hizmetleri kapsamında Supabase Inc.
          bünyesindeki veritabanı sunucularında barındırılmakta olup bu aktarım KVKK
          kapsamındaki güvenceler çerçevesinde gerçekleştirilmektedir.
        </p>

        <h2>f) KVKK Madde 11 Kapsamındaki Haklarınız</h2>
        <p>
          KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
        </p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>Kanun kapsamında silinmesini veya yok edilmesini isteme</li>
          <li>Düzeltme veya silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme</li>
          <li>İşlenen verilerin otomatik sistemler aracılığıyla aleyhinize sonuç doğurmasına itiraz etme</li>
          <li>Kanuna aykırı işleme nedeniyle uğradığınız zararın giderilmesini talep etme</li>
        </ul>
        <p>
          Bu haklarınızı kullanmak için{' '}
          <a href="mailto:info@checkrezerve.com" className="text-emerald-700">
            info@checkrezerve.com
          </a>{' '}
          adresine yazabilir veya{' '}
          <Link href="/kvkk-basvuru" className="text-emerald-700">
            KVKK Başvuru Formu
          </Link>{' '}
          sayfamızı kullanabilirsiniz.
        </p>

        <div className="not-prose mt-10 p-5 bg-zinc-50 rounded-xl border border-zinc-200 text-sm text-zinc-600 space-y-1">
          <p><strong>Veri Sorumlusu:</strong> CheckRezerve Teknoloji</p>
          <p>
            <strong>E-posta:</strong>{' '}
            <a href="mailto:info@checkrezerve.com" className="text-emerald-700">
              info@checkrezerve.com
            </a>
          </p>
        </div>
      </article>
    </main>
  )
}
