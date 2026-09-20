import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function DELETE(request: NextRequest) {
  const limited = await rateLimit(request, { prefix: 'delete-user', max: 5, windowMs: 60_000 })
  if (limited) return limited

  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.slice(7)

    const admin = getSupabaseAdmin()

    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Rezervasyonları anonimleştir (soft delete — 90 gün sonra pg_cron ile temizlenir)
    const anonymizedAt = new Date().toISOString()
    const anonymizePayload = {
      guest_name: null,
      guest_phone: null,
      special_requests: null,
      deleted_at: anonymizedAt,
    }

    // 1) Üyelik üzerinden yapılan rezervasyonlar (customer_id doğrudan eşleşir)
    const { error: reservationError } = await admin
      .from('reservations')
      .update(anonymizePayload)
      .eq('customer_id', userId)
      .is('deleted_at', null)

    if (reservationError) {
      console.error('[delete-user] reservations anonymize failed', reservationError)
      return NextResponse.json(
        { error: 'Rezervasyonlar anonimleştirilemedi, hesap silinmedi' },
        { status: 500 },
      )
    }

    // 2) Login olmadan (misafir olarak) yapılan rezervasyonlar: customer_id NULL olur,
    //    bu yüzden e-posta eşleşmesiyle yakalanır. Not: Kullanıcı rezervasyonu farklı bir
    //    e-posta/telefon ile yaptıysa bu kayıtlar eşlenemez; onlar 90 günlük pg_cron
    //    temizliğine kalır (bkz. anonymize_old_deleted_reservations).
    const userEmail = user.email?.trim().toLowerCase()
    if (userEmail) {
      const { error: guestReservationError } = await admin
        .from('reservations')
        .update(anonymizePayload)
        .is('customer_id', null)
        .is('deleted_at', null)
        .ilike('guest_email', userEmail)

      if (guestReservationError) {
        console.error('[delete-user] guest reservations anonymize failed', guestReservationError)
        return NextResponse.json(
          { error: 'Rezervasyonlar anonimleştirilemedi, hesap silinmedi' },
          { status: 500 },
        )
      }
    }

    // Favori kayıtlarını sil
    const { error: favoritesError } = await admin
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)

    if (favoritesError) {
      console.error('[delete-user] favorites delete failed', favoritesError)
      return NextResponse.json(
        { error: 'Hesap silinirken bir hata oluştu' },
        { status: 500 },
      )
    }

    // Auth kullanıcısını sil (profiles tablosu ON DELETE CASCADE ile otomatik silinir)
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true, message: 'Hesabınız silindi' })
  } catch (error) {
    console.error('[delete-user]', error)
    return NextResponse.json({ error: 'Hesap silinirken bir hata oluştu' }, { status: 500 })
  }
}
