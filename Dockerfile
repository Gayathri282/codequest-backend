# backend/Dockerfile
# Multi-stage build for a lean production image

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npx prisma generate

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

RUN addgroup -S codequest && adduser -S codequest -G codequest
USER codequest

EXPOSE 5000

# Ensure schema/indexes exist, then start API
CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
