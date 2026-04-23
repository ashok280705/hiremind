# ----------- Dependencies -----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ----------- Build -----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ----------- Distroless Runner -----------
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Only copy minimal standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["server.js"]