import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase'
import FloorPlanEditorWrapper from './FloorPlanEditorWrapper'
import type { EditorTable } from './FloorPlanEditor'

type Props = { params: Promise<{ id: string }> }

export default async function FloorPlanPage({ params }: Props) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  // panel kroki ile aynı kaynaktan oku: masa_tipleri
  const [{ data: restaurant }, { data: rawMasaTipleri }] = await Promise.all([
    supabase
      .from('restaurants')
      .select('id, name, floor_plan_enabled')
      .eq('id', id)
      .single(),
    supabase
      .from('masa_tipleri')
      .select('id, isletme_id, ad, kapasite, aktif, x, y, width, height, sekil')
      .eq('isletme_id', id)
      .eq('aktif', true)
      .order('created_at'),
  ])

  if (!restaurant) notFound()

  // masa_tipleri kolonlarını EditorTable'e map'le
  const tables: EditorTable[] = (rawMasaTipleri ?? []).map((t: Record<string, unknown>) => ({
    id:       t.id as string,
    label:    (t.ad ?? t.label ?? 'Masa') as string,
    capacity: (t.kapasite ?? t.capacity ?? 4) as number,
    x:        (t.x ?? 0) as number,
    y:        (t.y ?? 0) as number,
    width:    (t.width ?? 80) as number,
    height:   (t.height ?? 80) as number,
    shape:    ((t.sekil === 'yuvarlak' || t.shape === 'circle') ? 'circle' : 'rect') as 'rect' | 'circle',
  }))

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-6xl flex items-center gap-4">
          <Link
            href="/admin"
            className="text-stone-500 hover:text-white text-xs transition-colors shrink-0"
          >
            ← Admin
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {restaurant.name}
            </h1>
            <p className="text-xs text-stone-500">Masa Krokisi Düzenleyici</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 overflow-x-auto">
          <FloorPlanEditorWrapper
            restaurantId={restaurant.id}
            initialTables={tables}
            floorPlanEnabled={restaurant.floor_plan_enabled ?? false}
          />
        </div>
      </div>
    </div>
  )
}
