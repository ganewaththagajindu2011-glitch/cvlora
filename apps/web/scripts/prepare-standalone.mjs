import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { isTrustedCssPath } from './trusted-css-path.mjs';
const hashes = new Set();
const cssRoot = resolve('.next/static/css');
function hash(css) {
  hashes.add(`sha256-${createHash('sha256').update(css).digest('base64')}`);
}
for (const file of readdirSync(cssRoot))
  if (file.endsWith('.css')) hash(readFileSync(join(cssRoot, file)));
// Next inlineCss concatenates layout and route styles into one style element.
// Derive its hash from trusted build assets, never request or CV content.
for (const file of readdirSync('.next/server/app', { recursive: true })) {
  if (!file.endsWith('_client-reference-manifest.js')) continue;
  const source = readFileSync(join('.next/server/app', file), 'utf8');
  const start = source.indexOf(']=');
  if (start < 0) throw new Error('Unexpected Next CSS manifest format');
  const manifest = JSON.parse(source.slice(start + 2).replace(/;\s*$/, ''));
  const paths = new Set();
  for (const entries of Object.values(manifest.entryCSSFiles)) {
    for (const entry of entries) if (entry.inlined) paths.add(entry.path);
  }
  const contents = [...paths].map((path) => {
    const asset = resolve('.next', path);
    if (!isTrustedCssPath(cssRoot, asset))
      throw new Error('Unexpected trusted CSS path');
    return readFileSync(asset, 'utf8');
  });
  if (contents.length) hash(contents.join(''));
}
if (!hashes.size) throw new Error('Trusted styles are missing');
writeFileSync('.next/trusted-style-hashes.json', JSON.stringify([...hashes]));
cpSync('.next/static', '.next/standalone/apps/web/.next/static', {
  recursive: true,
});
cpSync(
  '.next/trusted-style-hashes.json',
  '.next/standalone/apps/web/.next/trusted-style-hashes.json',
);
if (existsSync('public'))
  cpSync('public', '.next/standalone/apps/web/public', { recursive: true });
