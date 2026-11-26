import { json } from '../../src/api/ShopApi';
import { products, uniqueText, users } from '../../src/data/users';
import { expect, test } from '../../src/fixtures';
import { OrderSchema, ReviewCreatedSchema } from '../../src/schemas';

test.describe('Auth', () => {
  test('valid login returns a JWT', { tag: ['@smoke'] }, async ({ api }) => {
    const token = await api.login(users.alice.username, users.alice.password);
    expect(token.split('.')).toHaveLength(3);
  });

  for (const [label, creds] of [
    ['wrong password', { username: 'alice', password: 'wrong' }],
    ['unknown user', { username: 'nobody', password: 'x' }],
    ['empty password', { username: 'alice', password: '' }],
  ] as const) {
    test(`rejects ${label}`, { tag: ['@regression'] }, async ({ request }) => {
      const res = await request.post('/api/login', { data: creds });
      expect(res.status()).toBe(401);
    });
  }

  test('rejects a malformed login body', { tag: ['@regression'] }, async ({ request }) => {
    const res = await request.post('/api/login', { data: { username: 'alice' } });
    expect(res.status()).toBe(422);
  });
});

test.describe('Orders', () => {
  test('user can read their own order', { tag: ['@smoke'] }, async ({ aliceApi }) => {
    const res = await aliceApi.getOrder(users.alice.orderId);
    expect(res.status()).toBe(200);
    const order = await json(res, OrderSchema);
    expect(order.shipping_address).toContain(users.alice.address);
  });

  test('orders require authentication', { tag: ['@regression'] }, async ({ api }) => {
    expect((await api.useToken(undefined).getOrder(users.alice.orderId)).status()).toBe(401);
  });

  test('garbage token is rejected', { tag: ['@regression'] }, async ({ api }) => {
    expect((await api.useToken('not.a.jwt').getOrder(users.alice.orderId)).status()).toBe(401);
  });

  test('unknown order returns 404', { tag: ['@regression'] }, async ({ aliceApi }) => {
    expect((await aliceApi.getOrder(99999)).status()).toBe(404);
  });
});

test.describe('Reviews', () => {
  test('logged-in user can post a review', { tag: ['@smoke'] }, async ({ aliceApi }) => {
    const res = await aliceApi.addReview(products.keyboard.id, uniqueText('API review'));
    expect(res.status()).toBe(201);
    await json(res, ReviewCreatedSchema);
  });

  test('anonymous review is rejected', { tag: ['@regression'] }, async ({ api }) => {
    expect((await api.addReview(products.keyboard.id, 'hi')).status()).toBe(401);
  });

  test('review on missing product returns 404', { tag: ['@regression'] }, async ({ aliceApi }) => {
    expect((await aliceApi.addReview(99999, 'hi')).status()).toBe(404);
  });

  for (const [label, body] of [
    ['empty', ''],
    ['too long (2001 chars)', 'x'.repeat(2001)],
  ] as const) {
    test(`rejects ${label} review`, { tag: ['@regression'] }, async ({ aliceApi }) => {
      expect((await aliceApi.addReview(products.keyboard.id, body)).status()).toBe(422);
    });
  }
});
