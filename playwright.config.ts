import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * Projects:
 *  - api:      HTTP-only tests (no browser) - fast, run first
 *  - chromium: browser tests (UI, accessibility, security)
 *  - firefox / webkit: opt-in cross-browser run with CROSS_BROWSER=1
 */
const browserTests = /tests\/(ui|a11y|security)\/.*\.spec\.ts/;
const channel = process.env.PW_CHANNEL; // e.g. "chrome" to use an installed Chrome

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    baseURL: env.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.PW_VIDEO === 'off' ? 'off' : 'retain-on-failure',
  },
  projects: [
    { name: 'api', testMatch: /tests\/api\/.*\.spec\.ts/ },
    {
      name: 'chromium',
      testMatch: browserTests,
      use: { ...devices['Desktop Chrome'], ...(channel ? { channel } : {}) },
    },
    ...(process.env.CROSS_BROWSER
      ? [
          { name: 'firefox', testMatch: browserTests, use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', testMatch: browserTests, use: { ...devices['Desktop Safari'] } },
        ]
      : []),
  ],
});
