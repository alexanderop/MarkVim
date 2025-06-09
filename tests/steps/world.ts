import { setWorldConstructor } from '@cucumber/cucumber'
import { type Browser, chromium, type Page } from '@playwright/test'

class CustomWorld {
  browser!: Browser
  page!: Page

  async init() {
    // eslint-disable-next-line node/prefer-global/process -- Need access to environment variables in ESM test context
    const env = process.env || {}
    const isHeaded = env.HEADED === 'true'

    this.browser = await chromium.launch({
      headless: !isHeaded,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    })
  }

  async cleanup() {
    await this.browser?.close()
  }
}

setWorldConstructor(CustomWorld)
