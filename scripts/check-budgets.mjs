import { writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = process.cwd();
const entries = [];
for (const route of ['/', '/templates', '/editor']) {
  const response = await fetch(`http://127.0.0.1:3000${route}`);
  if (!response.ok)
    throw new Error(`Cannot measure ${route}: HTTP ${response.status}`);
  const html = await response.text();
  const files = new Set();
  const inline = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .join('\n');
  const inlinePath = `.budget-inline-${route === '/' ? 'landing' : route.slice(1)}.js`;
  writeFileSync(inlinePath, inline);
  files.add(inlinePath);
  for (const tag of html.matchAll(/<script\b[^>]*>/g)) {
    // nomodule fallbacks are not downloaded/executed by supported modern browsers.
    if (/\bnomodule\b/i.test(tag[0])) continue;
    const source = tag[0].match(/\bsrc="([^"?]+)"/);
    if (!source) continue;
    if (!source[1].startsWith('/_next/static/'))
      throw new Error('Unexpected external script');
    const file = resolve(
      root,
      'apps/web/.next',
      source[1].slice('/_next/'.length),
    );
    if (
      !relative(resolve(root, 'apps/web/.next/static'), file).startsWith('..')
    )
      files.add(relative(root, file));
    else throw new Error('Unexpected script path');
  }
  if (files.size === 1) throw new Error(`No scripts discovered for ${route}`);
  entries.push({
    name: `${route} initial modern-browser JS`,
    path: [...files],
    limit: route === '/editor' ? '250 kB' : '150 kB',
    gzip: true,
    brotli: false,
  });
}
writeFileSync('.size-limit.generated.json', JSON.stringify(entries, null, 2));
const result = spawnSync(
  'pnpm',
  ['exec', 'size-limit', '--config', '.size-limit.generated.json'],
  { stdio: 'inherit' },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
