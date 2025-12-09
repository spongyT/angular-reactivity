# Step 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./
COPY src ./src

RUN npm install
RUN npm run build

# Step 2: Run
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 8080
CMD ["node", "dist/index.js"]
