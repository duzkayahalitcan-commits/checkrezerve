import { getSupabaseAdmin } from '@/lib/supabase'
import type { WorkingHours } from '@/types'
import { logConversation, type Channel, type ResponseSource } from '@/lib/conversation-logger'

// ============================================================
// W-78: Ortak Asistan Beyni
// /api/ai-assistant/chat (web voice), /api/ai-chatbot (web chat),
// /api/chat (mobil uygulama) bu modülü kullanır.
// Tek yerden güncellenir: bypass, akış, onay kuralı, validasyon,
// W-76 özellik matrisi enjeksiyonu, konuşma kaydı.
// ============================================================

export interface BizCtx {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  working_hours: WorkingHours | null
  assistant_name: string | null
}

export interface ChatMsg { role: 'user' | 'assistant'; content: string }

// ─── Metin normalizasyonu ─────────────────────────────────────────
export function normalizeText(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim()
}

// ─── Çalışma saatleri özeti ───────────────────────────────────────
export function saatYanit(wh: WorkingHours | null): string | null {
  if (!wh) return null
  const gunler: Record<string, string> = {
    monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba',
    thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar',
  }
  const acikGunler: string[] = []
  for (const [day, h] of Object.entries(wh)) {
    const wd = h as { open?: boolean; start?: string; end?: string }
    if (wd.open) acikGunler.push(`${gunler[day] ?? day} ${wd.start ?? '?'}-${wd.end ?? '?'}`)
  }
  if (acikGunler.length === 0) return 'kapalı'
  return acikGunler.map(g => `• ${g}`).join('; ')
}

// ─── Sıfır token bypass (selamlama / veda) ────────────────────────
const GREETINGS = new Set(['merhaba', 'merhabalar', 'selam', 'iyi günler', 'iyi akşamlar', 'kolay gelsin', 'hoş geldiniz', 'alo'])
const FAREWELLS = new Set(['teşekkürler', 'teşekkür ederim', 'sağol', 'sağolun', 'görüşürüz', 'iyi günler dilerim', 'hoşça kal', 'hoşçakal', 'iyi akşamlar dilerim', 'teşekkürler iyi günler'])
const FAREWELL_SUFFIX = /(görüşürüz|hoşça kal|hoşçakal|iyi günler dilerim|iyi akşamlar dilerim)$/
const QUESTION_WORDS = /nasıl|kaç|var mı|yapabilir|soru|rezervasyon|saat|fiyat|adres|telefon|nerede|açık mı/

export function isFarewell(norm: string): boolean {
  if (FAREWELLS.has(norm)) return true
  if (FAREWELL_SUFFIX.test(norm)) return true
  return /^(teşekkür|teşekkürler|sağol|sağolun)/.test(norm) && !QUESTION_WORDS.test(norm)
}
export function isGreeting(norm: string): boolean {
  if (GREETINGS.has(norm)) return true
  return /^(merhaba|merhabalar|selam|alo)/.test(norm) && !QUESTION_WORDS.test(norm)
}

// ─── W-76 özellik matrisi enjeksiyonu ─────────────────────────────
const DURUM_ETIKET: Record<string, string> = { var: 'VAR', yok: 'YOK', bilgi_al: 'BİLGİ ALIN' }

export async function getFeatures(restaurantId: string): Promise<{ ozellikler: string; diger: string }> {
  try {
    const db = getSupabaseAdmin()
    const { data } = await db
      .from('isletme_ozellikleri')
      .select('ozellik_kodu, durum, notu')
      .eq('restaurant_id', restaurantId)
    if (!data || data.length === 0) return { ozellikler: '', diger: '' }

    const rows = data as Record<string, unknown>[]
    const tanimKodlari = rows.filter(r => !String(r.ozellik_kodu).startsWith('genel_bilgi_')).map(r => r.ozellik_kodu as string)
    const baslikMap = new Map<string, string>()
    if (tanimKodlari.length > 0) {
      const { data: tanimlar } = await db.from('ozellik_tanimlari').select('kod, baslik').in('kod', tanimKodlari)
      ;(tanimlar ?? []).forEach((t: Record<string, unknown>) => baslikMap.set(t.kod as string, t.baslik as string))
    }

    const ozellikSatirlari: string[] = []
    const digerSatirlari: string[] = []
    for (const r of rows) {
      const kod = r.ozellik_kodu as string
      const durum = (r.durum as string) ?? 'bilgi_al'
      const notu = (r.notu as string) ?? ''
      if (kod.startsWith('genel_bilgi_')) { if (notu) digerSatirlari.push(`- ${notu}`); continue }
      if (durum === 'bilgi_al' && !notu) continue
      const baslik = baslikMap.get(kod) ?? kod
      const etiket = DURUM_ETIKET[durum] ?? 'BİLGİ ALIN'
      ozellikSatirlari.push(`- ${baslik}: ${etiket}${notu ? ` (${notu})` : ''}`)
    }
    return { ozellikler: ozellikSatirlari.join('\n'), diger: digerSatirlari.join('\n') }
  } catch {
    return { ozellikler: '', diger: '' }
  }
}

