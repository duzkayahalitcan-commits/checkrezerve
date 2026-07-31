import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/chat/rate
// Body: { session_id, rating, restaurant_id, messages? }
// Inserts a conversation log entry with rating feedback.
// Used by the mobile app when a user rates a voice call.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { session_id, rating, restaurant_id, messages } = body

    if (!session_id || !rating || !restaurant_id) {
      return NextResponse.json(
        { error: 'session_id, rating, and restaurant_id required' },
        { status: 400 }
      )
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('conversations').insert({
      session_id,
      rating,
      restaurant_id,
      messages: messages ?? null,
      channel: 'app_voice',
      user_message: 'ÇAĞRI',
      assistant_response: 'ÖZET',
      response_source: 'ai',
    })

    if (error) {
      console.error('[rate] insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    )
  }
}
