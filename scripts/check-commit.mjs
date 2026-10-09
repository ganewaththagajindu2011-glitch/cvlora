import { readFileSync } from 'node:fs';
const text = readFileSync(process.argv[2], 'utf8').split('\n')[0];
if (
  !/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .+/.test(
    text,
  )
) {
  console.error(
    'Use a Conventional Commit, e.g. feat(web): add template gallery',
  );
  process.exit(1);
}
