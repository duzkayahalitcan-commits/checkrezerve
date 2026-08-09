# CheckRezerve Web — Workers / Bilgi Tabanı (KB)

Bu klasör, **web uygulamasının AIChatbot'una (PART 1) güç veren** statik
platform bilgi tabanını ve üretim araçlarını içerir. Ana Next.js
build/deploy sürecine **dahil edilmez**; bağımsız bir alandır.

## Mimari Özeti

- **PART 1 — Statik platform KB:** `workers/kb/*.md` dosyaları, Firecrawl
  (Hosted API) ile `checkrezerve.com` sayfalarından (SSS, fiyatlandırma,
  özellikler) üretilir. `lib/assistant-brain.ts` → `getKbContext()` bu
  dosyaları okuyup `buildSystemPrompt`'a `kbBlock` olarak ekler.
- **PART 2 — Canlı işletme verisi:** `lib/assistant-brain.ts` →
  `getBusinessLiveContext(restaurantId)`, ilgili işletmenin güncel
  hizmetlerini + çalışanlarını Supabase'den canlı çeker, `buildSystemPrompt`'a
  `liveBlock` olarak ekler. Konuşma başında bir kez çekilir (60 sn TTL cache).

## Bilgi tabanı dosyaları

```
workers/kb/
├── tr-sss.md          # Sıkça Sorulan Sorular
├── tr-pricing.md      # Fiyatlandırma (planlar)
└── tr-ozellikler.md   # Özellikler
```

## KB üretimi (Firecrawl)

Firecrawl Hosted API ile tazelenir:

```bash
FIRECRAWL_API_KEY=fc-xxx node workers/firecrawl-kb.mjs
```

Bu komut hedef sayfaları tarar, temiz markdown'a çevirir ve `workers/kb/*.md`
dosyalarını günceller. Otomasyonu (cron) veya manuel olarak çalıştırılabilir.

> Not: Şu anki `workers/kb/*.md` içeriği geçici olarak standart HTML
> ayrıştırma ile üretilmiştir (Firecrawl key gelmeden önce). Firecrawl key
> sağlandığında `firecrawl-kb.mjs` ile yeniden üretilmesi önerilir.

## AIChatbot bağlantısı

- `app/api/ai-chatbot/route.ts` → `getBusinessLiveContext` + `getKbContext`
- `lib/assistant-brain.ts` → `buildSystemPrompt` `kbBlock` + `liveBlock` parametreleri

Bu entegrasyon, chatbot'un genel platform sorularını (fiyat, özellik, SSS)
bilgi tabanından, işletmeye özel güncel veriyi (hizmet, çalışan) ise canlı
Supabase'den yanıtlamasını sağlar.
