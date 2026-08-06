import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────
// CHATBOT MUHTEŞEM ADIM 5 — Haftalık log analizi (manuel)
// Son 7 günün chatbot konuşma loglarını (conversations tablosu)
// çeker, DeepSeek'e özetletir ve "bot hangi konularda zorlandı,
// hangi sorular yanlış anlaşıldı" raporu üretir.
//
// GET /api/admin/chatbot-analiz?days=7&restaurant_id=<uuid>
//   - days: varsayılan 7 (1-30 arası)
//   - restaurant_id: opsiyonel; verilirse tek işletme, verilmezse tümü
//   - Çıktı: { konusma_sayisi, analiz_edilen, rapor }
// Manüel tetiklenir; cron/otomatik zamanlama kurulmaz.
// ─────────────────────────────────────────────────────────────
async function checkAdmin() {
  const adminSecret   = process.env.ADMIN_SECRET ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  if (!adminSecret || !adminPassword) return null
  const jar = await cookies()
  const token = jar.get('cr_admin')?.value ?? ''
  if (!token) return null
  const expected = createHmac('sha256', adminSecret).update(adminPassword).digest('base64')
  return token === expected ? 'admin' : null
}

export async function GET(req: NextRequest) {
  const adminId = await checkAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const days = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get('days') ?? '7', 10) || 7, 1), 30)
  const restaurantId = req.nextUrl.searchParams.get('restaurant_id') ?? ''
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const db = getSupabaseAdmin()
  let query = db
    .from('conversations')
    .select('restaurant_id, channel, user_message, assistant_response, response_source, is_unknown, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500)

  if (restaurantId) query = query.eq('restaurant_id', restaurantId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []) as Record<string, unknown>[]
  const toplam = rows.length
  const bilinmeyen = rows.filter(r => r.is_unknown === true || /kesin bilgim yok|bilmiyorum|tam anlayamadım|alakasız/i.test(String(r.assistant_response ?? ''))).length

  if (toplam === 0) {
    return NextResponse.json({ konusma_sayisi: 0, bilinmeyen_orani: 0, rapor: 'Belirtilen aralıkta konuşma kaydı bulunamadı.' })
  }

  // DeepSeek'e özetlet — "bot hangi konularda zorlandı" raporu
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) {
    return NextResponse.json({
      konusma_sayisi: toplam,
      bilinmeyen_orani: Math.round((bilinmeyen / toplam) * 100),
      rapor: 'DEEPSEEK_API_KEY yok; ham örnekler aşağıda.',
      ornekler: rows.slice(0, 20).map(r => ({ u: r.user_message, a: r.assistant_response, is_unknown: r.is_unknown })),
    })
  }

  // Rapor için örnekler — en sık zorlanılan (bilinmeyen) konuşmalar öncelikli
  const oncelikli = [...rows].sort((a, b) => {
    const au = a.is_unknown === true ? 0 : 1
    const bu = b.is_unknown === true ? 0 : 1
    return au - bu
  }).slice(0, 60).map(r => `K: ${String(r.user_message).slice(0, 200)} | B: ${String(r.assistant_response).slice(0, 200)}`).join('\n')

  const systemPrompt = `Sen CheckRezerve chatbot log analisti sun. Aşağıda son ${days} günün konuşma örnekleri var. Türkçe, kısa ve başlıklı bir rapor üret:
- "BOT ZORLANDIĞI KONULAR": hangi sorular yanlış anlaşıldı / bot emin olamadı (özellikle işletme tipi karışıklığı, fiyat/menü/müsaitlik tahmini, kuaför-spa-restoran karışması)
- "YANLIŞ ANLAŞILAN SORULAR": 3-5 somut örnek
- "ÖNERİLER": 3-5 somut iyileştirme
Sadece verilen örneklerden çıkarım yap, uydurma. Rapor 200 kelimeyi aşmasın.`

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 600,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Toplam ${toplam} konuşma (${bilinmeyen} bilinmeyen). Örnekler:\n${oncelikli}` },
        ],
      }),
    })
    if (!res.ok) throw new Error(`DeepSeek ${res.status}`)
    const json = await res.json()
    const rapor = (json.choices?.[0]?.message?.content as string) ?? 'Rapor üretilemedi.'

    return NextResponse.json({
      konusma_sayisi: toplam,
      bilinmeyen_sayisi: bilinmeyen,
      bilinmeyen_orani: Math.round((bilinmeyen / toplam) * 100),
      analiz_edilen_ornek: Math.min(toplam, 60),
      rapor,
      tarih_araligi: `${since} → now`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `DeepSeek analiz hatası: ${msg}` }, { status: 502 })
  }
}
