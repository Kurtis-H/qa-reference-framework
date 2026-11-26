import { json } from '../../src/api/ShopApi';
import { products } from '../../src/data/users';
import { expect, test } from '../../src/fixtures';
import { HealthSchema, ProductListSchema } from '../../src/schemas';

test.describe('Products API', () => {
  test('health check reports ok', { tag: ['@smoke'] }, async ({ api }) => {
    const res = await api.health();
    expect(res.status()).toBe(200);
    await json(res, HealthSchema);
  });

  test('lists public products matching the contract', { tag: ['@smoke'] }, async ({ api }) => {
    const res = await api.searchProducts();
    expect(res.status()).toBe(200);
    const list = await json(res, ProductListSchema);
    expect(list.map((p) => p.name)).toEqual(
      expect.arrayContaining([products.keyboard.name, products.hub.name, products.headphones.name]),
    );
  });

  test('never lists hidden products', { tag: ['@regression'] }, async ({ api }) => {
    const list = await json(await api.searchProducts(), ProductListSchema);
    expect(list.map((p) => p.id)).not.toContain(products.hiddenDrone.id);
  });

  test('search is case-insensitive and filters by name', { tag: ['@regression'] }, async ({ api }) => {
    const list = await json(await api.searchProducts('usb-c'), ProductListSchema);
    expect(list.map((p) => p.name)).toEqual([products.hub.name]);
  });

  test('search with no matches returns an empty list', { tag: ['@regression'] }, async ({ api }) => {
    const list = await json(await api.searchProducts('does-not-exist-xyz'), ProductListSchema);
    expect(list).toEqual([]);
  });

  test('prices are positive and have at most 2 decimals', { tag: ['@regression'] }, async ({ api }) => {
    const list = await json(await api.searchProducts(), ProductListSchema);
    for (const p of list) {
      expect(p.price, p.name).toBeGreaterThan(0);
      expect(Math.round(p.price * 100) / 100, p.name).toBe(p.price);
    }
  });
});
