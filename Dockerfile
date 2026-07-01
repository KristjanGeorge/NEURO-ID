# NEURO-ID Service — Dockerfile
# Build context: NEURO-ID repo root

# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY services/neuro-id-service/package.json ./services/neuro-id-service/

RUN pnpm install --frozen-lockfile

COPY services/neuro-id-service/tsconfig.json ./services/neuro-id-service/
COPY services/neuro-id-service/src           ./services/neuro-id-service/src

RUN pnpm --filter neuro-id-service build

# ── Production stage ────────────────────────────────────────────────────────────
FROM node:20-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY services/neuro-id-service/package.json ./services/neuro-id-service/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/services/neuro-id-service/dist ./services/neuro-id-service/dist

ENV NODE_ENV=production
EXPOSE 6000

HEALTHCHECK --interval=15s --timeout=10s --retries=5 \
  CMD wget -qO- http://localhost:6000/health || exit 1

CMD ["node", "services/neuro-id-service/dist/index.js"]
