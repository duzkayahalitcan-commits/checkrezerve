import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getLocale } from 'next-intl/server'
import MisafirList from './MisafirList'

export const dynamic = 'force-dynamic'

export default async function MisafirlerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug } = await params
  const db = getSupabaseAdmin()
  const locale = await getLocale()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  // Fetch guests from reservations (group by phone)
  const { data: reservations } = await db
    .from('reservations')
    .select('guest_name, guest_phone, reserved_date, status')
    .eq('restaurant_id', restaurant.id)
    .neq('status', 'cancelled')
    .not('guest_phone', 'is', null)
    .order('reserved_date', { ascending: false })

  // Aggregate unique guests
  const phoneMap = new Map<string, { name: string; phone: string; visits: number; lastVisit: string; statuses: string[] }>()
  for (const r of reservations ?? []) {
    const phone = r.guest_phone!
    if (!phoneMap.has(phone)) {
      phoneMap.set(phone, { name: r.guest_name ?? 'Misafir', phone, visits: 0, lastVisit: '', statuses: [] })
    }
    const entry = phoneMap.get(phone)!
    entry.visits++
    if (r.reserved_date > entry.lastVisit) entry.lastVisit = r.reserved_date
    entry.statuses.push(r.status)
    if (r.guest_name && r.guest_name !== 'Misafir') entry.name = r.guest_name
  }

  const guests = Array.from(phoneMap.values()).sort((a, b) => b.visits - a.visits)

  // Try to get from guests table if migration ran
  const { data: guestRecords } = await db
    .from('guests')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('total_visits', { ascending: false })

  const guestTagsMap = new Map<string, string[]>()
  if (guestRecords && guestRecords.length > 0) {
    const guestIds = guestRecords.map(g => g.id)
    const { data: assignments } = await db
      .from('guest_tag_assignments')
      .select('guest_id, tag_id, guest_tags!inner(name, color)')
      .in('guest_id', guestIds)

    if (assignments) {
      for (const a of assignments as unknown as { guest_id: string; guest_tags: { name: string; color: string } }[]) {
        if (!guestTagsMap.has(a.guest_id)) guestTagsMap.set(a.guest_id, [])
        guestTagsMap.get(a.guest_id)!.push(a.guest_tags.name)
      }
    }
  }

  // Fetch guest tags for this restaurant
  const { data: allTags } = await db
    .from('guest_tags')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('name')

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Misafirler</h1>
        <p className="text-xs text-stone-500 mt-0.5">{guests.length} misafir</p>
      </div>
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <MisafirList
          guests={guestRecords ?? guests}
          tags={allTags ?? []}
          guestTagsMap={Object.fromEntries(guestTagsMap)}
          locale={locale}
          restaurantId={restaurant.id}
        />
      </main>
    </div>
  )
}
