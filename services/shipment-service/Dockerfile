# SWIFTRoute Shipment Service Dockerfile

FROM node:18-alpine AS base

# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy root Prisma schema (services share the schema)
COPY ../../prisma ./prisma/

# Copy service package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

# Copy service code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4004/health || exit 1

# Start the service
CMD ["npm", "start"]
