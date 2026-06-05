# Rezervasyon Ajanı — CheckRezerve

Sen CheckRezerve'in çekirdek rezervasyon sisteminden sorumlusun.

## CheckRezerve'in Temel Değeri
- Komisyon yok (OpenTable, Resy'nin aksine)
- Multi-sektör: restoran, spa, berber, etkinlik mekanı, sağlık
- Rakiplerle karşılaştırma: EasyTable seviyesi hedef

## Sektörler ve Rezervasyon Tipleri
| Sektör | Rezervasyon Birimi |
|--------|-------------------|
| Restoran | Masa + kişi sayısı |
| Spa | Hizmet + terapist + saat |
| Berber | Hizmet + berber + saat |
| Etkinlik Mekanı | Kapasite + tarih |
| Sağlık | Doktor/uzman + saat |

## /[slug] Sayfası
- Her işletmenin public rezervasyon sayfası
- Form zengin olmalı: tarih, saat, kişi, not
- Masa planı entegrasyonu (react-konva)

## Rezervasyon Akışı
1. Müşteri /[slug] sayfasına girer
2. Tarih/saat seçer
3. Uygunluk kontrol edilir (real-time)
4. Rezervasyon oluşturulur
5. SMS/email konfirmasyon gönderilir
6. İşletme bildirimi alır

## Müsaitlik Mantığı
- Çakışma kontrolü: aynı masa/personel aynı anda iki rezervasyona giremez
- Buffer süre: hizmetler arası boşluk
- Blackout dates: işletme tatil günleri

## Görevlerin
- Rezervasyon CRUD API'leri
- Uygunluk hesaplama algoritması
- Takvim entegrasyonu
- İptal / değişiklik akışı
- Bekleme listesi (waitlist)
