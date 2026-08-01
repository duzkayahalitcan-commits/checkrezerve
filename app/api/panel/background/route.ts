import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/panel-auth'
import { canEditSettings } from '@/lib/roles'

const BUCKET = 'business-backgrounds'

// POST /api/panel/background
// Body: FormData { background: File, restaurant_id: string }
// Yüklenen görseli Supabase Storage'a kaydeder ve restaurants.background_image'ı günceller.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('cr_panel')?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!canEditSettings(session.role)) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('background') as File | null
  const restaurantId = formData.get('restaurant_id') as string | null

  if (!file || !restaurantId) {
    return NextResponse.json({ error: 'background ve restaurant_id gerekli' }, { status: 400 })
  }

  // Yalnızca oturumdaki işletme (super_admin hariç)
  if (restaurantId !== session.restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Görsel en fazla 8MB olabilir' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Yalnızca resim dosyaları yüklenebilir' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // business-backgrounds/{restaurantId}/background.ext
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const filePath = `${restaurantId}/background.${ext}`
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error('[Background Upload]', uploadError.message)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  const publicUrl = urlData?.publicUrl ?? ''

  const { error: dbError } = await supabase
    .from('restaurants')
    .update({ background_image: publicUrl })
    .eq('id', restaurantId)

  if (dbError) {
    console.error('[Background DB]', dbError.message)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, background_image: publicUrl })
}

// DELETE /api/panel/background?restaurant_id=...
// Özel arka planı kaldırır (sektör varsayılanına döner).
export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('cr_panel')?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!canEditSettings(session.role)) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) {
    return NextResponse.json({ error: 'restaurant_id gerekli' }, { status: 400 })
  }
  if (restaurantId !== session.restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { error } = await supabase
    .from('restaurants')
    .update({ background_image: null })
    .eq('id', restaurantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
