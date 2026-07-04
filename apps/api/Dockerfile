FROM node:20-alpine AS base
RUN corepack enable pnpm

# ─────────────────────────────────────────
# Dependencies stage
# ─────────────────────────────────────────
FROM base AS deps
WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────
# Build stage
# ─────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules

COPY . .

# Generate Prisma client
RUN pnpm --filter @linkbhejo/db prisma generate

# Build API
RUN pnpm --filter @linkbhejo/api build

# ─────────────────────────────────────────
# Production stage
# ─────────────────────────────────────────
FROM node:20-alpine AS runner
RUN corepack enable pnpm
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 linkbhejo

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/prisma ./prisma

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

USER linkbhejo

EXPOSE 3001

CMD ["node", "dist/index.js"]
