import { NextRequest, NextResponse } from 'next/server'
import { checkGreeting, searchFaq } from '@/lib/faq-search'
import { rateLimit } from '@/lib/rate-limit'

async function callDeepSeek(systemPrompt: string, messages: {role: string, content: string}[]) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 512, messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-6)] }),
  })
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  return (await res.json()).choices[0].message.content
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { prefix: 'chat', max: 30, windowMs: 60_000 })
  if (limited) return limited
  try {
    const { messages, businessName, businessType, availableSlots } = await request.json()
    const lastUserMsg = [...(messages ?? [])].reverse().find((m: {role: string, content: string}) => m.role === 'user')
    if (lastUserMsg) {
      const greeting = checkGreeting(lastUserMsg.content)
      if (greeting) return NextResponse.json({ message: greeting })
      const faqAnswer = await searchFaq(lastUserMsg.content)
      if (faqAnswer) return NextResponse.json({ message: faqAnswer })
    }
    const isGeneral = !businessName || businessType === 'platform'
    const systemPrompt = isGeneral
      ? `Sen CheckRezerve'in yapay zeka asistanısın. Kullanıcılara Türkçe olarak yardım ediyorsun. Kısa, samimi ve net cevaplar ver.

KESİN KURAL 1: SADECE CheckRezerve platformundaki gerçek işletmeleri öner. Hiçbir zaman platformda olmayan bir işletme adı uydurma, hayal etme veya önerme. Emin değilsen "Bunu platformumuzda arayarak bulabilirsiniz" de.

KESİN KURAL 2: Asla rezervasyon oluşturduğunu, kaydettiğini veya onayladığını söyleme. "Rezervasyonunuz onaylandı", "rezervasyon oluşturuldu", "kaydettim" gibi ifadeleri ASLA kullanma. Rezervasyon işlemleri sayfadaki form üzerinden yapılır. Kullanıcıya "Sayfadaki formu doldurarak rezervasyon yapabilirsiniz" diye yönlendir.`
      : `Sen ${businessName} adlı ${businessType} işletmesinin yapay zeka asistanısın. Müsait slotlar: ${JSON.stringify(availableSlots || [])}.

KESİN KURAL: Sen sadece bilgi toplar ve yönlendirirsin, asla rezervasyon oluşturmazsın. Gerçek rezervasyon kullanıcı tarafından sayfadaki form aracılığıyla yapılır. ASLA "rezervasyonunuz onaylandı", "rezervasyon oluşturuldu", "kaydettim", "tamamlandı" deme. Bunun yerine bilgileri topla ve şöyle yönlendir: "Bilgilerinizi aldım! Şimdi sayfadaki rezervasyon formunu doldurarak rezervasyonunuzu tamamlayabilirsiniz."`
    try {
      const message = await callDeepSeek(systemPrompt, messages)
      return NextResponse.json({ message })
    } catch (aiError) {
      console.error('[chat/ai]', aiError)
      return NextResponse.json({ message: 'Şu an yapay zeka asistanına ulaşılamıyor. Lütfen bizi doğrudan arayın.' })
    }
  } catch (error) {
    console.error('[chat]', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
