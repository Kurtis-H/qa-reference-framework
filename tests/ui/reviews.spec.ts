import { products, uniqueText } from '../../src/data/users';
import { expect, test } from '../../src/fixtures';

test.describe('Product reviews', () => {
  test('a review posted via API appears on the product page', { tag: ['@regression'] }, async ({
    aliceApi,
    productPage,
  }) => {
    // Arrange through the API (fast), assert through the UI (what users see).
    const text = uniqueText('Love this keyboard');
    await aliceApi.addReview(products.keyboard.id, text);

    await productPage.goto(products.keyboard.id);
    await expect(productPage.review(text)).toBeVisible();
    await expect(productPage.review(text)).toContainText('alice');
  });
});
