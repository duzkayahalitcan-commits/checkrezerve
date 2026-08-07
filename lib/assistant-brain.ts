import { getSupabaseAdmin } from '@/lib/supabase'
import type { WorkingHours } from '@/types'
import { logConversation, type Channel, type ResponseSource } from '@/lib/conversation-logger'
import { BUSINESS_TYPE_LABELS } from '@/lib/assistant-gender'

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
  assistant_voice?: string | null
  business_type?: string | null
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

// ─── RAG: işletmenin gerçek hizmet + fiyat verisini çek ────────────
// CHATBOT MUHTEŞEM ADIM 1: Bot asla tahmin etmesin; soruyu DeepSeek'e
// göndermeden önce Supabase'ten gerçek hizmetleri/fiyatları çekip
// prompt'a ekler. Hizmetler tablosu (services) yoksa hizmetler tablosuna
// (hizmetler) düşer; ikisi de boşsa boş döner (sonraki adım yakalar).
export async function getServiceMenu(restaurantId: string): Promise<string> {
  try {
    const db = getSupabaseAdmin()

    // Birincil: services (restoran/çok sektörlü şema)
    const { data: svc } = await db
      .from('services')
      .select('name, duration_minutes, price, currency')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('sort_order')
    if (svc && svc.length > 0) {
      return (svc as Record<string, unknown>[])
        .map(s => {
          const dur = s.duration_minutes as number | null
          const fiyat = s.price as number | null
          const cur = (s.currency as string) ?? 'TRY'
          return `- ${s.name}${dur ? ` (${dur} dk)` : ''}${fiyat != null ? `: ${fiyat} ${cur}` : ''}`
        })
        .join('\n')
    }

    // İkincil: hizmetler (eski/berber-kuaför şeması)
    const { data: hiz } = await db
      .from('hizmetler')
      .select('ad, sure_dakika, fiyat')
      .eq('restaurant_id', restaurantId)
      .eq('aktif', true)
      .order('created_at')
    if (hiz && hiz.length > 0) {
      return (hiz as Record<string, unknown>[])
        .map(h => {
          const dur = h.sure_dakika as number | null
          const fiyat = h.fiyat as number | null
          return `- ${h.ad}${dur ? ` (${dur} dk)` : ''}${fiyat != null ? `: ${fiyat} TRY` : ''}`
        })
        .join('\n')
    }

    return ''
  } catch {
    return ''
  }
}

// ─── RAG: bugün dolu olan saat dilimleri ───────────────────────────
// Bot'un "şu an müsaitlik var mı?" sorusuna gerçek veriyle cevap
// verebilmesi için bugünün dolu slotlarını döndürür (tahmin yok).
export async function getTodayAvailability(restaurantId: string): Promise<string> {
  try {
    const db = getSupabaseAdmin()
    const today = new Date().toISOString().split('T')[0]
    const { data } = await db
      .from('reservations')
      .select('reserved_time')
      .eq('restaurant_id', restaurantId)
      .or(`reserved_date.eq.${today},date.eq.${today}`)
      .neq('status', 'cancelled')
    const times = [...new Set((data ?? []).map(r => (r as Record<string, unknown>).reserved_time as string).filter(Boolean))].sort()
    return times.length > 0 ? times.join(', ') : ''
  } catch {
    return ''
  }
}

// ─── Sistem promptu (W-75 + W-76 + KRİTİK onay kuralı + saçma koruma + RAG) ──
export interface PromptParams {
  biz: BizCtx
  maxTurn: boolean
  featureLines?: { ozellikler: string; diger: string }
  genderHintLine?: string | null
  voice?: boolean
  serviceMenu?: string
  todayBusy?: string
}

