import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { WorkingHours } from '@/types'
import { checkCache } from '@/lib/audio-cache'
import type { ResponseSource } from '@/lib/conversation-logger'
import {
  buildSystemPrompt, callDeepSeek, detectGibberish, enforceReservationApproval,
  getFeatures, isFarewell, isGreeting, logTurn, normalizeText, saatYanit,
  type BizCtx, type ChatMsg,
} from '@/lib/assistant-brain'
import { checkFeatureFlag } from '@/lib/feature-flags'
import { genderHint, extractNameFromHistory } from '@/lib/assistant-gender'

// ─── In-memory cache (1 saat) ─────────────────────────────────────
const cache = new Map<string, { data: BizCtx; ts: number }>()
const CACHE_TTL = 3600_000

async function getBusiness(slug: string): Promise<BizCtx | null> {
  const cached = cache.get(slug)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('restaurants')
    .select('id, name, slug, phone, address, working_hours, ai_assistant_name, business_type')
    .eq('slug', slug)
    .single()

  if (!data) return null
  const biz: BizCtx = {
    id: (data as Record<string, unknown>).id as string,
    name: (data as Record<string, unknown>).name as string,
    slug: (data as Record<string, unknown>).slug as string,
    phone: (data as Record<string, unknown>).phone as string | null,
    address: (data as Record<string, unknown>).address as string | null,
    working_hours: (data as Record<string, unknown>).working_hours as WorkingHours | null,
    assistant_name: (data as Record<string, unknown>).ai_assistant_name as string | null,
    business_type: (data as Record<string, unknown>).business_type as string | null,
  }
  cache.set(slug, { data: biz, ts: Date.now() })
  return biz
}

// Session geçmişini DB'den çek — isim/bilgileri hatırlamak için
async function getHistory(sessionId: string): Promise<ChatMsg[]> {
  if (!sessionId) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('conversations')
    .select('user_message, assistant_response, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(20)
  if (!data) return []
  const msgs: ChatMsg[] = []
  for (const row of data as Record<string, unknown>[]) {
    const um = row.user_message as string
    const ar = row.assistant_response as string
    if (um) msgs.push({ role: 'user', content: um })
    if (ar) msgs.push({ role: 'assistant', content: ar })
  }
  return msgs
}

// POST /api/ai-assistant/chat
// Body: { text, restaurant_slug, session_id?, turn_number?, channel? }
export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const body = await req.json()
  const { text, restaurant_slug, session_id, turn_number, channel } = body
  if (!text || !restaurant_slug) {
    return NextResponse.json({ error: 'text and restaurant_slug required' }, { status: 400 })
  }

  const tBiz = Date.now()
  const biz = await getBusiness(restaurant_slug)
  if (!biz) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })

  // S1-T5: ai_chatbot feature flag zorunlu (asistan beyni yalnızca açık işletmelerde)
  const enabled = await checkFeatureFlag(biz.id, 'ai_chatbot')
  if (!enabled) {
    return NextResponse.json({ error: 'AI asistan bu işletmede aktif değil' }, { status: 403 })
  }

  const lower = text.toLowerCase()
  const normalized = normalizeText(text)
  const asistanAdi = biz.assistant_name ?? 'Asistan'
  const bid = biz.id

  async function respond(reply: string, source: ResponseSource, isUnknown = false, endCall = false) {
    logTurn({
      restaurant_id: bid,
      session_id,
      turn_number,
      channel: (channel as 'web_voice' | 'web_chat' | 'app_chat' | 'app_voice' | undefined) ?? 'web_chat',
      user_message: text,
      assistant_response: reply,
      response_source: source,
      is_unknown: isUnknown,
    })
    console.log(`[chat] respond source=${source} end_call=${endCall} total=${Date.now() - t0}ms biz=${Date.now() - tBiz}ms`)
    return NextResponse.json({ response: reply, cached: checkCache(reply), is_unknown: isUnknown, end_call: endCall })
  }

  // Saçma / anlamsız mesaj koruması
  if (detectGibberish(text)) {
    return respond('Sizi tam anlayamadım, tekrar eder misiniz?', 'cache', true, false)
  }

  // ─── 0-token BYPASS: veda ─────────────────────────────────────
  if (isFarewell(normalized)) {
    return respond(`Rica ederim, iyi günler dileriz. ${biz.name}'ı tercih ettiğiniz için teşekkürler.`, 'cache', false, true)
  }
  // ─── 0-token BYPASS: saf selamlama ────────────────────────────
  if (isGreeting(normalized)) {
    return respond(`Merhaba, hoş geldiniz! Ben ${asistanAdi}, ${biz.name} asistanıyım. Size nasıl yardımcı olabilirim? Rezervasyon yapmak ister misiniz?`, 'cache')
  }

  // ─── Keyword-based replies ────────────────────────────────────
  const digits = lower.replace(/[^\d]/g, '')
  const providingData = digits.length >= 9 || /(\b\d{1,2}[:.]\d{2}\b|\bsaat\s*\d|yarın|bugün|haftaya|pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar|sabah|akşam|öğle)/i.test(lower)

  if (!providingData && /saat|kaçta|açık mı|kapalı|çalışma|mesai|ne zaman/i.test(lower)) {
    const yanit = saatYanit(biz.working_hours)
    return respond(yanit ? `Çalışma saatlerimiz: ${yanit}` : 'Çalışma saatlerimiz hakkında bilgi alamadım.', 'cache')
  }
  if (!providingData && /telefon|numara|ara|ulaş/i.test(lower)) {
    return respond(`Bize ${biz.phone ?? 'telefon numaramızdan'} ulaşabilirsiniz.`, 'cache')
  }
  if (!providingData && /adres|nerede|konum|yol/i.test(lower)) {
    return respond(`Adresimiz: ${biz.address ?? 'Adres bilgisi bulunamadı'}`, 'cache')
  }

  // ─── DeepSeek API ─────────────────────────────────────────────
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  if (!deepseekKey) {
    return respond(`Üzgünüm, şu anda size yanıt veremiyorum. Lütfen ${biz.phone ?? 'telefonla'} ulaşın.`, 'cache')
  }

  const maxTurn = Number(turn_number ?? 0) > 12
  const features = await getFeatures(biz.id)
  const history = await getHistory(session_id ?? '')
  // Öğrenilen isimden cinsiyet ipucu üret (deterministik, güvenli)
  const userName = extractNameFromHistory([...history, { role: 'user' as const, content: text }])
  const genderHintLine = userName ? genderHint(userName) : null
  const systemPrompt = buildSystemPrompt({ biz, maxTurn, featureLines: features, genderHintLine })

  const tLLM = Date.now()
  try {
    const messages: ChatMsg[] = [...history, { role: 'user', content: text }]
    let reply = await callDeepSeek(systemPrompt, messages, 150)

    // KRİTİK kural: "oluşturuldu" yalnızca tam bilgi + onay sonrası
    const override = enforceReservationApproval(messages, reply)
    if (override) reply = override

    const isUnknown = /kesin bilgim yok|bilmiyorum|alakasız|tam anlayamadım/i.test(reply)
    const endCall = /oluşturuldu|iyi günler!|görüşürüz/i.test(reply)
    console.log(`[chat] llm=${Date.now() - tLLM}ms total=${Date.now() - t0}ms`)
    return respond(reply, 'ai', isUnknown, endCall)
  } catch {
    return respond(`Üzgünüm, şu anda size yanıt veremiyorum. Lütfen ${biz.phone ?? 'telefonla'} ulaşın.`, 'cache')
  }
}
