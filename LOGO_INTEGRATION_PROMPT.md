# CheckReserve — Logo Entegrasyon Görevi

## Kaynak Dosya
Logo görseli: `/mnt/user-data/uploads/gemini-2_5-flash-image_Minimalist_modern_app_icon_logo_for_a_reservation_management_SaaS_called_Checkre-0.jpg`

---

## GÖREV 1 — Web Sitesi Logo Entegrasyonu

### 1a. Görseli kopyala ve optimize et
```bash
mkdir -p assets
cp "/mnt/user-data/uploads/gemini-2_5-flash-image_Minimalist_modern_app_icon_logo_for_a_reservation_management_SaaS_called_Checkre-0.jpg" assets/logo.jpg

# Python ile PNG'ye çevir ve boyutlandır (şeffaf arka plan için)
python3 - <<'EOF'
from PIL import Image
import os

img = Image.open("assets/logo.jpg").convert("RGBA")

# Beyaz arka planı şeffaf yap
data = img.getdata()
new_data = []
for item in data:
    # Beyaza yakın pikselleri şeffaf yap
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)
img.putdata(new_data)

# Farklı boyutlarda kaydet
img.save("assets/logo.png", "PNG")

# Favicon için küçük boyut
favicon = img.copy()
favicon.thumbnail((64, 64), Image.LANCZOS)
favicon.save("assets/favicon.png", "PNG")

# Navbar için yatay versiyon (sadece ikon kısmı — üst 60%)
w, h = img.size
icon_only = img.crop((0, 0, w, int(h * 0.62)))
icon_only.thumbnail((40, 40), Image.LANCZOS)
icon_only.save("assets/logo-icon.png", "PNG")

print("Logo dosyaları oluşturuldu: assets/logo.png, assets/favicon.png, assets/logo-icon.png")
EOF
```

### 1b. index.html'de logo güncellemesi

`index.html` içindeki `<head>` bölümüne favicon ekle:
```html
<link rel="icon" type="image/png" href="assets/favicon.png">
```

Navbar'daki logo alanını şu şekilde güncelle (mevcut metin/SVG logosunu değiştir):
```html
<!-- Navbar logo -->
<a href="#" class="navbar-brand" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
  <img src="assets/logo-icon.png" alt="CheckReserve Logo" style="height:36px; width:auto;">
  <span style="font-family:'Playfair Display',serif; font-weight:700; font-size:1.25rem; color:#0D6E6E; letter-spacing:-0.02em;">CheckRezerve</span>
</a>
```

Footer'daki logo alanını da güncelle:
```html
<!-- Footer logo -->
<div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
  <img src="assets/logo-icon.png" alt="CheckReserve Logo" style="height:32px; width:auto; filter:brightness(0) invert(1);">
  <span style="font-family:'Playfair Display',serif; font-weight:700; font-size:1.1rem; color:#ffffff;">CheckRezerve</span>
</div>
```

---

## GÖREV 2 — Terminal CLI ASCII Logo

`checkrezerve-cli.js` (veya `cli_logo.py`) dosyası oluştur. Program başladığında terminalde renkli ASCII art logo göstersin:

### Node.js versiyonu (`cli_logo.js`):
```javascript
#!/usr/bin/env node

const TEAL = '\x1b[36m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const WHITE = '\x1b[37m';
const DIM = '\x1b[2m';

function printLogo() {
  console.clear();
  console.log('');
  console.log(`${TEAL}${BOLD}  ╔══════════════════════════════════════╗${RESET}`);
  console.log(`${TEAL}${BOLD}  ║                                      ║${RESET}`);
  console.log(`${TEAL}${BOLD}  ║   ${BLUE}📅${TEAL}  CheckRezerve               ✓  ║${RESET}`);
  console.log(`${TEAL}${BOLD}  ║   ${WHITE}Rezervasyon Yönetim Sistemi        ${TEAL}║${RESET}`);
  console.log(`${TEAL}${BOLD}  ║                                      ║${RESET}`);
  console.log(`${TEAL}${BOLD}  ╚══════════════════════════════════════╝${RESET}`);
  console.log('');
  console.log(`${DIM}  v1.0.0  |  checkrezerve.com  |  © 2024${RESET}`);
  console.log('');
}

printLogo();
```

