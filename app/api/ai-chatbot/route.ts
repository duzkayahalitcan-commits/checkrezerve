import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { checkGreeting, searchFaq } from '@/lib/faq-search'
import { rateLimit } from '@/lib/rate-limit'

async function callClaude(systemPrompt: string, messages: {role: string, content: string}[]) {
  // Anthropic kredisi bittiği için DeepSeek kullanılıyor
  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      .slice(-10)
  ]

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 512,
      messages: apiMessages,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('[ai-chatbot] DeepSeek error:', res.status, errText)
    throw new Error(`DeepSeek error: ${res.status}`)
  }
  const json = await res.json()
  const reply = json.choices?.[0]?.message?.content
  return reply ?? 'Yanıt oluşturulamadı.'
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { prefix: 'ai-chatbot', max: 30, windowMs: 60_000 })
  if (limited) return limited

  try {
    const { restaurant_id, messages } = await request.json()

    if (!restaurant_id || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'restaurant_id and messages required' }, { status: 400 })
    }

    // ── 1. Feature flag kontrolü ──────────────────────────────────────────
    const db = getSupabaseAdmin()
    const { data: flagRow } = await db
      .from('feature_flags')
      .select('enabled')
      .eq('restaurant_id', restaurant_id)
      .eq('feature', 'ai_chatbot')
      .maybeSingle()

    if (!flagRow?.enabled) {
      return NextResponse.json({ error: 'AI Chatbot bu işletme için aktif değil.' }, { status: 403 })
    }

    // ── 2. İşletme bilgilerini çek ───────────────────────────────────────
    const { data: biz } = await db
      .from('restaurants')
      .select('name, business_type')
      .eq('id', restaurant_id)
      .single()

    const businessName = biz?.name ?? 'İşletme'
    const businessType = biz?.business_type ?? 'genel'

    // ── 3. FAQ / greeting check ──────────────────────────────────────────
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    if (lastUserMsg) {
      const greeting = checkGreeting(lastUserMsg.content)
      if (greeting) return NextResponse.json({ message: greeting })
      const faqAnswer = await searchFaq(lastUserMsg.content)
      if (faqAnswer) return NextResponse.json({ message: faqAnswer })
    }

    // ── 4. Sistem prompt'u oluştur ───────────────────────────────────────
    const systemPrompt = `Sen ${businessName} adlı ${businessType} işletmesinin yapay zeka asistanısın. Türkçe, kısa ve samimi cevaplar ver. Her mesaja tek bir kısa cevap ver, uzun paragraflar yazma.

İşletme: ${businessName}
Tür: ${businessType}

KESİN KURAL: Sen sadece bilgi verir ve yönlendirirsin. Asla "rezervasyonunuz onaylandı", "kaydettim", "oluşturuldu" deme. Rezervasyonu sayfadaki form yapar. Kullanıcıyı forma yönlendir: "Sayfadaki formu doldurarak rezervasyon yapabilirsiniz."

SADECE bu işletme hakkında bilgi ver, başka işletmeler hakkında konuşma.`

    // ── 5. Claude'a sor ──────────────────────────────────────────────────
    try {
      const message = await callClaude(systemPrompt, messages)
      return NextResponse.json({ message })
    } catch (aiError) {
      console.error('[ai-chatbot]', aiError)
      return NextResponse.json({ message: 'Şu an yanıt veremiyorum, lütfen biraz sonra tekrar deneyin.' })
    }
  } catch (error) {
    console.error('[ai-chatbot]', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
