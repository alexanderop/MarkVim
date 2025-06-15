import type { Page } from '@playwright/test'
import type { Buffer } from 'node:buffer'

export class TestUtils {
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle')
    await page.waitForLoadState('domcontentloaded')
  }

  static async takeScreenshot(page: Page, name: string): Promise<Buffer> {
    return await page.screenshot({
      path: `tests/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    })
  }

  static async scrollToElement(page: Page, selector: string): Promise<void> {
    await page.locator(selector).scrollIntoViewIfNeeded()
  }

  static async waitForElementCount(page: Page, selector: string, count: number): Promise<void> {
    await page.waitForFunction(
      ({ selector, count }) => document.querySelectorAll(selector).length === count,
      { selector, count },
    )
  }

  static async getElementText(page: Page, selector: string): Promise<string> {
    return await page.locator(selector).textContent() || ''
  }

  static async isElementPresent(page: Page, selector: string): Promise<boolean> {
    return await page.locator(selector).count() > 0
  }

  static async waitForStableElement(page: Page, selector: string, timeout: number = 5000): Promise<void> {
    const element = page.locator(selector)
    await element.waitFor({ state: 'visible', timeout })

    // Wait for element to be stable (no position changes)
    let previousBox = await element.boundingBox()
    let stabilityCount = 0
    const requiredStabilityChecks = 3

    while (stabilityCount < requiredStabilityChecks) {
      await page.waitForTimeout(100)
      const currentBox = await element.boundingBox()

      if (this.areBoxesEqual(previousBox, currentBox)) {
        stabilityCount++
      }
      else {
        stabilityCount = 0
        previousBox = currentBox
      }
    }
  }

  private static areBoxesEqual(box1: any, box2: any): boolean {
    if (!box1 || !box2)
      return box1 === box2

    return (
      Math.abs(box1.x - box2.x) < 1
      && Math.abs(box1.y - box2.y) < 1
      && Math.abs(box1.width - box2.width) < 1
      && Math.abs(box1.height - box2.height) < 1
    )
  }

  static async highlightElement(page: Page, selector: string): Promise<void> {
    await page.evaluate((selector) => {
      const element = document.querySelector(selector)
      if (element instanceof HTMLElement) {
        element.style.border = '3px solid red'
        element.style.backgroundColor = 'yellow'
      }
    }, selector)
  }

  static async removeHighlight(page: Page, selector: string): Promise<void> {
    await page.evaluate((selector) => {
      const element = document.querySelector(selector)
      if (element instanceof HTMLElement) {
        element.style.border = ''
        element.style.backgroundColor = ''
      }
    }, selector)
  }

  static parseDataTable(dataTable: any): string[] {
    return dataTable.raw().slice(1).flat()
  }

  static async waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
    let requestCount = 0
    let responseCount = 0

    const requestHandler = () => requestCount++
    const responseHandler = () => responseCount++

    page.on('request', requestHandler)
    page.on('response', responseHandler)

    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      await page.waitForTimeout(100)
      if (requestCount === responseCount && requestCount > 0) {
        break
      }
    }

    page.off('request', requestHandler)
    page.off('response', responseHandler)
  }
}
