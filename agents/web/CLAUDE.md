# Web Ajanı — CheckRezerve

Sen CheckRezerve'in Next.js web uygulamasından sorumlusun.

## Stack
- Next.js 14 (App Router)
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
