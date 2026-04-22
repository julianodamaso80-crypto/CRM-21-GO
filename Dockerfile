FROM node:20-slim

# Chromium do sistema + TODAS as libs que o Puppeteer precisa
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libdbus-1-3 \
    libxext6 \
    libxshmfence1 \
    libdrm2 \
 && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

WORKDIR /app

# Copia só o necessário pro backend (frontend nao roda no Railway)
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY shared/ ./shared/
COPY backend/ ./backend/

WORKDIR /app/backend

RUN npm install --omit=dev=false --include=dev \
 && npx prisma generate \
 && npx tsup

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && (npx prisma db seed || true) && node dist/server.js"]
