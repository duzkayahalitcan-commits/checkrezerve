import type { Metadata } from 'next'

// PF-03: sayfa client bileşen olduğu için metadata burada (kişisel/iç sayfa → indekslenmez)
export const metadata: Metadata = {
  title: 'Favorilerim — CheckRezerve',
  description: 'Favori işletmeleriniz.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