// ─── Sistem promptu (W-75 + W-76 + KRİTİK onay kuralı + saçma koruma) ──
export interface PromptParams {
  biz: BizCtx
  maxTurn: boolean
  featureLines?: { ozellikler: string; diger: string }
}

export function buildSystemPrompt({ biz, maxTurn, featureLines }: PromptParams): string {
  const asistanAdi = biz.assistant_name ?? 'Asistan'
  const { ozellikler, diger } = featureLines ?? { ozellikler: '', diger: '' }
  const ozellikBlock = ozellikler ? `İŞLETME ÖZELLİKLERİ:\n${ozellikler}` : ''
  const digerBlock = diger ? `DİĞER BİLGİLER:\n${diger}` : ''

  return `Sen ${biz.name} asistanısın, adın ${asistanAdi}. Cevaplar 1-2 cümle, sesli okunur, kısa.

İşletme: ${biz.name} | Tel ${biz.phone ?? 'Yok'} | Adres ${biz.address ?? 'Yok'} | Web https://checkrezerve.com/tr/${biz.slug} | Çalışma ${saatYanit(biz.working_hours) ?? 'Bilinmiyor'}
${ozellikBlock ? `\n${ozellikBlock}` : ''}${digerBlock ? `\n${digerBlock}` : ''}

KURALLAR:
1) Mesaj türü: selamlama+soru ise kısa selamlayıp soruyu cevapla; alakasız/ilgisiz soruda aynen söyle: "Bu konuda kesin bilgim yok, işletmeyi doğrudan arayabilirsiniz."
2) Rezervasyon: kullanıcının mesajındaki mevcut bilgileri çıkar (kişi, tarih, saat, isim, telefon). Sadece EKSİK olan bilgiyi sor, her turda tek soru; zaten söyleneni tekrar sorma.
3) İsim öğrenilince cevap başında "{İsim} Bey/Hanım" diye hitap et (erkek=Bey, kadın=Hanım; emin değilsen sadece isim). Ör: "Halit Bey, rezervasyonunuzu oluşturuyorum." Hitap doğal, her cümlede değil, cevap başında/onayda.
4) KRİTİK — ASLA ERKEN "OLUŞTURULDU" DEME: "Rezervasyonunuz oluşturuldu", "onaylandı", "kaydettim" cümlesi SADECE şu koşullar TAMAMEN sağlandığında söylenebilir: (kişi sayısı + tarih + saat + isim + telefon) toplandı VE özet verildi VE kullanıcı açıkça onayladı (evet/onaylıyorum/olur). Bu bilgilerden biri eksikse veya onay alınmadıysa ASLA "oluşturuldu" deme — bunun yerine eksik bilgiyi sor ya da onay özeti iste: "{isim} Bey/Hanım, özetliyorum: {tarih} {saat}, {kişi} kişilik rezervasyon. Onaylıyor musunuz?"
5) Tüm bilgiler toplanıp onay alınınca: "Rezervasyonunuz oluşturuldu {isim} Bey/Hanım. Sizi {tarih} {saat}'te bekliyoruz. İyi günler!".
6) Doğrulama: geçmiş tarih→nazikçe düzelt; telefon 10-11 hane olmalı, eksikse tekrar iste; kapalı gün/saatte çalışma saatlerini söyle + alternatif öner.
7) SAÇMA/ANLAMSIZ MESAJ KORUMASI: Gelen mesaj Türkçe anlamlı değilse veya bağlamla hiç alakasızsa (rastgele karakterler, anlamsız kelimeler, işletme/rezervasyonla ilgisiz konu) tahmin yürütüp akışta ilerleme. Aynen şunu söyle: "Sizi tam anlayamadım, tekrar eder misiniz?" Asla boş bilgiyle "oluşturuldu" deme.
${ozellikler || diger ? `8) Müşteri bir özellik sorduğunda SADECE yukarıdaki listedeki bilgiyi kullan. VAR ise notuyla birlikte olumlu cevapla. YOK ise nazikçe belirt. BİLGİ ALIN veya özellik hakkında bilgi yoksa: "Bu konuda kesin bilgi veremiyorum, işletmeyi arayarak öğrenebilirsiniz: ${biz.phone ?? 'işletme telefonu'}". Listede OLMAYAN bir özellik sorulursa da işletmeye yönlendir ve ASLA uydurma.` : `8) Müşteri bir özellik sorduğunda (otopark, wifi, evcil hayvan vb.) bilgin yoksa: "Bu konuda kesin bilgi veremiyorum, işletmeyi arayarak öğrenebilirsiniz: ${biz.phone ?? 'işletme telefonu'}". ASLA uydurma.`}
${maxTurn ? '9) Konuşma uzadı: nazikçe sonuca bağla — rezervasyonu tamamla ya da telefonunu vererek yönlendir.' : ''}`
}

