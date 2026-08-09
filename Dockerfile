# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — bağımlılıklar
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — build
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public değişkenler (Railway / VPS build arg olarak geçer)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — minimal production image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ── PDF menü ayrıştırıcı (pdfminer.six) — image içinde build-time venv ──────
# markitdown -> pdfminer.six geçişi (image boyutu küçültme).
# markitdown'ın PDF motoru zaten pdfminer.six idi; artık doğrudan sadece
# pdfminer.six kurulur (~330MB gereksiz bağımlılık ağacı elendi).
# venv, host'a bağımlı olmadan image içine kurulur.
RUN apk add --no-cache python3 py3-virtualenv py3-pip \
 && python3 -m venv /opt/checkrezerve-venv \
 && /opt/checkrezerve-venv/bin/pip install --no-cache-dir --upgrade pip \
 && /opt/checkrezerve-venv/bin/pip install --no-cache-dir pdfminer.six \
 && apk del py3-virtualenv

ENV MENU_MARKITDOWN_PYTHON=/opt/checkrezerve-venv/bin/python

# Güvenlik: root olmayan kullanıcı
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone çıktısı — sadece gerekli dosyalar
COPY --from=builder --chown=nextjs:nodejs /app/public              ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone  ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static      ./.next/static

USER nextjs
EXPOSE 3000

# Runtime env değişkenleri container başlatılırken inject edilir
CMD ["node", "server.js"]