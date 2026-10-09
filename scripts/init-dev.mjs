import { randomBytes } from 'node:crypto';
import { writeFileSync, existsSync } from 'node:fs';
if (existsSync('.env')) {
  console.log('.env already exists; left unchanged.');
  process.exit(0);
}
const pg = randomBytes(32).toString('hex');
const redis = randomBytes(32).toString('hex');
writeFileSync(
  '.env',
  `NODE_ENV=development\nPORT=4000\nWEB_ORIGIN=http://localhost:3000\nPOSTGRES_USER=cvlora\nPOSTGRES_DB=cvlora\nPOSTGRES_PASSWORD=${pg}\nREDIS_PASSWORD=${redis}\nDATABASE_URL=postgresql://cvlora:${pg}@localhost:5432/cvlora\nREDIS_URL=redis://:${redis}@localhost:6379\n`,
  { mode: 0o600, flag: 'wx' },
);
console.log(
  'Created .env with random development-only credentials. Values were not printed.',
);
