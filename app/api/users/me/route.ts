import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function DELETE(request: NextRequest) {
  const limited = rateLimit(request, { prefix: 'delete-user', max: 5, windowMs: 60_000 })
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
    await admin
      .from('reservations')
      .update({
        customer_name: null,
        phone: null,
        special_requests: null,
        deleted_at: new Date().toISOString(),
      })
      .eq('customer_id', userId)
      .is('deleted_at', null)

    // Favori kayıtlarını sil
    await admin
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)

    // Auth kullanıcısını sil (profiles tablosu ON DELETE CASCADE ile otomatik silinir)
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true, message: 'Hesabınız silindi' })
  } catch (error) {
    console.error('[delete-user]', error)
    return NextResponse.json({ error: 'Hesap silinirken bir hata oluştu' }, { status: 500 })
  }
}