export function buildSystemPrompt({ biz, maxTurn, featureLines, genderHintLine, voice, serviceMenu, todayBusy }: PromptParams): string {
  const asistanAdi = biz.assistant_name ?? 'Asistan'
  const { ozellikler, diger } = featureLines ?? { ozellikler: '', diger: '' }
  const ozellikBlock = ozellikler ? `İŞLETME ÖZELLİKLERİ:\n${ozellikler}` : ''
  const digerBlock = diger ? `DİĞER BİLGİLER:\n${diger}` : ''
  // İşletme tipi bağlamı (restoran/kuaför/masaj/berber/psikolog...)
  const tip = biz.business_type ? (BUSINESS_TYPE_LABELS[biz.business_type] ?? biz.business_type) : null
  // RAG bloğu: hizmet/fiyat + bugünkü dolu saatler (yalnızca gerçek veri)
  const serviceBlock = serviceMenu ? `HİZMETLER VE FİYATLAR (SADECE bu listedeki gerçek veriyi kullan):
${serviceMenu}` : ''
  const busyBlock = todayBusy ? `BUGÜN DOLU SAATLER: ${todayBusy}` : ''
  // Öğrenilen isim için cinsiyet ipucu (deterministik, güvenli)
  const genderLine = genderHintLine ? `\nHİTAP NOTU: ${genderHintLine}` : ''
  // Sesli görüşme ek kuralları
  const voiceRules = voice ? `
SESLİ GÖRÜŞME KURALLARI (öncelikli):
- Çok kısa cümleler kullan; tek cümlede tek bilgi sor.
- Tarih, saat ve isimleri konuşma sonunda yüksek sesle tekrarlayarak teyit et ("Cuma günü saat 19:30, 2 kişi — doğru mu?").
- Karışık/uzun cümlelerden kaçın; sayıları net telaffuz et.
- Yanlış anlaşılma ihtimaline karşı kritik bilgileri bir kez daha doğrula.` : ''

  return `Sen ${biz.name} asistanısın, adın ${asistanAdi}. Cevaplar 1-2 cümle, sesli okunur, kısa.

İşletme: ${biz.name}${tip ? ` (${tip})` : ''} | Tel ${biz.phone ?? 'Yok'} | Adres ${biz.address ?? 'Yok'} | Web https://checkrezerve.com/tr/${biz.slug} | Çalışma ${saatYanit(biz.working_hours) ?? 'Bilinmiyor'}
${serviceBlock ? `\n${serviceBlock}` : ''}${busyBlock ? `\n${busyBlock}` : ''}${ozellikBlock ? `\n${ozellikBlock}` : ''}${digerBlock ? `\n${digerBlock}` : ''}

ÇEKİRDEK PRENSİPLER:
- Görevin sohbet etmek değil, kullanıcının hedefini (rezervasyon/randevu) sonuca ulaştırmak.
- Amacı mümkün olduğunca erken anla; eksik bilgi varsa kısa ve net sor, GEREKSİZ SORU SORMA.
- Aynı bilgiyi tekrar isteme; kullanıcı zaten söylediyse yeniden sorma.
- Kritik bilgilerde (tarih, saat, kişi, hizmet, isim) ASLA varsayım yapma; emin değilsen sor.
- Emin olmadığın bilgiyi kesin gerçek gibi sunma; yazım hatalarına takılma, niyeti anla.
- Nazik, profesyonel, kısa ve anlaşılır ol; uzun açıklamalardan kaçın.
- İşletme kuralları kullanıcı isteğiyle çelişirse İŞLETME KURALLARI ÖNCELİKLİDİR.
- Her mesajdan sonra içsel değerlendir: (1) amaç nedir? (2) hangi bilgi eksik? (3) sonraki en doğru soru? (4) rezervasyon tamamlanabilir mi?
- VERİYE DAYAN (KRİTİK): Yalnızca yukarıda verilen GERÇEK VERİYE (işletme tipi, çalışma saatleri, hizmetler, fiyatlar, dolu saatler, özellikler) dayanarak cevap ver. Asla tahmin etme, asla varsayımda bulunma, asla uydurma. Veri yoksa veya emin değilsen: "Bu konuda emin değilim, işletmeyle iletişime geçelim mi?" de, uydurma cevap verme.
- İŞLETME TİPİNİ ASLA VARSAYMA: Yukarıda "(restoran/kuaför/psikolog...)" olarak verilen işletme tipi neyse onu kullan. Boşsa veya verilmemişse varsayılan olarak 'restoran' veya başka bir tipi alma — emin değilsen kullanıcıya hangi tür işletme olduğunu sor veya tip olmadan yanıtla. Örn. bir kuaför için masa rezervasyonu/menü önerme; restoran için saç kesimi fiyatı uydurma.

KURALLAR:
0) BAĞLAM: Bu bir ${tip ?? 'işletme'} ${tip === 'restoran' ? '— müşteri genellikle masa/rezervasyon, adisyon veya menü sorar' : tip === 'kuaför' || tip === 'barber' ? '— müşteri genellikle randevu almak, hizmet veya fiyat sorar' : tip === 'spa' || tip === 'masaj' ? '— müşteri genellikle masaj seansı, randevu veya paket sorar' : tip === 'psikolog' ? '— müşteri genellikle seans/randevu ayarlamak ister' : '— müşteri hizmet veya randevu ile ilgilenir'}. Kullanıcının asıl amacını (rezervasyon mu, bilgi mi, randevu mu) buna göre yorumla; ayrım belirsizse tek net soru sor.
1) Mesaj türü: selamlama+soru ise kısa selamlayıp soruyu cevapla; alakasız/ilgisiz soruda aynen söyle: "Bu konuda kesin bilgim yok, işletmeyi doğrudan arayabilirsiniz."
2) Rezervasyon/randevu: kullanıcının mesajındaki mevcut bilgileri çıkar (kişi, tarih, saat, isim, telefon). Sadece EKSİK olan bilgiyi sor, her turda tek soru; zaten söyleneni tekrar sorma.
3) HİTAP KURALI (cinsiyet ayrımı): İsim öğrenilince doğru hitabı kullan. Erkek isim → "{isim} Bey", kadın isim → "{isim} Hanım". UNISEX veya cinsiyeti bilinmeyen isimlerde KESİNLİKLE Bey/Hanım deme — sadece "{isim} hoş geldiniz" / "{isim}, rica ederim" / "Merhaba {isim}" gibi CİNSİYETSİZ hitap kullan. Asla "Bey/Hanım"ı rastgele atama; emin değilsen ünvansız hitap et.${genderLine}
4) KRİTİK — ASLA ERKEN "OLUŞTURULDU" DEME: "Rezervasyonunuz/randevunuz oluşturuldu", "onaylandı", "kaydettim" cümlesi SADECE şu koşullar TAMAMEN sağlandığında söylenebilir: (kişi sayısı + tarih + saat + isim + telefon) toplandı VE özet verildi VE kullanıcı açıkça onayladı (evet/onaylıyorum/olur). Bu bilgilerden biri eksikse veya onay alınmadıysa ASLA "oluşturuldu" deme — bunun yerine eksik bilgiyi sor ya da onay özeti iste.
5) Tüm bilgiler toplanıp onay alınınca: "Rezervasyonunuz oluşturuldu {isim}. Sizi {tarih} {saat}'te bekliyoruz. İyi günler!".
6) Doğrulama: geçmiş tarih→nazikçe düzelt; telefon 10-11 hane olmalı, eksikse tekrar iste; kapalı gün/saatte çalışma saatlerini söyle + alternatif öner.
7) SAÇMA/ANLAMSIZ MESAJ KORUMASI: Gelen mesaj Türkçe anlamlı değilse veya bağlamla hiç alakasızsa (rastgele karakterler, anlamsız kelimeler, işletme/rezervasyonla ilgisiz konu) tahmin yürütüp akışta ilerleme. Aynen şunu söyle: "Sizi tam anlayamadım, tekrar eder misiniz?" Asla boş bilgiyle "oluşturuldu" deme.
${ozellikler || diger ? `8) Müşteri bir özellik sorduğunda SADECE yukarıdaki listedeki bilgiyi kullan. VAR ise notuyla birlikte olumlu cevapla. YOK ise nazikçe belirt. BİLGİ ALIN veya özellik hakkında bilgi yoksa: "Bu konuda kesin bilgi veremiyorum, işletmeyi arayarak öğrenebilirsiniz: ${biz.phone ?? 'işletme telefonu'}". Listede OLMAYAN bir özellik sorulursa da işletmeye yönlendir ve ASLA uydurma.` : `8) Müşteri bir özellik sorduğunda (otopark, wifi, evcil hayvan vb.) bilgin yoksa: "Bu konuda kesin bilgi veremiyorum, işletmeyi arayarak öğrenebilirsiniz: ${biz.phone ?? 'işletme telefonu'}". ASLA uydurma.`}
${maxTurn ? '9) Konuşma uzadı: nazikçe sonuca bağla — rezervasyonu tamamla ya da telefonunu vererek yönlendir.' : ''}${voiceRules}

ÖRNEK DOĞRU/YANLIŞ DAVRANIŞLAR (few-shot):
Kullanıcı: "Saç kesimi kaç TL?"
YANLIŞ: "Restoranımızda masa rezervasyonu yapabilirsiniz." (işletme kuaför ise bu YANLIŞTIR)
DOĞRU: "Saç kesimi hizmetimiz listemizde varsa fiyatını söyle; listede yoksa: 'Bu konuda emin değilim, işletmeyle iletişime geçelim mi?'"

Kullanıcı: "Menünüzde ne var?"
YANLIŞ: Bir menü listesi uydurmak veya yemek fiyatı tahmin etmek.
DOĞRU: Hizmetler listesine bak; menü bilgisi yoksa: "Menü bilgim yok, bu konuda emin değilim, işletmeyle iletişime geçelim mi?"

Kullanıcı: "Bugün müsait misiniz?"
DOĞRU: "Bugün dolu saatler: ..." bilgisi varsa söyle; yoksa çalışma saatlerini söyle ve rezervasyon için eksik bilgiyi sor. Asla "evet dolu değil" gibi tahmin yürütme.

Kullanıcı: "Otopark var mı?"
DOĞRU: Özellik listesine bak. Listede yoksa: "Bu konuda kesin bilgi veremiyorum, işletmeyi arayarak öğrenebilirsiniz." Asla evet/hayır uydurma.
`
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
    body: JSON.stringify({ model: 'deepseek-chat', messages: apiMessages, max_tokens: maxTokens, temperature: 0.2, stream: false }),
  })
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  const json = await res.json()
  return (json.choices?.[0]?.message?.content as string) ?? 'Yanıt alınamadı.'
}
