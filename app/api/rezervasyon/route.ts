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
        staff_id:        staff_id     || null,
        masa_tipi_id:    masa_tipi_id || null,
        table_id:        table_id     || null,
        special_requests: special_requests?.trim() || null,
        status: 'beklemede',
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
