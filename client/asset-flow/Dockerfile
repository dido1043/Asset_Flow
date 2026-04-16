# Multi-stage Dockerfile for Next.js production
# Builder
FROM node:20-alpine AS builder
WORKDIR /app
ARG API_URL
ARG NEXT_PUBLIC_API_URL
ENV API_URL=$API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Install dependencies first (use package-lock if present)
COPY package*.json ./
RUN npm ci
# Copy source and build
COPY . .
RUN npm run build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
ARG API_URL
ARG NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV API_URL=$API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Copy only what's needed from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
# Next.js starts with `next start` which listens on 3000 by default
CMD ["npm","start"]
