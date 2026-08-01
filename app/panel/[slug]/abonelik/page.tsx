import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Check, Ban, ShieldCheck, Undo2, Phone, Lock, Flag } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export const dynamic = 'force-dynamic'

export default async function AbonelikPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug } = await params
  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  const { data: subscription } = await db
    .from('subscriptions')
    .select('id, restaurant_id, plan, status, billing_period, current_period_end')
    .eq('restaurant_id', restaurant.id)
    .single()

  const { data: payments } = await db
    .from('subscription_payments')
    .select('id, restaurant_id, subscription_id, amount, currency, status, created_at')
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const planName = subscription?.plan ?? 'Starter'
  const status = subscription?.status ?? 'active'
  const period = subscription?.billing_period ?? 'monthly'

  const statusColors: Record<string, string> = {
    active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    trialing: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
    past_due: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    cancelled: 'text-red-400 bg-red-500/10 border-red-500/25',
    expired: 'text-stone-400 bg-stone-800 border-stone-700',
  }

  const statusLabels: Record<string, string> = {
    active: 'Aktif',
    trialing: 'Deneme',
    past_due: 'Ödeme Bekliyor',
    cancelled: 'İptal Edildi',
    expired: 'Süresi Doldu',
  }

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Abonelik</h1>
      </div>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Plan card */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mb-1">Mevcut Plan</p>
              <h2 className="text-2xl font-bold text-white">{planName}</h2>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[status] ?? ''}`}>
              {statusLabels[status] ?? status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-stone-800/50 rounded-xl p-4">
              <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-1">Dönem</p>
              <p className="text-white font-semibold capitalize">{period === 'monthly' ? 'Aylık' : 'Yıllık'}</p>
            </div>
            <div className="bg-stone-800/50 rounded-xl p-4">
              <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-1">Durum</p>
              <p className="text-white font-semibold capitalize">{statusLabels[status] ?? status}</p>
            </div>
          </div>

          {subscription?.current_period_end && (
            <p className="text-xs text-stone-500">
              Sonraki ödeme: {new Date(subscription.current_period_end + 'T12:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}

          {planName === 'Starter' && (
            <div className="mt-6 pt-6 border-t border-stone-800">
              <p className="text-sm text-stone-400 mb-3">Daha fazla özellik için Pro plana geçin.</p>
              <a href={`/pricing`} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 text-sm font-semibold transition-colors">
                Planı Yükselt
              </a>
            </div>
          )}
        </div>

        {/* Payment history */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-stone-200 mb-4">Ödeme Geçmişi</h3>
          {payments && payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-sm text-white font-medium">
                      {new Date(p.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'paid' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {p.status === 'paid' ? 'Ödendi' : 'Başarısız'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {Number(p.amount).toLocaleString()} ₺
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-sm text-center py-4">Henüz ödeme kaydı bulunmuyor.</p>
          )}
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: Ban, label: 'Komisyon yok' },
            { icon: ShieldCheck, label: 'Gizli ücret yok' },
            { icon: Undo2, label: '30 gün iade garantisi' },
            { icon: Phone, label: 'Ücretsiz kurulum desteği' },
            { icon: Lock, label: 'Müşteri veriniz size ait' },
            { icon: Flag, label: 'Türkiye desteği' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl p-4">
              <item.icon size={18} className="text-stone-500" />
              <span className="text-[11px] font-semibold text-stone-400 text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
