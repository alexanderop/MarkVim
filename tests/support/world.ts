/// <reference types="node" />

import type { IWorldOptions } from '@cucumber/cucumber'
import type { Browser, Page } from '@playwright/test'
import process from 'node:process'
import { After, Before, setDefaultTimeout, setWorldConstructor, World } from '@cucumber/cucumber'
import { chromium } from '@playwright/test'
import { DEFAULT_TIMEOUT_MS, POLLING_INTERVAL_MS } from './constants'

// Set default timeout for Cucumber steps
// Use longer timeout in CI environment to account for slower machines
const isCI = process.env.CI === 'true'
const defaultTimeout = isCI ? DEFAULT_TIMEOUT_MS : POLLING_INTERVAL_MS
setDefaultTimeout(defaultTimeout)

export interface MarkVimWorld extends World {
  browser?: Browser
  page?: Page
  sharedLink?: string
  init: () => Promise<void>
  cleanup: () => Promise<void>
}

class CustomWorld extends World implements MarkVimWorld {
  browser?: Browser
  page?: Page

  constructor(options: IWorldOptions) {
    super(options)
  }

  async init(): Promise<void> {
    try {
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: !process.env.HEADED,
        })
      }
      // Create fresh context with clean state for better test isolation
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
      })
      this.page = await context.newPage()
    }
    catch (error) {
      console.error('Failed to initialize browser/page:', error)
      throw error
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        const context = this.page.context()
        await this.page.close()
        await context.close()
        this.page = undefined
      }
      if (this.browser) {
        await this.browser.close()
        this.browser = undefined
      }
    }
    catch (error) {
      console.error('Failed to cleanup browser/page:', error)
    }
  }
}

setWorldConstructor(CustomWorld)

Before(async function (this: MarkVimWorld) {
  await this.init()
})

After(async function (this: MarkVimWorld) {
  await this.cleanup()
})
