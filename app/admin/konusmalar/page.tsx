import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'
import ConversationsClient from './ConversationsClient'

export const metadata: Metadata = {
  title: 'Admin — Konuşma Geçmişi',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface ConversationRow {
  id: string
  restaurant_id: string
  session_id: string
  turn_number: number
  channel: string
  user_message: string
  assistant_response: string
  response_source: string
  voice_id: string | null
  created_at: string
  restaurants: { name: string } | null
}

interface RestaurantRow {
  id: string
  name: string
}

export default async function ConversationsPage() {
  const supabase = getSupabaseAdmin()

  const [{ data: conversations }, { data: restaurants }] = await Promise.all([
    (await supabase
      .from('conversations')
      .select('*, restaurants(name)')
      .order('created_at', { ascending: false })
      .limit(200)) as { data: ConversationRow[] | null },

    (await supabase
      .from('restaurants')
      .select('id, name')
      .order('name')) as { data: RestaurantRow[] | null },
  ])

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">checkrezerve</h1>
            <p className="text-xs text-stone-500">Konuşma Geçmişi</p>
          </div>
          <a
            href="/admin"
            className="text-xs text-stone-500 hover:text-stone-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            ← Panel
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <ConversationsClient
          initialConversations={conversations ?? []}
          restaurants={restaurants ?? []}
        />
      </div>
    </div>
  )
}
