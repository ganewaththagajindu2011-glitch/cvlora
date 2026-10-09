import { existsSync } from 'node:fs';
import { URL } from 'node:url';
const standaloneRoot = new URL(
  '../.next/standalone/apps/web/',
  import.meta.url,
);
if (!existsSync(new URL('.next/trusted-style-hashes.json', standaloneRoot))) {
  throw new Error(
    'Web build is incomplete. Run pnpm --filter @cvlora/web build successfully before starting.',
  );
}
// Standalone Next uses HOSTNAME for its bind address; container hostnames are not
// suitable defaults for local smoke checks. Use a dedicated optional override.
process.env.HOSTNAME = process.env.CVLORA_WEB_HOST ?? '0.0.0.0';
await import('../.next/standalone/apps/web/server.js');
