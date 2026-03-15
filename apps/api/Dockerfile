# ── Stage 1: Prune monorepo ──────────────────────────────────────────
FROM node:20-alpine AS pruner

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

WORKDIR /app
COPY . .
RUN pnpm dlx turbo@2 prune @repo/api --docker

# ── Stage 2: Install & Build ────────────────────────────────────────
FROM node:20-alpine AS installer

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

WORKDIR /app

# Install dependencies from pruned lockfile (cached layer)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy pruned source and build
COPY --from=pruner /app/out/full/ .

# Ensure drizzle migrations directory exists (may not have migrations yet)
RUN mkdir -p apps/api/drizzle

RUN pnpm turbo build --filter=@repo/api...

# Remove dev dependencies
RUN pnpm prune --prod --no-optional

# ── Stage 3: Production Runner ──────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init libc6-compat

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

WORKDIR /app

# Copy production node_modules (root — contains @repo/shared symlink)
COPY --from=installer --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy shared package build output
COPY --from=installer --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=installer --chown=nodejs:nodejs /app/packages/shared/package.json ./packages/shared/package.json

# Copy API build output
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/package.json ./apps/api/package.json

# Copy Drizzle migrations for runtime migration support
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/drizzle ./apps/api/drizzle

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# dumb-init as PID 1 for proper signal forwarding (graceful shutdown)
CMD ["dumb-init", "node", "apps/api/dist/main.js"]
