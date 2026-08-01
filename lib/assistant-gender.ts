// ============================================================
// W-79: Asistan Hitap Zekası — Cinsiyet tespiti + işletme tipi
// Türkçe isimden cinsiyet tahmini (Bey/Hanım) ve unisex çözümü.
// /api/ai-assistant/chat, /api/ai-chatbot, /api/chat kullanır.
// ============================================================

export type GenderGuess = 'male' | 'female' | 'unisex' | 'unknown'

// ─── Türkçe isim sözlükleri (yaygın isimler) ─────────────────
// Not: Bu listeler kapsamlı değildir; bilinmeyen isim → 'unknown'
// döner ve sistem cinsiyetsiz hitap kullanır (güvenli varsayılan).
export const MALE_NAMES = new Set([
  'ahmet','mehmet','mustafa','halit','halil','emre','mert','burak','can','kaan',
  'onur','serkan','volkan','tarkan','hakan','berk','berkay','efe','yusuf','omer',
  'ömer','ali','veli','osman','hüseyin','hüseyin','ibrahim','ismail','ismail',
  'murat','murathan','kemal','atilla','gökhan','göktürk','tolga','turgay','ugur',
  'uğur','barış','baris','tarik','tarık','selim','celal','necip','kerem',
  'adem','cihan','cüneyt','cuneyt','eren','fırat','firat','hüseyin','kaan',
  'muhammet','ömer','ramazan','salih','sami','serdar','tuncay','umut','zeki',
  'bülent','bulent','cengiz','davut','ferhat','görkem','gorkem','harun','ismet',
  'kadir','levent','mahmut','nihat','oğuz','oguz','sabri','şenol','senol',
])

export const FEMALE_NAMES = new Set([
  'ayşe','ayse','fatma','zeynep','elif','merve','esra','büşra','busra','hatice',
  'emine','seda','ceren','selin','irem','melis','ece','gizem','hande',
  'öznur','oznur','şeyma','seyma','rabia','kübra','kubra','nur','nuran','sevgi',
  'gül','gul','gülsüm','gulsüm','meryem','yaren','derya','aslı','asli','pınar',
  'pinar','özlem','ozlem','damla','sude','ecrin','zümra','zumra','melike',
  'sümeyye','sumeyye','beyza','mihriban','tuğçe','tugce','nisa','miray','leyla',
  'duygu','demet','gamze','hilal','ipek','jale','kader','melda','nazlı','nazli',
  'özge','ozge','şule','sule','tuğba','tugba','zeliha','buse',
  'cansu','ceren','ece','elvan','eslem','feyza','gülşah','gulsah','hülya','hulya',
])

export const UNISEX_NAMES = new Set([
  'deniz','duru','aydın','aydin','alp','güneş','gunes','yağmur','yagmur',
  'umut','ege','kuzey','melodi','yıldız','yildiz','sahra','berfin','azra',
  'nehir','ada','tuna','evren','baran','çağan','cagan','dila','idil','lara',
  'mira','naz','seray','şirin','sirin','alaz','azur','bengü','bengu','defne',
  'derin','dora','hira','ila','lina','masal','nil','nisa','ruya','rüya','vera',
])

// ─── İşletme tipi → Türkçe etiket + hitap bağlamı ────────────
export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: 'restoran',
  barber: 'berber',
  hairdresser: 'kuaför',
  psychologist: 'psikolog',
  spa: 'spa ve masaj salonu',
  beauty_salon: 'güzellik salonu',
  dentist: 'diş hekimi',
  fitness: 'fitness salonu',
  veterinary: 'veteriner',
  pilates: 'pilates stüdyosu',
  chiropractor: 'kiropraktör',
  other: 'işletme',
}

// ─── İsim cinsiyet tespiti ────────────────────────────────────
// Bir ismi alır, erkek/kadın/unisex/unknown döndürür.
export function guessGender(name: string): GenderGuess {
  const clean = name.trim().toLowerCase().replace(/[^a-zçğıöşü0-9]/gi, '')
  if (!clean) return 'unknown'
  // Son ekten ipucu: "a/ye" bitenler çoğu kadın, ama güvenli değil
  if (UNISEX_NAMES.has(clean)) return 'unisex'
  if (FEMALE_NAMES.has(clean)) return 'female'
  if (MALE_NAMES.has(clean)) return 'male'
  // Bilinmeyen isim: güvenli varsayılan → unisex (cinsiyet varsayma)
  return 'unknown'
}

// ─── Hitap üretimi ────────────────────────────────────────────
// Cinsiyete göre Bey/Hanım; unisex/unknown için cinsiyetsiz hitap.
// Cinsiyetsiz: isim + "hoş geldiniz" / "rica ederim" (ünvansız).
export function buildAddress(name: string): string {
  const g = guessGender(name)
  if (g === 'male') return `${name} Bey`
  if (g === 'female') return `${name} Hanım`
  return name // unisex / unknown → sadece isim (en güvenli, en doğal)
}

// İsim + cinsiyet hakkında model için ipucu üret (prompt'a eklenir)
export function genderHint(name: string): string | null {
  const g = guessGender(name)
  if (g === 'male') return `${name} erkek ismidir; "${name} Bey" diye hitap et`
  if (g === 'female') return `${name} kadın ismidir; "${name} Hanım" diye hitap et`
  if (g === 'unisex') return `${name} unisex bir isimdir; cinsiyet belirtme, sadece "${name}" diye hitap et`
  return null
}

// Konuşma geçmişinden kullanıcının adını çıkar (deterministik)
// "Adım Halit", "benim adım Ayşe", "Halit" gibi ifadeleri yakalar.
export function extractNameFromHistory(messages: { role: string; content: string }[]): string | null {
  const namePatterns: RegExp[] = [
    /(?:adım|ismim|benim adım|benim ismim)\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)/u,
    /ben\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+(?:bey|hanım)/u,
    /([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+(?:bey|hanım)/u,
    /benim\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+(?:adım|ismim)/u,
  ]
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== 'user') continue
    for (const re of namePatterns) {
      const match = m.content.match(re)
      if (match?.[1]) return match[1]
    }
    // Düz tek isim (başında selamlama yoksa) — güvenli değil, atla
  }
  return null
}
