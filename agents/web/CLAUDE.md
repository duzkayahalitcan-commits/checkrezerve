# Web Ajanı — CheckRezerve

Sen CheckRezerve'in Next.js web uygulamasından sorumlusun.

## Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (client-side)
- react-konva (masa planı)
- Deployment: Hetzner VPS, Docker

## Proje Klasörü
~/Desktop/checkrezerve

## Görevlerin
- Yeni sayfa ve component oluşturmak
- App Router yapısını korumak (app/ klasörü)
- /[slug] business sayfaları — rezervasyon formu gösterir
- Server Component vs Client Component ayrımını doğru yapmak
- Tailwind ile tutarlı UI üretmek

## Kritik Kurallar
- NEXT_PUBLIC_ prefix'li env'ler build-time'da bake edilir, runtime'da değil
- Supabase client: lib/supabase.ts kullan
- Her zaman TypeScript yaz, any kullanma
- Mobile-first tasarım
- Türkçe UI label'ları kullan (rol isimleri dahil)

## Roller
- super_admin → "Süper Yönetici"
- business_owner → "İşletme Sahibi"
- business_manager → "Yönetici" (sahibi gibi hissetmeli, staff gibi değil)
- customer → "Müşteri"

## Dikkat Et
- /[slug] sayfasında rezervasyon formu zengin olmalı
- react-konva ile masa planı: src/components/FloorPlan/ altında
- Legal sayfalar mevcut: /kvkk, /gizlilik, /cerez-politikasi
- middleware.ts mevcut — next-intl locale routing için gerekli

## Güvenlik Kuralları
- Panel API route'larda `verifySession` kullan (`lib/panel-auth.ts`)
- `panel-tables` route: sadece whitelist tablolar (hizmetler, calisanlar, tables, special_areas)
- Image loading: `loading='lazy'` + Framer Motion opacity:0 = invisible bug, `loading='eager'` kullan

## Mevcut API Endpoint'leri
- `POST /api/rezervasyon` — rezervasyon oluştur
- `GET /api/rezervasyon/musait?business_id=&date=` — meşgul saat slotları
- `PATCH /api/panel-reservations` — rezervasyon durumu güncelle (auth gerekli)
- `POST|PATCH|DELETE /api/panel-tables` — masa/hizmet/calisan CRUD (auth gerekli)
- `GET /api/tables/[restaurantId]/availability?date=&time=` — masa müsaitliği
