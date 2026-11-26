import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { z } from 'zod';
import { LoginResponseSchema } from '../schemas';

/**
 * Thin client for vuln-shop's API. Tests call intent-level methods (login, searchProducts)
 * instead of building URLs and headers themselves.
 */
export class ShopApi {
  private token?: string;

  constructor(private readonly request: APIRequestContext) {}

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async login(username: string, password: string): Promise<string> {
    const res = await this.request.post('/api/login', { data: { username, password } });
    expect(res.status(), await res.text()).toBe(200);
    this.token = parse(LoginResponseSchema, await res.json()).token;
    return this.token;
  }

  useToken(token: string | undefined): this {
    this.token = token;
    return this;
  }

  health() {
    return this.request.get('/health');
  }

  searchProducts(q = '') {
    return this.request.get('/api/products', { params: { q } });
  }

  getOrder(id: number) {
    return this.request.get(`/api/orders/${id}`, { headers: this.authHeaders() });
  }

  addReview(productId: number, body: string) {
    return this.request.post(`/api/products/${productId}/reviews`, {
      data: { body },
      headers: this.authHeaders(),
    });
  }

  chat(message: string) {
    return this.request.post('/api/chat', { data: { message } });
  }

  openApi() {
    return this.request.get('/openapi.json');
  }
}

/** Validate a payload against a schema, with a readable error listing every mismatch. */
export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Contract violation:\n${JSON.stringify(result.error.issues, null, 2)}\nPayload: ${JSON.stringify(data)}`);
  }
  return result.data;
}

export async function json<T extends z.ZodTypeAny>(res: APIResponse, schema: T): Promise<z.infer<T>> {
  return parse(schema, await res.json());
}