### Python versiyonu (`cli_logo.py`):
```python
#!/usr/bin/env python3

TEAL   = '\033[36m'
BLUE   = '\033[34m'
BOLD   = '\033[1m'
RESET  = '\033[0m'
WHITE  = '\033[97m'
DIM    = '\033[2m'
GREEN  = '\033[32m'

LOGO = f"""
{TEAL}{BOLD}  ┌─────────────────────────────────────────┐
  │                                         │
  │   {BLUE}╔═╗{TEAL}  {WHITE}CheckRezerve{TEAL}          {GREEN}✓ HAZIR{TEAL}  │
  │   {BLUE}║ ║{TEAL}  {WHITE}Rezervasyon Yönetim Sistemi{TEAL}       │
  │   {BLUE}╚═╝{TEAL}                                   │
  └─────────────────────────────────────────┘{RESET}

{DIM}  Sürüm: 1.0.0  |  checkrezerve.com  |  © 2024{RESET}
"""

CALENDAR_LOGO = f"""
{TEAL}{BOLD}
   ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
  ██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
  ██║     ███████║█████╗  ██║     █████╔╝ 
  ██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ 
  ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
   ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝
{RESET}
{WHITE}  ██████╗ ███████╗███████╗███████╗██████╗ ██╗   ██╗███████╗
  ██╔══██╗██╔════╝╚════██║██╔════╝██╔══██╗██║   ██║██╔════╝
  ██████╔╝█████╗      ██╔╝█████╗  ██████╔╝██║   ██║█████╗  
  ██╔══██╗██╔══╝     ██╔╝ ██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  
  ██║  ██║███████╗   ██║  ███████╗██║  ██║ ╚████╔╝ ███████╗
  ╚═╝  ╚═╝╚══════╝   ╚═╝  ╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝{RESET}

{TEAL}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{RESET}
{DIM}  Rezervasyon Yönetim Sistemi  |  v1.0.0  |  checkrezerve.com{RESET}
"""

if __name__ == "__main__":
    import os
    os.system('clear')
    print(CALENDAR_LOGO)
```

---

## GÖREV 3 — Favicon Dosyaları (tüm platformlar)

```bash
python3 - <<'EOF'
from PIL import Image

img = Image.open("assets/logo.png").convert("RGBA")

# Sadece ikon kısmını al (alt yazı hariç)
w, h = img.size
icon = img.crop((int(w*0.05), 0, int(w*0.95), int(h*0.62)))

sizes = [16, 32, 48, 64, 128, 180, 192, 512]
for size in sizes:
    resized = icon.copy()
    resized.thumbnail((size, size), Image.LANCZOS)
    resized.save(f"assets/favicon-{size}x{size}.png", "PNG")
    print(f"  ✓ favicon-{size}x{size}.png")

# Apple touch icon
icon.thumbnail((180, 180), Image.LANCZOS)
icon.save("assets/apple-touch-icon.png", "PNG")
print("  ✓ apple-touch-icon.png")
EOF
```

index.html `<head>` bölümüne ekle:
```html
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<meta name="theme-color" content="#0D6E6E">
```

---

## GÖREV 4 — OG / Social Media Meta Tags

`index.html` `<head>` bölümüne ekle:
```html
<meta property="og:title" content="CheckRezerve — Akıllı Rezervasyon Yönetimi">
<meta property="og:description" content="Restoranlar, spalar ve oteller için yapay zeka destekli rezervasyon platformu.">
<meta property="og:image" content="assets/logo.png">
<meta property="og:url" content="https://checkrezerve.com">
<meta name="twitter:card" content="summary">
<meta name="twitter:image" content="assets/logo.png">
```

---

## Çalıştırma Sırası

```bash
# 1. PIL kütüphanesi yoksa yükle
pip install Pillow --break-system-packages

# 2. Logo işleme scriptini çalıştır (Görev 1a ve 3)
python3 process_logo.py

# 3. CLI logoyu test et
python3 cli_logo.py

# 4. index.html'i tarayıcıda aç ve logo'nun göründüğünü doğrula
open index.html
```

---

## Beklenen Çıktı

```
assets/
├── logo.jpg          ← orijinal
├── logo.png          ← şeffaf arka planlı PNG
├── logo-icon.png     ← sadece ikon, 40x40 (navbar için)
├── favicon.png       ← 64x64
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon-128x128.png
├── favicon-180x180.png
├── favicon-192x192.png
├── favicon-512x512.png
└── apple-touch-icon.png
```
