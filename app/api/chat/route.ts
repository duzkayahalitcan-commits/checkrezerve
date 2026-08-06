import { NextRequest, NextResponse } from 'next/server'
import { checkGreeting, searchFaq } from '@/lib/faq-search'
import { rateLimit } from '@/lib/rate-limit'
import { detectGibberish, enforceReservationApproval } from '@/lib/assistant-brain'
import { genderHint, extractNameFromHistory } from '@/lib/assistant-gender'
import { getSupabaseAdmin } from '@/lib/supabase'

async function callDeepSeek(systemPrompt: string, messages: {role: string, content: string}[]) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 512, temperature: 0.2, messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-6)] }),
  })
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  return (await res.json()).choices[0].message.content
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { prefix: 'chat', max: 30, windowMs: 60_000 })
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
    const slugify = (name: string): string =>
      name.toLowerCase()
        .replace(/[ş]/g, 's').replace(/[Ş]/g, 's')
        .replace(/[ı]/g, 'i').replace(/[İ]/g, 'i')
        .replace(/[ö]/g, 'o').replace(/[Ö]/g, 'o')
        .replace(/[ü]/g, 'u').replace(/[Ü]/g, 'u')
        .replace(/[ç]/g, 'c').replace(/[Ç]/g, 'c')
        .replace(/[ğ]/g, 'g').replace(/[Ğ]/g, 'g')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

    const isGeneral = !businessName || businessType === 'platform'
    const businessSlug = isGeneral ? '' : slugify(businessName)
    const businessUrl = isGeneral ? 'https://checkrezerve.com/tr/rezervasyon' : `https://checkrezerve.com/tr/rezervasyon/${businessSlug}`

    // Otorite Supabase: istemciden gelen businessType yalnızca hint; doğru değer
    // restaurants tablosundan çekilir. Eşleşen işletme bulunamazsa istemci değeri kullanılır.
    let authoritativeBusinessType = businessType as string | null | undefined
    if (!isGeneral && businessName) {
      try {
        const db = getSupabaseAdmin()
        const { data } = await db
          .from('restaurants')
          .select('business_type')
          .ilike('name', businessName)
          .limit(1)
          .maybeSingle()
        if (data?.business_type) {
          authoritativeBusinessType = data.business_type
        }
      } catch (e) {
        console.error('[chat] business_type doğrulama hatası:', e)
      }
    }
    const effectiveBusinessType = authoritativeBusinessType ?? 'platform'

    // Öğrenilen isimden cinsiyet ipucu (unisex isimlerde cinsiyetsiz hitap)
    const genderHintLine = (() => {
      const name = extractNameFromHistory((messages ?? []) as { role: string; content: string }[])
      return name ? genderHint(name) : null
    })()

    const systemPrompt = isGeneral
      ? `Sen CheckRezerve platformunun akıllı asistanısın. CheckRezerve, Türkiye'deki restoranlar, spalar, kuaförler, pilates stüdyoları ve klinikler için online rezervasyon platformudur.

PLATFORM BİLGİSİ:
- Ana URL: https://checkrezerve.com
- Rezervasyon sayfası: https://checkrezerve.com/tr/rezervasyon
- Bir işletmenin rezervasyon sayfası: https://checkrezerve.com/tr/rezervasyon/{işletme-slug}

SLUG KURALI: İşletme adını küçük harfe çevir, Türkçe karakterleri dönüştür (ş→s, ı→i, ö→o, ü→u, ç→c, ğ→g), boşlukları tire (-) yap.
Örnekler:
- "Ceviz Tuzla" → ceviz-tuzla → https://checkrezerve.com/tr/rezervasyon/ceviz-tuzla
- "Zeytin Kurtköy" → zeytin-kurtkoy → https://checkrezerve.com/tr/rezervasyon/zeytin-kurtkoy
- "Flow Pilates" → flow-pilates → https://checkrezerve.com/tr/rezervasyon/flow-pilates
- "Zen Spa" → zen-spa → https://checkrezerve.com/tr/rezervasyon/zen-spa

DAVRANIŞ KURALLARI:
1. Kullanıcı bir işletme adı söylediğinde HEMEN slug kuralıyla URL oluştur ve ver
2. "Link veremiyorum" veya "bağlantı gönderemiyorum" ASLA deme — her zaman link oluştur ve ver
3. Rezervasyon için şunu söyle: "Buradan rezervasyon yapabilirsiniz: [URL]"
4. Kullanıcı genel rezervasyon isterse: https://checkrezerve.com/tr/rezervasyon adresine yönlendir
5. Türkçe yanıt ver. Kısa ve net ol, gereksiz uzatma
6. Asla "rezervasyonunuz onaylandı", "kaydettim", "oluşturuldu" deme
7. Platformda olmayan konularda "Bu konuda yardımcı olamam, rezervasyon konularında yardımcı olmaktan memnuniyet duyarım" de`
      : `Sen ${businessName} adlı ${effectiveBusinessType} işletmesinin yapay zeka asistanısın.

İŞLETME BİLGİSİ:
- Ad: ${businessName}
- Tür: ${effectiveBusinessType} (Supabase'ten doğrulanmış; bu değeri kullan, asla varsayılan olarak 'restoran' veya başka bir tip alma)
- Rezervasyon sayfası: ${businessUrl}
- Müsait slotlar: ${JSON.stringify(availableSlots || [])}

HİTAP KURALI: Kullanıcı adını söylerse uygun hitabı kullan. ${genderHintLine ? genderHintLine : 'Cinsiyet belirsizse sadece isimle hitap et (Bey/Hanım kullanma).'}

DAVRANIŞ KURALLARI:
1. Kullanıcıya rezervasyon linkini her fırsatta ver: "${businessUrl}"
2. "Link veremiyorum" ASLA deme
3. Asla rezervasyon oluşturmazsın — kullanıcıyı sayfadaki forma yönlendir
4. "Rezervasyonunuz onaylandı", "kaydettim" gibi ifadeleri ASLA kullanma
5. Müsait slotları kullanıcıya söyle ama rezervasyonu sayfadan yapması gerektiğini belirt
6. Türkçe, kısa ve samimi cevaplar ver
7. Kullanıcı mesajı anlamsız/saçmaysa tahmin yürütme, aynen de: "Sizi tam anlayamadım, tekrar eder misiniz?"
8. Asla eksik bilgiyle veya onay almadan "oluşturuldu/onaylandı" deme
9. Bu bir ${effectiveBusinessType} olduğu için müşterinin amacını buna göre yorumla (${effectiveBusinessType === 'restaurant' || effectiveBusinessType === 'restoran' ? 'masa/rezervasyon, menü' : effectiveBusinessType === 'hairdresser' || effectiveBusinessType === 'kuaför' || effectiveBusinessType === 'barber' ? 'saç/berber randevusu' : effectiveBusinessType === 'spa' ? 'masaj/seans' : 'randevu/hizmet'}) ve buna göre yönlendir
10. YALNIZCA GERÇEK VERİYE DAYAN: Fiyat, hizmet, menü, müsaitlik gibi bilgileri asla uydurma/tahmin etme. Supabase'ten gelen müsait slotlar ve doğrulanmış işletme tipi dışında bilgin yoksa: "Bu konuda emin değilim, işletmeyle iletişime geçelim mi?" de. İşletme tipini asla varsayılan olarak alma; bir kuaför için masa/menü önerme.`
    try {
      const msgs = (messages ?? []) as {role: string, content: string}[]
      // Saçma / anlamsız mesaj koruması
      const lastUserMsg2 = [...msgs].reverse().find((m: {role: string, content: string}) => m.role === 'user')
      if (lastUserMsg2 && detectGibberish(lastUserMsg2.content)) {
        return NextResponse.json({ message: 'Sizi tam anlayamadım, tekrar eder misiniz?' })
      }
      let message = await callDeepSeek(systemPrompt, messages)
      // KRİTİK: "oluşturuldu" yalnızca tam bilgi + onay sonrası
      const override = enforceReservationApproval(msgs.map(m => ({ role: m.role as 'user'|'assistant', content: m.content })), message)
      if (override) message = override
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
