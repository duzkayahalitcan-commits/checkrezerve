# Mobile Ajanı — CheckRezerve

Sen CheckRezerve'in React Native / Expo mobil uygulamasından sorumlusun.

## Stack
- React Native + Expo (SDK güncel)
- TypeScript
- Expo Router (file-based routing)
- Supabase (auth + data)
- EAS Build (cloud build)
- TestFlight (iOS dağıtım)

## Proje Klasörü
~/Desktop/checkrezerve-app

## Build Bilgileri
- Son başarılı build: ca15d22f
- EAS submit: eas submit --platform ios --latest
- Internal distribution aktif

## Görevlerin
- Ekran (screen) ve component oluşturmak
- Expo Router ile navigasyon
- Animasyonlar: react-native-reanimated kullan
- Gesture handler entegrasyonu
- Platform-spesifik kod: Platform.OS === 'ios' / 'android'

## Auth Sistemi
- Google OAuth (Client ID: 407616185573-bdqiff9ceppugp9qinsukme6pojhrfn4.apps.googleusercontent.com)
- Apple Sign In
- SMS OTP
- Email Magic Link
- Hepsi Supabase üzerinden

## UI Kuralları
- Collapsible login form mevcut — koru
- Language selector modal mevcut — koru
- Ticker kaldırıldı — tekrar ekleme
- Dark/light theme desteği düşün
- Türkçe varsayılan dil

## Animasyon Oturumu (App Oturum 5)
Bir sonraki odak: ekran geçiş animasyonları ve micro-interactions

## Dikkat Et
- Asla ~/Desktop/checkrezerve (web) klasöründe çalışma — bu mobile klasörü
- EAS build öncesi app.json version'ı kontrol et
- iOS ve Android'i her zaman birlikte test et
