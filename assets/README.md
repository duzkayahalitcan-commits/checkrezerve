# Uygulama Assets

## Gerekli Dosyalar

### icon/icon.png
- Boyut: 1024x1024 px
- Format: PNG, şeffaf arka plan OLMAZ (solid renk)
- Bu tek dosyadan tüm platform boyutları otomatik üretilir

### icon/icon-foreground.png (Android Adaptive Icon)
- Boyut: 1024x1024 px
- Sadece ikon grafiği, padding bırak (güvenli alan: ortadaki %66)

### icon/icon-background.png (Android Adaptive Icon)
- Boyut: 1024x1024 px
- Düz renk veya desen (ör: #007AFF mavi)

### splash/splash.png
- Boyut: 2732x2732 px (en büyük iPad Pro boyutu — tüm cihazları kapsar)
- Ortada logo, etrafı boş/düz renk

## Nasıl Üretilir?

Dosyaları yerleştirdikten sonra:
```bash
export PATH="/tmp/node-v22.15.0-darwin-x64/bin:$PATH"
npx capacitor-assets generate --assetPath assets --android --ios
```

Bu komut tüm platform boyutlarını otomatik oluşturur.
