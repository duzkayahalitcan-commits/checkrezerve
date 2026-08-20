# CheckRezerve — Ana Ajan Rehberi

Platform: Türkiye'nin komisyonsuz multi-sektör rezervasyon sistemi.
Builder: Halitcan (solo)

## Stack
- Web: Next.js (App Router), TypeScript, Supabase-JS
- Mobile: Expo / React Native
- Database: Supabase (PostgreSQL)
- Deploy: VPS'te Docker (docker-compose), nginx reverse proxy
- Auth: Supabase JWKS
- Panel yazma işlemleri: getSupabaseAdmin() (RLS bypass), API route üzerinden

---

## Ekosistem — Aktif Araçlar

### Tmux Oturumları

| Oturum | Dizin | Kullanım |
|---|---|---|
| `web` | `~/Desktop/checkrezerve` | Next.js web — `npm run dev` (port 3001/3002), **fix uygulayan tek oturum** |
| `app` | `~/Desktop/checkrezerve-app` | Expo mobil — `npx expo start` (port 8081), **fix uygulayan tek oturum** |
| `genel` | `~/` | Genel terminal, vault, araç yönetimi |
| `web2` | `~/Desktop/checkrezerve` | Web için paralel keşif/analiz — **sadece rapor üretir, yazmaz** |
| `app2` | `~/Desktop/checkrezerve-app` | Mobil için paralel keşif/analiz — **sadece rapor üretir, yazmaz** |
| `genel2` | `~/` | İkinci genel oturum (araştırma, kısa komutlar) |

**Kurallar:**
- `web` ve `app` terminallerini asla karıştırma. Her oturumda aktif süreç var.
- **Paralel oturum kuralı:** `web2`/`app2`/`genel2` sadece rapor/inceleme yapar. Fix'i her zaman `web` veya `app` uygular. İki oturumun aynı dosyaya yazması race condition + kayıp değişiklik demektir.

### Araçlar

| Araç | Adres / Konum | Ne Zaman Devreye Girer |
|---|---|---|
| **OmniRoute** | `localhost:20128` | Her oturumda otomatik aktif. 290 LLM sağlayıcısı, auto-fallback, ~1.53B ücretsiz token/ay. Down olursa `~/.claude/settings.json`'da model'i Anthropic'e yönlendir. |
| **claude-obsidian** | `~/claude-obsidian` | Vault okuma/yazma. `/wiki-query`, `/save`, `/wiki-ingest` ile. Vault: `~/Documents/CheckRezerveKnowledge` |
| **hallmark** | `~/.claude/skills/hallmark` | Yeni sayfa/component tasarımı ve marketing UI. `hallmark audit` / `hallmark redesign` / `hallmark study` |
| **emilkowalski/skills** | `~/.claude/skills/` | UI polish, animasyon, component craft. `/emil-design-eng`, `/improve-animations`, `/find-animation-opportunities` |
| **strix** | `~/strix` | AI pentest — yeni API endpoint sonrası veya PR öncesi güvenlik taraması |
| **mattpocock-skills** | `~/mattpocock-skills` | TypeScript sorunları, ticket oluşturma (`to-tickets`), spesifikasyon (`to-spec`) |
| **book-to-skill** | `~/book-to-skill` | Teknik belge/kitap → agent skill dönüşümü (24-51× token tasarrufu) |

### Knowledge Vault

Tüm proje kararları, audit bulguları, sprint planları `~/Documents/CheckRezerveKnowledge/wiki/`'de yaşar.
Oturum başında vault bağlamını yüklemek için: `wiki/hot.md` + `wiki/index.md` oku.

---

## Sprint Durumu (Audit 2026-08-01 — 129+ Bulgu)

| Sprint | Durum | Özet |
|---|---|---|
| S1 Güvenlik | ✅ | RLS düzeltildi, n8n izole edildi, fallback secret'lar kaldırıldı, calendar-events/ciro-ozet auth eklendi, feature flag API'de uygulandı |
| S2 İş Mantığı | ✅ | Temporal reservation guard (DB fn), RBAC çalışıyor, health endpoint DB kontrolü, Redis rate limiting, notification orchestrator |
| S3 Performans | ✅ | SELECT * → explicit kolonlar, console.log temizlendi, withPanelAuth middleware, ISR, race condition fix, conversations RLS, composite index'ler, abonelik kontrolü. **Not:** `proxy.ts` S3-T4 değişikliği uncommitted — commit et. |
| S4 UX & Eksik | ⏳ | aria-label (23 eksik), loading spinner tutarlılığı, BookingForm silent error fix, guest_activities loglama, dress_code düzenleme, React.memo, dead code temizliği |

**Sprint planı & audit detayları:** `~/Documents/CheckRezerveKnowledge/wiki/decisions/Sprint-Plani-2026-08.md`

---

