FROM node:24.19.0-alpine AS build
WORKDIR /app
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then cat /run/secrets/proxy_ca >> /etc/ssl/cert.pem; fi; \
    apk add --no-cache openssl
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    export NODE_USE_ENV_PROXY=1; corepack enable && corepack prepare pnpm@11.19.0 --activate
COPY . .
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    export NODE_USE_ENV_PROXY=1; pnpm install --frozen-lockfile && pnpm db:generate && pnpm --filter @cvlora/api build && pnpm --filter @cvlora/api deploy --legacy --prod /out && /app/apps/api/node_modules/.bin/prisma generate --schema=/out/prisma/schema.prisma
FROM node:24.19.0-alpine AS runtime
WORKDIR /app
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then cat /run/secrets/proxy_ca >> /etc/ssl/cert.pem; fi; \
    apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
