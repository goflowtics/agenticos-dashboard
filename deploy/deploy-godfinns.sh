#!/usr/bin/env bash
# deploy-godfinns.sh — build locally, push to godfinns, start/restart dashboard
# Usage: ./deploy/deploy-godfinns.sh
set -euo pipefail

REMOTE_USER="godfinns"
REMOTE_HOST="192.168.0.14"
REMOTE_DIR="/home/godfinns/Work/agenticos-dashboard"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/remote_user}"
SSH="ssh -i $SSH_KEY"
SCP_RSH="-e ssh -i $SSH_KEY"

log() { echo "► $*"; }

# --- 1. Build ---
log "Building..."
npm run build

# --- 2. Ensure remote dir exists ---
$SSH "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p $REMOTE_DIR"

# --- 3. Rsync build + configs ---
log "Rsyncing build/..."
rsync -avz --delete -e "ssh -i $SSH_KEY" build/ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/build/"

log "Rsyncing configs..."
rsync -avz -e "ssh -i $SSH_KEY" \
    package.json \
    ecosystem.godfinns.config.cjs \
    deploy/nginx-os.flexmedia.is.conf \
    "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

# --- 4. Remote setup (idempotent) ---
log "Running remote setup..."
$SSH "${REMOTE_USER}@${REMOTE_HOST}" bash <<'ENDSSH'
set -euo pipefail

# install pm2 globally if missing
if ! command -v pm2 &>/dev/null; then
    echo "  installing pm2..."
    npm install -g pm2
fi

# install nginx if missing
if ! command -v nginx &>/dev/null; then
    echo "  installing nginx..."
    sudo apt-get update -qq && sudo apt-get install -y nginx
fi

# install nginx vhost
VHOST_SRC="/home/godfinns/Work/agenticos-dashboard/nginx-os.flexmedia.is.conf"
VHOST_DST="/etc/nginx/sites-available/os.flexmedia.is"
if [ -f "$VHOST_SRC" ]; then
    sudo cp "$VHOST_SRC" "$VHOST_DST"
    sudo ln -sf "$VHOST_DST" /etc/nginx/sites-enabled/os.flexmedia.is
    sudo nginx -t && sudo systemctl reload nginx
    echo "  nginx vhost installed"
fi

# start or restart pm2 app
cd /home/godfinns/Work/agenticos-dashboard
if pm2 describe agenticos-dashboard &>/dev/null; then
    pm2 reload ecosystem.godfinns.config.cjs
else
    pm2 start ecosystem.godfinns.config.cjs
fi
pm2 save

# setup pm2 startup (prints a command to run as sudo if not already done)
pm2 startup | tail -1 || true

echo "Done. Dashboard running at http://127.0.0.1:4242"
ENDSSH

log "Deploy complete."
log ""
log "Next steps on godfinns:"
log "  1. Set SESSION_SECRET and RESEND_API_KEY in environment"
log "     (add to /home/godfinns/.bashrc or /etc/environment, then pm2 restart)"
log "  2. Make sure os.flexmedia.is Cloudflare DNS A record → 46.239.216.78"
log "  3. SSL: Cloudflare Full (Strict) mode OR install Cloudflare Origin Cert"
log "     See: https://dash.cloudflare.com → os.flexmedia.is → SSL/TLS → Origin Server"
