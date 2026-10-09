import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const result = spawnSync(
  'pnpm',
  ['list', '-r', '--depth', 'Infinity', '--json'],
  { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
);
if (result.error) throw result.error;
if (result.status !== 0) throw new Error('Dependency inventory failed');
const components = new Map();
function visit(record) {
  if (record.name && record.version && !record.version.startsWith('link:')) {
    const purl = `pkg:npm/${record.name.replace('@', '%40')}@${record.version}`;
    components.set(purl, {
      type: 'library',
      name: record.name,
      version: record.version,
      purl,
    });
  }
  for (const key of ['dependencies', 'devDependencies', 'optionalDependencies'])
    for (const [name, dependency] of Object.entries(record[key] ?? {}))
      visit({ ...dependency, name: dependency.name ?? name });
}
for (const root of JSON.parse(result.stdout)) visit(root);
writeFileSync(
  'sbom.cdx.json',
  JSON.stringify(
    {
      bomFormat: 'CycloneDX',
      specVersion: '1.6',
      version: 1,
      components: [...components.values()],
    },
    null,
    2,
  ),
);
console.log(
  `Generated CycloneDX inventory with ${components.size} components.`,
);
