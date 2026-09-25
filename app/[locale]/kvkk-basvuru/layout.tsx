import type { Metadata } from 'next'

// PF-03: sayfa client bileşen olduğu için metadata burada
export const metadata: Metadata = {
  title: 'KVKK Başvuru Formu',
  description: '6698 sayılı KVKK kapsamında kişisel verilerinize ilişkin başvuru formu.',
  openGraph: { title: 'KVKK Başvuru Formu', description: '6698 sayılı KVKK kapsamında kişisel verilerinize ilişkin başvuru formu.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
