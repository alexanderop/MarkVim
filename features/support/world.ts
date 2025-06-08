import type { IWorldOptions } from '@cucumber/cucumber'
import type { Browser, BrowserContext, Page } from '@playwright/test'
import { World } from '@cucumber/cucumber'
import { chromium } from '@playwright/test'

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
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
    
    this.browser = await chromium.launch({
      headless,
      slowMo: headless ? 0 : 100,
      args: [
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        ...(isCI ? [
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-sync',
          '--metrics-recording-only',
          '--no-first-run',
        ] : []),
      ],
    })
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      reducedMotion: 'reduce',
      timeout: isCI ? 60000 : 30000,
      ignoreHTTPSErrors: true,
      ...(isCI ? {
        recordVideo: undefined,
        recordHar: undefined,
      } : {}),
    })
    
    this.page = await this.context.newPage()
    
    const defaultTimeout = isCI ? 45000 : 30000
    this.page.setDefaultTimeout(defaultTimeout)
    this.page.setDefaultNavigationTimeout(defaultTimeout)
  }

  async closeBrowser() {
    await this.page?.close()
    await this.context?.close()
    await this.browser?.close()
  }
}
