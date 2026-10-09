import { cpSync, existsSync } from 'node:fs';
cpSync('.next/static', '.next/standalone/apps/web/.next/static', {
  recursive: true,
});
if (existsSync('public'))
  cpSync('public', '.next/standalone/apps/web/public', { recursive: true });
