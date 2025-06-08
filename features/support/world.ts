import { IWorld, setWorldConstructor, World } from '@cucumber/cucumber';
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  PlaywrightTestOptions,
} from '@playwright/test';

export class CustomWorld extends World implements IWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  async openApplication() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.goto('http://localhost:3000'); // Assumes dev server is running
  }

  async closeApplication() {
    await this.page.close();
    await this.context.close();
    await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);