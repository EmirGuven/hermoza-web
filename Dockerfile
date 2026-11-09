# syntax=docker/dockerfile:1.7
# Hermoza Kitchen & Atelier — Next.js (standalone) üretim imajı

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
# Sitemap, robots.txt, llms.txt ve paylaşım kartları build sırasında üretilir: site adresi burada da gerekli
ARG SITE_URL=https://hermoza.com.tr
ENV NEXT_TELEMETRY_DISABLED=1 \
    SITE_URL=${SITE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build sırasında sayfalar gerçek içerikle ön-render edilsin diye veritabanı adresi
# BuildKit secret olarak verilir (imaja yazılmaz). Verilmezse site varsayılan içerikle derlenir,
# çalışırken veritabanından güncellenir.
RUN --mount=type=secret,id=database_url,required=false \
    if [ -f /run/secrets/database_url ]; then export DATABASE_URL="$(cat /run/secrets/database_url)"; fi; \
    npm run build

# Migration script'i için ayrı, küçük bağımlılık klasörü. Standalone çıktı drizzle-orm'u uygulama
# koduna gömdüğü için node_modules'ta bırakmaz; migrate.mjs'in kendi paketleri olmalı.
# Sürümler package.json'dan okunur.
FROM node:22-alpine AS migrator
WORKDIR /migrate
COPY package.json ./app-package.json
RUN node -e "const d=require('./app-package.json').dependencies; require('fs').writeFileSync('package.json', JSON.stringify({private:true, type:'module', dependencies:{'drizzle-orm':d['drizzle-orm'], pg:d.pg}}))" \
    && npm install --omit=dev --no-audit --no-fund

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    UPLOAD_DIR=/app/uploads

# Standalone çıktı + statik dosyalar + migration'lar
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/drizzle ./drizzle
COPY --from=migrator --chown=node:node /migrate/node_modules ./migrate/node_modules
COPY --from=migrator --chown=node:node /migrate/package.json ./migrate/package.json
COPY --from=build --chown=node:node /app/scripts/migrate.mjs ./migrate/migrate.mjs
RUN mkdir -p /app/uploads && chown node:node /app/uploads

# node kullanıcısı (uid 1000) sunucudaki dev kullanıcısıyla aynı: uploads klasörüne yazabilir
USER node
EXPOSE 3000
# Önce bekleyen migration'lar (çalışma klasörü /app, drizzle/ buradan okunur), sonra uygulama
CMD ["sh", "-c", "node migrate/migrate.mjs && exec node server.js"]
