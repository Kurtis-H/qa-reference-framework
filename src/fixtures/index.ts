import { test as base } from '@playwright/test';
import { ShopApi } from '../api/ShopApi';
import { users } from '../data/users';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';

type Fixtures = {
  api: ShopApi;
  aliceApi: ShopApi;
  bobApi: ShopApi;
  homePage: HomePage;
  productPage: ProductPage;
};

/**
 * Custom fixtures: tests ask for what they need (`aliceApi`, `homePage`) and get it
 * ready to use. Login and setup live here, not copy-pasted into every test.
 */
export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ShopApi(request));
  },
  aliceApi: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({ baseURL });
    const api = new ShopApi(ctx);
    await api.login(users.alice.username, users.alice.password);
    await use(api);
    await ctx.dispose();
  },
  bobApi: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({ baseURL });
    const api = new ShopApi(ctx);
    await api.login(users.bob.username, users.bob.password);
    await use(api);
    await ctx.dispose();
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
});

export { expect } from '@playwright/test';
