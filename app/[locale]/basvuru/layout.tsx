import type { Metadata } from 'next'

// PF-03: sayfa client bileşen olduğu için metadata burada
export const metadata: Metadata = {
  title: 'İşletme Başvurusu',
  description: 'Restoran, kuaför, klinik, spa ve spor salonları için CheckRezerve başvuru formu.',
  openGraph: { title: 'İşletme Başvurusu', description: 'Restoran, kuaför, klinik, spa ve spor salonları için CheckRezerve başvuru formu.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
