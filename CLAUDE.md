# CHECKREZERVE — CLAUDE.md

## Proje Nedir?
Checkrezerve, işletmelere özel rezervasyon ve randevu yönetim sistemidir.
Hedef kitle: restoranlar, güzellik salonları, spalar, berberler, kuaförler, psikologlar.
Site: checkrezerve.com — işletmeler firma adıyla özel link alır (örn: checkrezerve.com/zeytin-restoran)

## Teknoloji Stack
- Frontend: Next.js 14 (App Router), Tailwind CSS, TypeScript
- Backend: Supabase (DB + Auth + Edge Functions)
- SMS: Netgsm
- WhatsApp: Meta Business API veya Twilio
- Mail: Resend
- Hosting: Vercel
- Mobile: Expo (React Native) — geliştirme aşamasında

## Klasör Yapısı
- /app → Next.js sayfalar
- /components → UI componentleri
- /lib → Supabase client, yardımcı fonksiyonlar
- /supabase → migration dosyaları, edge functions

## Temel Özellikler

### 1. İşletme Paneli
- Telefon rezervasyonlarını manuel ekleme
- Gelen online rezervasyonları görme ve onaylama
- Müşteri geçmiş ziyaret takibi (kaç kez geldi, kaç kişiyle)
- Masa/kapasite yönetimi (bölüme göre: bahçe, iç mekan vb.)
- Mesai saati yönetimi (telefon görünürlüğü otomatik açılır/kapanır)

### 2. Müşteri Rezervasyon Sayfası
- Online rezervasyon formu
- İletişim bilgileri (yetkili adı + numarası, mesai saatinde görünür)
- Yapay zeka çağrı asistanı numarası (mesai dışı aktif)
- 2 rezervasyon seçeneği: online form veya telefon/AI asistan

### 3. Bildirim Sistemi
- Rezervasyon onayı: SMS / WhatsApp / Mail (müşteri veya işletme seçer)
- Rezervasyon hatırlatması: rezervasyon günü öğle saatinde otomatik
- Kanal seçimi işletme bazında veya rezervasyon bazında yapılabilir

### 4. Gelişmiş Masa Yönetimi (Restoran Modülü)
- Bölüm bazlı masa tanımı (bahçe 2 kişilik, iç salon 4 kişilik vb.)
- Kişi sayısına göre otomatik masa eşleştirme
- Çakışma kontrolü — aynı masaya çift rezervasyon engeli
- Minimum kişi kuralı (örn: bahçe 4 kişilik masaya 2 kişi rezervasyon yapamaz)

### 5. Yapay Zeka Çağrı Asistanı (Yakında)
- Mesai dışı rezervasyon alır
- Müşteriyi dinler, isim + kişi sayısı + tarih alır
- Sisteme otomatik ekler, onay SMS'i gönderir
- İşletme panelinde "AI tarafından alındı" etiketi ile görünür

## Geliştirme Kuralları
- Her zaman önce CLAUDE.md oku
- Phoebix projesiyle (~/Desktop/phoebix) KESİNLİKLE karıştırma
- Checkrezerve dosyaları: ~/Desktop/checkrezerve
- Mobile app dosyaları: ~/Desktop/checkrezerve-app
- Her değişiklikten sonra git add -A && git commit && git push yap
- Türkçe değişken isimleri kabul edilir ama kod İngilizce yorum satırlarıyla desteklenmeli
- Supabase migration'ları sıralı numaralandır (20260410000001, 20260410000002...)

## Veritabanı Tabloları (Özet)
- isletmeler — işletme bilgileri, mesai saatleri, aktif kanallar
- rezervasyonlar — tüm rezervasyonlar
- musteriler — müşteri profilleri (telefon bazlı)
- masalar — işletmeye ait masa/kapasite tanımları
- sms_log / bildirim_log — gönderilen bildirimler
- ai_cagrilar — yapay zeka tarafından alınan çağrılar (yakında)

## Öncelik Sırası (Şu An)
1. Expo mobile app iskeletini kur
2. İşletme paneli mobile uyumlu hale getir
3. Bildirim kanalı seçimini (SMS/WA/mail) rezervasyon formuna ekle
4. Gelişmiş masa yönetimi modülünü tamamla
5. AI çağrı asistanı entegrasyonu
