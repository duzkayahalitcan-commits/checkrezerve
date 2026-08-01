import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { notifyReservationEvent } from '@/lib/notification-orchestrator'

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
      zone_id, special_requests,
    } = body

    if (!restaurant_id || !customer_name || !phone || !date || !time) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const safeMasaTipiId = masa_tipi_id && UUID_RE.test(masa_tipi_id) ? masa_tipi_id : null
    const safeTableId = table_id && UUID_RE.test(table_id) ? table_id : null
    const safeZoneId = zone_id && UUID_RE.test(zone_id) ? zone_id : null

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
      const { data: check } = await getSupabaseAdmin().rpc('check_reservation_availability', {
        p_restaurant_id: restaurant_id,
        p_table_id:      safeTableId,
        p_date:          date,
        p_time:          time,
        p_duration:      null,
        p_party_size:    partySize,
      })

      if (!check?.ok) {
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
          .select('*', { count: 'exact', head: true })
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

    const insertPayload: Record<string, unknown> = {
      restaurant_id,
      guest_name:       customer_name.trim(),
      guest_phone:      phone.trim(),
      guest_email:      email?.trim() || null,
      party_size:       parseInt(party_size, 10) || 1,
      reserved_date:    date,
      reserved_time:    time,
      service_id:       service_id      || null,
      calisan_id:       (staff_id && staff_id !== '__any__') ? staff_id : null,
      masa_tipi_id:     safeMasaTipiId  || null,
      table_id:         safeTableId     || null,
      zone_id:          safeZoneId      || null,
      special_requests: special_requests?.trim() || null,
      cancellation_token: generateCancellationToken(),
      status: 'pending',
      source: 'form',
    }

    const { data, error } = await getSupabaseAdmin()
      .from('reservations')
      .insert(insertPayload)
      .select('id')
      .single()

    if (error) {
      console.error('[rezervasyon]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
