// Standalone Next uses HOSTNAME for its bind address; container hostnames are not
// suitable defaults for local smoke checks. Use a dedicated optional override.
process.env.HOSTNAME = process.env.CVLORA_WEB_HOST ?? '0.0.0.0';
await import('../.next/standalone/apps/web/server.js');
