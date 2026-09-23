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

    // LG-07/MB-01 FİX: Önceki kod DB'de olmayan `reservations.customer_id` ve `deleted_at`
    // kolonlarını kullanıyordu → her silme isteği 500 dönüyor, hesap HİÇ silinmiyordu.
    // reservations'ta kullanıcı id'si yok; eşleşme e-posta ve profil telefonuyla yapılır.
    // guest_name/guest_phone NOT NULL olduğu için null yerine sabit değer yazılır.
    // Legacy PII kolonları (customer_name, phone) da temizlenir (learned.md #1).
    const anonymizePayload = {
      guest_name:       'Silinmiş kullanıcı',
      guest_phone:      'silindi',
      guest_email:      null,
      customer_name:    null,
      phone:            null,
      special_requests: null,
      notes:            null,
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('phone, telefon')
      .eq('id', userId)
      .maybeSingle()

    // Telefon DB'de farklı biçimlerde tutulabiliyor (05XX…, +905XX…, 5XX…) → varyantlarla eşleştir
    const phoneVariants = new Set<string>()
    for (const raw of [profile?.phone, profile?.telefon]) {
      const digits = String(raw ?? '').replace(/\D/g, '')
      if (digits.length < 10) continue
      const local = digits.slice(-10) // 5XXXXXXXXX
      phoneVariants.add(`0${local}`).add(`+90${local}`).add(`90${local}`).add(local)
    }

    const userEmail = user.email?.trim().toLowerCase()
    const matchers: Array<{ col: 'guest_email' | 'guest_phone' | 'phone'; values: string[] }> = []
    if (userEmail) matchers.push({ col: 'guest_email', values: [userEmail] })
    if (phoneVariants.size) {
      matchers.push({ col: 'guest_phone', values: [...phoneVariants] })
      matchers.push({ col: 'phone', values: [...phoneVariants] })
    }

    for (const m of matchers) {
      const query = admin.from('reservations').update(anonymizePayload)
      const { error: anonError } = m.col === 'guest_email'
        ? await query.ilike('guest_email', m.values[0])
        : await query.in(m.col, m.values)
      if (anonError) {
        console.error('[delete-user] reservations anonymize failed', m.col, anonError)
        return NextResponse.json(
          { error: 'Rezervasyonlar anonimleştirilemedi, hesap silinmedi' },
          { status: 500 },
        )
      }
    }

    // Kullanıcıya bağlı diğer kişisel kayıtlar (hata akışı durdurmaz, loglanır)
    for (const [table, col] of [['push_tokens', 'user_id'], ['push_subscriptions', 'user_id'], ['musteri_kanal_tercihleri', 'musteri_id']] as const) {
      const { error } = await admin.from(table).delete().eq(col, userId)
      if (error) console.error(`[delete-user] ${table} delete failed`, error)
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
