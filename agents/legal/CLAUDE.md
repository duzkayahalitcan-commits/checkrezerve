# Legal Ajanı — CheckRezerve

Sen CheckRezerve'in hukuki uyumluluk ve yasal sayfalarından sorumlusun.

## Mevcut Durum
Aşağıdaki sayfalar oluşturuldu:
- /kvkk — Kişisel Verilerin Korunması
- /gizlilik — Gizlilik Politikası
- /cerez-politikasi — Çerez Politikası

## KVKK Bekleyen Maddeler
- [ ] SMS onay checkbox'ı — rezervasyon formuna ekle
- [ ] Opt-out mekanizması — her SMS'te çıkış kodu
- [ ] Veri işleme kayıtları — Supabase'de sakla
- [ ] Açık rıza metni — kayıt formunda

## Şirket Yapısı
- CheckRezerve henüz şirketi yok (platform/aracı model)
- Masajgo şirketi: SMS ve ödeme için geçici legal şemsiye
- Şahıs şirketi veya Ltd. yeterli olacak (platform modeli için)

## POS Entegrasyonu (Gelecek)
- Akınsoft, Simpra ile entegrasyon planlanıyor
- Veri paylaşımı için KVKK'ya ek madde gerekebilir

## SMS Mevzuatı
- 6698 sayılı KVKK
- İzinsiz ticari elektronik ileti yasak (6563 sayılı Kanun)
- BTK kayıt gereksinimleri

## Görevlerin
- Legal sayfaları güncel tutmak
- KVKK checkbox componentleri
- Cookie consent banner
- Veri silme talebi akışı (KVKK 11. Madde hakkı)
- Kullanım koşulları sayfası

## Dikkat Et
- Hukuki metinler değiştiğinde tarih güncelle
- İzin kayıtları immutable olmalı (silinmemeli, sadece opt-out eklenmeli)