// ─── Saçma / anlamsız mesaj tespiti ───────────────────────────────
export function detectGibberish(raw: string): boolean {
  const norm = normalizeText(raw)
  if (!norm) return true
  const letters = norm.replace(/[^a-zçğıöşü0-9]/gi, '')
  if (letters.length < 2) return true // tek/iki harf
  // Aynı harfin 5+ tekrarı → saçma
  if (/(.)\1{4,}/.test(norm)) return true
  // Az farklı harf (≤2) + uzun → saçma (örn "zzz zzzz zzzz")
  const distinct = new Set(letters.split('')).size
  if (distinct <= 2 && letters.length >= 5) return true
  // Uzun ve hiç sesli harf yok → anlamsız gürültü
  const vowelCount = (norm.match(/[aeiouöüı]/g) ?? []).length
  if (letters.length >= 6 && vowelCount === 0) return true
  // Sayısal/özel karakter ağırlıklı ama kelime yok
  const words = norm.split(' ')
  const letterWords = words.filter(w => /[a-zçğıöşü]/i.test(w))
  if (letterWords.length === 0 && norm.replace(/\d/g, '').trim().length > 0) return true
  return false
}

// ─── KRİTİK: "oluşturuldu" yalnızca tam bilgi + onay sonrası ──────
export function enforceReservationApproval(history: ChatMsg[], reply: string): string | null {
  if (!/oluşturuldu|onaylandı|kaydettim/i.test(reply)) return null

  const userTexts = history.filter(m => m.role === 'user').map(m => m.content.toLowerCase()).join(' ')
  const hasCount = /(\d+)\s*kişi|kişilik/.test(userTexts)
  const hasDate = /(yarın|bugün|haftaya|önümüzdeki|pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar|ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık|\d{1,2}[\.\/\-]\d{1,2}|\d{1,2}\s+\w+)/.test(userTexts)
  const hasTime = /(\d{1,2}[:.]\d{2}|\bsaat\s*\d{1,2}|\b(?:sabah|öğle|öğlen|akşam|gece)\s*\d{1,2}|\b\d{1,2}\s*(?:'da|'de|de|da|gibi)\b)/.test(userTexts)
  const hasName = /(adım|ismim|benim adım|ben\s+\w+\s+(?:bey|hanım)| adı )/i.test(userTexts)
  const lastUser = ([...history].reverse().find(m => m.role === 'user')?.content.toLowerCase() ?? '')
  const approved = /(evet|onaylıyorum|olur|tamam|onaylıyor)/.test(lastUser)

  // Rezervasyon için kişi + isim + onay şart; tarih VE saat ikisi de toplanmış olmalı.
  if (!(hasCount && hasName && approved && hasDate && hasTime)) {
    return 'Rezervasyonunuzu oluşturmadan önce bilgileri doğrulamam gerekiyor. Kaç kişilik, hangi tarihte ve saat kaçta rezervasyon istersiniz?'
  }
  return null
}

// ─── Konuşma kaydı ────────────────────────────────────────────────
export interface LogParams {
  restaurant_id: string
  session_id?: string
  turn_number?: number
  channel?: Channel
  user_message: string
  assistant_response: string
  response_source?: ResponseSource
  is_unknown?: boolean
}
export function logTurn(p: LogParams) {
  logConversation({
    restaurant_id: p.restaurant_id,
    session_id: p.session_id ?? '',
    turn_number: p.turn_number ?? 1,
    channel: p.channel ?? 'web_chat',
    user_message: p.user_message,
    assistant_response: p.assistant_response,
    response_source: p.response_source ?? 'ai',
    is_unknown: p.is_unknown ?? false,
  })
}

// ─── DeepSeek çağrısı ─────────────────────────────────────────────
export async function callDeepSeek(systemPrompt: string, messages: ChatMsg[], maxTokens = 150): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) throw new Error('DEEPSEEK_API_KEY not configured')
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({ role: m.role, content: m.content })).slice(-10),
  ]
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages: apiMessages, max_tokens: maxTokens, temperature: 0.7, stream: false }),
  })
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  const json = await res.json()
  return (json.choices?.[0]?.message?.content as string) ?? 'Yanıt alınamadı.'
}
