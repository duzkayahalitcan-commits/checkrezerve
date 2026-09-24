import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { notifyReservationEvent } from '@/lib/notification-orchestrator'
import { logGuestActivity, resolveGuestByPhone } from '@/lib/guest-activities'
import { isValidPhone } from '@/lib/phone'
import { checkFeatureFlag } from '@/lib/feature-flags'

function generateCancellationToken(): string {
  return createHash('sha256').update(randomBytes(32)).digest('hex').slice(0, 32)
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { prefix: 'rezervasyon', max: 10, windowMs: 60_000 })
  if (limited) return limited

  try {
    const body = await request.json()
    const {
      restaurant_id, customer_name, phone, email, party_size,
      date, time, table_id, service_id, staff_id, masa_tipi_id,
      zone_id, zone_name, special_requests, sms_consent,
    } = body

    // Mobil: Authorization: Bearer <Supabase JWT> (giriş yapmış müşteri) veya body.source='app' → source='app'.
    // Bearer geçerliyse ve e-posta gönderilmediyse hesabın e-postası yazılır (Rezervasyonlarım eşleşmesi için).
    let appUserEmail: string | null = null
    const bearer = (request.headers.get('authorization') ?? '').match(/^Bearer\s+(.+)$/)?.[1]
    if (bearer) {
      const { data: { user } } = await getSupabaseAdmin().auth.getUser(bearer)
      appUserEmail = user?.email ?? null
    }
    const isApp = !!appUserEmail || body.source === 'app'

    if (!restaurant_id || !customer_name || !phone || !date || !time) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }
    // PX-12: harf/eksik haneli numara kaydedilip SMS'te sessizce düşmesin
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: 'Telefon numarası geçersiz. Örnek: 0 5XX XXX XX XX' }, { status: 400 })
    }

    // OP-11: işletmenin kapalı günü (panel → Ayarlar → Kapalı günler)
    const { data: restClosed } = await getSupabaseAdmin()
      .from('restaurants')
      .select('closed_dates')
      .eq('id', restaurant_id)
      .maybeSingle()
    if (Array.isArray(restClosed?.closed_dates) && restClosed.closed_dates.includes(date)) {
      return NextResponse.json({ error: 'İşletme bu tarihte kapalı. Lütfen başka bir gün seçin.' }, { status: 409 })
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const safeMasaTipiId = masa_tipi_id && UUID_RE.test(masa_tipi_id) ? masa_tipi_id : null
    const safeTableId = table_id && UUID_RE.test(table_id) ? table_id : null
    const safeZoneId = zone_id && UUID_RE.test(zone_id) ? zone_id : null
    // K2 (gece G2): form `hizmetler.id` gönderiyor (body alanı adı geriye uyum için service_id kaldı).
    // service_id kolonu `services` tablosuna FK verdiği için her hizmetli rezervasyon 23503 ile düşüyordu;
    // kanonik kolon hizmet_id (→ hizmetler). Hizmet bu işletmeye ait değilse yazılmaz.
    let safeHizmetId: string | null = null
    if (service_id && UUID_RE.test(service_id)) {
      const { data: hz } = await getSupabaseAdmin()
        .from('hizmetler').select('id').eq('id', service_id).eq('restaurant_id', restaurant_id).maybeSingle()
      safeHizmetId = hz?.id ?? null
    }

    const { data: phoneConflict } = await getSupabaseAdmin()
      .from('reservations')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .eq('guest_phone', phone.trim())
      .eq('reserved_date', date)
      .eq('reserved_time', time)
      .neq('status', 'cancelled')
      .limit(1)
      .maybeSingle()

    if (phoneConflict) {
      return NextResponse.json(
        { error: 'Bu telefon numarası için bu tarih ve saatte zaten bir rezervasyonunuz bulunmaktadır.' },
        { status: 409 }
      )
    }

    // ── S2-T1: Temporal Reservation Guard — masa çakışma + kapasite kontrolü ──
    if (safeTableId) {
      const partySize = parseInt(party_size, 10) || 1
      const { data: check, error: rpcErr } = await getSupabaseAdmin().rpc('check_reservation_availability', {
        p_restaurant_id: restaurant_id,
        p_table_id:      safeTableId,
        p_date:          date,
        p_time:          time,
        p_duration:      null,
        p_party_size:    partySize,
      })

      // Fonksiyon henüz oluşturulmadıysa (migration çalışmamışsa) sessizce geç
      if (rpcErr) {
        console.warn('[rezervasyon] guard fonksiyonu bulunamadı, atlanıyor:', rpcErr.message)
      } else if (!check?.ok) {
        return NextResponse.json(
          { error: check?.message ?? 'Seçilen masa için uygunluk bulunamadı.' },
          { status: 409 }
        )
      }
    }

    // ── Zone kapasite kontrolü (race condition'a karşı sunucu tarafında) ──
    if (safeZoneId) {
      const [{ data: zone }, { count: existingCount }] = await Promise.all([
        getSupabaseAdmin()
          .from('special_areas')
          .select('capacity')
          .eq('id', safeZoneId)
          .maybeSingle(),
        getSupabaseAdmin()
          .from('reservations')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', restaurant_id)
          .eq('zone_id', safeZoneId)
          .eq('reserved_date', date)
          .eq('reserved_time', time)
          .neq('status', 'cancelled'),
      ])

      if (zone && zone.capacity != null && (existingCount ?? 0) >= zone.capacity) {
        return NextResponse.json(
          { error: 'Bu bölge dolu, lütfen farklı bir bölge veya saat seçin.' },
          { status: 409 }
        )
      }
    }

    // OP-08: aynı çalışana çakışan rezervasyon (hizmet süresine göre aralık çakışması).
    // "Fark etmez" (staff_id yok/__any__) → kontrol yok. Not: kontrol-sonra-yaz, tam atomik değil.
    const calisanId = staff_id && staff_id !== '__any__' && UUID_RE.test(staff_id) ? staff_id : null
    if (calisanId) {
      const toMin = (t: string) => { const [h, m] = String(t).slice(0, 5).split(':').map(Number); return h * 60 + m }
      const db = getSupabaseAdmin()
      const [{ data: newHz }, { data: sameDay }] = await Promise.all([
        safeHizmetId ? db.from('hizmetler').select('sure_dakika').eq('id', safeHizmetId).maybeSingle() : Promise.resolve({ data: null }),
        db.from('reservations').select('reserved_time, hizmetler(sure_dakika)')
          .eq('restaurant_id', restaurant_id).eq('calisan_id', calisanId)
          .eq('reserved_date', date).neq('status', 'cancelled'),
      ])
      const newStart = toMin(time)
      const newEnd = newStart + ((newHz as { sure_dakika: number | null } | null)?.sure_dakika || 30)
      const clash = (sameDay ?? []).some(r => {
        const hz = (Array.isArray(r.hizmetler) ? r.hizmetler[0] : r.hizmetler) as { sure_dakika: number | null } | null
        const st = toMin(r.reserved_time as string)
        return st < newEnd && newStart < st + (hz?.sure_dakika || 30)
      })
      if (clash) {
        return NextResponse.json(
          { error: 'Seçtiğiniz çalışanın bu saatte başka bir randevusu var. Lütfen başka bir saat seçin.' },
          { status: 409 },
        )
      }
    }

    // OP-07: işletme 'Otomatik Onay' (auto_confirm) flag'ini açtıysa rezervasyon doğrudan onaylı;
    // kapalıysa (varsayılan) önceki gibi 'pending' → panelde "Onay Bekleyen" sayacında görünür.
    const autoConfirm = await checkFeatureFlag(restaurant_id, 'auto_confirm').catch(() => false)

    const insertPayload: Record<string, unknown> = {
      restaurant_id,
      guest_name:       customer_name.trim(),
      guest_phone:      phone.trim(),
      guest_email:      email?.trim() || appUserEmail || null,
      party_size:       parseInt(party_size, 10) || 1,
      reserved_date:    date,
      reserved_time:    time,
      hizmet_id:        safeHizmetId,
      calisan_id:       calisanId,
      masa_tipi_id:     safeMasaTipiId  || null,
      table_id:         safeTableId     || null,
      zone_id:          safeZoneId      || null,
      // #6: form gönderiyordu ama kaydedilmiyordu; mobil sadece zone_name yazıyor → iki kanal tutarlı
      zone_name:        typeof zone_name === 'string' && zone_name.trim() ? zone_name.trim().slice(0, 100) : null,
      special_requests: special_requests?.trim() || null,
      sms_consent:      sms_consent === true, // LG-02: sadece ayrı pazarlama kutusu
      cancellation_token: generateCancellationToken(),
      status: autoConfirm ? 'confirmed' : 'pending',
      source: isApp ? 'app' : 'form',
    }

    let { data, error } = await getSupabaseAdmin()
      .from('reservations')
      .insert(insertPayload)
      .select('id')
      .single()
    // source CHECK 'app'i SQL 09 öncesi kabul etmez (23514) → 'form' ile tekrar
    if (error?.code === '23514' && insertPayload.source === 'app') {
      insertPayload.source = 'form'
      ;({ data, error } = await getSupabaseAdmin().from('reservations').insert(insertPayload).select('id').single())
    }

    if (error) {
      console.error('[rezervasyon]', error)
      // PX-03: DB hata metni (FK/constraint) müşteriye gösterilmez; ayrıntı yukarıda loglanıyor
      return NextResponse.json(
        { error: 'Rezervasyonunuz kaydedilemedi. Bilgileriniz duruyor, lütfen tekrar deneyin; sorun sürerse işletmeyi arayın.' },
        { status: 500 },
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Rezervasyonunuz kaydedilemedi. Lütfen tekrar deneyin.' }, { status: 500 })
    }

    // ── S4-T2: Misafir aktivite kaydı (reservation) — async, engellemez ──
    void (async () => {
      const guest = await resolveGuestByPhone(restaurant_id, insertPayload.guest_phone as string)
      if (guest) {
        await logGuestActivity({
          guest_id: guest.id,
          activity_type: 'reservation',
          description: `${insertPayload.guest_name} — ${date} ${time} (${insertPayload.party_size} kişi)`,
          metadata: { reservation_id: data.id, date, time, party_size: insertPayload.party_size },
        })
      }
    })()

    // ── S2-T5: Bildirim orkestrasyonu (müşteri + işletme + n8n) — async, engellemez ──
    try {
      const { data: rest } = await getSupabaseAdmin()
        .from('restaurants')
        .select('id, name, phone, address')
        .eq('id', restaurant_id)
        .single()

      if (rest) {
        void notifyReservationEvent(
          'created',
          {
            id: data.id,
            restaurant_id,
            guest_name: insertPayload.guest_name as string,
            guest_phone: insertPayload.guest_phone as string,
            party_size: insertPayload.party_size as number,
            reserved_date: insertPayload.reserved_date as string,
            reserved_time: insertPayload.reserved_time as string,
            cancellation_token: insertPayload.cancellation_token as string,
          },
          { id: rest.id, name: rest.name, phone: rest.phone, address: rest.address }
        )
      }
    } catch (notifyErr) {
      console.error('[rezervasyon] bildirim hatası (akışı durdurmaz):', notifyErr)
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('[rezervasyon]', err)
    return NextResponse.json({ error: 'Beklenmeyen bir sorun oluştu. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
