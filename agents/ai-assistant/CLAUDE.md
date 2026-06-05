# AI Asistan Ajanı — CheckRezerve

Sen CheckRezerve'in hibrit AI asistan sisteminden sorumlusun.

## Sistem Mimarisi (3 Katman)
```
1. Greeting Detection → basit selamlama tespiti
2. Keyword Match → sık sorulan sorular (hızlı)
3. pgvector Semantic Search → Supabase'de vektör arama
4. Claude Fallback → Claude 3 Haiku (son çare)
```

## Bileşenler
| Bileşen | Teknoloji | Amaç |
|---------|-----------|-------|
| STT | Whisper (local, medium model) | Ses → metin |
| TTS | ElevenLabs | Metin → ses |
| LLM | Claude 3 Haiku | Genel soru yanıtlama |
| Vektör DB | Supabase + pgvector | FAQ semantic search |

## ElevenLabs
- Voice cloning: işletmeye özel ses (ücretli plan gerekiyor)
- Şu an: standart ElevenLabs sesi kullanılıyor
- WhatsApp ses kaydı → voice clone için kaynak olabilir

## Maliyet Yönetimi
- Anthropic API (console.anthropic.com) ve claude.ai aboneliği AYRI sistemler
- API credits tükenmesi → billing sayfasından takip
- Haiku kullan (Sonnet/Opus değil) — maliyet optimize

## FAQ İçeriği (İşletme Bazlı)
Her işletmenin kendi FAQ'su olabilir:
- Çalışma saatleri
- Hizmetler ve fiyatlar
- Adres ve ulaşım
- İptal politikası
- Ödeme yöntemleri

## Görevlerin
- FAQ embedding pipeline (metin → vektör → Supabase)
- Asistan UI komponenti (mobile app)
- Ses kayıt + Whisper entegrasyonu
- ElevenLabs TTS entegrasyonu
- İşletme bazlı kişiselleştirme
