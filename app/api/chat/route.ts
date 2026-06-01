import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkGreeting, searchFaq } from '@/lib/faq-search'
import { rateLimit } from '@/lib/rate-limit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { prefix: 'chat', max: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { messages, businessName, businessType, availableSlots } = await request.json()

    // Son kullanıcı mesajını bul
    const lastUserMsg = [...(messages ?? [])].reverse().find(
      (m: { role: string; content: string }) => m.role === 'user'
    )
    if (lastUserMsg) {
      // Kademe 0: Selamlama ($0)
      const greeting = checkGreeting(lastUserMsg.content)
      if (greeting) return NextResponse.json({ message: greeting })

      // Kademe 1-2: FAQ arama
      const faqAnswer = await searchFaq(lastUserMsg.content)
      if (faqAnswer) return NextResponse.json({ message: faqAnswer })
    }

    const isGeneral = !businessName || businessType === 'platform'
    const systemPrompt = isGeneral
      ? `Sen CheckRezerve'in yapay zeka asistanısın. CheckRezerve, restoran, kuaför, spa, psikolog, klinik ve daha pek çok işletme için online rezervasyon platformudur. Kullanıcılara Türkçe olarak yardım ediyorsun. Görevlerin: hangi tür işletmelerin olduğunu açıklamak, /rezervasyon sayfasından işletme aratmak için yönlendirmek, platform hakkında soruları cevaplamak. Kısa, samimi ve net cevaplar ver.`
      : `Sen ${businessName} adlı ${businessType} işletmesinin yapay zeka asistanısın. Müşterilere Türkçe olarak yardım ediyorsun. Görevlerin: randevu ayarlamak, sorulara cevap vermek, işletme hakkında bilgi vermek. Müsait randevu slotları: ${JSON.stringify(availableSlots || [])}. Kısa ve net cevaplar ver. Randevu için mutlaka isim, tarih ve saat bilgisi al.`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      })

      return NextResponse.json({
        message: response.content[0].type === 'text' ? response.content[0].text : '',
      })
    } catch (aiError) {
      console.error('[chat/ai]', aiError)
      return NextResponse.json({
        message: 'Şu an yapay zeka asistanına ulaşılamıyor. Rezervasyon için lütfen bizi doğrudan arayın veya formu kullanarak rezervasyon yapın.',
      })
    }
  } catch (error) {
    console.error('[chat]', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
