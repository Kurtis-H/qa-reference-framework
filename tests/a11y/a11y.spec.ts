import AxeBuilder from '@axe-core/playwright';
import { products } from '../../src/data/users';
import { expect, test } from '../../src/fixtures';

/**
 * Automated WCAG 2.1 AA checks with axe-core. Automated tools catch roughly a third of
 * accessibility issues, so this is a floor, not a full audit.
 */
const pages: Array<[name: string, path: string]> = [
  ['home', '/'],
  ['product', `/products/${products.keyboard.id}`],
];

for (const [name, path] of pages) {
  test(`${name} page has no WCAG 2.1 AA violations`, { tag: ['@a11y'] }, async ({ page }, testInfo) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

    await testInfo.attach('axe-results.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.help} [${v.nodes.length} element(s)]`);
    expect(summary, 'accessibility violations').toEqual([]);
  });
}
