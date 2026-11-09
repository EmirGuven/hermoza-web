# syntax=docker/dockerfile:1.7
# Hermoza Kitchen & Atelier — Next.js (standalone) üretim imajı

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build sırasında sayfalar gerçek içerikle ön-render edilsin diye veritabanı adresi
# BuildKit secret olarak verilir (imaja yazılmaz). Verilmezse site varsayılan içerikle derlenir,
# çalışırken veritabanından güncellenir.
RUN --mount=type=secret,id=database_url,required=false \
    if [ -f /run/secrets/database_url ]; then export DATABASE_URL="$(cat /run/secrets/database_url)"; fi; \
    npm run build

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
COPY --from=build --chown=node:node /app/scripts/migrate.mjs ./scripts/migrate.mjs
RUN mkdir -p /app/uploads && chown node:node /app/uploads

# node kullanıcısı (uid 1000) sunucudaki dev kullanıcısıyla aynı: uploads klasörüne yazabilir
USER node
EXPOSE 3000
CMD ["sh", "-c", "node scripts/migrate.mjs && exec node server.js"]
