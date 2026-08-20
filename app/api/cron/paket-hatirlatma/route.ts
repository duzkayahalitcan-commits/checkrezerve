// W-69 (KADEMELİ): Paket Bitiş Otomatik Hatırlatma
// VPS crontab: 0 9 * * * curl -H "Authorization: Bearer $CRON_SECRET" https://checkrezerve.com/api/cron/paket-hatirlatma
//
// Kademeli eşikler: kalan seans 3/2/1/0 olduğunda birer kez bildirim gönderilir.
// Her eşik musteri_paketleri.hatirlatma_gonderilen_esikler (JSONB) içinde ayrı
// izlenir: {"3":true,"2":true,"1":false,"0":false} → tekrar gönderilmez.
// Vertical terminoloji (business_type): pilates→Ders, psychologist→Seans,
// restaurant→Rezervasyon, diğer→Randevu.
// Kanal tercihi: gönderim anında DB'den güncel etkin kanallar okunur (cache yok),
// n8n webhook'una bildirilir.

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Vertical terminoloji: business_type → seans adı
const TERM: Record<string, string> = {
  pilates: 'Ders',
  psychologist: 'Seans',
  chiropractor: 'Seans',
  restaurant: 'Rezervasyon',
  spa: 'Randevu',
  hairdresser: 'Randevu',
  barber: 'Randevu',
  beauty_salon: 'Randevu',
  dentist: 'Randevu',
  fitness: 'Randevu',
  veterinary: 'Randevu',
}

function term(businessType: string | null | undefined): string {
  return TERM[businessType ?? ''] ?? 'Randevu'
}

// "0" eşiği için yenileme/kayıt sayfası linki
function renewalUrl(restaurantSlug?: string | null): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://checkrezerve.com'
  // Müşteri paket sayfasına yönlendir; slug yoksa ana sayfa
  return restaurantSlug ? `${base}/panel` : `${base}`
}

// Eşik mesajı — vertical terminoloji + kanal uygun
function buildMessage(termName: string, kalan: number, paketAdi: string, isletme: string): { title: string; body: string } {
  if (kalan <= 0) {
    return {
      title: `${isletme} — ${termName}leriniz bitti`,
      body: `${paketAdi} ${termName.toLowerCase()} sayınız bitti. Yenilemek için: ${renewalUrl()}`,
    }
  }
  return {
    title: `${isletme} — Son ${kalan} ${termName.toLowerCase()}!`,
    body: `${paketAdi} paketinde ${kalan} ${termName.toLowerCase()} kaldı.`,
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const n8nBase = process.env.N8N_BASE_URL

  // Kalan seansı 0..3 olan aktif paketler
  const { data: items } = await db
    .from('bitmek_uzere_paketler')
    .select('id, musteri_id, musteri_email, musteri_telefon, paket_adi, kalan_seans, restaurant_id, isletme_adi, business_type, hatirlatma_gonderilen_esikler')

  let processed = 0
  const log: Record<string, number> = {}

  for (const item of (items ?? [])) {
    const rec = item as Record<string, unknown>
    const id = rec.id as string
    const kalan = Number(rec.kalan_seans ?? 0)
    // kalan 3+ → eşik 3, 2 → 2, 1 → 1, 0 → 0
    const esikKey = String(kalan >= 3 ? 3 : kalan) // "3","2","1","0"

    // JSONB takip — bu eşik zaten gönderildi mi?
    const gonderilen = (rec.hatirlatma_gonderilen_esikler as Record<string, boolean> | null) ?? {}
    if (gonderilen[esikKey]) {
      continue // tekrar gönderme
    }

    try {
      const businessType = (rec.business_type as string) ?? null
      const termName = term(businessType)
      const { title, body } = buildMessage(termName, kalan, (rec.paket_adi as string) ?? '', (rec.isletme_adi as string) ?? '')

      // Kanal tercihi: gönderim anında DB'den GÜNCEL etkin kanallar
      let aktifKanallar: string[] = ['email', 'sms', 'whatsapp'] // varsayılan
      try {
        const { data: kan } = await db.rpc('get_aktif_kanallar', {
          p_musteri_id: rec.musteri_id as string,
          p_restaurant_id: rec.restaurant_id as string,
        })
        if (kan && Array.isArray(kan) && kan.length > 0) {
          aktifKanallar = kan as string[]
        }
      } catch {
        // RPC hatası → varsayılan kanallarla devam
      }

      // n8n webhook'a bildir (kanal tercihi + kademe + mesaj)
      if (n8nBase) {
        try {
          await fetch(`${n8nBase}/webhook/paket-hatirlatma`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              musteri_email: (rec.musteri_email as string) ?? null,
              musteri_telefon: (rec.musteri_telefon as string) ?? null,
              paket_adi: rec.paket_adi,
              kalan_seans: kalan,
              esik: Number(esikKey),
              isletme_adi: rec.isletme_adi,
              term: termName,
              title,
              body,
              renewal_url: kalan <= 0 ? renewalUrl() : null,
              kanallar: aktifKanallar, // n8n bu kanallara gider
            }),
          })
        } catch {
          // n8n hatası loglanır ama DB güncellemesi devam eder
        }
      }

      // Bu eşiği işaretle (tekrar gönderilmez)
      const yeniEsikler = { ...gonderilen, [esikKey]: true }
      await db
        .from('musteri_paketleri')
        .update({
          hatirlatma_gonderilen_esikler: yeniEsikler,
          hatirlatma_tarihi: new Date().toISOString(),
          // Geriye dönük uyum: tek-bayrak da güncellenir
          hatirlatma_gonderildi: true,
        })
        .eq('id', id)

      log[esikKey] = (log[esikKey] ?? 0) + 1
      processed++
    } catch {
      // DB hatası → bu kaydı atla, sonraki çalıştırmada tekrar dene
    }
  }

  return NextResponse.json({ processed, total: (items ?? []).length, byEsik: log })
}
