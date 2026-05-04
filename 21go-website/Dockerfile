# Dockerfile minimalista pro 21go-website (Next.js 15)
# - Sem instalar Chromium (puppeteer eh dep transitiva, nao usado no codigo)
# - Multi-stage pra reduzir tamanho da imagem final
# - Cache de npm pra acelerar rebuilds

# ====== Stage 1: deps ======
FROM node:20-slim AS deps
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps --include=dev

# ====== Stage 2: build ======
FROM node:20-slim AS builder
WORKDIR /app
ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ====== Stage 3: runner ======
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
