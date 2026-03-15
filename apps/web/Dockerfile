# ── Stage 1: Prune monorepo ──────────────────────────────────────────
FROM node:20-alpine AS pruner

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app
COPY . .
RUN pnpm dlx turbo@2 prune @repo/web --docker

# ── Stage 2: Install & Build ────────────────────────────────────────
FROM node:20-alpine AS installer

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Install dependencies from pruned lockfile (cached layer)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy pruned source and build
COPY --from=pruner /app/out/full/ .

# Ensure public directory exists (may not exist yet)
RUN mkdir -p apps/web/public

# env.ts validates BACKEND_API_URL at import time during next build
ARG BACKEND_API_URL
ENV BACKEND_API_URL=$BACKEND_API_URL

RUN pnpm turbo build --filter=@repo/web...

# ── Stage 3: Production Runner ──────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

WORKDIR /app

# Next.js standalone output (includes all traced dependencies)
COPY --from=installer --chown=nodejs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nodejs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nodejs:nodejs /app/apps/web/public ./apps/web/public

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# dumb-init as PID 1 for proper signal forwarding (graceful shutdown)
CMD ["dumb-init", "node", "apps/web/server.js"]
