# Öğrenilmiş Kurallar

Bu dosya gerçek bug'lardan çıkarılmış, tekrar etmesin diye kayıt altına alınmış kurallardır.
Her kural bir `<!-- learned-stamp -->` yorumu taşır: `category`, `capturedAt` (ISO tarih), `applied` (kural uygulanan görev sayısı), `wins` (kural gerçekten bir sorunu önlediği sayı), `skipped` (bilerek göz ardı edildiği sayı).

Görev başında bu dosyayı oku, ilgili kurallar varsa uygula.

---

## Bilinen Tuzaklar

### 1. Rezervasyon PII kolon isimleri: `guest_name`/`guest_phone`, `customer_name`/`phone` DEĞİL

Rezervasyon tablosunda misafir bilgisi için doğru kolonlar `guest_name` ve `guest_phone`'dur.
`customer_name` / `phone` eski (legacy) isimlerdir ve tabloda hâlâ var olabilirler ama artık
kullanılmazlar. Bu isimlerle yazılan bir UPDATE/DELETE sorgusu hata vermez, sessizce **yanlış
satırı** günceller veya hiçbir satırı etkilemeden "başarılı" döner.

KVKK silme akışında bu yüzden gerçek veri silinmeden işlem "başarılı" dönmüştü — kullanıcı
verisinin hâlâ veritabanında durduğu fark edilmeden kapatılabilecek bir bug'du.

**Kural:** Rezervasyon PII'siyle ilgili her sorguda (özellikle silme/güncelleme) kolon adının
`guest_name` / `guest_phone` olduğunu doğrula. `customer_name` / `phone` görürsen legacy kabul et,
kullanma. Migration/schema dosyasını kontrol etmeden PII kolon ismi varsayma.

<!-- learned-stamp: category=database; capturedAt=2026-09-21; applied=1; wins=1; skipped=0 -->

---

### 2. React hook'larından önce koşullu `return` yazılmaz

Bir component içinde `useMemo`/`useCallback`/`useState` gibi hook çağrılarından önce koşullu
(`if (...) return ...`) bir erken çıkış olamaz. Bu, React'in "hook'lar her render'da aynı sırada
çağrılmalı" kuralını (Rules of Hooks) ihlal eder. Geliştirme sırasında fark edilmeyebilir ama
belirli koşullarda hook sırası kayar ve state/memo bozulur.

`InteractiveFloorMap` component'inde bu ihlal vardı: koşullu return, `useMemo`/`useCallback`
tanımlarından önce yazılmıştı.

**Kural:** Component içinde tüm hook çağrıları (`useState`, `useMemo`, `useCallback`, `useEffect`
vb.) en üstte, herhangi bir koşullu return'den önce olmalı. Erken çıkışlar (`if (!data) return null`
gibi) sadece tüm hook'lar çağrıldıktan SONRA yazılabilir.

<!-- learned-stamp: category=web; capturedAt=2026-09-21; applied=1; wins=1; skipped=0 -->
