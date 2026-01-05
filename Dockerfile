# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle.config.ts ./


CMD ["npm", "start"]