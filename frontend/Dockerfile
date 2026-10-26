# ─────────────────────────────────────────────
# Stage 1: base — Node 20 LTS con pnpm
# ─────────────────────────────────────────────
FROM node:22-alpine AS base

# Pinear versión exacta evita sorpresas con breaking changes (ej: pnpm v12)
RUN corepack enable && corepack prepare pnpm@11.15.1 --activate

WORKDIR /app

# ─────────────────────────────────────────────
# Stage 2: dev — instala en runtime para que
# pnpm-lock.yaml quede en el volumen del host
# ─────────────────────────────────────────────
FROM base AS dev

# Copiar manifiestos ANTES de que el volumen los tape,
# así pnpm sabe qué instalar aunque node_modules no exista.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

EXPOSE 3000

# node_modules se instala dentro del contenedor.
# El volumen ./frontend:/app tapa el resto del código (hot-reload),
# pero node_modules queda aislado gracias al volumen anónimo /app/node_modules
# declarado en docker-compose.yml.
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
FROM node:22-alpine AS prod

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