## Veritabanı Tabloları
- restaurants, reservations, calisanlar, hizmetler
- user_favorites, profiles, masa_tipleri
- subscriptions, subscription_payments, iyzico_webhook_logs
- paketler, musteri_paketleri, musteri_notlari, kroki_zones
- restaurant_users (panel giriş bilgileri — username/password_hash/role, profiles'a bağlı DEĞİL)
- kvkk_applications (KVKK başvuru kayıtları — migration uygulandı, tablo DB'de mevcut)

### Şema Notları (Dikkat Edilecek Tuzaklar)

**reservations tablosu — dual-column mimarisi**
Tablo hem yeni (canonical) hem eski (legacy/"dead") kolonlar barındırıyor. Yeni kod
sadece canonical'ları kullansın; eski kolonlar geri uyumluluk için duruyor.

| Amaç | Canonical (kullan) | Legacy (yazma) |
|---|---|---|
| Misafir adı | `guest_name` | `customer_name` |
| Telefon | `guest_phone` | `phone` |
| Tarih | `reserved_date` | `date` |
| Saat | `reserved_time` | `time` (text!) |
| Kişi sayısı | `party_size` | `kisi_sayisi` |

Ek: `guest_email` var (opsiyonel), email_logs trigger'ı bu kolona bakar.

**reservations.status enum — İNGİLİZCE**
Değerler: `pending` / `confirmed` / `completed` / `cancelled`. Türkçe string
("beklemede", "onaylandi", "iptal" vb.) YAZMA — DB constraint hata verir ve UI
filtreleri bozulur. Türkçe metin sadece görüntüleme katmanında üretilir.

**calisanlar.profile_id — eklendi ama backfill YAPILMADI**
Kolon migration ile eklendi (nullable uuid). Mevcut 8 satırın hiçbirinde dolu değil.
Panel girişleri `restaurant_users` tablosunda (username/password_hash/role) tutuluyor;
`calisanlar.profile_id` üzerinden auth kurulumu şu an çalışmıyor. profiles-bağlı bir
akış yazmadan önce backfill migration'ı çalıştır.

## Erişim
- VPS: 178.105.51.245 (Hetzner), SSH: `ssh -i ~/.ssh/checkrezerve_vps root@178.105.51.245`
- Supabase: posarvagedpqtsrcrwfe.supabase.co
- tmux session: `web` (tmux attach -t web)

---

## Ajan Haritası

```
agents/
├── web/              → Next.js, component, sayfa, UI
├── mobile/           → Expo, React Native, animasyon
├── deploy/           → Docker, VPS, env yönetimi
├── database/         → Supabase, migration, RLS, pgvector
├── auth/             → OAuth, session, rol sistemi
├── reservations/     → Rezervasyon akışı, müsaitlik
├── business/         → İşletme paneli, masa planı
├── customer/         → Müşteri UX, arama, profil
├── payments/         → Abonelik, ödeme
├── notifications/    → SMS, email, push
├── ai-assistant/     → Whisper + ElevenLabs + Claude Haiku
├── analytics/        → Dashboard, raporlar
├── legal/            → KVKK, gizlilik, uyumluluk
├── testing/          → E2E, unit, RLS testleri
├── content/          → Copy, App Store, email metni
└── product/          → Roadmap, strateji, feature kararları
```

---

## Tek Ajan Senaryoları

### "Yeni bir web sayfası ekle"
→ **web**
```
agents/web/CLAUDE.md oku
```

### "Mobil ekran yap / animasyon ekle"
→ **mobile**
```
agents/mobile/CLAUDE.md oku
```

### "VPS'e deploy et / Docker güncelle"
→ **deploy**
```
agents/deploy/CLAUDE.md oku
```

### "Supabase tablosu / migration yaz"
→ **database**
```
agents/database/CLAUDE.md oku
```

### "RLS policy güncelle"
→ **database** + **auth** (birlikte oku)

### "SMS / email bildirimi ekle"
→ **notifications**

### "KVKK checkbox ekle"
→ **legal** + **web** (birlikte oku)

### "App Store açıklaması yaz"
→ **content**

### "Ne yapmalıyım / öncelik ne?"
→ **product**

---

## Kombinasyon Senaryoları

### Rezervasyon özelliği eklemek
```
reservations + database + web (veya mobile)
```
Önce database ile şemayı yaz → sonra reservations ile iş mantığını → sonra web/mobile ile UI'ı.

### Yeni kullanıcı auth akışı
```
auth + database + web (veya mobile)
```
Auth akışını auth ile tasarla → DB tarafını database ile yaz → UI'ı web/mobile ile.

### İşletme onboarding sayfası
```
business + web + database
```
İş mantığı business'ta → şema database'de → sayfa web'de.

### Bildirim sistemi kurulumu
```
notifications + database + auth
```
Hangi olayda kim bildirim alır → auth rollere göre filtrele → DB'de log tut.

### Analitik dashboard
```
analytics + database + web
```
Hangi metrik → SQL sorgusu → dashboard component.

### AI asistan yeni özellik
```
ai-assistant + database + mobile
```
Embedding pipeline → pgvector → mobil UI.

### Deploy öncesi kontrol
```
deploy + testing
```
Test geç → env kontrol et → deploy et.

### Legal uyumluluk (KVKK güncellemesi)
```
legal + web + database + notifications
```
Neyi değiştirmek gerekiyor → form UI → DB'de izin kaydı → SMS opt-out.

---

## Hangi Ajan Ne Zaman KULLANILMAZ

| Durum | Yanlış ajan | Doğru ajan |
|-------|------------|------------|
| Supabase migration yazıyorum | web | database |
| Docker config değiştiriyorum | web | deploy |
| Rol sistemi güncelliyorum | web | auth + database |
| Mobil animasyon yapıyorum | web | mobile |
| Landing page copy yazıyorum | product | content |
| Feature karar veriyorum | web | product |

---

## Oturum Başlangıç Protokolü — OTOMATİK AJAN SEÇİMİ

**Her yeni oturumda, Halitcan hiçbir şey söylemeden önce şunu yap:**

1. `~/Documents/CheckRezerveKnowledge/wiki/hot.md` oku — sprint durumu ve aktif thread'leri öğren
2. Halitcan'a şunu sor: **"Ne yapacaksın?"**
3. Cevabına göre aşağıdaki tablodan uygun ajan(lar)ı belirle
4. O ajanların CLAUDE.md dosyalarını oku
5. "X + Y ajanı olarak çalışıyorum" de ve göreve başla

**Sprint 4 başlamadıysa:** `proxy.ts` S3-T4 değişikliğinin commit edilmesi gerekiyor — bunu hatırlat.

Halitcan sana ajan ismi söylemek zorunda değil. Sen karar verirsin.

### Otomatik Eşleştirme Tablosu

| Halitcan ne derse | Hangi ajanları oku |
|-------------------|--------------------|
| sayfa, component, UI, Next.js | web |
| ekran, animasyon, mobil, Expo | mobile |
| deploy, VPS, Docker, sunucu | deploy |
| tablo, migration, SQL, Supabase | database |
| giriş, login, OAuth, rol, yetki | auth + database |
| rezervasyon, müsaitlik, takvim | reservations + database |
| işletme paneli, masa planı | business + web |
| müşteri, arama, profil | customer + web |
| ödeme, abonelik, fatura | payments + database |
| SMS, email, bildirim, push | notifications + database |
| asistan, ses, Whisper, bot | ai-assistant + database |
| grafik, rapor, analitik | analytics + database + web |
| KVKK, gizlilik, hukuki | legal + web |
| test, bug, hata | testing |
| metin, copy, App Store | content |
| ne yapmalıyım, öncelik, strateji | product |

### Emin olamazsan
Görevi ikiye böl: "veri mi, UI mı?" → veri tarafı database, UI tarafı web/mobile.

---

## Kritik Proje Kuralları (Her Ajan İçin Geçerli)

1. **Terminal karışıklığı:** Web için `~/Desktop/checkrezerve`, mobile için `~/Desktop/checkrezerve-app`. Asla karıştırma.
2. **Deploy:** Claude Code sadece yazar ve push eder. Deploy komutlarını Halitcan çalıştırır.
3. **ENV:** `NEXT_PUBLIC_` → build-time (--build-arg). Runtime secret'lar → --env-file.
4. **Roller:** business_manager = sahibi gibi hissetmeli. Staff gibi gösterme.
5. **Dil:** UI her zaman Türkçe.
6. **Token:** Minimal. Keşfetmeden önce sor. Gereksiz dosya okuma yapma.
7. **Kritik Docker rule:** `docker rm -f` ile isim bazlı silme bazen çalışmaz çünkü yarım kalmış docker-compose recreate denemeleri container'ları `<hash>_isim` formatında yeniden adlandırır. `ContainerConfig KeyError` alınırsa önce `docker ps -a --format '{{.Names}}' | grep -iE "checkrezerve|nginx|whisper|certbot"` ile gerçek isimleri kontrol et, hash önekli olanları da sil, sonra `docker-compose up -d --build`.

---

## VPS Cron İşleri

| Cron | Zamanlama | İş |
|---|---|---|
| `/opt/checkrezerve` nginx watchdog | `*/5 * * * *` | checkrezerve-nginx down/exit ise recreate; log: `/var/log/nginx-watchdog.log` |
| paket-hatirlatma tetikleyici | `0 9 * * *` | `curl -H "Authorization: Bearer <CRON_SECRET>" .../api/cron/paket-hatirlatma` — **⚠ mevcut cron'da token boş, hotfix bekliyor** |
| **fail2ban GitHub Actions whitelist refresh** | `0 4 * * 1` | `/usr/local/bin/update-fail2ban-github-whitelist.sh` — `api.github.com/meta` → `.actions` CIDR listesini çekip `/etc/fail2ban/jail.d/github-actions-whitelist.local`'ı yeniden yazar, `fail2ban-client reload` yapar. Amaç: CI Deploy SSH oturumlarının fail2ban tarafından banlanmasını önlemek. Log: `/var/log/fail2ban-github-whitelist.log` |

---

## Hızlı Başvuru

| Konu | Değer |
|------|-------|
| Web VPS | 178.105.51.245 (Hetzner) |
| SSH | ssh -i ~/.ssh/checkrezerve_vps root@178.105.51.245 |
| Supabase | posarvagedpqtsrcrwfe.supabase.co |
| tmux session | claude |
| iOS build | ca15d22f (son başarılı) |
| EAS submit | eas submit --platform ios --latest |

---

## Tamamlanan İşler

- [x] **2026-06-06 — Rezervasyon sayfası yeniden tasarlandı**
  - `app/[locale]/rezervasyon/[id]/BookingForm.tsx` → 8 adımlı wizard (Kişi, Tarih, Saat, Alan, Masa, Bilgi, Özet, Başarı)
  - Restoran: 8 adım, diğer sektörler: 6 adım (alan/masa atlanır)
  - Step progress bar, Framer Motion animasyonlu geçişler
  - Tam takvim görünümü (bugün+30 gün), 4 sütunlu saat gridi
  - Mock alan ve masa verisi (İç Mekan 11, Bahçe 6, Teras 8, Sigara 5 masa)
  - `messages/*.json`: tüm dillerde yeni `rezervasyon.adim.*` key'leri eklendi
  - Auth prefill: supabase.auth.getSession() ile e-posta ve ad otomatik doldurma
  - Deployed: Hetzner VPS (docker compose up -d --build)

- [x] **2026-06-19 — Kapsamlı kod incelemesi ve güvenlik düzeltmeleri (W-01..W-10)**
  - **GÜVENLİK**: `panel-reservations` + `panel-tables` API route'ları HMAC token doğrulaması eklendi
  - **GÜVENLİK**: `panel-tables` route'unda tablo whitelist eklendi (hizmetler/calisanlar/tables/special_areas)
  - **BUG FİX**: `/api/rezervasyon/musait` endpoint'i oluşturuldu (meşgul saat slotları)
  - **PERFORMANS**: BookingForm takvim gün başlıkları locale'e göre dinamik hale getirildi
  - **SEO**: Home page ve portal sayfasına og:image + OpenGraph metadata eklendi
  - **TYPESCRİPT**: Home page'deki `as never` TypeScript workaround temizlendi
  - **ROUTING**: `middleware.ts` oluşturuldu (next-intl locale yönlendirmesi için)
  - **DOC**: agents/web/CLAUDE.md güncellendi (Next.js 14 → 15)

- [x] **2026-06-24 — W-11..W-19: profil, panel takvim, arama fix, auth, cookie banner**
  - **W-11**: `POST /api/rezervasyon` → e-posta log'u eklendi (console.log mock, Resend/Nodemailer'a hazır)
  - **W-12**: `app/[locale]/isletme/[slug]/page.tsx` → public işletme profil sayfası (Server Component, SEO metadata, Rezervasyon Yap CTA)
  - **W-13**: `SearchableBusinessList.tsx` kart layoutu güncellendi → yatay (görsel sol, isim+badge+buton sağ), loading="eager"
  - **W-14**: `app/panel/[slug]/takvim/` → `WeeklyView.tsx` eklendi (7 sütun haftalık görünüm), monthly/weekly toggle (?view=haftalik)
  - **W-15**: Panel dashboard stat kartları güncellendi → Bugünkü/Bu Hafta/Onay Bekleyen/İptal, her kart filtreli rezervasyon listesine link
  - **W-16**: `app/[locale]/profil/page.tsx` → "Son Rezervasyonlar" bölümü eklendi (son 5, guest_email ile sorgu)
  - **W-17**: `app/[locale]/giris/page.tsx` → zaten tam implement edilmiş (Google+Apple OAuth, Türkçe hatalar) — değişiklik yok
  - **W-18**: `CookieBanner` locale layout'a eklendi (`app/[locale]/layout.tsx`)
  - **W-19**: `not-found.tsx` güncellendi → "Rezervasyon Yap" butonu eklendi
- [x] **2026-06-24 — W-21..W-29: SEO, gerçek veri, auth, favoriler, toast**
  - **W-21**: `isletme/[slug]/page.tsx` → JSON-LD LocalBusiness schema markup eklendi
  - **W-22**: Rezervasyon listesi sayfası `getSupabaseAdmin` → `getSupabase` (anon client) geçiş
  - **W-23**: Panel takvim gerçek veri zaten W-14'te yapılmıştı (WeeklyView + Supabase)
  - **W-24**: Panel dashboard istatistik kartları W-15'te yapılmıştı
  - **W-25**: Giriş sayfası zaten tam implement edilmişti (Google+Apple OAuth)
  - **W-26**: Şifre sıfırlama sayfaları zaten implement edilmişti
  - **W-27**: `favorilerim/page.tsx` → `business_type` + `cover_image` join, skeleton loading, boş durum Türkçe
  - **W-28**: `FavoriteToggle.tsx` oluşturuldu (Supabase auth+DB bağlantılı), `BusinessDetailHero`'ya entegre, `restaurantId` prop eklendi
  - **W-29**: `BookingForm.tsx` → `useToast()` entegre (başarı=yeşil, hata=kırmızı)
- [x] **2026-06-24 — W-31..W-39: işletme detay, filtre, panel CRUD, blog, performans**
  - **W-31**: `isletme/[slug]/page.tsx` → hizmetler + çalışanlar bölümleri eklendi (paralel sorgu), FavoriteToggle hero'ya entegre
  - **W-32**: `SearchableBusinessList.tsx` → sıralama chips (En Yeni / A–Z / Yakın) + temizle butonu eklendi
  - **W-33**: `RezervasyonList.tsx` → satır tıklama → detay modal (AnimatePresence, spring anim, alan tablosu, Onayla/İptal/Tamamla/Geri Al aksiyonları)
  - **W-34**: Panel StaffManager (çalışan CRUD) zaten tam implement edilmişti — değişiklik yok
  - **W-35**: Panel ServiceManager (hizmet CRUD) zaten tam implement edilmişti — değişiklik yok
  - **W-36**: `rezervasyonlarim/page.tsx` → 3 sekme (Yaklaşan/Geçmiş/İptal), guest_email sorgusu, satır tıklama detay modal, iptal butonu (sadece pending+gelecek tarih)
  - **W-37**: Blog sayfaları zaten tam implement edilmişti (6 yazı, i18n, SEO) — değişiklik yok
  - **W-38**: `app/[locale]/loading.tsx` oluşturuldu (spinner + "Yükleniyor..." metni)
  - **W-39**: `home/page.tsx` + `hakkimizda/page.tsx` → `loading="lazy"` → `loading="eager"` (Framer Motion opacity:0 bug önlemi)
- [x] **2026-06-24 — W-41..W-49: rezervasyon API, onay sayfası, panel güncelleme, i18n, PWA**
  - **W-41**: `POST /api/rezervasyon` zaten gerçek Supabase insert yapıyordu — doğrulandı, değişiklik yok
  - **W-42**: `app/[locale]/rezervasyon/[id]/onay/page.tsx` oluşturuldu (Server Component, ?ref= query param ile rezervasyon detayı, ConfettiClient, Rezervasyonlarım + Ana Sayfa butonları)
  - **W-43**: `/panel/[slug]/misafirler/page.tsx` zaten tam implement edilmişti (phone bazlı aggregation, arama destekli MisafirList) — değişiklik yok
  - **W-44**: `/panel/[slug]/abonelik/page.tsx` zaten tam implement edilmişti (plan kartı, ödeme geçmişi) — değişiklik yok
  - **W-45**: giris/profil için tüm dil dosyalarında keys mevcut — doğrulandı. favorilerim/rezervasyonlarim hardcoded TR kullanıyor (i18n entegrasyonu yok)
  - **W-46**: `app/manifest.ts` → name/short_name 'CheckRezerve', theme_color #E53935, background_color #2B1B17
  - **W-47**: `app/sitemap.ts` → /profil ve /favorilerim eklendi; robots.ts zaten panel/admin disallow yapıyordu
  - **W-48**: `/panel/[slug]/ayarlar/page.tsx` + `SettingsForm.tsx` zaten tam implement edilmişti (çalışma saatleri, kapalı günler, ön ödeme, Supabase update) — değişiklik yok
  - **W-49**: 7 dosyadan tüm console.log kaldırıldı; TypeScript any kaldı (Supabase typing workaroundları — as any/as unknown)
  - **W-50**: i18n routing.ts → /rezervasyonlarim, /favorilerim, /rezervasyon/[id]/onay eklendi (TS fix)
- [x] **2026-06-25 — W-51..W-59: rezervasyon iyileştirme, panel bugün, arama filtre, puan, rapor, SEO**
  - **W-51**: BookingForm.tsx saat slotları → meşgul kırmızı (bg-red-50/border-red-200), müsait yeşil (bg-green-50/border-green-200)
  - **W-52**: TodayView.tsx → auto-refresh her 60 saniyede (setInterval + router.refresh, sadece bugün görünümünde)
  - **W-53**: SearchableBusinessList.tsx → Filtreler butonu + drawer (şehir dropdown, adres bazlı filtreleme, aktif filtre badge)
  - **W-54**: SearchableBusinessList.tsx → StarRating component, rezervasyon/page.tsx reviews tablosu sorgusu (silent fallback), "Henüz değerlendirme yok" gösterimi
  - **W-55**: `app/panel/[slug]/raporlar/` oluşturuldu (bu ay/geçen ay karşılaştırma, recharts 7 günlük bar chart, top 5 müşteri, en popüler saat)
  - **W-56**: next.config.ts → image formats avif/webp, deviceSizes/imageSizes optimize edildi
  - **W-57**: public/sw.js zaten tam implement edilmişti; `profil/NotificationToggle.tsx` oluşturuldu (izin kontrolü, "Bildirimleri Aç" butonu), profil sayfasına entegre
  - **W-58**: RestaurantDetail.tsx → is_verified field, verifyRestaurant() / rejectRestaurant() fonksiyonları, Onayla/Reddet butonları
  - **W-59**: isletme/[slug] → BreadcrumbList JSON-LD schema eklendi; OG image dinamik /api/og route'a bağlandı; `app/api/og/route.tsx` oluşturuldu (next/og ImageResponse, edge runtime) (önceki oturumda yapıldı)

- [x] **2026-06-25 — W-61..W-66: middleware, email fix, sitemap, i18n eksik sayfalar, isletme detail i18n, admin login**
  - **W-61**: `middleware.ts` oluşturuldu — root `/` → locale redirect, `/panel` ve `/admin` auth guard
  - **W-62**: `[slug]/actions.ts` → `guest_email` eklendi, email_logs trigger artık çalışıyor
  - **W-63**: `app/sitemap.ts` → işletme URL'leri `/[slug]` → `/isletme/[slug]` düzeltildi
  - **W-64**: i18n: `favorilerim`, `rezervasyonlarim`, `giris` sayfaları `useTranslations`'e geçirildi; 7 dilde `favorites`, `myReservations`, auth ek key'leri eklendi
  - **W-65**: `isletme/[slug]/page.tsx` → hardcoded TR metinler `useTranslations('isletmeDetail')` ile değiştirildi; JSON-LD (`LocalBusiness` + `BreadcrumbList`) locale-aware yapıldı; 7 dilde `isletmeDetail` namespace'i eklendi
  - **W-66**: `app/admin/login/` → `ADMIN_PASSWORD` sistemi kaldırıldı; Supabase Auth (`signInWithPassword`) + `profiles.role = 'super_admin'` kontrolü eklendi; 4 admin API route'u ve middleware güncellendi; token formatı `userId:HMAC(userId)`
- [x] **2026-06-25 — W-67..W-69: iptal sayfası, push notification, admin pagination + arama**
  - **W-67**: `app/[locale]/rezervasyon/iptal/[token]/page.tsx` + `CancelForm.tsx` oluşturuldu; token doğrulama, status→cancelled update, cancelUrl SMS entegrasyonu; `cancellation_token` migration SQL
  - **W-68**: web-push kuruldu; VAPID key üretildi; `POST /api/push/subscribe` (abonelik kaydı) + `POST /api/push/send` (VAPID ile push gönderme, dinamik import) route'ları oluşturuldu; `push_subscriptions` migration SQL; public/sw.js push handler zaten mevcuttu
  - **W-69**: `app/admin/RestaurantList.tsx` — 20'şer sayfalama + arama (isim/slug); `ReservationDashboard.tsx` — 20'şer sayfalama + tab değişince sayfa sıfırlama
- [x] **2026-06-25 — W-70..W-72: rol tabanlı izinler, SEO ince ayar, n8n test + audit log**
  - **W-70**: `lib/roles.ts` — 8 granüler yetki fonksiyonu eklendi: `canDeleteReservation`, `canManageStaff`, `canEditSettings`, `canViewReports`, `canManageTables`, `canManageServices`, `canViewSubscription`, `canViewGuests`; `roleWeight` hiyerarşisi (super_admin 100 → customer 10)
  - **W-71**: `app/robots.ts` — doğrulanmamış işletme path'leri disallow, Googlebot için ayrı kural; `app/api/og/route.tsx` — varsayılan type `'İşletme'` → `'Online Booking'`
  - **W-72**: n8n workflow dosyası doğrulandı (`n8n/checkrezerve-workflow.json` 233 satır); `app/api/admin/audit-logs/route.ts` (POST/GET) oluşturuldu; `admin_audit_logs` migration SQL; `RestaurantDetail.tsx`'te onay/red aksiyonlarına audit log eklendi (`restaurant_verified` / `restaurant_rejected`)
- [x] **2026-06-26 — W-73: Restoran masa krokisi: 3 secilebilir model**
  - **W-73**: `FloorPlanPicker.tsx` yeniden yazıldı — SVG tabanlı 3 model (Salon/Teras/Lounge) sekme sistemi; `businessType === 'restaurant'` kontrolü (diğer sektörlerde gösterilmez); masa durumları: boş (gri), dolu (kırmızı, tiklanamaz), seçili (marka kırmızı #E53935); marka renkleri (#E53935, #2B1B17, #D4A373); seçilen masa `table_id` olarak form payload'ına eklenir
- [x] **2026-06-26 — W-74..W-76: email HTML template, kod kalite pass, performans optimizasyonu**
  - **W-74**: `supabase/functions/send-emails/index.ts` — markalı HTML template eklendi (logo, #E53935/#2B1B17/#D4A373 renkler, responsive card); hem `html` hem `text` fallback ile Resend'e gönderim; trigger'dan gelen düz metin body HTML'e dönüştürülür
  - **W-75**: `console.log` temizliği ✅ (web app'te 0 adet); kullanılmayan `MasalarContent` ara wrapper kaldırıldı, `any` tipi temizlendi; `npx tsc --noEmit` hatasız
  - **W-76**: görsel `loading="eager"` kuralı korundu (Framer Motion bug); `next/font/google` font preload zaten root layout'ta aktif; metadata/kewywords genişletildi
- [x] **2026-06-26 — W-77..W-78: InteractiveFloorMap (izometrik) + FloorMapEditor taslağı**
  - **W-77**: `components/InteractiveFloorMap.tsx` (381 satır) — SVG izometrik masa krokisi; `TableLayout` tipi (id, label, shape, x, y, seats, zone, status); 3 zone sekmesi (Salon/Teras/Lounge); `toIso()` izometrik dönüşüm (diamond kareler + elips yuvarlaklar); Framer Motion animasyon (renk geçişi 300ms easeInOut, hover scale 1.05); drop-shadow filtresi; bos #C9A678 / dolu #C26B5C / secili #E53935 + #2B1B17 detay; `mapRestaurantTables()` mapping fonksiyonu; `businessType === 'restaurant'` kontrolü
  - **W-78**: `components/FloorMapEditor.tsx` (117 satır) — sürükle-bırak masa düzenleyici iskeleti; grid referans çizgileri; MouseDown/Move/Up event handler placeholder; "Kaydet" butonu Supabase update imzalı
  - **Entegrasyon dokümanı**: `~/Desktop/floormap-entegrasyon.md` (122 satır) — tablo yapısı, kolon açıklamaları, Supabase sorgusu, JSX kullanımı, component API dokümantasyonu
- [x] **2026-06-26 — W-79: InteractiveFloorMap rezervasyon akışına bağlandı**
  - **W-79**: `BookingForm.tsx` → eski `FloorPlanPicker` import'u kaldırıldı; `InteractiveFloorMap` import edildi; `FloorTable → TableLayout` adaptör fonksiyonu (`toTableLayouts()`) eklendi; `selectedArea` zone olarak geçirildi; `businessType` prop'u korundu; `dynamic` import temizlendi
- [x] **2026-06-26 — W-BLUEGREEN: Zero-downtime blue-green deployment**
  - `docker-compose.yml`: `app` servisi `blue` (port 3001) ve `green` (port 3002) olarak ikiye bölündü; ikisi de aynı image, farklı container isimleri
  - `nginx.conf`: upstream `nextjs_upstream` deploy script'i tarafından `sed` ile güncellenir; `nginx -s reload` ile kesintisiz geçiş
  - `deploy.sh`: rsync → active_slot oku → pasif slot build + health check (3×10sn) → nginx reload switch → active_slot güncelle → eski container durdur → "Kesinti: 0 saniye"
  - İlk kurulum: `active_slot=blue`, blue:3001 aktif, green:3002 pasif bekliyor
  - Deploy testi geçti ✅ kesinti olmadan green'e geçildi

- [x] **2026-06-26 — W-79: InteractiveFloorMap baglantisi + fixler**
  - `BookingForm.tsx`: `FloorPlanPicker` → `InteractiveFloorMap`; `toTableLayouts()` adaptörü; `specialAreas` dinamik zone'lar
  - `InteractiveFloorMap.tsx`: `areas` prop'u ile dinamik zone sekmeleri; `TableLayout.zone` tipi `string` yapıldı
  - Booking form'da masa verisi boşsa varsayılan 8 test masası oluşturulur
  - `page.tsx`: `tables` → `masa_tipleri`, `is_active` → `aktif`, `restaurant_id` → `isletme_id`, `label` → `ad`, `capacity` → `kapasite`
  - `floorPlanEnabled`: feature flag kontrolü kaldırıldı, sadece `floorTables.length > 0`
  - W-74..W-76: email HTML template (markalı), kod kalite (console.log temiz, any azaltıldı), performans (font preload, metadata)
- [x] **2026-06-26 — W-84..W-86: SEO son kontrol, performans, son deploy + sağlık kontrolü**
  - **W-84**: canonical URL (root + locale layout + sitemap) ✅; hreflang 7 dil eksiksiz ✅; JSON-LD (Organization, WebSite, SoftwareApplication, LocalBusiness, BreadcrumbList, FAQPage) ✅
  - **W-85**: `next build` 236 statik sayfa, 0 hata, 0 uyarı ✅; bundle uyarısı yok; `next/image` 19 kullanım, native `<img>` yok; TypeScript fix: `LanguageSelector`'da `l` → `loc`, `ScrollToTop`'ta çift aria-label temizlendi
  - **W-86**: 🟢 Blue-green deploy başarılı (green aktif); Nginx `depends_on` fix; nginx reload sorunu çözüldü (`docker compose up -d nginx --no-deps`); tüm kritik route'lar 200 ✅; eski `checkrezerve-blue` ve `checkrezerve-app` temizlendi
- [x] **2026-06-26 — deploy.sh basitlestirme: blue single-container deploy**
  - `deploy.sh`: blue-green karmasıklığı kaldırıldı → single container modeli
  - Artik: tsc → rsync → `docker compose build blue` → `docker compose up -d blue --no-deps` → 30sn bekle → health check (curl + docker exec fallback) → `nginx -s reload`
  - KRITIK: nginx hic restart edilmez, sadece reload; `docker compose down` kullanilmaz; nginx.conf'a dokunulmaz
  - Health check basarisizsa deploy iptal edilir, eski container calismaya devam eder
  - Test: `checkrezerve-blue:3001` healthy, site 200 OK ✅
- [x] **2026-06-26 — W-88: Izometrik kroki BookingForm baglantisi**
  - `BookingForm.tsx`: `InteractiveFloorMap` zaten import edilmis ve masa secimi adiminda kullaniliyor
  - `toTableLayouts()` adaptoru: `FloorTable` → `TableLayout` donusumu; x/y koordinati yoksa otomatik grid hesaplama (`Math.round(t.x / 40) || 1`)
  - `table_id`: `safeTableId` olarak payload'a ekleniyor (UUID dogrulamali)
  - `businessType === 'restaurant'` kontrolu: masa adimi sadece restoranlarda gosteriliyor

- [x] **2026-06-26 — W-89: Samba POS webhook test**
  - `POST /api/pos/samba/webhook` endpoint canliya cikti
  - Test sonuclari: 404 dondu cunku endpoint deploy edilmemisti (W-87 onbording deploy'u bu endpointi icermiyordu)
  - **Fix:** deploy.sh calistirildi, endpoint canliya cikti
  - Test: 401 (`X-Webhook-Secret header required`) — dogru calisiyor ✅
- [x] **2026-06-26 — Takvim Modülü (günlük/haftalık/aylık görünüm, slide-over edit, soft-delete undo, realtime)**
  - Mevcut CalendarGrid + WeeklyView korundu, geliştirildi
  - **Yeni**: `DailyView.tsx` — 08:00-23:00 saat slot grid, her slot tıklanabilir, +Ekle butonu
  - **Yeni**: `CalendarSidebar.tsx` — sağdan slide-over panel, tarih/saat/personel/not düzenleme, soft-delete + 5sn "Geri Al" tostu
  - **Yeni**: `actions.ts` — 3 server action (updateReservation, softDeleteReservation, undoDeleteReservation)
  - **Yeni**: `TakvimClient.tsx` — client wrapper, realtime subscription (Supabase postgres_changes), 3 görünüm toggle (Günlük/Haftalık/Aylık)
  - **Tip**: `CalendarTypes.ts` — TakvimReservation, ViewMode
  - Renkler: onaylı=yeşil, beklemede=amber, iptal=kırmızı/soluk, gold accent (#D4A373), primary (#0d2e1c)
  - Marka uyumu: mevcut panel renk şeması, Framer Motion animasyonları
  - Responsive: tablet uyumlu, loading skeleton, empty state
  - `npx tsc --noEmit` ✅
  - `git commit -m "feat: takvim modulu - gunluk/haftalik/aylik, inline edit, undo"`

- [x] **2026-06-26 — W-88..W-89: Izometrik kroki baglantisi + POS webhook test**
  - W-88: `InteractiveFloorMap` zaten bagli; `toTableLayouts()` adaptor; `table_id` payload'a gidiyor ✅
  - W-89: `POST /api/pos/samba/webhook` endpoint test edildi, calisiyor (401 dondu ✅)

- [x] **2026-07-02 — W-90: Onboarding calisma saatleri bug fix (day_* → working_hours JSONB)**
  - **SORUN**: Onboarding formu `restaurants` tablosunda olmayan `day_mon_open`, `day_mon_close` gibi kolonlara yazmaya calisiyordu → "Could not find the 'day_fri_close' column" hatasi
  - **COZUM**: `actions.ts` → FormData'dan `day_*` kolonlari yerine `working_hours` JSONB objesi olusturup restaurants.update'a gonderiyor
  - **FORMAT**: `{ monday: { open: true, start: "09:00", end: "18:00" }, tuesday: {...}, ... }` (mevcut WorkingDayHours tipiyle uyumlu)
  - **YUKLEME**: `Step1BusinessInfo.tsx` → `getHour(idx, 'start'|'end')` ve `isClosed(idx)` fonksiyonlariyla `restaurant.working_hours` JSONB'den formu dolduruyor (edit senaryosu)
  - **VALIDASYON**: `open < close` kontroli (kapali gunlerde saat kontrolu yok); her gun icin lokalde hata mesaji
  - **API**: `getSupabaseAdmin()` kullaniliyor (RLS bypass), onboardinge ozel server action
  - **ETKILENEN**: sadece `app/panel/[slug]/onboarding/actions.ts` + `Step1BusinessInfo.tsx`
  - **DIGER TARAFLAR**: Mevcut SettingsForm, bugun/page.tsx, panel-settings API route'u zaten `working_hours` kullaniyordu — degisiklik gerekmedi
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-07-02 — W-91 + W-92: Switch toggle + form validasyonu**
  - **W-91**: Checkbox (`Kapalı` yazılı, kafa karıştırıcı) → **Switch toggle** (yeşil=Açık, gri=Kapalı)
    - Switch AÇIK → saat inputları aktif, KAPALI → inputlar disabled + opacity %40
    - Mapping tek yerde yorumlu: `day_N_open` value `'on'`/`'off'` ↔ `working_hours.day.open = true/false`
    - Varsayılan: yeni onboarding'te **tüm günler AÇIK, 09:00-18:00**
  - **W-92**: Client + server validasyon:
    - Telefon: TR format regex (`/^(0\d{10}|\+90\d{10})$/`), harf girişi keydown'da engellenir
    - Web sitesi: opsiyonel, doluysa `new URL()` ile URL validasyonu
    - İşletme adı min 2, adres min 5 karakter
    - Çalışma saatleri açık günlerde start < end zorunlu
    - Hata mesajları alan altında **kırmızı text**, submit'te ilk hatalı alana **scroll+focus**
    - Server-side (`actions.ts`) aynı validasyonları tekrar eder
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-07-03 — W-94: Hizmetler kolon hatası + restoran/kafe için onboarding hizmet adımını atlama**
  - **SORUN 1**: `addService` DB'de olmayan `duration_minutes` ve `price` kolonlarına insert yapıyordu, gerçek kolonlar `sure_dakika` ve `fiyat`
  - **FİX 1**: `actions.ts`'de insert kolonları `sure_dakika` / `fiyat` olarak düzeltildi; `Step2Services.tsx` tip ve input name'leri de güncellendi
  - **SORUN 2 (ÜRÜN)**: Restoran/kafe işletmelerinde süre+fiyat bazlı hizmet tanımlamak anlamsız — masa düzeni yeterli
  - **FİX 2**: `page.tsx` → `business_type` kontrolü: `restaurant` veya `cafe` ise hizmet adımı tamamen atlanır, onboarding 4 adıma düşer
  - **FİX 3**: `Step2Services.tsx` → restoran/kafe için bilgilendirme kartı + opsiyonel details form gösterilir, "Devam Et" butonunda hizmet zorunluluğu yok
  - **FİX 4**: `StepIndicator.tsx` → `isNoService` prop'u ile 4 adımlı (Bilgiler/Çalışanlar/Masa/Tamam) veya 5 adımlı gösterim
  - **FİX 5**: `/onboarding/{2,3,4,5}/page.tsx` → her biri `totalSteps` ve `isNoService` prop'larını StepIndicator'a geçirir; adım 3 (çalışanlar) restoran için adım 2 olarak görünür
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-07-03 — W-95: Onboarding "Ünvan" placeholder'ı işletme tipine göre dinamik**
  - **SORUN**: `Step3Staff.tsx`'te ünvan placeholder'ı sabit "Örn: Berber Ustası" idi
  - **COZUM**: `src/constants/roleSuggestions.ts` oluşturuldu — `getRolePlaceholder(businessType)` fonksiyonu
  - **HARITA**: restoran→"Örn: Garson", kuaför→"Örn: Kuaför", spa→"Örn: Masör", pilates→"Örn: Pilates Eğitmeni", berber→"Örn: Berber Ustası", fitness→"Örn: Antrenör", klinik→"Örn: Fizyoterapist", vb.
  - **İLETİM**: `3/page.tsx` → `businessType` prop'u ile Step3Staff'e aktarılır
  - **ETKİLENEN**: `Step3Staff.tsx` (prop + placeholder), `3/page.tsx` (prop geçişi)
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-07-03 — W-96: Salon Krokisi login'e yönlendirme hatası (auth bug)**
  - **SORUN**: `/panel/[slug]/kroki` sayfası, kullanıcı giriş yapmış olmasına rağmen `/panel/login`'e yönlendiriyordu
  - **NEDEN**: `page.tsx`'teki `SELECT` sorgusu Supabase'de **olmayan** `kroki_data` ve `kroki_enabled` kolonlarını içeriyordu → Supabase hata döndü → `restaurant` null oldu → `redirect('/panel/login')` çalıştı
  - **TESPİT**: Supabase OpenAPI şemasından doğrulandı — `kroki_zones` var ✅ ama `kroki_data` ve `kroki_enabled` migration'ları (`20260630000001_kroki_editör.sql`) Supabase'e çalıştırılmamış ❌
  - **FİX**: `SELECT`'ten `kroki_data` ve `kroki_enabled` kaldırıldı; `initialData` sabit `[]` olarak geçirildi
  - **ETKİLENEN**: `app/panel/[slug]/kroki/page.tsx`
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-07-03 — W-97: Salon Krokisi canvas boyutlandırma + SetupModal kapatma**
  - **SORUN 1**: Canvas alanı container'a göre sığmıyordu — SVG varsayılan 300×150 koordinat sistemi kullandığı için 12m×10m (720×600px) canvas'ın sadece 1/6'sı görünüyordu
  - **ÇÖZÜM**: SVG'ye `viewBox="0 0 {canvasW} {canvasH}"` eklendi + `preserveAspectRatio="xMidYMid meet"` → canvas container genişliğine otomatik ölçeklenir
  - **SORUN 2**: "Kat Ekle" → "Salon Kurulumu" modalının **kapatma mekanizması yoktu** — X butonu eksik, ESC dinlenmiyor, backdrop tıklama çalışmıyordu
  - **ÇÖZÜM**: `SetupModal.tsx`'e `onCancel` prop'u eklendi; ✕ butonu (sağ üst), `Escape` keydown handler, backdrop `onClick={e => e.target === e.currentTarget ? onCancel() : null}` eklendi
  - **ETKİLENEN**: `src/components/kroki/SetupModal.tsx`, `src/components/kroki/KrokiEditor.tsx`
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-07-03 — W-98: Kroki canvas aşırı küçük + masa tipi yerleşmiyor**
  - **SORUN 1**: Canvas minik bir kareye sıkışmıştı — W-97'deki `viewBox="0 0 720 600"` sabit
    değeri container boyutunu dikkate almıyor, canvas içerikten küçük kalıyordu
  - **ÇÖZÜM**: `transform translate+scale` tamamen kaldırıldı, zoom/pan viewBox üzerinden
    yapılıyor. `viewBox` dinamik: `${-panX/zoom} ${-panY/zoom} ${containerW/zoom} ${containerH/zoom}`.
    **Fit-to-container**: ilk yüklemede `fitZoom = min(containerW/canvasW, containerH/canvasH) * 0.85`
    ile canvas container'a tam sığar. Kullanıcı zoom yapınca `hasUserZoomed` flag'i set edilir,
    manuel zoom'a geçilir. `ResizeObserver` ile container boyutu canlı izlenir.
  - **SORUN 2**: Masa tipi seçip canvas'a tıklayınca masa yerleşmiyordu — nedeni: SVG içindeki
    `<g>` elemanı grid/image/rect gibi alt elemanlar tıklamayı yutuyor, `onClick` SVG'e
    ulaşamıyordu
  - **ÇÖZÜM**: `<g>` wrapper'a `style={{ pointerEvents: 'none' }}` eklendi (tıklama SVG'e
    geçsin diye), masa node'larına `pointerEvents: 'auto'` eklendi (taşınabilir kalsın diye)
  - **ETKİLENEN**: `src/components/kroki/KrokiEditor.tsx`
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-07-03 — W-99: Salon Krokisi "Kaydedilemedi" hatası**
  - **SORUN**: Masa yerleştirip Kaydet'e basınca "Kaydedilemedi" hatası çıkıyordu
  - **ROOT CAUSE**: `POST /api/panel/kroki` route'u `restaurants.update({ kroki_data, kroki_enabled })` yapıyordu → **bu kolonlar Supabase'de yok** (W-96'da da tespit edilmişti). Supabase hata döndü, client ise `!res.ok` kontrol edip gerçek hatayı gizleyip "Kaydedilemedi" basıyordu.
  - **FİX 1** (`app/api/panel/kroki/route.ts`): `kroki_data` ve `kroki_enabled` referansları kaldırıldı. Artık **`kroki_zones`** kolonuna yazılıyor (Supabase'de var olan tek JSONB kolon). GET endpoint'i de `kroki_zones` okuyor.
  - **FİX 2** (`KrokiEditorPage.tsx`): Client tarafında payload key `kroki_data` → `floor_data` olarak değiştirildi. Hata durumunda response body'den gerçek error mesajı (`errBody.error`) okunup toast'ta gösteriliyor. `catch (e)` ile hata tipi kontrolü eklendi.
  - **FİX 3**: `console.error('[Kroki POST]', error.message)` ile sunucu tarafına log eklendi.
  - **TEST**: Supabase REST API ile doğrudan `PATCH kroki_zones` testi yapıldı → başarılı ✅. Test verisi sonra `[]`'a resetlendi.
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-07-03 — W-100: Kroki kayıt sonrası 404/error boundary hatası**
  - **SORUN**: Masa ekleyip kaydettikten sonra sayfa yenilenince "Bir Şeyler Ters Gitti" (error boundary) açılıyordu
  - **TESPİT**: VPS log'unda `TypeError: Cannot read properties of undefined (reading 'length')` → `KrokiTabsPage` içinde `.map()` çağrısı `undefined` iterate ediyor
  - **ROOT CAUSE**: W-99'da `POST /api/panel/kroki` floor verisini `kroki_zones` kolonuna yazmaya başladı. Sayfa yenilenince `page.tsx` `kroki_zones`'u `KrokiZone[]` cast'i ile `initialZones`'a geçirdi, ama içerik floor objeleri (tables/canvasW property'leri, polygon yok) içeriyordu → `ZoneEditor`'da tip uyuşmazlığı → `.map()` undefined
  - **FİX**: `page.tsx`'te `kroki_zones` verisi ikiye filtreleniyor:
    - `polygonalZones`: `polygon` property'si olan → `initialZones` (Zone Editor)
    - `floorData`: `tables`'ı olan veya polygon'suz düz objeler → `initialData` (Kroki Editor)
  - **ETKİLENEN**: `app/panel/[slug]/kroki/page.tsx`
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-07-05 — W-100: Bölge Sistemi Redesign + ZoneViewer bağlantısı**
  - **BÖLÜM A — Bölge Sistemi (canvas'sız kart modeli)**
    - **A1**: `kroki_mode` kolonu migration SQL (`supabase/migrations/20260705_kroki_redesign.sql`) — ALTER TABLE restaurants ADD kroki_mode TEXT CHECK('tables','zones') DEFAULT 'zones'. Mod seçici UI: `ModeSelector.tsx` (iki kart: Detaylı Masa Krokisi / Bölge Kartları)
    - **A2**: `NewZoneEditorPage` — canvas tamamen kaldırıldı, yerine kart grid'i + sağ panelde düzenleme (ad, tema, renk, kapasite, masa sayısı, sil)
    - **A3**: Özel fotoğraf yükleme — `POST /api/panel/zone-photo` → Supabase Storage `kroki/zone-photos/{restaurantId}/{zoneId}.webp`, max 5MB. `NewZoneEditorPage`'de "Fotoğraf Seç" + "Varsayılana Dön" butonu
    - **A4**: Migration SQL'i manuel çalıştırıldı (kroki_mode kolonu eklendi, eski zonelara theme atandı)
    - **A5**: `ZoneViewer` müşteri tarafı — SVG/canvas tamamen kaldırıldı, yerine kart listesi (görsel + ad + kapasite + theme). `BookingForm.tsx`'e `krokiMode`+`krokiZones` prop'ları eklendi; `renderMasaSelect()` içinde `krokiMode === 'zones'` ise `ZoneViewer`, `'tables'` ise `InteractiveFloorMap`
  - **BÖLÜM B — Masa Editörü canvas bug'ları**
    - **B1**: Fit-to-container iyileştirme — `requestAnimationFrame` ile ilk render'da container 0 dönerse tekrar ölç, padding %85→%90
    - **B2**: Boş kat viewBox fallback — `DEFAULT_VIEWBOX = '0 0 720 600'`
  - **ETKİLENEN**: `src/components/kroki/KrokiEditor.tsx`, `src/components/kroki/SetupModal.tsx`, `src/components/kroki/ModeSelector.tsx` (yeni), `src/components/kroki/ZoneViewer.tsx`, `src/types/kroki-zone.ts`, `app/panel/[slug]/kroki/page.tsx`, `app/panel/[slug]/kroki/KrokiTabsPage.tsx`, `app/panel/[slug]/kroki/NewZoneEditorPage.tsx` (yeni), `app/api/panel/kroki-mode/route.ts` (yeni), `app/api/panel/zone-photo/route.ts` (yeni), `app/[locale]/rezervasyon/[id]/page.tsx`, `app/[locale]/rezervasyon/[id]/BookingForm.tsx`, `supabase/migrations/20260705_kroki_redesign.sql` (yeni)
  - **TS**: `npx tsc --noEmit` hatasiz ✅

- [x] **2026-08-01 — Sprint 1: Güvenlik Acil (5 görev, tümü tamamlandı)**
  - **S1-T1**: `reservations` RLS — `USING(true)` → `USING(phone = get_my_phone())` (migration: `20260801_fix_reservations_rls.sql`)
  - **S1-T2**: n8n port 5678 kapatıldı, `N8N_BASIC_AUTH_ACTIVE=true`, DB şifresi env'e taşındı
  - **S1-T3**: 4 dosyadaki hardcoded fallback secret kaldırıldı (`'checkrezerve-fallback-secret'`), `lib/env.ts` startup validator eklendi
  - **S1-T4**: `/api/panel/[slug]/calendar-events` ve `/api/panel/[slug]/ciro-ozet` endpoint'lerine session doğrulama eklendi
  - **S1-T5**: `/api/ai-reserve`, `/api/ai-assistant/*` endpoint'lerine feature flag kontrolü eklendi
  - **Kapatılan bulgular:** G1, G2, G3, G4, G5, A1, A2, A3, I3

- [x] **2026-08-01 — Sprint 2: İş Mantığı (5 görev, tümü tamamlandı)**
  - **S2-T1**: `check_reservation_availability()` PostgreSQL fonksiyonu — zaman çakışması + kapasite kontrolü tek DB sorgusunda
  - **S2-T2**: `lib/roles.ts` fonksiyonları (`canDeleteReservation`, `canManageStaff`, `canManageTables`, `canEditSettings`) API route'larına bağlandı
  - **S2-T3**: `/api/health` endpoint'i Supabase DB sorgusu yapacak şekilde güncellendi (stub'dan gerçek health check'e)
  - **S2-T4**: Redis (Upstash) rate limiting — `lib/rate-limit.ts` in-memory Map → Redis, blue/green container bypass sorunu çözüldü
  - **S2-T5**: `lib/notification-orchestrator.ts` — AI rezervasyon bildirimi, iptal bildirimi, n8n tüm kanallar için tetikleniyor
  - **Kapatılan bulgular:** I1, I2, I4, A5, G8, A6, E1, E2, E4

- [x] **2026-08-01 — Sprint 3: Performans & Kod Temizliği (10 görev, tümü tamamlandı)**
  - SELECT * → explicit kolon listesi (26+ sorgu)
  - console.log temizliği (50+ statement kaldırıldı)
  - `withPanelAuth` merkezi middleware — 15+ route'daki tekrar ortadan kalktı
  - `audio-sentences.ts` lazy/split — 129KB bundle yükü azaltıldı
  - `force-dynamic` → `revalidate: 3600` (ISR) — işletme detay sayfaları
  - `actions.ts:115-121` race condition fix — insert sonrası ID ayrı SELECT yerine tek sorguda
  - Hardcoded URL'ler (`Railway URL`, `localhost:5001`) env'e taşındı
  - `conversations` tablosu RLS `USING(true)` → super_admin kontrolüne güncellendi
  - Composite index'ler: (restaurant_id, phone, date), (restaurant_id, ozellik_kodu), (restaurant_id, session_id)
  - Abonelik kontrolü `app/panel/[slug]/layout.tsx`'e eklendi
  - **Not:** `proxy.ts` S3-T4 değişikliği working tree'de — commit edilmesi gerekiyor
  - **Kapatılan bulgular:** P1, P2, P3, K1, K4, K5, K6, S4, S5, I7

<!-- DEVAM NOKTASI: Sprint 4 — proxy.ts commit et, sonra UX görevleri -->
