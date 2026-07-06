FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter @emirsign/api build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER nestjs
EXPOSE 3001
CMD ["node", "dist/main"]
