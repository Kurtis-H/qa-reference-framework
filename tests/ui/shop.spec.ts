import { products } from '../../src/data/users';
import { expect, test } from '../../src/fixtures';

test.describe('Shop UI', () => {
  test('home page shows products', { tag: ['@smoke'] }, async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.heading).toContainText('Vuln Shop');
    expect(await homePage.productNames()).toEqual(
      expect.arrayContaining([products.keyboard.name, products.hub.name, products.headphones.name]),
    );
  });

  test('search narrows the product list', { tag: ['@smoke'] }, async ({ homePage }) => {
    await homePage.goto();
    await homePage.search('keyboard');
    await expect(homePage.productLinks).toHaveCount(1);
    await expect(homePage.productLinks.first()).toContainText(products.keyboard.name);
  });

  test('clicking a product opens its page', { tag: ['@regression'] }, async ({ homePage, productPage, page }) => {
    await homePage.goto();
    await homePage.openProduct(products.headphones.name);
    await expect(page).toHaveURL(new RegExp(`/products/${products.headphones.id}$`));
    await expect(productPage.heading).toHaveText(products.headphones.name);
  });

  test('back link returns to the shop', { tag: ['@regression'] }, async ({ productPage, page }) => {
    await productPage.goto(products.hub.id);
    await productPage.backLink.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('hidden product page returns 404', { tag: ['@regression'] }, async ({ productPage }) => {
    const res = await productPage.goto(products.hiddenDrone.id);
    expect(res?.status()).toBe(404);
  });

  test('support chat replies to a question', { tag: ['@smoke'] }, async ({ homePage }) => {
    await homePage.goto();
    await homePage.sendChat('How long does shipping take?');
    await expect(homePage.chatLog).toContainText('You: How long does shipping take?');
    await expect(homePage.chatLog).toContainText('ShopBot:');
  });
});
