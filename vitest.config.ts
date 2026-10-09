import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/**/*.test.{ts,mjs}'],
    pool: 'forks',
    maxWorkers: 4,
  },
});
