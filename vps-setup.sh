#!/usr/bin/env bash
# =============================================================================
# vps-setup.sh — Contabo VPS ilk kurulum scripti
#
# Bu scripti VPS'e SSH ile bağlandıktan sonra çalıştır:
#   curl -fsSL https://raw.githubusercontent.com/KULLANICIN/checkrezerve/main/vps-setup.sh | bash
# veya dosyayı kopyalayıp:
#   chmod +x vps-setup.sh && sudo ./vps-setup.sh
# =============================================================================

set -euo pipefail
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[setup]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC}  $*"; }

[ "$(id -u)" -eq 0 ] || { echo "Root yetkisi gerekli: sudo ./vps-setup.sh"; exit 1; }

# ─── 1. Sistem güncellemesi ───────────────────────────────────────────────────
log "Sistem güncelleniyor..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  curl wget git ufw fail2ban \
  ca-certificates gnupg lsb-release \
  htop unzip logrotate

# ─── 2. Docker kurulumu ───────────────────────────────────────────────────────
log "Docker kuruluyor..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable --now docker
log "Docker versiyonu: $(docker --version)"
log "Docker Compose versiyonu: $(docker compose version)"

# ─── 3. Sudo kullanıcı oluştur (root ile çalışmamak için) ────────────────────
DEPLOY_USER="deployer"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  log "Deploy kullanıcısı oluşturuluyor: $DEPLOY_USER"
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  usermod -aG docker,sudo "$DEPLOY_USER"
  warn "Önemli: $DEPLOY_USER için şifre veya SSH key ayarla!"
fi

# ─── 4. UFW Güvenlik Duvarı ───────────────────────────────────────────────────
log "UFW ayarlanıyor..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    comment "SSH"
ufw allow 80/tcp    comment "HTTP"
ufw allow 443/tcp   comment "HTTPS"
# n8n için (sadece VPN/güvenilir IP'den erişmek istersen aşağıyı aç):
# ufw allow from SENIN_IP_ADRESIN to any port 5678 comment "n8n"
echo "y" | ufw enable
log "UFW durumu:"
ufw status verbose

# ─── 5. Fail2ban ─────────────────────────────────────────────────────────────
log "Fail2ban yapılandırılıyor..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled  = true
port     = ssh
logpath  = %(sshd_log)s
maxretry = 3
bantime  = 24h
EOF

systemctl enable --now fail2ban
log "Fail2ban aktif."

# ─── 6. SSH Güvenlik Sıkılaştırması ──────────────────────────────────────────
log "SSH güvenliği sıkılaştırılıyor..."
SSHD_CONFIG="/etc/ssh/sshd_config"
# Mevcut ayarları sakla
cp "$SSHD_CONFIG" "${SSHD_CONFIG}.bak"

sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' "$SSHD_CONFIG"
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/'  "$SSHD_CONFIG"
sed -i 's/^#\?X11Forwarding.*/X11Forwarding no/'                   "$SSHD_CONFIG"

systemctl reload sshd
warn "SSH key ile bağlandığını doğrulamadan root login'i kapatma!"

# ─── 7. Proje dizini ─────────────────────────────────────────────────────────
log "Proje dizini hazırlanıyor..."
mkdir -p /opt/checkrezerve
chown "$DEPLOY_USER:$DEPLOY_USER" /opt/checkrezerve

# ─── 8. Logrotate Docker logları için ────────────────────────────────────────
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl reload docker

# ─── 9. Swap (RAM az olan VPS'ler için) ──────────────────────────────────────
if [ ! -f /swapfile ]; then
  log "2GB swap oluşturuluyor..."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
  log "Swap aktif."
fi

# ─── Özet ────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
log "VPS kurulumu tamamlandı!"
echo ""
echo "Sonraki adımlar:"
echo "  1. SSH key'ini VPS'e ekle (ssh-copy-id veya ~/.ssh/authorized_keys)"
echo "  2. Projeyi klonla: git clone https://github.com/KULLANICIN/checkrezerve /opt/checkrezerve"
echo "  3. .env dosyasını oluştur: cp .env.example .env && nano .env"
echo "  4. DNS A kaydını VPS IP'sine yönlendir: checkrezerve.com → $(curl -s ifconfig.me)"
echo "  5. SSL al ve deploy et: ./deploy.sh --init-ssl"
echo ""
echo "VPS IP adresi: $(curl -s ifconfig.me)"
echo "════════════════════════════════════════════════"
