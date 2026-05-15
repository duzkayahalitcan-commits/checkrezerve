import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurant_id, customer_name, phone, party_size,
      date, time, service_id, staff_id, masa_tipi_id, table_id, special_requests,
    } = body

    if (!restaurant_id || !customer_name || !phone || !date || !time) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    // Check same phone at same restaurant+date+time (prevents double booking for any business type)
    const { data: phoneConflict } = await getSupabaseAdmin()
      .from('reservations')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .eq('phone', phone.trim())
      .eq('date', date)
      .eq('time', time)
      .neq('status', 'cancelled')
      .limit(1)
      .maybeSingle()

    if (phoneConflict) {
      return NextResponse.json(
        { error: 'Bu telefon numarası için bu tarih ve saatte zaten bir rezervasyonunuz bulunmaktadır.' },
        { status: 409 }
      )
    }

    // Check for double booking if a specific table was selected
    if (table_id) {
      const { data: conflict } = await getSupabaseAdmin()
        .from('reservations')
        .select('id')
        .eq('restaurant_id', restaurant_id)
        .eq('table_id', table_id)
        .eq('date', date)
        .eq('time', time)
        .neq('status', 'cancelled')
        .limit(1)
        .maybeSingle()

      if (conflict) {
        return NextResponse.json(
          { error: 'Bu masa seçilen tarih ve saatte dolu. Lütfen başka bir masa seçin.' },
          { status: 409 }
        )
      }
    }

    const { data, error } = await getSupabaseAdmin()
      .from('reservations')
      .insert({
        restaurant_id,
        customer_name: customer_name.trim(),
        phone: phone.trim(),
        party_size: parseInt(party_size, 10) || 1,
        date,
        time,
        service_id:      service_id   || null,
        calisan_id:      staff_id     || null,
        masa_tipi_id:    masa_tipi_id || null,
        table_id:        table_id     || null,
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
