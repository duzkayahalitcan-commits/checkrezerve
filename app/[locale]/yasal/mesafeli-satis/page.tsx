import type { Metadata } from 'next'
import LegalDraftPage from '@/components/LegalDraftPage'

// LG-05 — TASLAK: hukukçu onayından önce yayına alınmamalı ve ödeme akışına bağlanmamalı.
export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme (Taslak) | CheckRezerve',
  robots: { index: false, follow: false },
}

export default function MesafeliSatisPage() {
  return (
    <LegalDraftPage
      baslik="Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu"
      guncelleme="23 Eylül 2026 (taslak)"
      bolumler={[
        { baslik: '1. Taraflar', paragraflar: [
          'Satıcı / Hizmet Sağlayıcı: [ŞİRKET UNVANI], [ADRES], Vergi Dairesi / No: [VERGİ DAİRESİ] / [VERGİ NO], MERSİS: [MERSİS NO], E-posta: [E-POSTA], Telefon: [TELEFON].',
          'Alıcı: CheckRezerve işletme paneline kayıt olan ve abonelik satın alan gerçek veya tüzel kişi (“İşletme”). Alıcının kayıt sırasında beyan ettiği unvan, adres ve iletişim bilgileri esas alınır.',
        ] },
        { baslik: '2. Sözleşmenin Konusu', paragraflar: [
          'Bu sözleşme, İşletme’nin CheckRezerve çevrim içi rezervasyon ve randevu yönetim yazılımına (“Hizmet”) seçtiği abonelik planı kapsamında erişimine ilişkin tarafların hak ve yükümlülüklerini, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri çerçevesinde düzenler.',
          '[HUKUKÇU NOTU: Alıcı tacir/işletme ise ilişki B2B’dir ve tüketici mevzuatının uygulanıp uygulanmayacağı değerlendirilmelidir.]',
        ] },
        { baslik: '3. Hizmetin Temel Nitelikleri ve Fiyat', paragraflar: [
          'Plan adı, kapsamı, dönem (aylık/yıllık) ve KDV dahil toplam bedel ödeme adımında ayrıca gösterilir: [PLAN] – [TUTAR] TL (KDV dahil) / [DÖNEM].',
          'Abonelik, iptal edilmediği sürece her dönem sonunda aynı koşullarla otomatik olarak yenilenir. Fiyat değişiklikleri en az [30] gün önceden bildirilir.',
        ] },
        { baslik: '4. Ödeme', paragraflar: [
          'Ödemeler iyzico altyapısı üzerinden kredi/banka kartı ile alınır. Kart bilgileri CheckRezerve tarafından saklanmaz.',
          'Her ödeme için fatura/e-Arşiv fatura [DÜZENLENME YÖNTEMİ] ile İşletme’nin kayıtlı e-posta adresine gönderilir.',
        ] },
        { baslik: '5. Hizmetin İfası', paragraflar: [
          'Hizmet, ödemenin onaylanmasıyla birlikte elektronik ortamda derhal kullanıma açılır.',
        ] },
        { baslik: '6. Cayma Hakkı', paragraflar: [
          'Elektronik ortamda anında ifa edilen hizmetlerde cayma hakkı, Mesafeli Sözleşmeler Yönetmeliği m.15 uyarınca istisna kapsamında olabilir. [HUKUKÇU NOTU: istisnanın uygulanması için alıcının açık onayı ödeme öncesinde alınmalıdır.]',
          'Cayma hakkının kullanılabildiği durumlarda bildirim [E-POSTA] adresine yazılı olarak yapılır; iade [14] gün içinde ödeme yöntemine yapılır.',
        ] },
        { baslik: '7. İptal', paragraflar: [
          'İşletme aboneliğini panelde “Abonelik” sayfasından dilediği zaman iptal edebilir; iptal mevcut dönemin sonunda geçerli olur. Ayrıntılar İptal ve İade Politikası’ndadır.',
        ] },
        { baslik: '8. Uyuşmazlıklar', paragraflar: [
          'Uyuşmazlıklarda [YETKİLİ TÜKETİCİ HAKEM HEYETİ / MAHKEMELER] yetkilidir.',
        ] },
        { baslik: '9. Onay', paragraflar: [
          'Alıcı, ödeme adımında bu ön bilgilendirme formunu ve sözleşmeyi okuduğunu ve kabul ettiğini elektronik ortamda onaylar. Onay kaydı (tarih, saat, metin sürümü) saklanır.',
        ] },
      ]}
    />
  )
}
