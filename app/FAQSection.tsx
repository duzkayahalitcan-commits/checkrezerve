'use client'
import { useState } from 'react'

const FAQS = [
  {
    q: 'CheckRezerve Nedir?',
    a: 'CheckRezerve, firmaların diledikleri şekilde ödemeli, ön ödemeli veya ödemesiz rezervasyon alabilmelerini sağlayan yeni nesil bir rezervasyon altyapısıdır.',
  },
  {
    q: 'Rezervasyon veya no-show başına komisyon alıyor musunuz?',
    a: 'Hayır. Yalnızca seçtiğiniz planın sabit aylık veya yıllık abonelik ücreti ödersiniz; rezervasyon adedi, masa sayısı veya no-show oranına göre ek kesinti veya komisyon uygulanmaz.',
  },
  {
    q: 'Kara Liste Yönetimi Nedir?',
    a: 'Daha önce iptal yapan veya gelmeyen müşterileri kolayca engelleyebilirsiniz. Kara liste özelliği sayesinde no-show oranlarını düşürebilirsiniz.',
  },
  {
    q: 'Rezervasyon Ön Onay Süreci Nedir?',
    a: 'Müşteriler rezervasyon talebi oluşturur, siz de bu talepleri onaylayabilir veya reddedebilirsiniz. Kısacası, kontrol tamamen sizdedir.',
  },
  {
    q: 'Ön Provizyon Nasıl Çalışıyor?',
    a: 'Ön provizyon sayesinde müşterileriniz işletmenize geldiğinde aldığınız ön ödemeyi kolayca kaldırabilirsiniz. Müşteri gelmediği takdirde ön ödemeyi satış işlemine dönüştürerek kaybı telafi edebilirsiniz.',
  },
  {
    q: 'Müşteri Rezervasyona Gelmediğinde Ne Oluyor?',
    a: 'İptal politikanıza göre müşteriye iade yapılabilir ya da aldığınız ön ödeme işletmenizde kalır. Bu seçim tamamen size bırakılmıştır.',
  },
  {
    q: 'Manuel Olarak Rezervasyon Oluşturabilir Miyim?',
    a: 'Evet, panel üzerinden manuel rezervasyon oluşturabilirsiniz. Telefon ile gelen rezervasyonları sisteme kolayca ekleyebilirsiniz.',
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
