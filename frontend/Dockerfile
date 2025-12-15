# Multi-stage production build for Next.js frontend

# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# 2) Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only what we need for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# If you have a next.config file, copy it as well (optional)
# COPY --from=builder /app/next.config.* ./

# Reuse node_modules from builder (simple, not minimal size but fast)
COPY --from=builder /app/node_modules ./node_modules

# Expose production port
EXPOSE 4060

# Start Next.js in production mode
CMD ["npm", "start", "--", "-p", "4060"]
