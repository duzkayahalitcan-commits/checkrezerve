# Durum — 23–25 Eylül 2026 (web: checkrezerve)

> **Güncelleme 25 Eylül ~10:00 UTC:** aşağıdaki 'bekleyen' commit'lerin hepsi + altyapı kararları deploy edildi. Bkz. §0.

> Tek sayfalık güncel durum. Ayrıntılar: `gece-raporu-2026-09-23.md`, `ozellik-denetimi-2026-09-23.md`, API sözleşmeleri `api-sozlesmeleri.md`.

## 0. 25 Eylül deploy'u (image `6b844241ffae`, main `74f25f9` öncesi `51d13c7` + canonical düzeltmesi bekliyor)
- **Deploy edilen:** §2'deki 13 commit + `57b0ee6` (deploy.yml silindi), `1add13b` (deploy.sh `.env*` hariç), `b8c7965` (Redis), `51d13c7` (gerçek 404).
- **Geri dönüş:** `checkrezerve:rollback-20260924` (`d49baf63f6df`). VPS env yedeği: `/opt/checkrezerve/.env.bak-20260925`.
- **.env:** `REDIS_PASSWORD` (48 hex, VPS'te üretildi, hiç gösterilmedi) + `REDIS_URL=redis://:***@checkrezerve-redis:6379` eklendi.
- **Doğrulama (canlı):** 6 container ayakta (redis healthy, şifresiz erişim NOAUTH); `/api/health` → `redis: ok`; `/tr/bu-sayfa-yok`, `/tr/isletme/olmayan`, `/tr/rezervasyon/<olmayan>` → **404**, mevcut sayfalar 200; sitemap 210 URL, işletme sayfaları var, `/en/register` (yerel yol), profil yok; rate-limit 11. istekte 429 (Redis'te `rl:*` anahtarları, gerçek IP); `send-sms` oturumsuz 401 (403 dalı panel oturumu olmadan test edilmedi).
- **Deploy sırasında bulunan:** rsync `--delete` olmadığı için git'te silinen dosyalar VPS'te kalıyordu (`[locale]/loading.tsx` dahil → 404 düzeltmesi etkisiz olurdu). Silinen 10 dosya VPS'ten elle kaldırıldı; VPS'e özgü `public/images` altındaki 2 görsel, `CLAUDE.md.backup`, `__pycache__` bırakıldı.
- **Deploy BEKLEYEN:** `74f25f9` — kök `app/layout.tsx`'teki sabit canonical (canlıda `/tr/sss` → `https://checkrezerve.com`). Yerelde doğrulandı.

### 🔴 Açık: günlük rezervasyon hatırlatmaları 13 Eylül'den beri gitmiyor
GitHub Actions `daily-reminders.yml` her gün **401** (son 12 çalıştırmanın hepsi). GitHub `CRON_SECRET` secret'ı (11 Nisan) prod `.env`'dekinden farklı; prod `.env` ve container tutarlı (64 karakter). Çözüm: GitHub secret'ı prod değeriyle güncellemek (onay bekliyor). Paket hatırlatma VPS cron'u sağlıklı (her gün 200; CLAUDE.md'deki "token hotfix bekliyor" notu eskimiş).

### Diğer notlar
- Mevcut bazı sayfa başlıkları çift sonekli ("İletişim — CheckRezerve | CheckRezerve"): kök şablon `%s | CheckRezerve` + sayfa başlığındaki "— CheckRezerve".
- Kök metadata'da `verification: { google: 'PLACEHOLDER_GOOGLE_SEARCH_CONSOLE' }` sahte doğrulama etiketi basıyor.
- VPS `/opt/checkrezerve/.env` izni `644` (herkes okuyabilir) → `600` önerilir.
- GitHub secret'ları `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` artık kullanılmıyor (deploy.yml silindi) → silinebilir.

## 1. Canlıda ne var
| | |
|---|---|
| Son deploy | 24 Eylül ~12:10 UTC, image `d49baf63f6df`, main `7e42527` (blue + green healthy) |
| Geri dönüş etiketleri | `checkrezerve:rollback-20260923b` (bir önceki, `26b67f65f22a`), `checkrezerve:rollback-20260920` (`b6486ad1be8e`) |
| VPS env yedeği | `/root/checkrezerve.env.bak-20260923` |
| Deploy yöntemi | Elle: rsync (`.env`, `.env.local` HARİÇ) → `docker-compose build blue` → CLAUDE.md akışı. **CI `deploy.yml` kullanılmıyor** (git pull + compose v2 + olmayan `app` servisi; VPS'teki repo commit'siz değişiklik içeriyor). main push'larında `[skip ci]`. |
| Sağlık | `/api/health` → ok, db connected, `redis: disabled` (REDIS_URL yok → rate-limit container başına bellek içi), `sms: whatsapp configured` |

**Canlıda doğrulananlar:** hizmetli web rezervasyonu `hizmet_id` ile kaydoluyor (K2), randevuda `party_size=1` (#5), misafir iptal linki iptal ediyor + tek kullanımlık (CM-04), SambaPOS webhook sırsız/yanlış sırla 401, mobil panel API'leri kimliksiz/sahte token'la 401, anon anahtarıyla `webhook_secret` okunamıyor.

## 2. Deploy BEKLEYEN commit'ler (main, push edilmedi — onay gerekiyor)
| Commit | Konu | Test |
|---|---|---|
| `ef80a7e` | karar-5: send-sms yalnız işletmenin rezervasyon numaralarına (+ mobil Bearer) | Panel oturumuyla bilinmeyen numaraya POST `/api/send-sms` → 403 |
| `9de1fb0` | OP-03: telefon araması boşluklu kayıtları buluyor | Yeni rezervasyon → boşluklu kayıtlı numara → ad dolmalı |
| `ec84b8b` | karar-7: misafir etiket/not ve admin durum → API route | Panel → Misafirler → etiket/not; Admin → rezervasyon durumu |
| `3567906` | karar-8: flag etiketi "Ön ödeme tutarını göster" | Admin → Feature flags |
| `a6c243a` | karar-12: kullanılmayan 8 dosya silindi | build |
| `7a05f50` | karar-13: kanal RPC hatası/boş → paket hatırlatması yok | cron log |
| `9da99f2` | OP-07: `auto_confirm` flag'i → web rezervasyonu `confirmed` | Flag aç → web rezervasyonu doğrudan onaylı |
| `61d9f37` | OP-08: aynı çalışana çakışan saat 409 (hizmet süresiyle) | Aynı çalışana 10:00 (60 dk) ve 10:30 → ikincisi 409 |
| `686f26e` | SC-03: login/kayıt/iletişim rate-limit, X-Real-IP | 11. hatalı giriş → "geçersiz" |
| `eab92ec` | SC-06: rezervasyon API zod şeması | Hatalı tarih → 400 "Geçersiz veya eksik alan: tarih" |
| `4263aa1` | PF-03: yanlış canonical kaldırıldı, sitemap (işletmeler + yerel yollar), 13 sayfaya metadata | `/tr/sss` canonical'ı artık `/tr` değil; `sitemap.xml`'de `/isletme/` > 0, `/en/register` |
| `bed8602` | PF-07: markalı `global-error` | — |
| `674feca` | lint `<a>`→`<Link>` (164 → 39 error) | Panel/marketing linkleri |

## 3. SQL durumu
| Dosya | Durum |
|---|---|
| app `04-SC-02.sql` (restaurant_secrets) | ✅ Çalıştırıldı (13 sır, anon yetki 0) |
| `07` sır yenileme | ✅ Çalıştırıldı (13/64/13/13) |
| `09` status `no_show` + source genişletme | ✅ Çalıştırıldı (06'nın yerine) |
| `08` eski `webhook_secret` kolonunu boşalt | ✅ Çalıştırıldı (eski 0, yeni 13) |
| `06` | ⛔ Gereksiz (09 kapsadı) |
| `03` anon insert sıkılaştırma | ⏳ Hazır; mobil/panel akışlarını kırmadığı doğrulandı |
| `05` sms_logs/bildirim_log kolonları | ⏳ Hazır (düşük risk) |
| `01` service_id backfill/drop | ⏳ Backfill 0 satır; drop mobil kontrolünden sonra |
| `02` export_logs.auth_user_id | ⏳ Hazır |
| `04-test-rezervasyon-silme` | ⛔ Gereksiz (kayıt yok) |

## 4. Açık konular / kararlar
1. **Deploy** — yukarıdaki 13 commit (onay bekliyor).
2. **SQL 03 ve 05** çalıştırılsın mı? (ikisi de düşük risk, kod her iki durumda çalışır)
3. **Soft 404:** olmayan sayfalar `[locale]/loading.tsx` stream'i yüzünden 200 + `noindex` dönüyor (indekslenmez). Gerçek 404 için stream yapısı değişmeli.
4. **Redis:** prod'da `REDIS_URL` yok; rate-limit iki container arasında paylaşılmıyor.
5. **CI `deploy.yml`** ya düzeltilmeli (rsync/compose 1.29/blue-green) ya da silinmeli; şu an her main push'u `[skip ci]` gerektiriyor.
6. **`deploy.sh`** rsync'i `.env`'i hariç tutmuyor → prod env'in üzerine yazar. Düzeltilmeli.
7. **Mobil:** doğrudan Supabase insert'ten `POST /api/rezervasyon`'a (Bearer + `source:'app'`) geçerse kapalı gün, çakışma, telefon doğrulama, bildirim ve auto_confirm ortak olur. Sözleşmeler `api-sozlesmeleri.md`.
8. **Mobil rapor (`checkrezerve-app/.agents/gece-raporu-2026-09-23.md` §4-C)** düz metin şifre içeriyor → app oturumunda silinmeli.
9. `ZoneViewer` müşteri formunda kullanılmıyor (zones modu) — ayrı iş.
10. `/rezervasyon/[id]/onay` sayfası anon client ile okuduğu için hep "bulunamadı" (kullanılmıyor olabilir; noindex yapıldı).
EOF
