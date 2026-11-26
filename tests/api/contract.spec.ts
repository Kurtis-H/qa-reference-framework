import { expect, test } from '../../src/fixtures';

/**
 * Guards the published OpenAPI spec. If an endpoint is renamed or removed without
 * updating clients, this fails before anything ships.
 */
const EXPECTED_OPERATIONS: Array<[method: string, path: string]> = [
  ['get', '/health'],
  ['post', '/api/login'],
  ['get', '/api/products'],
  ['get', '/api/orders/{order_id}'],
  ['post', '/api/products/{product_id}/reviews'],
  ['post', '/api/chat'],
];

test.describe('OpenAPI contract', () => {
  test('spec exposes every expected operation', { tag: ['@smoke'] }, async ({ api }) => {
    const res = await api.openApi();
    expect(res.status()).toBe(200);
    const spec = await res.json();
    expect(spec.openapi).toMatch(/^3\./);
    for (const [method, path] of EXPECTED_OPERATIONS) {
      expect(spec.paths?.[path]?.[method], `${method.toUpperCase()} ${path}`).toBeDefined();
    }
  });

  test('chat endpoint limits message length', { tag: ['@regression'] }, async ({ api }) => {
    const spec = await (await api.openApi()).json();
    const schema = spec.components.schemas.ChatIn.properties.message;
    expect(schema.maxLength).toBeLessThanOrEqual(4000);
    expect((await api.chat('x'.repeat(4001))).status()).toBe(422);
  });
});
