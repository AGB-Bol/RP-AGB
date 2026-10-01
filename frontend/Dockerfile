# ─────────────────────────────────────────────
# Stage 1: base — Node 20 LTS con pnpm
# ─────────────────────────────────────────────
FROM node:20-alpine AS base

# Pinear versión exacta evita sorpresas con breaking changes (ej: pnpm v12)
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

# ─────────────────────────────────────────────
# Stage 2: dev — instala en runtime para que
# pnpm-lock.yaml quede en el volumen del host
# ─────────────────────────────────────────────
FROM base AS dev

EXPOSE 3000

# pnpm install corre en el entrypoint:
#   - Si no hay lockfile lo genera en ./frontend (visible en el host)
#   - Si ya existe el lockfile, pnpm es suficientemente inteligente
#     para saber que no hay nada nuevo y el arranque es casi instantáneo
CMD ["sh", "-c", "pnpm install && pnpm dev"]

# ─────────────────────────────────────────────
# Stage 3: deps — solo para producción
# (requiere pnpm-lock.yaml commiteado en git)
# ─────────────────────────────────────────────
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

# frozen-lockfile garantiza reproducibilidad en CI/producción
RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────
# Stage 4: builder — compila la app
# ─────────────────────────────────────────────
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ─────────────────────────────────────────────
# Stage 5: prod — imagen final mínima
# ─────────────────────────────────────────────
FROM node:20-alpine AS prod

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

WORKDIR /app

# standalone output solo copia lo necesario (ver next.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
