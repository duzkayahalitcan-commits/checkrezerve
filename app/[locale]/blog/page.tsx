import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import BlogCoverImage from './BlogCoverImage'
import { setRequestLocale, getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'blog' })

  const POSTS = [
    {
      emoji: '🚫',
      tag: t('p1Tag'),
      title: t('p1Title'),
      excerpt: t('p1Excerpt'),
      readTime: t('p1ReadTime'),
      date: t('p1Date'),
      cover: '/images/blog-no-show.jpg',
    },
    {
      emoji: '🤖',
      tag: t('p2Tag'),
      title: t('p2Title'),
      excerpt: t('p2Excerpt'),
      readTime: t('p2ReadTime'),
      date: t('p2Date'),
      cover: '/images/blog-restoran-ai.png',
    },
    {
      emoji: '💆',
      tag: t('p3Tag'),
      title: t('p3Title'),
      excerpt: t('p3Excerpt'),
      readTime: t('p3ReadTime'),
      date: t('p3Date'),
      cover: '/images/blog-spa.png',
    },
    {
      emoji: '📊',
      tag: t('p4Tag'),
      title: t('p4Title'),
      excerpt: t('p4Excerpt'),
      readTime: t('p4ReadTime'),
      date: t('p4Date'),
      cover: '/images/blog-rezervasyon-veri.jpg',
    },
    {
      emoji: '✂️',
      tag: t('p5Tag'),
      title: t('p5Title'),
      excerpt: t('p5Excerpt'),
      readTime: t('p5ReadTime'),
      date: t('p5Date'),
      cover: '/images/blog-kuafor.jpg',
    },
    {
      emoji: '💳',
      tag: t('p6Tag'),
      title: t('p6Title'),
      excerpt: t('p6Excerpt'),
      readTime: t('p6ReadTime'),
      date: t('p6Date'),
      cover: '/images/blog-on-odeme.png',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="pt-28 pb-16 text-white text-center relative" style={{backgroundImage:"linear-gradient(135deg,rgba(13,18,26,0.82) 0%,rgba(13,110,110,0.60) 100%),url('/images/blog-banner.jpg')",backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className="mx-auto max-w-2xl px-6 relative z-10">
          <span className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300 font-medium mb-6">
            {t('badge')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            {t('heroTitle')}<br />{t('heroTitleLine2')}
          </h1>
          <p className="text-white/70 text-lg">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map(post => (
              <article key={post.title}
                className="rounded-2xl border border-zinc-100 bg-white hover:border-red-100 hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
                <BlogCoverImage src={post.cover} alt={post.title} tag={post.tag} />
                <div className="p-6">
                  <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                    {post.tag}
                  </span>
                  <h2 className="font-bold text-zinc-900 mb-3 leading-snug group-hover:text-red-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>⏱ {post.readTime}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="text-zinc-400 text-sm mb-4">{t('comingSoon')}</p>
            <Link href="/iletisim"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 hover:border-red-400 hover:text-red-600 px-6 py-3 text-sm font-semibold text-zinc-700 transition-all">
              {t('guestWriter')}
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
