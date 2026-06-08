import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurant_id, customer_name, phone, email, party_size,
      date, time, service_id, staff_id, masa_tipi_id, special_requests,
    } = body

    if (!restaurant_id || !customer_name || !phone || !date || !time) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const safeMasaTipiId = masa_tipi_id && UUID_RE.test(masa_tipi_id) ? masa_tipi_id : null

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

    const { data, error } = await getSupabaseAdmin()
      .from('reservations')
      .insert({
        restaurant_id,
        guest_name:       customer_name.trim(),
        guest_phone:      phone.trim(),
        guest_email:      email?.trim() || null,
        party_size:       parseInt(party_size, 10) || 1,
        reserved_date:    date,
        reserved_time:    time,
        service_id:       service_id      || null,
        calisan_id:       staff_id        || null,
        masa_tipi_id:     safeMasaTipiId  || null,
        table_id:         null,
        special_requests: special_requests?.trim() || null,
        status: 'pending',
        source: 'form',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[rezervasyon]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('[rezervasyon]', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
