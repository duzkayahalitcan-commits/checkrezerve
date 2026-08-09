#!/usr/bin/env python3
"""CheckRezerve menu converter: PDF/görsel dosyayı MarkItDown ile markdown/metne çevirir.

Kullanım:
    python menu_convert.py <dosya_yolu>

Çıktı: dönüştürülmüş metni stdout'a basar. Hata durumunda stderr'e yazar ve
nonzero çıkış koduyla döner.

Bu script'i Node/Next.js sunucusu, /api/menu/parse içinden subprocess olarak çağırır.
"""
import sys
from pathlib import Path

def main() -> int:
    if len(sys.argv) < 2:
        print("Kullanım: menu_convert.py <dosya_yolu>", file=sys.stderr)
        return 2

    src = Path(sys.argv[1])
    if not src.is_file():
        print(f"Dosya bulunamadı: {src}", file=sys.stderr)
        return 2

    try:
        from markitdown import MarkItDown
    except Exception as e:  # noqa: BLE001
        print(f"MarkItDown yüklenemiyor: {e}", file=sys.stderr)
        return 3

    try:
        md = MarkItDown()
        result = md.convert(str(src))
        text = (result.text_content or "").strip()
        if not text:
            print("Dosyadan metin çıkarılamadı (boş sonuç).", file=sys.stderr)
            return 4
        sys.stdout.write(text)
        return 0
    except Exception as e:  # noqa: BLE001
        print(f"Dönüştürme hatası: {e}", file=sys.stderr)
        return 5

if __name__ == "__main__":
    sys.exit(main())
