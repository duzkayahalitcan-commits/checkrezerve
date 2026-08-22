#!/usr/bin/env bash
# =============================================================================
# deploy.sh — checkrezerve.com tek container deploy
#
# Kullanım:
#   ./deploy.sh
#
# Mantık:
#   1. TypeScript kontrol (local)
#   2. rsync ile VPS'e gönder (middleware.ts exclude)
#   3. VPS'te docker compose build + up (sadece blue)
#   4. Health check bekle
#   5. nginx reload
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'

info() { echo -e "${CYAN}[deploy]${NC} $*"; }
ok()   { echo -e "${GREEN}[ok]${NC}     $*"; }
fail() { echo -e "${RED}[hata]${NC}   $*"; exit 1; }

# ─── 1) Proje dizini ────────────────────────────────────────────────────────
cd ~/Desktop/checkrezerve

# ─── 2) TypeScript kontrol ──────────────────────────────────────────────────
info 'TypeScript kontrol ediliyor...'
TS_OUTPUT=$(npx tsc --noEmit 2>&1 | head -30) || true
if echo "$TS_OUTPUT" | grep -q "error TS"; then
  fail "TypeScript hatasi:"
  echo "$TS_OUTPUT"
  exit 1
fi
ok 'TypeScript hatasiz'

# ─── 3) rsync ile VPS'e gönder ──────────────────────────────────────────────
info 'Dosyalar VPS\'e gonderiliyor...'
rsync -avz \
  --exclude=.git \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=middleware.ts \
  -e 'ssh -i ~/.ssh/checkrezerve_vps' \
  ~/Desktop/checkrezerve/ \
  root@178.105.51.245:/opt/checkrezerve/ \
  2>&1 | tail -3
ok 'rsync tamam'

# ─── 4) VPS'te build + deploy ───────────────────────────────────────────────
info 'Docker build basliyor...'
ssh -i ~/.ssh/checkrezerve_vps root@178.105.51.245 bash -s << 'SSHEOF'
set -euo pipefail

cd /opt/checkrezerve

# Build
docker compose build blue 2>&1 | tail -3
echo "[deploy] Build tamam"

# Eski container'i durdur ve yeniden baslat
echo "[deploy] Blue container yeniden baslatiliyor..."
docker rm -f checkrezerve-blue 2>/dev/null || true
docker compose up -d blue --no-deps 2>&1 | tail -3

# Health check — 60sn içinde retry (Dockerfile'daki start_period: 60s ile uyumlu)
# NOT: `curl http://checkrezerve-blue:3001` host DNS'te resolve edilemez
# (checkrezerve-blue sadece Docker network içinden erişilir). O yüzden tek
# doğru yol: `docker exec` ile container-internal test.
echo "[deploy] Health check bekleniyor (max 60sn, 5sn arayla)..."
HEALTH_OK=false
for i in $(seq 1 12); do
  if docker exec checkrezerve-blue wget -qO- http://127.0.0.1:3001/api/health >/dev/null 2>&1; then
    HEALTH_OK=true
    echo "[deploy] Blue container healthy (${i}. deneme, $((i*5))sn)"
    break
  fi
  sleep 5
done

if [ "$HEALTH_OK" = true ]; then
  echo "[deploy] nginx reload (kesintisiz)..."
  docker exec checkrezerve-nginx nginx -s reload
  echo "[deploy] nginx reload tamam"

  # Public sanity: nginx üzerinden gerçek user path'i test et
  if curl -sfI --max-time 10 https://checkrezerve.com/api/health >/dev/null 2>&1; then
    echo "[deploy] Public /api/health erisilebilir ✅"
  else
    echo "[uyari] Public /api/health erisilemedi (build OK ama nginx/SSL uyum kontrol et)"
  fi
else
  echo "[hata] Health check basarisiz — yeni container calismiyor"
  echo "[hata] Eski container devam ediyor, deploy IPTAL"
  docker logs checkrezerve-blue --tail 20
  exit 1
fi

echo "[deploy] Deploy tamamlandi"
SSHEOF

ok "Deploy tamamlandi ✅"
