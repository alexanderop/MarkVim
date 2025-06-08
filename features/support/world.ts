import type { IWorldOptions } from '@cucumber/cucumber'
import type { Browser, BrowserContext, Page } from '@playwright/test'
import { World } from '@cucumber/cucumber'
import { chromium } from '@playwright/test'

export interface CustomWorld extends World {
  browser: Browser
  context: BrowserContext
  page: Page
}

export interface PlaywrightTestOptions {
  browser: string
}

export class CustomWorld extends World {
  browser!: Browser
  context!: BrowserContext
  page!: Page

  constructor(options: IWorldOptions) {
    super(options)
  }

  async initBrowser() {
    const headless = this.parameters?.headless ?? true
    this.browser = await chromium.launch({
      headless,
      slowMo: headless ? 0 : 100,
    })
    this.context = await this.browser.newContext()
    this.page = await this.context.newPage()
  }

  async closeBrowser() {
    await this.page?.close()
    await this.context?.close()
    await this.browser?.close()
  }
}
