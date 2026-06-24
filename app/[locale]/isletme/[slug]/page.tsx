import { notFound } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import { BUSINESS_TYPE_ICONS, BUSINESS_TYPE_LABELS, type BusinessType } from '@/types'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

async function getRestaurant(slug: string) {
  const { data } = await getSupabase()
    .from('restaurants')
    .select('id, name, slug, address, phone, description, business_type, is_active, cover_image')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const r = await getRestaurant(slug)
  if (!r) return {}
  return {
    title: `${r.name} — CheckRezerve`,
    description: r.description ?? `${r.name} için online rezervasyon yapın.`,
    openGraph: {
      title: r.name,
      description: r.description ?? `${r.name} için online rezervasyon yapın.`,
      images: r.cover_image ? [r.cover_image] : [],
    },
  }
}

export default async function IsletmePage({ params }: Props) {
  const { slug } = await params
  const r = await getRestaurant(slug)
  if (!r) notFound()

  const typeLabel = BUSINESS_TYPE_LABELS[r.business_type as BusinessType] ?? 'İşletme'
  const typeIcon  = BUSINESS_TYPE_ICONS[r.business_type as BusinessType] ?? '🏪'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: r.name,
    description: r.description ?? undefined,
    address: r.address ? { '@type': 'PostalAddress', streetAddress: r.address } : undefined,
    telephone: r.phone ?? undefined,
    image: r.cover_image ?? undefined,
    url: `https://checkrezerve.com/tr/isletme/${r.slug}`,
    makesOffer: {
      '@type': 'Offer',
      name: 'Online Rezervasyon',
      url: `https://checkrezerve.com/tr/rezervasyon/${r.id}`,
    },
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <div className="relative h-52 bg-gradient-to-br from-[#2B1B17] to-[#E53935] flex items-end">
        {r.cover_image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={r.cover_image}
            alt=""
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="relative z-10 px-6 pb-6 w-full">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 bg-white/10 backdrop-blur px-3 py-1 rounded-full border border-white/20 mb-3">
            {typeIcon} {typeLabel}
          </span>
          <h1 className="text-2xl font-black text-white leading-tight">{r.name}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-6">
        {/* Info card */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
          {r.description && (
            <p className="text-sm text-zinc-600 leading-relaxed">{r.description}</p>
          )}
          {r.address && (
            <div className="flex items-start gap-3">
              <span className="text-base mt-0.5">📍</span>
              <p className="text-sm text-zinc-700">{r.address}</p>
            </div>
          )}
          {r.phone && (
            <div className="flex items-center gap-3">
              <span className="text-base">📞</span>
              <a href={`tel:${r.phone}`} className="text-sm text-[#E53935] font-semibold hover:underline">
                {r.phone}
              </a>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href={{ pathname: '/rezervasyon/[id]', params: { id: r.id } }}
          className="block w-full text-center bg-[#E53935] hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-md shadow-red-200"
        >
          Rezervasyon Yap
        </Link>

        <Link
          href="/rezervasyon"
          className="block w-full text-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ← Tüm İşletmeler
        </Link>
      </div>
    </main>
  )
}
