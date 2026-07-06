import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/panel-auth'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('cr_panel')?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('photo') as File | null
  const zoneId = formData.get('zone_id') as string | null
  const restaurantId = formData.get('restaurant_id') as string | null

  if (!file || !zoneId || !restaurantId) {
    return NextResponse.json({ error: 'photo, zone_id, and restaurant_id required' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fotoğraf en fazla 5MB olabilir' }, { status: 400 })
  }

  // Sadece resim formatları
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Yalnızca resim dosyaları yüklenebilir' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // zone-photos/{restaurantId}/{zoneId}.webp
  const filePath = `zone-photos/${restaurantId}/${zoneId}.webp`
  const { error: uploadError } = await supabase.storage
    .from('kroki')
    .upload(filePath, file, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (uploadError) {
    console.error('[ZonePhoto Upload]', uploadError.message)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Public URL al
  const { data: urlData } = supabase.storage.from('kroki').getPublicUrl(filePath)
  const photoUrl = urlData?.publicUrl ?? ''

  return NextResponse.json({ success: true, photo_url: photoUrl })
}
