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

<!-- learned-stamp: category=database; capturedAt=2026-09-21; applied=2; wins=1; skipped=0 -->

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

---

### 3. UI metni ararken grep/rg'yi büyük/küçük harf duyarsız (`-i`) çalıştır

UI metinleri aynı ifadeyi farklı büyük/küçük harflerle taşır. "Fark Etmez" araması "Fark etmez"
yazılmış yerleri kaçırdı; eksik sonuçla "başka yerde yok" sonucuna varıldı. Türkçe'de İ/ı, I/i
dönüşümleri bu riski artırır.

**Kural:** Kullanıcıya görünen metin (etiket, buton, toast, placeholder) ararken `grep -rni` /
`rg -i` kullan. Türkçe karakterli ifadelerde ayrıca harf varyantlarını (`[İi]`, `[Iı]`) dene.
Boş sonuçtan sonra `echo "exit: $?"` ile grep'in gerçekten çalıştığını doğrula.

<!-- learned-stamp: category=tooling; capturedAt=2026-09-23; applied=0; wins=0; skipped=0 -->

---

### 4. Kod yorumlarına güvenme — DB'den doğrula

`app/[locale]/rezervasyon/[id]/page.tsx`'teki yorum `calisan_saatler` için "RLS super_admin_only,
istemci okuyamaz" diyordu. `pg_policies` sorgusu `calisan_saatler_public_read` (SELECT, `true`)
policy'sinin olduğunu gösterdi — yorum yanlıştı ve admin client kullanımı yanlış bir gerekçeye
dayanıyordu. Aynı gece: `reservations.service_id`'nin `hizmetler`'e değil `services`'e FK verdiği,
kodda hiçbir yorumdan anlaşılmıyordu.

**Kural:** RLS, FK, kolon varlığı veya tip hakkında bir yorum/varsayım üzerine karar vermeden önce
`pg_policies`, `pg_constraint` veya `information_schema.columns` ile SELECT yap. Yorum ile DB
çelişirse DB doğrudur; yorumu düzelt.

<!-- learned-stamp: category=database; capturedAt=2026-09-23; applied=0; wins=0; skipped=0 -->

---

### 5. Aynı kavram için yeni kolon eklemeden önce var olanı ara

`reservations` tablosunda hizmet için iki kolon var: `service_id` (FK → `services`, web yazıyor)
ve `hizmet_id` (FK → `hizmetler`, mobil yazıyor, panel/raporlar/e-posta trigger'ı okuyor). Web'in
yazdığı değer yanlış tabloya FK verdiği için hizmetli web rezervasyonları FK ihlaline düşüyor;
raporlar web rezervasyonlarının hizmetini hiç görmüyor.

**Kural:** Yeni kolon/tablo eklemeden önce aynı kavramı taşıyan Türkçe/İngilizce karşılığı ara
(`service/hizmet`, `staff/calisan`, `table/masa`, `restaurant/isletme`):
`SELECT table_name, column_name FROM information_schema.columns WHERE column_name ILIKE '%hizmet%' OR column_name ILIKE '%service%';`
Varsa onu kullan; yoksa yenisini ekle ve CLAUDE.md "Şema Tuzakları"na yaz.

<!-- learned-stamp: category=database; capturedAt=2026-09-23; applied=0; wins=0; skipped=0 -->
