FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm install --no-audit --no-fund
COPY . .
RUN npx prisma generate

FROM base AS dev
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && (npx prisma db seed || true) && npm run start:dev"]

FROM base AS build
RUN npm run build

FROM node:22-alpine AS prod
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
