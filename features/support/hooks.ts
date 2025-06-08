import { After, Before, setWorldConstructor } from '@cucumber/cucumber'
import { CustomWorld } from './world.js'

Before({ timeout: 60000 }, async function (this: CustomWorld) {
  await this.initBrowser()
  await this.page.goto('http://localhost:3000')

  // Clear localStorage to ensure clean state
  await this.page.evaluate(() => localStorage.clear())

  // Wait for the app to fully load by checking for key elements
  await this.page.waitForSelector('[data-testid="document-title"]', { timeout: 30000 })

  // Wait for any initial loading to complete
  await this.page.waitForTimeout(1000)

  // Ensure the sidebar is visible for tests that depend on it
  const sidebar = this.page.locator('aside')
  const sidebarVisible = await sidebar.isVisible()
  if (!sidebarVisible) {
    // Click the sidebar toggle if it's not visible
    const sidebarToggle = this.page.locator('button[title*="sidebar"]').first()
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click()
      await this.page.waitForTimeout(500)
    }
  }
})

After({ timeout: 30000 }, async function (this: CustomWorld) {
  await this.closeBrowser()
})

setWorldConstructor(CustomWorld)
