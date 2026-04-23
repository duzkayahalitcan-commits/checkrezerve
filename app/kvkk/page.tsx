import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'KVKK — Kişisel Verilerin Korunması Politikası',
  description: 'CheckRezerve Teknoloji kişisel verilerin korunması ve işlenmesi politikası.',
}

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-800 px-4 py-12">
      <article className="max-w-2xl mx-auto prose prose-zinc">
        <div className="not-prose mb-8">
          <Link href="/" className="text-sm text-emerald-700 hover:underline">← Ana Sayfa</Link>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 mb-1">
          Kişisel Verilerin Korunması ve İşlenmesi Politikası
        </h1>
        <p className="text-sm text-zinc-400 mb-8">Son güncelleme: 23 Nisan 2026</p>

        <p>
          <strong>CheckRezerve Teknoloji</strong> (&ldquo;CheckRezerve&rdquo;) olarak, siz
          kullanıcılarımıza ve iş ortaklarımıza ait kişisel verileri hassasiyetle korumakta,
          veri sorumlusu sıfatıyla 6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;)
          uyarınca tüm yükümlülüklerimizi yerine getirmekteyiz.
        </p>

        <h2>1. Kişisel Verileriniz ve Edinme Yöntemlerimiz</h2>
        <p>
          Kişisel veri; belirli ya da belirlenebilir nitelikteki bir kişiye ilişkin her türlü bilgidir.
          Adınız, soyadınız, telefon numaranız, e-posta adresiniz ve işletmenize dair bilgiler KVKK
          kapsamında işlenmektedir. Bu veriler platformumuzu kullandığınızda, başvuru formunu
          doldurduğunuzda veya bizimle iletişime geçtiğinizde elde edilmektedir.
        </p>

        <h2>2. Kişisel Verilerinizin İşlenme Amacı</h2>
        <p>CheckRezerve olarak kişisel verilerinizi şu amaçlarla işleriz:</p>
        <ul>
          <li>Platformumuzdan aldığınız hizmet dolayısıyla yükümlülüklerimizi yerine getirmek</li>
          <li>Rezervasyon ve işletme süreçlerini takip etmek ve düzenlemek</li>
          <li>Faaliyet konusu kapsamında hizmet sunmak ve kaliteyi artırmak</li>
          <li>Satış, pazarlama ve tanıtım faaliyetleri yürütmek</li>
          <li>Kampanya ve yeniliklerden haberdar etmek (açık rıza ile)</li>
          <li>Yasal yükümlülükleri yerine getirmek</li>
        </ul>
        <p>
          Verileriniz; işleme amacı ortadan kalktığında veya mevzuat uyarınca işlememiz zorunlu
          kılındığımız süre dolduğunda tarafımızca silinecek, yok edilecek veya anonimleştirilerek
          kullanılmaya devam edilecektir.
        </p>

        <h2>3. Veri Sahibi Olarak Haklarınız</h2>
        <p>
          KVKK&apos;nın 11. maddesinde belirlendiği üzere, veri sahibi olarak şu haklarınız
          bulunmaktadır:
        </p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>KVKK 7. madde kapsamında silinmesini veya yok edilmesini isteme</li>
          <li>
            Otomatik sistemlerle analiz edilmesi sonucu aleyhinize çıkan kararlara itiraz etme
          </li>
          <li>
            Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde giderilmesini talep etme
          </li>
        </ul>

        <h2>4. Başvuru</h2>
        <p>
          Haklarınıza ilişkin taleplerinizi{' '}
          <a href="mailto:info@checkrezerve.com" className="text-emerald-700">
            info@checkrezerve.com
          </a>{' '}
          adresine e-posta göndererek veya{' '}
          <Link href="/kvkk-basvuru" className="text-emerald-700">
            KVKK Başvuru Formu
          </Link>{' '}
          sayfamızı kullanarak iletebilirsiniz. Talebiniz 30 gün içinde yanıtlanacaktır.
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
