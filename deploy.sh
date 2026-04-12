#!/usr/bin/env bash
# =============================================================================
# deploy.sh — checkrezerve.com için tek komutluk deploy scripti
#
# Kullanım:
#   ./deploy.sh            → normal deploy (git pull + build + restart)
#   ./deploy.sh --init-ssl → ilk kez SSL sertifikası al, ardından deploy et
#   ./deploy.sh --no-build → imaj build etmeden sadece container'ları yeniden başlat
# =============================================================================

set -euo pipefail

DOMAIN="checkrezerve.com"
EMAIL="admin@checkrezerve.com"   # ← Let's Encrypt bildirimleri için değiştir
COMPOSE="docker compose"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC}  $*"; }
die()  { echo -e "${RED}[error]${NC} $*" >&2; exit 1; }

# ─── Ön kontroller ───────────────────────────────────────────────────────────
command -v docker  >/dev/null 2>&1 || die "Docker kurulu değil. Önce vps-setup.sh çalıştır."
command -v git     >/dev/null 2>&1 || die "Git kurulu değil."
[ -f ".env" ]                       || die ".env dosyası bulunamadı. .env.example'dan kopyala ve doldur."

# ─── Argüman işleme ──────────────────────────────────────────────────────────
INIT_SSL=false
NO_BUILD=false
for arg in "$@"; do
  case $arg in
    --init-ssl) INIT_SSL=true ;;
    --no-build) NO_BUILD=true ;;
    *) warn "Bilinmeyen argüman: $arg" ;;
  esac
done

# ─── Git: en son kodu çek ────────────────────────────────────────────────────
log "GitHub'dan son değişiklikler çekiliyor..."
git pull --ff-only || die "git pull başarısız. Önce merge conflict'leri çöz."

# ─── İlk SSL kurulumu ────────────────────────────────────────────────────────
if [ "$INIT_SSL" = true ]; then
  log "SSL bootstrap başlıyor..."

  # Geçici HTTP-only nginx başlat (ACME challenge için)
  log "Geçici HTTP nginx başlatılıyor..."
  $COMPOSE down --remove-orphans 2>/dev/null || true
  docker run -d --rm --name nginx-init \
    -p 80:80 \
    -v "$(pwd)/nginx-init.conf:/etc/nginx/conf.d/default.conf:ro" \
    -v "certbot-www:/var/www/certbot" \
    nginx:1.27-alpine

  sleep 3

  # Certbot ile sertifika al (compose volume ismine dikkat: proje_prefix + certbot-conf)
  CERTBOT_VOL="${COMPOSE_PROJECT_NAME:-checkrezerve}_certbot-conf"
  log "Let's Encrypt sertifikası alınıyor: $DOMAIN (volume: $CERTBOT_VOL)"
  docker run --rm \
    -v "${CERTBOT_VOL}:/etc/letsencrypt" \
    -v "certbot-www:/var/www/certbot" \
    certbot/certbot certonly \
      --webroot \
      --webroot-path=/var/www/certbot \
      --email "$EMAIL" \
      --agree-tos \
      --no-eff-email \
      -d "$DOMAIN" \
      -d "www.$DOMAIN"

  # Geçici nginx'i durdur
  docker stop nginx-init 2>/dev/null || true
  log "SSL sertifikası başarıyla alındı."
fi

# ─── Build ───────────────────────────────────────────────────────────────────
if [ "$NO_BUILD" = false ]; then
  log "Docker imajı build ediliyor..."
  $COMPOSE build --no-cache app
fi

# ─── Deploy ──────────────────────────────────────────────────────────────────
log "Container'lar başlatılıyor..."
$COMPOSE up -d --remove-orphans

# ─── Sağlık kontrolü ─────────────────────────────────────────────────────────
log "Uygulama ayağa kalkması bekleniyor..."
for i in $(seq 1 12); do
  if docker exec checkrezerve-app wget -qO- http://localhost:3000/api/health >/dev/null 2>&1; then
    log "Uygulama hazır!"
    break
  fi
  echo -n "."
  sleep 5
  [ "$i" -eq 12 ] && die "Uygulama 60 saniyede hazır olmadı. Logları kontrol et: docker logs checkrezerve-app"
done

# ─── Durum özeti ─────────────────────────────────────────────────────────────
echo ""
log "Deploy tamamlandı!"
echo "─────────────────────────────────────────"
$COMPOSE ps
echo "─────────────────────────────────────────"
echo ""
log "Loglar için: docker logs -f checkrezerve-app"
log "Canlı site:  https://$DOMAIN"

# ─── Hatırlatma Cron'u (her gün 09:00) ──────────────────────────────────────
CRON_JOB="0 9 * * * curl -s -X POST https://$DOMAIN/api/send-reminders -H 'Authorization: Bearer \${CRON_SECRET}' >> /var/log/checkrezerve-reminders.log 2>&1"
if ! crontab -l 2>/dev/null | grep -qF "send-reminders"; then
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  log "Hatırlatma cron'u eklendi (her gün 09:00)."
fi
