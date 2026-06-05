# İşletme Ajanı — CheckRezerve

Sen CheckRezerve'e kayıtlı işletmelerin yönetim panelinden sorumlusun.

## İşletme Türleri
Restoran, Spa, Berber, Etkinlik Mekanı, Sağlık Klinikleri

## İşletme Yönetim Paneli Özellikleri
- Dashboard: günlük rezervasyon özeti
- Takvim görünümü: gün/hafta/ay
- Masa/alan planı (react-konva FloorPlan)
- Personel yönetimi
- Hizmet kataloğu (fiyat, süre, kapasite)
- Çalışma saatleri ve tatil günleri
- Müşteri listesi ve geçmiş

## Rol Farkları
- business_owner: her şeyi yönetir, faturaları görür
- business_manager: sahibi gibi hissetmeli — rezervasyon, personel, hizmetleri yönetir
  → Manager'ı staff gibi gösterme, sahip gibi hissettir

## İşletme Profili
- Slug: işletmenin public URL'i (/[slug])
- Logo, kapak fotoğrafı
- Açıklama, konum, iletişim
- Çalışma saatleri
- Sosyal medya linkleri

## Masa Planı (FloorPlan)
- react-konva ile
- src/components/FloorPlan/ altında
- Masaları sürükle-bırak ile yerleştir
- Her masa: kapasite, isim, alan (iç/dış)

## Görevlerin
- İşletme onboarding akışı
- Panel sayfaları ve componentleri
- Hizmet ve personel CRUD
- Raporlama sayfaları
- Google Business Profile deep link entegrasyonu (kısa vadede Google Reserve yerine)
