#!/usr/bin/env python3
"""CheckRezerve menu converter: PDF dosyayı pdfminer.six ile metne çevirir.

Kullanım:
    python menu_convert.py <dosya_yolu>

Çıktı: dönüştürülmüş metni stdout'a basar. Hata durumunda stderr'e yazar ve
nonzero çıkış koduyla döner.

Bu script'i Node/Next.js sunucusu, /api/menu/parse içinden subprocess olarak
çağırır. Görsel (jpg/png) OCR'ı ayrıca Node tarafında (tesseract.js) yapılır;
bu script YALNIZCA PDF için kullanılır.

PDF->metin: pdfminer.six'in high_level.extract_text() fonksiyonu kullanılır.
Bu, eski markitdown bağımlılığının PDF yoluyla BİREBİR aynı motordur
(markitdown da aynı pdfminer fonksiyonunu çağırır), ancak markitdown'ın
beraberinde getirdiği ~330MB'lık gereksiz bağımlılık ağacı (pandas, numpy,
openai, azure, pptx, magika vs.) image'dan elenir.
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
        from pdfminer.high_level import extract_text
    except Exception as e:  # noqa: BLE001
        print(f"pdfminer.six yüklenemiyor: {e}", file=sys.stderr)
        return 3

    try:
        text = (extract_text(str(src)) or "").strip()
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
