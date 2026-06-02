'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function LegalSidebar({ activePath }: { activePath: string }) {
  const t = useTranslations('legal')

  const LINKS = [
    { href: '/kullanim-kosullari',              labelKey: 'linkTerms' },
    { href: '/gizlilik',                        labelKey: 'linkPrivacy' },
    { href: '/cerez-politikasi',                labelKey: 'linkCookies' },
    { href: '/kvkk',                            labelKey: 'linkKvkk' },
    { href: '/yasal/basvuru-formu-aydinlatma',  labelKey: 'linkApplicationNotice' },
    { href: '/kvkk-basvuru',                    labelKey: 'linkKvkkApplication' },
    { href: '/yasal/hesap-silme',               labelKey: 'linkAccountDeletion' },
  ]

  return (
    <nav className="w-full lg:w-64 flex-shrink-0">
      <div className="lg:sticky lg:top-24 bg-zinc-50 rounded-2xl border border-zinc-100 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-2 mb-3">{t('sidebarTitle')}</p>
        <ul className="flex flex-col gap-1">
          {LINKS.map(l => {
            const active = activePath === l.href
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block py-2.5 text-sm leading-snug transition-colors ${
                    active
                      ? 'pl-3 border-l-2 border-red-600 text-red-700 font-bold'
                      : 'pl-3 text-zinc-600 hover:text-zinc-900 border-l-2 border-transparent'
                  }`}
                >
                  {t(l.labelKey as Parameters<typeof t>[0])}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
