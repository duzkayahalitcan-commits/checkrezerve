import { getSupabaseAdmin } from '@/lib/supabase'

export type Channel = 'web_voice' | 'web_chat' | 'app_chat' | 'app_voice'
export type ResponseSource = 'cache' | 'concat' | 'ai'

interface LogParams {
  restaurant_id: string
  session_id?: string
  turn_number?: number
  channel?: Channel
  user_message: string
  assistant_response: string
  response_source: ResponseSource
  voice_id?: string
}

/**
 * Log a conversation turn to the `conversations` table.
 * Errors are silently caught so logging never breaks the main flow.
 */
export async function logConversation(params: LogParams) {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('conversations').insert({
      restaurant_id: params.restaurant_id,
      session_id: params.session_id ?? '',
      turn_number: params.turn_number ?? 1,
      channel: params.channel ?? 'web_chat',
      user_message: params.user_message,
      assistant_response: params.assistant_response,
      response_source: params.response_source,
      voice_id: params.voice_id ?? null,
    })
    if (error) {
      console.error('[conversation-logger] insert error:', error.message)
    }
  } catch (e) {
    console.error('[conversation-logger] exception:', (e as Error).message)
  }
}
