import Link from 'next/link'

const LINKS = [
  { href: '/kullanim-kosullari',              label: 'Kullanım Koşulları & Gizlilik Politikası' },
  { href: '/cerez-politikasi',                label: 'Çerez Aydınlatma Metni' },
  { href: '/kvkk',                            label: 'Kişisel Verilerin Korunması ve İşlenmesi Politikası' },
  { href: '/yasal/basvuru-formu-aydinlatma',  label: 'Başvuru Formu Aydınlatma Metni' },
  { href: '/kvkk-basvuru',                    label: 'KVKK Başvuru Formu' },
]

export default function LegalSidebar({ activePath }: { activePath: string }) {
  return (
    <nav className="w-full lg:w-64 flex-shrink-0">
      <div className="lg:sticky lg:top-24 bg-zinc-50 rounded-2xl border border-zinc-100 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-2 mb-3">Yasal Sayfalar</p>
        <ul className="flex flex-col gap-1">
          {LINKS.map(l => {
            const active = activePath === l.href
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block px-3 py-2.5 rounded-xl text-sm leading-snug transition-colors ${
                    active
                      ? 'bg-red-600 text-white font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
