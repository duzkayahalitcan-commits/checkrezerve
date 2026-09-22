import { NextRequest, NextResponse } from 'next/server'
import { checkFeatureFlag } from '@/lib/feature-flags'

// GET /api/feature-flag?restaurant_id=<uuid>&feature=<key>
// Herkese açık, salt-okunur tek flag kontrolü. Müşteri tarafı (web/mobil) bir
// özelliği göstermeden önce işletmede açık mı diye sormak için kullanır.
// feature_flags RLS'i sadece işletme personeline (profiles.isletme_id eşleşmesi)
// SELECT izni veriyor; müşteri client'ı (anon/authenticated-customer) doğrudan
// okuyamaz. Bu route admin client ile RLS'i bypass edip yalnızca enabled boolean'ı
// döner — başka hiçbir alan sızdırmaz.
export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get('restaurant_id') ?? ''
  const feature       = req.nextUrl.searchParams.get('feature') ?? ''

  if (!restaurantId || !feature) {
    return NextResponse.json({ enabled: false }, { status: 400 })
  }

  const enabled = await checkFeatureFlag(restaurantId, feature)
  return NextResponse.json({ enabled })
}
