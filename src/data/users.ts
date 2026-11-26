/** Demo accounts seeded by vuln-shop. Public on purpose - it's a local training app. */
export const users = {
  alice: { username: 'alice', password: 'alice123', orderId: 1, address: 'Alice Lane' },
  bob: { username: 'bob', password: 'bob123', orderId: 2, address: 'Bob Street' },
} as const;

export type UserKey = keyof typeof users;

export const products = {
  keyboard: { id: 1, name: 'Mechanical Keyboard' },
  hub: { id: 2, name: 'USB-C Hub' },
  headphones: { id: 3, name: 'Noise-Cancelling Headphones' },
  /** Hidden product - must never be visible to customers. */
  hiddenDrone: { id: 4, name: 'Prototype Drone' },
} as const;

/** Unique text per test run so parallel tests and re-runs never collide. */
export function uniqueText(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
