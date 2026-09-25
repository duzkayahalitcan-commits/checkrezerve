import type { Metadata } from 'next'
import LegalDraftPage from '@/components/LegalDraftPage'

// LG-06 — TASLAK: hukukçu onayından önce yayına alınmamalı.
export const metadata: Metadata = {
  title: 'Abonelik İptal ve İade Politikası (Taslak)',
  robots: { index: false, follow: false },
}

export default function IptalIadePage() {
  return (
    <LegalDraftPage
      baslik="Abonelik İptal ve İade Politikası"
      guncelleme="23 Eylül 2026 (taslak)"
      bolumler={[
        { baslik: '1. Kapsam', paragraflar: [
          'Bu politika, işletmelerin CheckRezerve ücretli abonelik planlarının iptali ve ücret iadesine ilişkin koşulları açıklar. Müşterilerin işletmelerde yaptığı rezervasyonların iptali ilgili işletmenin kendi politikasına tabidir.',
        ] },
        { baslik: '2. Deneme Süresi', paragraflar: [
          '[DENEME SÜRESİ] günlük deneme süresi içinde yapılan iptallerde herhangi bir ücret alınmaz.',
        ] },
        { baslik: '3. İptal', paragraflar: [
          'Abonelik, işletme panelindeki “Abonelik” sayfasından veya [E-POSTA] adresine yazılı bildirimle dilediğiniz zaman iptal edilebilir.',
          'İptal, ödemesi yapılmış mevcut dönemin sonunda yürürlüğe girer; dönem sonuna kadar hizmete erişim devam eder ve sonraki dönem için ücret tahsil edilmez.',
        ] },
        { baslik: '4. İade', paragraflar: [
          'Kullanılmış dönemler için kısmi (kıst) iade yapılmaz. [HUKUKÇU NOTU: yıllık planlarda kıst iade uygulanıp uygulanmayacağına karar verilmeli.]',
          'Hatalı veya mükerrer tahsilatlar tespit edildiğinde [14] iş günü içinde ödeme yapılan karta iade edilir.',
          'Hizmetin CheckRezerve kaynaklı nedenlerle [X] günden uzun süre kesintiye uğraması hâlinde, kesinti süresine karşılık gelen bedel bir sonraki döneme mahsup edilir veya iade edilir.',
        ] },
        { baslik: '5. Ödeme Başarısızlığı', paragraflar: [
          'Yenileme ödemesi alınamazsa işletmeye e-posta ile bildirilir ve [7] günlük ek süre tanınır. Bu süre sonunda ödeme alınamazsa hesap salt okunur moda alınır; veriler [30] gün boyunca saklanır.',
        ] },
        { baslik: '6. Veriler', paragraflar: [
          'İptal sonrasında işletme verileri [SAKLAMA SÜRESİ] boyunca saklanır ve talep hâlinde dışa aktarılabilir; süre sonunda KVKK’ya uygun şekilde silinir veya anonimleştirilir.',
        ] },
        { baslik: '7. İletişim', paragraflar: ['[ŞİRKET UNVANI] – [E-POSTA] – [TELEFON]'] },
      ]}
    />
  )
}
