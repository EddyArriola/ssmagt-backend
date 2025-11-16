# Dockerfile para NestJS Backend
FROM node:20-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    wget \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias primero (incluyendo @prisma/client)
RUN npm ci && npm cache clean --force

# Generar cliente de Prisma
RUN npx prisma generate

# Etapa de build
FROM base AS builder

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

# Instalar dependencias del sistema para producción
RUN apk add --no-cache openssl libc6-compat wget

WORKDIR /app

# Copiar package.json y prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar solo dependencias de producción
RUN npm ci --omit=dev && npm cache clean --force

# Generar cliente de Prisma en producción
RUN npx prisma generate

# Copiar archivos built
COPY --from=builder /app/dist ./dist

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Cambiar ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "dist/src/main"]