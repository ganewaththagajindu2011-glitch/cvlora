FROM node:24.19.0-alpine AS base
WORKDIR /app
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    export NODE_USE_ENV_PROXY=1; corepack enable && corepack prepare pnpm@11.19.0 --activate
FROM base AS build
COPY . .
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    export NODE_USE_ENV_PROXY=1; pnpm install --frozen-lockfile && pnpm --filter @cvlora/web build
FROM node:24.19.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
