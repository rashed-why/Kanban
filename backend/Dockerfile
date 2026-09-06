# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma:generate
RUN yarn build

RUN yarn install --frozen-lockfile --production && yarn cache clean

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl wget \
  && addgroup -S nestjs \
  && adduser -S nestjs -G nestjs

COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nestjs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json
COPY --chown=nestjs:nestjs docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

USER nestjs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD ["CMD-SHELL", "node -e \"const p=Number(process.env.PORT||4000);const s=require('net').connect(p,'127.0.0.1',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1))\""]

ENTRYPOINT ["./docker-entrypoint.sh"]
