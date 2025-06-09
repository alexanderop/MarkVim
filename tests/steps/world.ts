import { setWorldConstructor } from '@cucumber/cucumber'
import { type Browser, chromium, type Page } from '@playwright/test'

class CustomWorld {
  browser!: Browser
  page!: Page

  async init() {
    // Use environment variable to determine headed mode
    const process = await import('node:process')
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
