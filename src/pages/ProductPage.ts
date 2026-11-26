import { Locator, Page } from '@playwright/test';

/** Page object for a single product page with its reviews. */
export class ProductPage {
  readonly heading: Locator;
  readonly reviews: Locator;
  readonly backLink: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.reviews = page.locator('#reviews li');
    this.backLink = page.getByRole('link', { name: /back to shop/i });
  }

  async goto(productId: number) {
    return this.page.goto(`/products/${productId}`);
  }

  review(text: string): Locator {
    return this.reviews.filter({ hasText: text });
  }
}
