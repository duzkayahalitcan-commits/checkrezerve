#!/usr/bin/env bash
# CheckRezerve menü ayrıştırıcı ortamı kurulumu.
# MarkItDown (Python) PDF'leri metne çevirmek için kullanılır.
#
# Proje içinde .venv oluşturmak Turbopack build'ini bozar (symlink dışa işaret
# eder). Bu yüzden venv, proje DIŞINA (~/.checkrezerve-venv) kurulur ve
# MENU_MARKITDOWN_PYTHON env'i ile işaret edilir.
#
# Kullanım:
#   ./scripts/setup-menu-parser.sh
#
# Kurulduktan sonra .env.local dosyanıza ekleyin:
#   MENU_MARKITDOWN_PYTHON="$HOME/.checkrezerve-venv/bin/python"
set -euo pipefail

VENV_DIR="${MENU_MARKITDOWN_VENV_DIR:-$HOME/.checkrezerve-venv}"
PYTHON="${PYTHON:-python3}"

echo "▶ Kuruluyor: $VENV_DIR"
"$PYTHON" -m venv "$VENV_DIR"
"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/python" -m pip install markitdown

echo ""
echo "✅ Hazır! Şu satırı .env.local'e ekleyin:"
echo "MENU_MARKITDOWN_PYTHON=\"$VENV_DIR/bin/python\""
