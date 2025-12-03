FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY packages/config-eslint/package.json ./packages/config-eslint/
COPY packages/config-typescript/package.json ./packages/config-typescript/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY services/trading/package.json ./services/trading/
RUN npm ci --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/config-eslint/node_modules ./packages/config-eslint/node_modules
COPY --from=deps /app/packages/config-typescript/node_modules ./packages/config-typescript/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/services/trading/node_modules ./services/trading/node_modules
COPY . .
RUN npm run build --workspace=@popflash/shared
RUN npm run build --workspace=@popflash/database
RUN npm run build --workspace=@popflash/trading-service

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/services/trading/dist ./services/trading/dist
COPY --from=builder /app/services/trading/package.json ./services/trading/
COPY --from=builder /app/node_modules ./node_modules
USER appuser
EXPOSE 4200
CMD ["node", "services/trading/dist/index.js"]
