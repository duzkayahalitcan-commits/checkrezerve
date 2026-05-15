'use client'
import { useState } from 'react'

const FAQS = [
  {
    q: 'CheckRezerve hangi işletmeler için uygundur?',
    a: 'Restoran, kafe, kuaför, berber, spa, güzellik salonu, fitness merkezi, otel ve etkinlik mekanı gibi randevu veya rezervasyona dayalı çalışan her işletme CheckRezerve\'i kullanabilir. Esnek yapısı sayesinde sektörden bağımsız olarak kolayca yapılandırılabilir.',
  },
  {
    q: 'Ön ödeme sistemi nasıl işliyor?',
    a: 'Müşteriniz rezervasyon yaparken belirlediğiniz tutarı kredi kartıyla öder. Bu tutar rezervasyon tarihine kadar güvencede tutulur. Müşteri geldiğinde ödeme serbest bırakılır ya da iade edilir; gelmediğinde ise işletmenizde kalır. Tüm işlemler 3D Secure altyapısıyla güvence altındadır.',
  },
  {
    q: 'Rezervasyon başına komisyon ödüyor muyum?',
    a: 'Hayır. CheckRezerve sabit abonelik modeli ile çalışır. Kaç rezervasyon alırsanız alın, ek bir komisyon ya da kesinti söz konusu değildir. Aylık veya yıllık planınızın ücreti dışında hiçbir ek ücret ödemezsiniz.',
  },
  {
    q: 'Kurulum ne kadar sürer?',
    a: 'Kaydınızı tamamladıktan sonra işletme bilgilerinizi, hizmetlerinizi ve çalışma saatlerinizi girerek aynı gün aktif olabilirsiniz. Teknik bilgi gerektirmez; destek ekibimiz de her adımda yanınızdadır.',
  },
  {
    q: 'Müşterilerim nasıl rezervasyon yapıyor?',
    a: 'Size özel bir rezervasyon sayfası oluşturulur. Bu bağlantıyı web sitenize, Instagram profilinize ya da WhatsApp\'ınıza ekleyebilirsiniz. Müşterileriniz 7/24 bu sayfa üzerinden rezervasyon talep edebilir.',
  },
  {
    q: 'Rezervasyon iptali veya değişikliği nasıl yönetilir?',
    a: 'Panel üzerinden istediğiniz rezervasyonu düzenleyebilir, iptal edebilir ya da yeni bir zamana taşıyabilirsiniz. Değişiklik yapıldığında müşterinize otomatik bildirim gönderilir.',
  },
  {
    q: 'Birden fazla çalışanım var, hepsini sisteme ekleyebilir miyim?',
    a: 'Evet. Profesyonel ve Kurumsal planlarda çalışan bazlı takvim tanımlayabilirsiniz. Her personelin kendi müsaitlik durumu ayrı ayrı yönetilebilir.',
  },
  {
    q: 'Verilerim güvende mi?',
    a: 'Tüm verileriniz şifreli bağlantılar üzerinden iletilir ve güvenli sunucularda saklanır. KVKK kapsamında kişisel verilerin korunmasına azami özen gösterilir. Verileriniz hiçbir koşulda üçüncü taraflarla paylaşılmaz.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className={`rounded-2xl border transition-colors ${
              isOpen ? 'border-red-200 bg-red-50' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
            >
              <span className={`text-sm font-semibold leading-snug ${isOpen ? 'text-red-700' : 'text-zinc-800'}`}>
                {faq.q}
              </span>
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isOpen ? 'bg-red-600 text-white' : 'bg-zinc-200 text-zinc-500'
              }`}>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5">
                <p className="text-sm text-zinc-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
