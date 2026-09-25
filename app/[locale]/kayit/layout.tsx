import type { Metadata } from 'next'

// PF-03: sayfa client bileşen olduğu için metadata burada
export const metadata: Metadata = {
  title: 'İşletme Kaydı',
  description: 'İşletmenizi CheckRezerve’e kaydedin: komisyonsuz online rezervasyon, randevu takvimi ve otomatik hatırlatmalar.',
  openGraph: { title: 'İşletme Kaydı', description: 'İşletmenizi CheckRezerve’e kaydedin: komisyonsuz online rezervasyon, randevu takvimi ve otomatik hatırlatmalar.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
