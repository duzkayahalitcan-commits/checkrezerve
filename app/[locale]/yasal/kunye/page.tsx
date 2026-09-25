import type { Metadata } from 'next'
import LegalDraftPage from '@/components/LegalDraftPage'

// LG-10 — TASLAK: köşeli parantezli alanlar Halitcan tarafından doldurulmalı.
export const metadata: Metadata = {
  title: 'Künye ve İletişim (Taslak)',
  robots: { index: false, follow: false },
}

export default function KunyePage() {
  return (
    <LegalDraftPage
      baslik="Künye ve İletişim Bilgileri"
      guncelleme="23 Eylül 2026 (taslak)"
      bolumler={[
        { baslik: 'Hizmet Sağlayıcı', paragraflar: [
          'Ticaret unvanı: [ŞİRKET UNVANI]',
          'Adres: [AÇIK ADRES]',
          'Vergi dairesi / Vergi no: [VERGİ DAİRESİ] / [VERGİ NO]',
          'MERSİS no: [MERSİS NO]',
          'Ticaret sicil no: [SİCİL NO]',
        ] },
        { baslik: 'İletişim', paragraflar: [
          'E-posta: [E-POSTA]',
          'Telefon: [TELEFON]',
          'KEP adresi: [KEP ADRESİ]',
        ] },
        { baslik: 'Yasal Bilgilendirme', paragraflar: [
          '6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında hizmet sağlayıcıya ait tanıtıcı bilgilerdir. Kişisel verilerin işlenmesine ilişkin bilgiler KVKK Aydınlatma Metni’nde yer alır.',
        ] },
      ]}
    />
  )
}
