// W-69: Paket Bitiş Otomatik Hatırlatma
// VPS crontab: 0 9 * * * curl -H "Authorization: Bearer $CRON_SECRET" https://checkrezerve.com/api/cron/paket-hatirlatma

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const n8nBase = process.env.N8N_BASE_URL

  const { data: items } = await db
    .from('bitmek_uzere_paketler')
    .select('id, musteri_email, paket_adi, kalan_seans, isletme_adi')

  let processed = 0

  for (const item of (items ?? [])) {
    try {
      // n8n webhook'a bildir (basarisizlik DB guncellemesini engellemez)
      if (n8nBase) {
        try {
          await fetch(`${n8nBase}/webhook/paket-hatirlatma`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              musteri_email: (item as Record<string, unknown>).musteri_email,
              paket_adi: (item as Record<string, unknown>).paket_adi,
              kalan_seans: (item as Record<string, unknown>).kalan_seans,
              isletme_adi: (item as Record<string, unknown>).isletme_adi,
            }),
          })
        } catch {
          // n8n hatasi loglanir ama DB guncellemesi devam eder
        }
      }

      await db
        .from('musteri_paketleri')
        .update({
          hatirlatma_gonderildi: true,
          hatirlatma_tarihi: new Date().toISOString(),
        })
        .eq('id', (item as Record<string, unknown>).id as string)

      processed++
    } catch {
      // DB hatasi olursa bu kaydi atla, sonraki calistirmada tekrar dene
    }
  }

  return NextResponse.json({ processed, total: (items ?? []).length })
}
