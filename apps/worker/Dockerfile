# M0 fails closed. M4 must replace this with a sandboxed Chromium worker.
FROM node:24.19.0-alpine AS build
WORKDIR /app
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    export NODE_USE_ENV_PROXY=1; corepack enable && corepack prepare pnpm@11.19.0 --activate
COPY . .
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    export NODE_USE_ENV_PROXY=1; pnpm install --frozen-lockfile && pnpm --filter @cvlora/worker build
FROM node:24.19.0-alpine AS runtime
WORKDIR /app
COPY --from=build --chown=node:node /app/apps/worker/dist/index.js ./index.js
USER node
CMD ["node", "index.js"]
