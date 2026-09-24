import type { Metadata } from 'next'

// PF-03: sayfa client bileşen olduğu için metadata burada
export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular — CheckRezerve',
  description: 'CheckRezerve online rezervasyon ve randevu sistemi hakkında sık sorulan sorular: fiyatlandırma, kurulum, SMS/WhatsApp bildirimleri, KVKK.',
  openGraph: { title: 'Sıkça Sorulan Sorular — CheckRezerve', description: 'CheckRezerve online rezervasyon ve randevu sistemi hakkında sık sorulan sorular: fiyatlandırma, kurulum, SMS/WhatsApp bildirimleri, KVKK.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
