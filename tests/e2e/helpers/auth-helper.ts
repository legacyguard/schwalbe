
import type { Page } from '@playwright/test';
import { testUser } from '../fixtures/test-data';

export class AuthHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async signIn(email = testUser.email, password = testUser.password) {
    await this.page.goto('/sign-in');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/dashboard');
  }

  async signUp(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    await this.page.goto('/sign-up');
    await this.page.fill('input[name="firstName"]', userData.firstName);
    await this.page.fill('input[name="lastName"]', userData.lastName);
    await this.page.fill('input[type="email"]', userData.email);
    await this.page.fill('input[type="password"]', userData.password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/dashboard');
  }

  async signOut() {
    await this.page.click('button[aria-label="User menu"]');
    await this.page.click('text=Sign out');
    await this.page.waitForURL('**/sign-in');
  }

  async isSignedIn() {
    try {
      // Check for authenticated UI elements in addition to URL
      await this.page.waitForURL('**/dashboard', { timeout: 1000 });
      const userMenuButton = this.page.locator(
        'button[aria-label="User menu"]'
      );
      return await userMenuButton.isVisible();
    } catch {
      return false;
    }
  }
}
