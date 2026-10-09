import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('landing and template navigation work without browser errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'More than a CV',
  );
  await page.getByRole('link', { name: 'Browse templates' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose your starting point.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Use Professional' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('theme is interactive and landing meets axe WCAG checks', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    /dark|light/,
  );
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ html: n.html, summary: n.failureSummary })),
    })),
  ).toEqual([]);
});
test('reduced motion degrades effects and mobile content does not overflow', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-quality', 'low');
  const size = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.width);
});

test('trusted styles render and unauthorized inline CSS is blocked', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(247, 249, 245)',
  );
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = 'body{background-color:rgb(255,0,0)!important}';
    document.head.appendChild(style);
  });
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(247, 249, 245)',
  );
});
