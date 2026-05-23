# CheckRezerve — Görev Listesi

## Proje Bilgileri
- Web: ~/Desktop/checkrezerve (Next.js, next-intl, Tailwind)
- Mobil: ~/Desktop/checkrezerve-app (Expo/React Native)
- VPS: 161.97.68.236, SSH: ~/.ssh/checkrezerve_vps
- Supabase: posarvagedpqtsrcrwfe
- Deploy komutu: rsync -avz --exclude='.git' --exclude='node_modules' --exclude='.next' ./ root@161.97.68.236:/opt/checkrezerve/ && ssh -i ~/.ssh/checkrezerve_vps root@161.97.68.236 "cd /opt/checkrezerve && docker-compose up -d --build"

## Tasarım Kuralları — HER ZAMAN UYGULA
- Hiçbir zaman generic/bootstrap görünüm. Her component "vay be" dedirtmeli.
- Animasyonlar: cubic-bezier(0.23, 1, 0.32, 1) — asla linear
- GPU acceleration: will-change + transform: translateZ(0) tüm animasyonlu elementlerde
- Primary: #E53935, Typography keskin hiyerarşi, Whitespace cömert
- Micro-interaction: hover/focus/scroll/click her yerde
- Görseller: her zaman overlay+gradient ile dramatize et

## GÖREVLER — Sırayla yap, biteni [x] yap

### WEB

[x] 1. DiagonalSplit Portal — app/[locale]/page.tsx
- Mevcut page.tsx içeriğini app/[locale]/home/page.tsx'e taşı
- page.tsx sadece DiagonalSplit olsun, header/footer yok, tam ekran
- Sol üst: CheckRezerve logo (beyaz), sağ üst: dil seçici (TR/EN/AR/DE)
- Sağ alt: "İşletmeler için →" linki → /[locale]/home
- 3 panel: restoran (split-restoran.jpg center 40%), guzellik (split-guzellik.jpg), spa (split-spa.jpg)
- Panel content left: max(16%, 40px) — clip-path arkasında kalmasın
- clip-path transition YOK — sadece flex + filter transition
- will-change: flex, filter; transform: translateZ(0) tüm panellerde
- Tıklayınca: router.push('/[locale]/rezervasyon?kategori=X')
- messages/tr.json + en.json + ar.json + de.json'a diagonal key ekle

[x] 2. Home Hero — app/[locale]/home/page.tsx
- Hero tam ekran, hero-premium.jpg, güçlü overlay
- Başlık: staggered word reveal animasyonu (soldan, delay ile)
- CTA: kırmızı primary + ghost, hover scale+shadow
- Scroll indicator: animated chevron

[x] 3. Features Section
- 6 feature: düz grid değil, alternatif sol-sağ layout
- Scroll'da slide-in, görsel hover scale(1.02)

[x] 4. MarketingHeader
- Scroll'da backdrop-blur + shadow
- Nav hover: kırmızı underline slide animasyonu
- Mobile: hamburger → fullscreen overlay, staggered link girişi

[x] 5. rezervasyon/page.tsx
- URL'den ?kategori parametresi oku
- Kategori filter chips: tümü/restoran/guzellik/spa
- İşletme kartları: görsel, isim, puan, adres, rezervasyon butonu
- Loading: skeleton cards, Empty: güzel illüstrasyon

### MOBİL

[ ] 6. CustomerNavigator — HomeScreen sol üst profil butonu
- HomeScreen header sol üst: profil ikonu
- navigation.navigate('Profile') — Stack'te kayıtlı değilse ekle

[ ] 7. ProfileInfoScreen — Supabase entegrasyonu
- profiles tablosuna allergens jsonb kolonu ekle (alembic migration)
- Kaydet: Supabase'e yaz, sayfa açılınca çek

[ ] 8. HomeScreen tasarım
- Üst: konum bazlı banner
- Kategori chips: horizontal scroll
- İşletme kartları: görsel full-width, gradient overlay, favori butonu

[ ] 9. BusinessDetailScreen
- Hero: tam genişlik görsel + gradient + geri butonu
- Hizmetler: fiyat+süre chip
- Sticky bottom: "Rezervasyon Yap" bar

[ ] 10. ReservationConfirmScreen
- Success checkmark: scale 0→1 spring animasyonu
- Rezervasyon özet kartı
- "Takvime Ekle" + "Ana Sayfaya Dön" butonları

## Tamamlandıktan Sonra
Web: deploy et
Mobil: npx tsc --noEmit kontrol et
