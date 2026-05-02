import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { FloorTable } from '@/types'
import FloorPlanEditorWrapper from './FloorPlanEditorWrapper'

type Props = { params: Promise<{ id: string }> }

export default async function FloorPlanPage({ params }: Props) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const [{ data: restaurant }, { data: rawTables }] = await Promise.all([
    supabase
      .from('restaurants')
      .select('id, name, floor_plan_enabled')
      .eq('id', id)
      .single(),
    supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', id)
      .eq('is_active', true)
      .order('created_at'),
  ])

  if (!restaurant) notFound()

  const tables = (rawTables ?? []) as FloorTable[]

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
