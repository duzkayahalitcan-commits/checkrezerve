import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'

export const dynamic = 'force-dynamic'

export default async function PaketOzetiPage() {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session || session.role !== 'super_admin') redirect('/panel/login')

  const db = getSupabaseAdmin()

  // Isletme bazinda paket ozeti - tek query
  const { data: ozet } = await db
    .from('restaurants')
    .select(`
      id, name, slug, business_type,
      paketler:paketler(count),
      musteri_paketleri:musteri_paketleri!left(count)
    `)
    .eq('is_active', true)
    .order('name')

  // Ayri query ile kalan seans ve biten paket sayilari
  const { data: kalanlar } = await db
    .from('musteri_paketleri')
    .select(`
      restaurant_id,
      kalan_seans,
      durum
    `)

  const kalanMap = new Map<string, { aktifPaket: number; toplamKalan: number; bitenPaket: number }>()
  for (const r of (kalanlar ?? [])) {
    const rid = r.restaurant_id as string
    if (!kalanMap.has(rid)) kalanMap.set(rid, { aktifPaket: 0, toplamKalan: 0, bitenPaket: 0 })
    const entry = kalanMap.get(rid)!
    entry.toplamKalan += (r.kalan_seans as number) ?? 0
    if (r.durum === 'aktif') entry.aktifPaket++
    if (r.durum === 'bitti') entry.bitenPaket++
  }

  const rows = (ozet ?? []).map((r: Record<string, unknown>) => {
    const stats = kalanMap.get(r.id as string) ?? { aktifPaket: 0, toplamKalan: 0, bitenPaket: 0 }
    return {
      name: r.name as string,
      slug: r.slug as string,
      type: r.business_type as string,
      paketSayisi: (r.paketler as unknown as { count: number }[])?.[0]?.count ?? 0,
      ...stats,
    }
  }).filter(r => r.paketSayisi > 0 || r.aktifPaket > 0)

  return (
    <div className="min-h-screen bg-stone-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-lg font-bold mb-1">Paket Özeti</h1>
        <p className="text-xs text-stone-400 mb-6">İşletme bazında paket istatistikleri</p>

        {rows.length === 0 ? (
          <div className="text-center py-16 text-stone-500 text-sm">Henüz paket verisi yok</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-700/50">
                  <th className="text-left py-3 px-3 font-medium">İşletme</th>
                  <th className="text-left py-3 px-3 font-medium">Tür</th>
                  <th className="text-right py-3 px-3 font-medium">Aktif Paket</th>
                  <th className="text-right py-3 px-3 font-medium">Toplam Kalan Seans</th>
                  <th className="text-right py-3 px-3 font-medium">Biten Paket</th>
                  <th className="text-right py-3 px-3 font-medium">Tanımlı Paket</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.slug} className="border-b border-stone-800/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-medium text-white">{r.name}</td>
                    <td className="py-3 px-3 text-stone-400 text-xs">{r.type}</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-semibold">{r.aktifPaket}</td>
                    <td className="py-3 px-3 text-right text-amber-400 font-semibold">{r.toplamKalan}</td>
                    <td className="py-3 px-3 text-right text-stone-400">{r.bitenPaket}</td>
                    <td className="py-3 px-3 text-right text-stone-300">{r.paketSayisi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
