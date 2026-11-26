import { Locator, Page } from '@playwright/test';

/** Page object for the shop home page: product search and support chat. */
export class HomePage {
  readonly heading: Locator;
  readonly modeBadge: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productLinks: Locator;
  readonly chatInput: Locator;
  readonly chatSend: Locator;
  readonly chatLog: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.modeBadge = page.locator('.mode');
    this.searchInput = page.locator('#search input[name="q"]');
    this.searchButton = page.locator('#search button');
    this.productLinks = page.locator('#products a');
    this.chatInput = page.locator('#chat input[name="message"]');
    this.chatSend = page.locator('#chat button');
    this.chatLog = page.locator('#chatlog');
  }

  async goto() {
    await this.page.goto('/');
    await this.productLinks.first().waitFor();
  }

  async search(term: string) {
    const response = this.page.waitForResponse((r) => r.url().includes('/api/products'));
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await response;
  }

  async productNames(): Promise<string[]> {
    return (await this.productLinks.allTextContents()).map((t) => t.split(' - ')[0].trim());
  }

  async openProduct(name: string) {
    await this.productLinks.filter({ hasText: name }).click();
  }

  async sendChat(message: string) {
    const response = this.page.waitForResponse((r) => r.url().endsWith('/api/chat'));
    await this.chatInput.fill(message);
    await this.chatSend.click();
    await response;
  }
}
