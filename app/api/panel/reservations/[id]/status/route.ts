import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'
import { canDeleteReservation } from '@/lib/roles'
import { logGuestActivity, resolveGuestByPhone } from '@/lib/guest-activities'

const VALID_STATUSES = ['cancelled', 'completed', 'confirmed', 'pending']

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { status } = body

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
    }, { status: 400 })
  }

  // S2-T2: İptal (cancelled) yıkıcı işlemdir — canDeleteReservation gerekir (owner/super_admin)
  if (status === 'cancelled' && !canDeleteReservation(session.role)) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  const db = getSupabaseAdmin()

  // ── S4-T2: İptal durumunda misafir aktivite kaydı düş (async, engellemez) ──
  if (status === 'cancelled') {
    void (async () => {
      const { data: reservation } = await db
        .from('reservations')
        .select('guest_name, guest_phone, reserved_date, reserved_time, restaurant_id')
        .eq('id', id)
        .single()

      if (reservation?.guest_phone) {
        const guest = await resolveGuestByPhone(reservation.restaurant_id, reservation.guest_phone)
        if (guest) {
          await logGuestActivity({
            guest_id: guest.id,
            activity_type: 'cancellation',
            description: `${reservation.guest_name ?? 'Misafir'} — ${reservation.reserved_date} ${reservation.reserved_time ?? ''}`,
            metadata: { reservation_id: id },
          })
        }
      }
    })()
  }

  const { error } = await db
    .from('reservations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, status })
}
