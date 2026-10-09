import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sampleCv } from '../../packages/shared/src/editor';
test('create a CV from the landing, edit sections, reorder and print', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Create my CV' }).click();
  await page.getByLabel('Full name', { exact: true }).fill('Ayesha Silva');
  await page
    .getByLabel('Professional title', { exact: true })
    .fill('Software Engineer');
  await page.getByLabel('Email', { exact: true }).fill('ayesha@example.com');
  await page
    .getByLabel('Professional summary', { exact: true })
    .fill('I build accessible applications.');
  await page.getByLabel('Section type').selectOption('experience');
  await page.getByRole('button', { name: 'Add section', exact: true }).click();
  const experience = page.getByRole('region', { name: 'Experience section' });
  await experience
    .getByLabel('Role, qualification or skill')
    .fill('Software Engineer');
  await experience
    .getByLabel('Organisation or institution')
    .fill('Sample Studio');
  await experience.getByLabel('Dates').fill('2023 – Present');
  await experience
    .getByLabel('Details', { exact: true })
    .fill('Shipped a customer portal.\nImproved accessibility.');
  await page.getByLabel('Section type').selectOption('education');
  await page.getByRole('button', { name: 'Add section', exact: true }).click();
  await page
    .getByRole('region', { name: 'Education section' })
    .getByLabel('Role, qualification or skill')
    .fill('BSc Computer Science');
  await page
    .getByRole('button', { name: 'Move Education up', exact: true })
    .click();
  await expect(page.locator('#cv-document .cv-section h2')).toHaveText([
    'Profile',
    'Education',
    'Experience',
  ]);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('#cv-document .cv-section h2')).toHaveText([
    'Profile',
    'Experience',
    'Education',
  ]);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(
    page.getByRole('article', { name: 'Your CV preview' }),
  ).toBeVisible();
  await expect(page.locator('#cv-document')).toContainText('Ayesha Silva');
  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printCalled =
        document.querySelector('#cv-document h1')?.textContent ?? '';
    };
  });
  await page
    .getByRole('button', { name: 'Print / Save PDF', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-print-called',
    'Ayesha Silva',
  );
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.editor-form')).toBeHidden();
  await expect(page.locator('#cv-document')).toBeVisible();
  const pdf = await page.pdf({
    path: testInfo.outputPath('created-cv.pdf'),
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  expect(errors).toEqual([]);
});
test('device saving is opt-in, restores drafts and removes the device copy', async ({
  page,
}) => {
  await page.goto('/editor');
  await page.getByLabel('Full name', { exact: true }).fill('Kamal Perera');
  expect(
    await page.evaluate(() => localStorage.getItem('cvlora.draft.v1')),
  ).toBeNull();
  await page.getByLabel('Remember on this device').check();
  await expect(page.getByRole('status')).toHaveText(
    'Draft saved on this device.',
  );
  await page.reload();
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    'Kamal Perera',
  );
  await page.getByLabel('Remember on this device').uncheck();
  expect(
    await page.evaluate(() => localStorage.getItem('cvlora.draft.v1')),
  ).toBeNull();
  await page.reload();
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('');
});
test('imports strict drafts, renders malicious strings as text and rejects invalid imports', async ({
  page,
}, testInfo) => {
  await page.goto('/editor?template=classic');
  await expect(page.locator('#cv-document')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await expect(page.getByLabel('Import CVLora draft file')).toBeHidden();
  await expect(
    page.getByRole('combobox', { name: 'Template', exact: true }),
  ).toHaveValue('classic');
  const cv = sampleCv();
  cv.personal.name = '<img src=x onerror=alert(1)>';
  cv.summary = 'සිංහල தமிழ்';
  await page.getByLabel('Import CVLora draft file').setInputFiles({
    name: 'draft.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(cv)),
  });
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    cv.personal.name,
  );
  await expect(page.locator('#cv-document img')).toHaveCount(0);
  await expect(page.locator('#cv-document')).toContainText('සිංහල தமிழ்');
  await page.getByLabel('Import CVLora draft file').setInputFiles({
    name: 'draft.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ ...cv, ownerId: 'other' })),
  });
  await expect(page.getByRole('status')).toContainText(
    'not a valid CVLora draft',
  );
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    cv.personal.name,
  );
  const downloadPromise = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Download draft', exact: true })
    .click();
  const download = await downloadPromise;
  await download.saveAs(testInfo.outputPath('draft.json'));
  expect(download.suggestedFilename()).toBe('cvlora-draft.json');
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
  const size = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.width);
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
