# syntax=docker/dockerfile:1

# ---------- dependencias ------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
# Prisma necesita openssl para elegir su motor de consultas en musl.
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build -------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# El build no abre la base de datos ni firma sesiones: estos valores solo están
# para que no falte ninguna variable durante la compilación.
ENV DATABASE_URL="file:/tmp/build.db"
ENV SESSION_SECRET="solo-para-el-build-no-se-usa-en-tiempo-de-ejecucion-000000"
RUN npm run build
# Se poda primero y se regenera después: npm prune borraría el cliente de Prisma.
RUN npm prune --omit=dev && npx prisma generate

# ---------- runtime -----------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl su-exec && \
    addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs diario

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    DATABASE_URL="file:/data/diario.db"

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/data ./data
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

VOLUME ["/data"]
EXPOSE 3000

# El entrypoint arranca como root solo para dar permisos al volumen y baja a
# "diario" antes de ejecutar la aplicación.
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node_modules/.bin/next", "start"]
