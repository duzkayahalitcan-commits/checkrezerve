'use server'

import { revalidatePath } from 'next/cache'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendSms } from '@/lib/notification-service'
import { canEditSettings } from '@/lib/roles'

async function requireSession() {
  const s = await getPanelSession()
  if (!s) throw new Error('Unauthorized')
  return s
}

// ─── Şablon CRUD ────────────────────────────────────────────────────────────

export async function saveTemplate(formData: FormData) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const id = formData.get('id') as string | null
  const ad = formData.get('ad') as string
  const icerik = formData.get('icerik') as string
  const tip = formData.get('tip') as string

  if (!ad?.trim() || !icerik?.trim()) return { success: false, error: 'Ad ve içerik zorunludur' }

  const payload = { isletme_id: session.restaurantId, ad: ad.trim(), icerik: icerik.trim(), tip: tip || 'sms' }

  if (id) {
    const { error } = await db.from('bildirim_sablonlari').update(payload).eq('id', id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await db.from('bildirim_sablonlari').insert(payload)
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/panel/[slug]/bildirimler')
  return { success: true }
}

export async function deleteTemplate(id: string) {
  const session = await requireSession()
  const db = getSupabaseAdmin()
  const { error } = await db.from('bildirim_sablonlari').delete().eq('id', id).eq('isletme_id', session.restaurantId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/panel/[slug]/bildirimler')
  return { success: true }
}

// ─── Manuel bildirim gönder ─────────────────────────────────────────────────

export async function sendNotification(formData: FormData) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const tip = formData.get('tip') as string
  const alici = formData.get('alici') as string
  const mesaj = formData.get('mesaj') as string

  if (!mesaj?.trim()) return { success: false, error: 'Mesaj zorunludur' }

  // Log'a kaydet
  const { error } = await db.from('bildirim_log').insert({
    isletme_id: session.restaurantId,
    tip: tip || 'sms',
    alici: alici || 'manuel',
    mesaj: mesaj.trim(),
    durum: 'pending',
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/[slug]/bildirimler')
  return { success: true }
}

// ─── Tekrar gönder ──────────────────────────────────────────────────────────

export async function resendNotification(id: string) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const { error } = await db.from('bildirim_log').update({ durum: 'pending', hata_mesaji: null }).eq('id', id).eq('isletme_id', session.restaurantId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/panel/[slug]/bildirimler')
  return { success: true }
}

// ─── Toplu gönderim (W-70) ────────────────────────────────────────────────────
// Hedefler: tum_musteriler (tüm SMS numaraları) | paket_sahipleri (push)
// tip: sms | push

const BULK_MAX_RECIPIENTS = 500 // SMS maliyeti / spam koruması için sınır

async function renderTemplate(
  template: string,
  vars: Record<string, string>
): Promise<string> {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`)
}

// SMS hedeflerini topla (yalnızca KVKK pazarlama onayı veren müşteriler)
// KVKK: toplu pazarlama SMS'i yalnızca sms_consent=true olan rezervasyon
// müşterilerine gönderilir. guests tablosunda konsent kolonu olmadığından,
// guests kaynaklı telefonlar pazarlama SMS'i için DAHİL EDİLMEZ (yasal risk).
// Push bilinçli aboneliktir ve konsent gerektirmez.
async function collectSmsTargets(
  db: ReturnType<typeof getSupabaseAdmin>,
  restaurantId: string,
  hedef: string,
  filtre: { baslangic?: string; bitis?: string } | null
): Promise<{ alici: string; musteriAdi?: string }[]> {
  const targets = new Map<string, string>() // phone -> name

  if (hedef === 'paket_sahipleri') {
    // Paket sahipleri için SMS: musteri_paketleri sahiplerinin telefonları
    // guests'te konsent olmadığından bulunamıyor; push için kullanılır.
    return []
  }

  // SMS hedefleri yalnızca sms_consent=true rezervasyon müşterileri.
  let resQuery = db
    .from('reservations')
    .select('guest_name, guest_phone')
    .eq('restaurant_id', restaurantId)
    .eq('sms_consent', true)
    .not('guest_phone', 'is', null)
  if (hedef === 'rezervasyon_tarih' && filtre?.baslangic) {
    resQuery = resQuery.gte('reserved_date', filtre.baslangic)
  }
  if (hedef === 'rezervasyon_tarih' && filtre?.bitis) {
    resQuery = resQuery.lte('reserved_date', filtre.bitis)
  }
  const { data: reservations } = await resQuery
  for (const r of reservations ?? []) {
    const phone = r.guest_phone!.trim()
    if (phone && !targets.has(phone)) targets.set(phone, r.guest_name)
  }

  return Array.from(targets.entries())
    .map(([alici, musteriAdi]) => ({ alici, musteriAdi }))
    .slice(0, BULK_MAX_RECIPIENTS)
}

// Push hedeflerini topla (musteri_paketleri sahiplerinin push abonelikleri)
async function collectPushTargets(
  db: ReturnType<typeof getSupabaseAdmin>,
  restaurantId: string
): Promise<{ endpoint: string; keys_p256dh: string; keys_auth: string }[]> {
  const { data: paketler } = await db
    .from('musteri_paketleri')
    .select('musteri_id')
    .eq('restaurant_id', restaurantId)
    .eq('aktif', true)
  const userIds = paketler?.map(p => p.musteri_id) ?? []
  if (userIds.length === 0) return []

  const { data: subs } = await db
    .from('push_subscriptions')
    .select('endpoint, keys_p256dh, keys_auth')
    .in('user_id', userIds)

  return (subs ?? []).slice(0, BULK_MAX_RECIPIENTS)
}

export type BulkResult = {
  success: boolean
  error?: string
  hedef: string
  toplam: number
  basarili: number
  basarisiz: number
}

export async function bulkSendNotification(formData: FormData): Promise<BulkResult> {
  const session = await requireSession()
  if (!canEditSettings(session.role)) return { success: false, error: 'Yetkiniz yok', hedef: '', toplam: 0, basarili: 0, basarisiz: 0 }

  const tip = (formData.get('tip') as string) || 'sms'
  const hedef = (formData.get('hedef') as string) || 'tum_musteriler'
  const mesaj = (formData.get('mesaj') as string) || ''
  const baslangic = (formData.get('baslangic') as string) || undefined
  const bitis = (formData.get('bitis') as string) || undefined

  if (!mesaj.trim()) return { success: false, error: 'Mesaj zorunludur', hedef, toplam: 0, basarili: 0, basarisiz: 0 }

  const db = getSupabaseAdmin()
  const restaurantId = session.restaurantId

  // İşletme adı (şablon değişkeni için)
  const { data: restaurant } = await db
    .from('restaurants')
    .select('name')
    .eq('id', restaurantId)
    .single()

  if (tip === 'push') {
    const targets = await collectPushTargets(db, restaurantId)
    if (targets.length === 0) {
      return { success: true, hedef, toplam: 0, basarili: 0, basarisiz: 0 }
    }

    const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? ''
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? ''
    const VAPID_EMAIL = process.env.VAPID_EMAIL ?? 'destek@checkrezerve.com'
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return { success: false, error: 'VAPID keys not configured', hedef, toplam: 0, basarili: 0, basarisiz: 0 }
    }
    const { default: webpush } = await import('web-push')
    webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

    const payload = JSON.stringify({ title: restaurant?.name ?? 'checkrezerve', body: mesaj.trim(), url: '/admin' })
    let basarili = 0, basarisiz = 0

    for (const target of targets) {
      try {
        await webpush.sendNotification(
          { endpoint: target.endpoint, keys: { p256dh: target.keys_p256dh, auth: target.keys_auth } },
          payload
        )
        basarili++
        await db.from('bildirim_log').insert({
          isletme_id: restaurantId, tip: 'push', alici: target.endpoint, mesaj: mesaj.trim(), durum: 'sent',
        })
      } catch (err) {
        basarisiz++
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('410') || msg.includes('gone') || msg.includes('unsubscribe')) {
          await db.from('push_subscriptions').delete().eq('endpoint', target.endpoint)
        }
        await db.from('bildirim_log').insert({
          isletme_id: restaurantId, tip: 'push', alici: target.endpoint, mesaj: mesaj.trim(), durum: 'failed', hata_mesaji: msg,
        })
      }
    }

    revalidatePath('/panel/[slug]/bildirimler')
    return { success: true, hedef, toplam: targets.length, basarili, basarisiz }
  }

  // SMS
  const targets = await collectSmsTargets(db, restaurantId, hedef, { baslangic, bitis })
  if (targets.length === 0) {
    return { success: true, hedef, toplam: 0, basarili: 0, basarisiz: 0 }
  }

  let basarili = 0, basarisiz = 0
  for (const t of targets) {
    const rendered = await renderTemplate(mesaj, {
      musteri_adi: t.musteriAdi ?? '',
      tarih: '',
      saat: '',
      isletme_adi: restaurant?.name ?? '',
    })
    try {
      const res = await sendSms({ to: t.alici, body: rendered })
      if (res.success) {
        basarili++
        await db.from('bildirim_log').insert({
          isletme_id: restaurantId, tip: 'sms', alici: t.alici, mesaj: rendered, durum: 'sent',
        })
      } else {
        basarisiz++
        await db.from('bildirim_log').insert({
          isletme_id: restaurantId, tip: 'sms', alici: t.alici, mesaj: rendered, durum: 'failed', hata_mesaji: res.error,
        })
      }
    } catch (err) {
      basarisiz++
      await db.from('bildirim_log').insert({
        isletme_id: restaurantId, tip: 'sms', alici: t.alici, mesaj: rendered, durum: 'failed',
        hata_mesaji: err instanceof Error ? err.message : String(err),
      })
    }
  }

  revalidatePath('/panel/[slug]/bildirimler')
  return { success: true, hedef, toplam: targets.length, basarili, basarisiz }
}
