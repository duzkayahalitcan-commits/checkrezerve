import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import {
  buildSystemPrompt, callDeepSeek, detectGibberish, enforceReservationApproval,
  getFeatures, isFarewell, isGreeting, logTurn, normalizeText,
  type ChatMsg,
} from '@/lib/assistant-brain'
import { genderHint, extractNameFromHistory } from '@/lib/assistant-gender'

// POST /api/ai-chatbot
// Body: { restaurant_id, messages }
// Web AI chatbot (AIChatbot.tsx). W-78: W-75 beyni ile bağlandı.
export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { prefix: 'ai-chatbot', max: 30, windowMs: 60_000 })
  if (limited) return limited

  try {
    const { restaurant_id, messages } = await request.json()
    if (!restaurant_id || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'restaurant_id and messages required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()

    // ── Feature flag kontrolü ──────────────────────────────────────────
    const { data: flagRow } = await db
      .from('feature_flags')
      .select('enabled')
      .eq('restaurant_id', restaurant_id)
      .eq('feature', 'ai_chatbot')
      .maybeSingle()
    if (!flagRow?.enabled) {
      return NextResponse.json({ error: 'AI Chatbot bu işletme için aktif değil.' }, { status: 403 })
    }

    // ── İşletme bilgilerini çek ───────────────────────────────────────
    const { data: bizRaw } = await db
      .from('restaurants')
      .select('id, name, slug, phone, address, working_hours, ai_assistant_name, business_type')
      .eq('id', restaurant_id)
      .single()
    if (!bizRaw) return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 })

    const biz = {
      id: bizRaw.id,
      name: bizRaw.name,
      slug: bizRaw.slug,
      phone: bizRaw.phone ?? null,
      address: bizRaw.address ?? null,
      working_hours: bizRaw.working_hours ?? null,
      assistant_name: bizRaw.ai_assistant_name ?? null,
      business_type: bizRaw.business_type ?? null,
    }

    const history: ChatMsg[] = (messages as ChatMsg[]).filter(m => m.role === 'user' || m.role === 'assistant')
    const lastUser = [...history].reverse().find(m => m.role === 'user')
    const text = lastUser?.content ?? ''
    const normalized = normalizeText(text)

    // Konuşma kaydı (channel app_chat) — her kullanıcı mesajında bir tur
    const turn_number = history.filter(m => m.role === 'user').length

    // Saçma / anlamsız mesaj koruması
    if (text && detectGibberish(text)) {
      const reply = 'Sizi tam anlayamadım, tekrar eder misiniz?'
      logTurn({ restaurant_id: biz.id, session_id: (history[0]?.content ?? '').slice(0, 40), turn_number, channel: 'app_chat', user_message: text, assistant_response: reply, is_unknown: true })
      return NextResponse.json({ message: reply })
    }

    // ── 0-token BYPASS ────────────────────────────────────────────────
    if (isFarewell(normalized)) {
      const reply = `Rica ederim, iyi günler dileriz. ${biz.name}'ı tercih ettiğiniz için teşekkürler.`
      logTurn({ restaurant_id: biz.id, session_id: (history[0]?.content ?? '').slice(0, 40), turn_number, channel: 'app_chat', user_message: text, assistant_response: reply })
      return NextResponse.json({ message: reply })
    }
    if (isGreeting(normalized)) {
      const reply = `Merhaba, hoş geldiniz! Ben ${biz.assistant_name ?? 'Asistan'}, ${biz.name} asistanıyım. Size nasıl yardımcı olabilirim? Rezervasyon yapmak ister misiniz?`
      logTurn({ restaurant_id: biz.id, session_id: (history[0]?.content ?? '').slice(0, 40), turn_number, channel: 'app_chat', user_message: text, assistant_response: reply })
      return NextResponse.json({ message: reply })
    }

    // ── W-75/76 beyin ────────────────────────────────────────────────
    const maxTurn = turn_number > 12
    const features = await getFeatures(biz.id)
    const genderHintLine = (() => {
      const name = extractNameFromHistory(history)
      return name ? genderHint(name) : null
    })()
    const systemPrompt = buildSystemPrompt({ biz, maxTurn, featureLines: features, genderHintLine })

    try {
      let reply = await callDeepSeek(systemPrompt, history, 200)
      // KRİTİK: "oluşturuldu" yalnızca tam bilgi + onay sonrası
      const override = enforceReservationApproval(history, reply)
      if (override) reply = override

      const isUnknown = /kesin bilgim yok|bilmiyorum|alakasız|tam anlayamadım/i.test(reply)
      logTurn({ restaurant_id: biz.id, session_id: (history[0]?.content ?? '').slice(0, 40), turn_number, channel: 'app_chat', user_message: text, assistant_response: reply, is_unknown: isUnknown })
      return NextResponse.json({ message: reply })
    } catch (aiError) {
      console.error('[ai-chatbot]', aiError)
      const fallback = 'Şu an yanıt veremiyorum, lütfen biraz sonra tekrar deneyin.'
      logTurn({ restaurant_id: biz.id, session_id: (history[0]?.content ?? '').slice(0, 40), turn_number, channel: 'app_chat', user_message: text, assistant_response: fallback })
      return NextResponse.json({ message: fallback })
    }
  } catch (error) {
    console.error('[ai-chatbot]', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
