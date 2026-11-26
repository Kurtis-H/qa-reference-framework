/**
 * All environment-specific values live here, so tests never hardcode URLs or credentials.
 *
 * BASE_URL defaults to vuln-shop's SECURE instance. The functional suite should pass
 * against either mode; the @security suite only passes against secure mode (that's the point).
 */
export const env = {
  baseUrl: process.env.BASE_URL ?? 'http://localhost:8001',
} as const;
