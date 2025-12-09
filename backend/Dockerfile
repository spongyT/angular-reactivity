# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# package.json + package-lock.json kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm install

# Restlicher Code
COPY tsconfig.json ./
COPY src ./src

# TypeScript build
RUN npm run build



# ---- Runtime Stage ----
FROM node:20-alpine

WORKDIR /app

# Nur benötigte Dateien kopieren
COPY package*.json ./
RUN npm install --only=production

# Dist aus dem Builder kopieren
COPY --from=builder /app/dist ./dist

# Expose Port
EXPOSE 3000

# Startbefehl
CMD ["node", "dist/index.js"]