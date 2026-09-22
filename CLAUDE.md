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
- Roller: `super_admin`, `isletme_admin`, `isletme_calisan`

Bu repo: `~/Desktop/checkrezerve` → checkrezerve.com (VPS'te Docker).
Mobil uygulama AYRI repo: `~/Desktop/checkrezerve-app`. `~/Desktop/phoebix` tamamen ayrı proje — dokunma, bahsetme.

## Öğrenilmiş Kurallar

Görev başında `.agents/learned.md`'yi oku. İlgili bir kural varsa, görevin
YAPILACAKLAR/todo listesine son madde olarak şunu ekle: "learned.md: <kural adı>
için wins/applied/skipped sayacını güncelle" — kural gerçekten bir iş problemini
önlediyse `wins`'i, uygulandı ama fark etmediyse `applied`'i, bilerek atlandıysa
`skipped`'i 1 artır. Bu madde tamamlanmadan görevi/review'u bitirme.

---

## Ekosistem — Aktif Araçlar

### Tmux Oturumları

> Oturumlar zamanla değişir; şüphedeysen `tmux ls` ile doğrula.

| Oturum | Dizin | Kullanım |
|---|---|---|
| `web` | `~/Desktop/checkrezerve` | Next.js web — `npm run dev` (port 3001/3002), **fix uygulayan tek oturum** |
| `app` | `~/Desktop/checkrezerve-app` | Expo mobil — `npx expo start` (port 8081), **fix uygulayan tek oturum** |
| `genel` | `~/` | Genel terminal, vault, araç yönetimi |
| `web2` | `~/Desktop/checkrezerve` | **Kapalı** (aynı anda 5 oturum Mac'i donduruyor). Açılırsa: web için paralel keşif/analiz — **sadece rapor üretir, yazmaz** |
| `app2` | `~/Desktop/checkrezerve-app` | **Kapalı** (aynı anda 5 oturum Mac'i donduruyor). Açılırsa: mobil için paralel keşif/analiz — **sadece rapor üretir, yazmaz** |
| `video` | `~/Desktop/checkrezerve` | Medya/video üretimi için ayrılmış oturum |

**Kurallar:**
- `web` ve `app` terminallerini asla karıştırma. Her oturumda aktif süreç var.
- **Paralel oturum kuralı:** `web2`/`app2` şu an kapalı; açılırlarsa sadece rapor/inceleme yaparlar. Fix'i her zaman `web` veya `app` uygular. İki oturumun aynı dosyaya yazması race condition + kayıp değişiklik demektir.
- Durum kontrolü: `tmux capture-pane -t <oturum> -p | tail -30`. IDLE görmeden "bitti" deme.
- `send-keys` göndermeden önce pane'in düz zsh prompt'unda olduğunu doğrula (jcode TUI'deyse komut sohbete yazı olarak düşer).

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
| S1 Güvenlik | ✅ | RLS düzeltildi, n8n izole edildi, fallback secret'lar kaldırıldı, calendar-events/ciro-ozet auth, feature flag API'de |
| S2 İş Mantığı | ✅ | Temporal reservation guard (DB fn), RBAC, health endpoint DB kontrolü, Redis rate limiting, notification orchestrator |
| S3 Performans | ✅ | SELECT * → explicit kolonlar, console.log temizliği, withPanelAuth middleware, ISR, race condition fix, conversations RLS, composite index'ler, abonelik kontrolü |
| S4 UX & Eksik | ⏳ | aria-label eksikleri, loading spinner tutarlılığı, BookingForm silent error fix, guest_activities loglama, dress_code düzenleme, React.memo, dead code temizliği |

**Sprint planı & audit detayları:** `~/Documents/CheckRezerveKnowledge/wiki/decisions/Sprint-Plani-2026-08.md`

**Güncel iş geçmişi bu dosyada tutulmaz.** Tamamlanan işlerin kaydı: `git log` + yukarıdaki wiki. Bu dosya sadece aktif durumu ve kuralları taşır.

---

## Veritabanı Tabloları
- restaurants, reservations, calisanlar, hizmetler
- user_favorites, profiles, masa_tipleri
- subscriptions, subscription_payments, iyzico_webhook_logs
- paketler, musteri_paketleri, musteri_notlari, kroki_zones
- restaurant_users (panel giriş bilgileri — username/password_hash/role, profiles'a bağlı DEĞİL)
- kvkk_applications (KVKK başvuru kayıtları — migration uygulandı, tablo DB'de mevcut)

### Şema Notları (Dikkat Edilecek Tuzaklar)

**reservations — dual-column mimarisi.** Yeni kod sadece canonical kolonları kullansın; legacy kolonlar geri uyumluluk için duruyor.

| Amaç | Canonical (kullan) | Legacy (yazma) |
|---|---|---|
| Misafir adı | `guest_name` | `customer_name` |
| Telefon | `guest_phone` | `phone` |
| Tarih | `reserved_date` | `date` |
| Saat | `reserved_time` | `time` (text!) |
| Kişi sayısı | `party_size` | `kisi_sayisi` |

Ek: `guest_email` var (opsiyonel), email_logs trigger'ı bu kolona bakar.

**reservations.status enum — İNGİLİZCE.** Değerler: `pending` / `confirmed` / `completed` / `cancelled`. Türkçe string ("beklemede", "onaylandi", "iptal" vb.) YAZMA — DB constraint hata verir ve UI filtreleri bozulur. Türkçe metin sadece görüntüleme katmanında üretilir.

**calisanlar.profile_id — eklendi ama backfill YAPILMADI.** Kolon nullable uuid olarak eklendi, mevcut satırlarda dolu değil. Panel girişleri `restaurant_users` tablosunda (username/password_hash/role) tutuluyor; `calisanlar.profile_id` üzerinden auth şu an çalışmıyor. profiles-bağlı bir akış yazmadan önce backfill migration'ı çalıştır.

### Şema Tuzakları (information_schema ile doğrulandı, 2026-09-23)

| Tablo | Doğru kolon | Yanlış varsayım (YOK) |
|---|---|---|
| `hizmetler` | `sure_dakika` (integer), `fiyat` (numeric) | `duration_minutes`, `price` |
| `masa_tipleri` | `isletme_id` (uuid), `ad`, `kapasite`, `aktif` | `restaurant_id`, `label`, `capacity`, `is_active` |
| `restaurants` | `working_hours` (jsonb) | `day_mon_open` vb. `day_*` kolonları |
| `restaurants` | `kroki_zones` (jsonb), `kroki_mode` (text) | `kroki_data`, `kroki_enabled` |

---

## Hızlı Başvuru

| Konu | Değer |
|---|---|
| Web VPS | 178.105.51.245 (Hetzner) |
| SSH | `ssh -i ~/.ssh/checkrezerve_vps root@178.105.51.245` |
| Supabase | posarvagedpqtsrcrwfe.supabase.co |
| Aktif tmux (fix) | `web` (web), `app` (mobil) — `tmux attach -t web` |
| iOS build | ca15d22f (son başarılı) |
| EAS submit | `eas submit --platform ios --latest` |

---

## Ajan Haritası

`agents/` altında 16 rol: `web`, `mobile`, `deploy`, `database`, `auth`, `reservations`, `business`, `customer`, `payments`, `notifications`, `ai-assistant`, `analytics`, `legal`, `testing`, `content`, `product`.
Her biri kendi `agents/<rol>/CLAUDE.md` dosyasını taşır; ilgili görevi alınca o dosyayı oku.

---

## Oturum Başlangıç Protokolü — OTOMATİK AJAN SEÇİMİ

**Her yeni oturumda, Halitcan hiçbir şey söylemeden önce:**

1. `~/Documents/CheckRezerveKnowledge/wiki/hot.md` oku — sprint durumu ve aktif thread'leri öğren
2. Halitcan'a şunu sor: **"Ne yapacaksın?"**
3. Cevabına göre aşağıdaki tablodan uygun ajan(lar)ı belirle
4. O ajanların `agents/<rol>/CLAUDE.md` dosyalarını oku
5. "X + Y ajanı olarak çalışıyorum" de ve göreve başla

Halitcan sana ajan ismi söylemek zorunda değil. Sen karar verirsin.

### Otomatik Eşleştirme Tablosu

| Halitcan ne derse | Hangi ajanları oku |
|---|---|
| sayfa, component, UI, Next.js | web |
| ekran, animasyon, mobil, Expo | mobile |
| deploy, VPS, Docker, sunucu | deploy |
| tablo, migration, SQL, Supabase | database |
| giriş, login, OAuth, rol, yetki | auth + database |
| RLS policy | database + auth |
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

**Çok ajanlı işler (sıralı çalış):**
- Yeni rezervasyon özelliği → `database` (şema) → `reservations` (iş mantığı) → `web`/`mobile` (UI)
- Yeni auth akışı → `auth` (tasarım) → `database` (DB) → `web`/`mobile` (UI)
- İşletme onboarding → `business` (iş mantığı) → `database` (şema) → `web`
- Bildirim sistemi → `notifications` (olay/kanal) → `auth` (rol filtresi) → `database` (log)
- AI asistan özelliği → `ai-assistant` (embedding pipeline) → `database` (pgvector) → `mobile`
- Deploy öncesi → `testing` (test geç) → `deploy` (env + deploy)
- KVKK güncellemesi → `legal` → `web` (form) → `database` (izin kaydı) → `notifications` (SMS opt-out)

### Emin olamazsan
Görevi ikiye böl: "veri mi, UI mı?" → veri tarafı `database`, UI tarafı `web`/`mobile`.

### Hangi Ajan Ne Zaman KULLANILMAZ

| Durum | Yanlış ajan | Doğru ajan |
|---|---|---|
| Supabase migration yazıyorum | web | database |
| Docker config değiştiriyorum | web | deploy |
| Rol sistemi güncelliyorum | web | auth + database |
| Mobil animasyon yapıyorum | web | mobile |
| Landing page copy yazıyorum | product | content |
| Feature karar veriyorum | web | product |

---

## Kritik Proje Kuralları (Her Ajan İçin Geçerli)

1. **Terminal karışıklığı:** Web için `~/Desktop/checkrezerve`, mobile için `~/Desktop/checkrezerve-app`. Asla karıştırma.
2. **Deploy:** Deploy'u Claude yapar ama her seferinde önce açık onay alır; sonra `docker ps` + `docker logs --tail 50` ile doğrular. Migration her zaman Halitcan'da.
3. **ENV:** `NEXT_PUBLIC_` → build-time (--build-arg). Runtime secret'lar → --env-file.
4. **Roller:** business_manager = sahibi gibi hissetmeli. Staff gibi gösterme.
5. **Dil:** UI her zaman Türkçe.
6. **Token:** Minimal. Keşfetmeden önce sor. Gereksiz dosya okuma yapma.
7. **Kritik Docker rule:** `docker rm -f` ile isim bazlı silme bazen çalışmaz; yarım kalmış `docker-compose recreate` denemeleri container'ları `<hash>_isim` formatında yeniden adlandırır. `ContainerConfig KeyError` alınırsa önce `docker ps -a --format '{{.Names}}' | grep -iE "checkrezerve|nginx|whisper|certbot"` ile gerçek isimleri kontrol et, hash önekli olanları da sil, sonra `docker-compose up -d --build`.

---

## Kod Kuralları
- Env değerlerini hardcode etme, `.env`'den oku.
- Over-engineering yok, basit tut. Her route tek bir domain'e ait.
- Bir şeyi silmeden önce "bu neden var?" diye sor (ör. hizmet tekrarı bilinçli veri tasarımı).
- Görseller: `loading="lazy"` + Framer Motion `initial={{opacity:0}}` görseli görünmez yapar → `loading="eager"` kullan, sadece container'ı animate et.
- TypeScript içinde `!` olan heredoc zsh'de patlar → dosyayı Python `open().write()` ile yaz.

## Migration (KESİN KURAL)
- Migration'ı ASLA kendin uygulama. Alembic yok.
- Akış: SQL'i hazırla → `pbcopy` ile panoya koy → Halitcan Supabase SQL Editor'e yapıştırıp çalıştırır → doğrulama sonucunu geri yapıştırır.
- Doğrulama sorgusunu da hazırla. Sonucu gelmeden "tamam" deme.
- Büyük migration / mimari değişiklikten önce premortem yap (`~/.claude/skills/premortem`).

## Deploy Detayları
- VPS klasörü `/opt/checkrezerve`. Akış: yerelden rsync → VPS'te:
  ```
  docker ps -a --format '{{.Names}}' | grep -iE "checkrezerve|nginx|whisper|certbot" | xargs -r docker rm -f
  docker-compose up -d --build
  ```
- `docker-compose down` ASLA (compose 1.29.2, ContainerConfig hatası). Hash önekli (`<hash>_isim`) container'lar kalırsa onları da sil.
- nginx.conf host'ta `cat >` ile yazılır; container içinde `sed -i` YASAK (bind-mount inode bozulur).
- Yeni `server_name` → `docker restart checkrezerve-nginx` (`nginx -s reload` yetmez).
- SSL: symlink değil archive yolu (`/etc/letsencrypt/archive/checkrezerve.com/fullchain1.pem`).

## Doğrulama ve Hijyen
- Kendi iddialarını DB/dosya üzerinden doğrula; "bulunamadı" demeden önce kontrol et.
- grep sonuna `echo "exit: $?"` ekle (ENOSPC çıktıyı sessizce yutar; boş sonuç = eşleşme yok demek değil).
- Commit'ler konu bazlı ve izole olsun; karışık commit yok. Commit'ten önce Halitcan diff'i görür.

## Test Kullanıcıları
- ceviz@checkrezerve.com → isletme_admin
- ceviz.manager@checkrezerve.com → isletme_calisan
- checkrezerve@proton.me → super_admin
(Şifreler `.env.test` / Halitcan'da; buraya yazma.)

---

## VPS Cron İşleri

| Cron | Zamanlama | İş |
|---|---|---|
| nginx watchdog (`/opt/checkrezerve`) | `*/5 * * * *` | checkrezerve-nginx down/exit ise recreate. Log: `/var/log/nginx-watchdog.log` |
| paket-hatirlatma tetikleyici | `0 9 * * *` | `curl -H "Authorization: Bearer <CRON_SECRET>" .../api/cron/paket-hatirlatma` — **⚠ token için hotfix bekliyor** |
| fail2ban GitHub Actions whitelist refresh | `0 4 * * 1` | `update-fail2ban-github-whitelist.sh` — `api.github.com/meta` `.actions` CIDR'lerini çekip fail2ban whitelist'i yazar. Amaç: CI deploy SSH oturumlarının banlanmasını önlemek |
