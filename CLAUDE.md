# CheckRezerve — Görev Listesi

## Proje Bilgileri
- Web: ~/Desktop/checkrezerve (Next.js, next-intl, Tailwind)
- Mobil: ~/Desktop/checkrezerve-app (Expo/React Native)
- VPS: 178.105.51.245 (Hetzner), SSH: ~/.ssh/checkrezerve_vps
- Supabase: posarvagedpqtsrcrwfe
- Deploy komutu: rsync -avz -e "ssh -i ~/.ssh/checkrezerve_vps" --exclude='.git' --exclude='node_modules' --exclude='.next' ./ root@178.105.51.245:/opt/checkrezerve/ && ssh -i ~/.ssh/checkrezerve_vps root@178.105.51.245 "cd /opt/checkrezerve && docker-compose up -d --build"

## Tasarım Kuralları — HER ZAMAN UYGULA
- Hiçbir zaman generic/bootstrap görünüm. Her component "vay be" dedirtmeli.
- Animasyonlar: cubic-bezier(0.23, 1, 0.32, 1) — asla linear
- GPU acceleration: will-change + transform: translateZ(0) tüm animasyonlu elementlerde
- Primary: #E53935, Typography keskin hiyerarşi, Whitespace cömert
- Micro-interaction: hover/focus/scroll/click her yerde
- Görseller: her zaman overlay+gradient ile dramatize et

## GÖREVLER — Sırayla yap, biteni [x] yap

### WEB

[x] 1. DiagonalSplit Portal — app/[locale]/page.tsx
- Mevcut page.tsx içeriğini app/[locale]/home/page.tsx'e taşı
- page.tsx sadece DiagonalSplit olsun, header/footer yok, tam ekran
- Sol üst: CheckRezerve logo (beyaz), sağ üst: dil seçici (TR/EN/AR/DE)
- Sağ alt: "İşletmeler için →" linki → /[locale]/home
- 3 panel: restoran (split-restoran.jpg center 40%), guzellik (split-guzellik.jpg), spa (split-spa.jpg)
- Panel content left: max(16%, 40px) — clip-path arkasında kalmasın
- clip-path transition YOK — sadece flex + filter transition
- will-change: flex, filter; transform: translateZ(0) tüm panellerde
- Tıklayınca: router.push('/[locale]/rezervasyon?kategori=X')
- messages/tr.json + en.json + ar.json + de.json'a diagonal key ekle

[x] 2. Home Hero — app/[locale]/home/page.tsx
- Hero tam ekran, hero-premium.jpg, güçlü overlay
- Başlık: staggered word reveal animasyonu (soldan, delay ile)
- CTA: kırmızı primary + ghost, hover scale+shadow
- Scroll indicator: animated chevron

[x] 3. Features Section
- 6 feature: düz grid değil, alternatif sol-sağ layout
- Scroll'da slide-in, görsel hover scale(1.02)

[x] 4. MarketingHeader
- Scroll'da backdrop-blur + shadow
- Nav hover: kırmızı underline slide animasyonu
- Mobile: hamburger → fullscreen overlay, staggered link girişi

[x] 5. rezervasyon/page.tsx
- URL'den ?kategori parametresi oku
- Kategori filter chips: tümü/restoran/guzellik/spa
- İşletme kartları: görsel, isim, puan, adres, rezervasyon butonu
- Loading: skeleton cards, Empty: güzel illüstrasyon

### MOBİL

[x] 6. CustomerNavigator — HomeScreen sol üst profil butonu
- HomeScreen header sol üst: profil ikonu
- navigation.navigate('Profile') — Stack'te kayıtlı değilse ekle

[x] 7. ProfileInfoScreen — Supabase entegrasyonu
- profiles tablosuna allergens jsonb kolonu ekle (alembic migration)
- Kaydet: Supabase'e yaz, sayfa açılınca çek

[x] 8. HomeScreen tasarım
- Üst: konum bazlı banner
- Kategori chips: horizontal scroll
- İşletme kartları: görsel full-width, gradient overlay, favori butonu

[x] 9. BusinessDetailScreen
- Hero: tam genişlik görsel + gradient + geri butonu
- Hizmetler: fiyat+süre chip
- Sticky bottom: "Rezervasyon Yap" bar

[x] 10. ReservationConfirmScreen
- Success checkmark: scale 0→1 spring animasyonu
- Rezervasyon özet kartı
- "Takvime Ekle" + "Ana Sayfaya Dön" butonları

## Tamamlandıktan Sonra
Web: deploy et
Mobil: npx tsc --noEmit kontrol et

---

## GÜVENLİK & KALİTE RAPORU (2026-05-23)

### ✅ Düzeltilen Bulgular
| # | Dosya | Sorun | Çözüm |
|---|-------|-------|-------|
| 1 | `lib/rate-limit.ts` (yeni) | Rate limiting yoktu | In-memory rate limiter utility oluşturuldu |
| 2 | `app/api/send-sms/route.ts` | Rate limit yok | 10 req/dk limit eklendi |
| 3 | `app/api/chat/route.ts` | Rate limit yok | 30 req/dk limit eklendi |
| 4 | `app/api/voice/route.ts` | Rate limit yok | 15 req/dk limit eklendi |
| 5 | `app/api/transcribe/route.ts` | Rate limit yok | 20 req/dk limit eklendi |
| 6 | `app/api/ai-reserve/route.ts` | Rate limit yok | 20 req/dk limit eklendi |
| 7 | `lib/faq-search.ts` | 4x console.log debug | Tümü temizlendi |
| 8 | `lib/notification-service.ts` | Duplicate `ReservationNotificationParams` (satır 26 vs 206) | İlk tanım kaldırıldı, kapsamlı olan korundu |
| 9 | `src/hooks/useAuth.ts` (mobil) | `console.log` hassas rol verisi | Temizlendi |
| 10 | `src/screens/panel/SettingsScreen.tsx` (mobil) | `console.log` rol bilgisi | Temizlendi |
| 11 | `src/screens/admin/IsletmeAdminStatsScreen.tsx` (mobil) | `console.log` Supabase sorgu detayları | Temizlendi |
| 12 | `src/screens/panel/DashboardScreen.tsx` (mobil) | `useEffect(fn, [])` — fetchStats dependency eksik | `useCallback` + `[fetchStats]` dependency eklendi |
| 13 | `components/MarketingHeader.tsx` | `as any` href cast | `as never` ile değiştirildi |
| 14 | `app/[locale]/home/page.tsx` | `as any` href cast | `as never` ile değiştirildi |

### ⚠️ Kalan Bulgular (refactor gerektirir, şimdilik takip edilsin)
| Dosya | Sorun |
|-------|-------|
| `app/panel/[slug]/ReservationList.tsx:9` | Local `Reservation` type — `types/index.ts`'deki master type kullanılabilir |
| `app/admin/ReservationDashboard.tsx:6` | Aynı local `Reservation` type |
| `app/panel/[slug]/page.tsx:193` | `as any` cast — proper type gerekli |
| `app/admin/page.tsx:223-225` | `as unknown as` — proper type gerekli |
| Mobile `SubscriptionScreen.tsx` | 6+ `as any` cast |

### ✅ Güvenli Olan (false positive)
- `.env.local` gitignore'da, git'te takip edilmiyor ✓
- `dangerouslySetInnerHTML` — JSON-LD için kullanılıyor, XSS riski yok ✓
- `SUPABASE_SERVICE_ROLE_KEY` — sadece server-side lib'de (API routes), client bundle'a gitmiyor ✓
