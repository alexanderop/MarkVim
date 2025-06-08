import { After, Before, setWorldConstructor } from '@cucumber/cucumber'
import { CustomWorld } from './world.js'

Before({ timeout: 60000 }, async function (this: CustomWorld) {
  await this.initBrowser()
  
  // Navigate to the application with retry logic
  let retries = 3
  while (retries > 0) {
    try {
      await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
      break
    } catch (error) {
      retries--
      if (retries === 0) throw error
      await this.page.waitForTimeout(2000)
    }
  }

  // Clear localStorage to ensure clean state
  await this.page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  // Wait for the app to fully load with multiple checkpoints
  await this.page.waitForSelector('[data-testid="document-title"]', { timeout: 30000 })
  
  // Wait for Vue app to be fully hydrated
  await this.page.waitForFunction(
    () => window.document.readyState === 'complete',
    { timeout: 15000 }
  )
  
  // Additional wait for any async components or data loading
  await this.page.waitForTimeout(2000)

  // Ensure the sidebar is visible and interactive for tests that depend on it
  try {
    const sidebar = this.page.locator('aside')
    const sidebarVisible = await sidebar.isVisible()
    
    if (!sidebarVisible) {
      // Try to find and click the sidebar toggle
      const sidebarToggle = this.page.locator('button[title*="sidebar"]').first()
      if (await sidebarToggle.isVisible()) {
        await sidebarToggle.click()
        await this.page.waitForTimeout(1000)
        
        // Verify sidebar is now visible
        await this.page.waitForSelector('aside', { state: 'visible', timeout: 5000 })
      }
    }
  } catch (error) {
    // Log sidebar setup issue but don't fail the test
    console.warn('Sidebar setup warning:', error.message)
  }
  
  // Final verification that the app is ready
  await this.page.waitForFunction(
    () => {
      // Check that key elements are present and interactive
      const title = document.querySelector('[data-testid="document-title"]')
      const editor = document.querySelector('.cm-editor')
      return title && editor && document.body.classList.contains('loaded') !== false
    },
    { timeout: 15000 }
  )
})

After({ timeout: 30000 }, async function (this: CustomWorld) {
  try {
    // Take a screenshot if the test failed (for debugging)
    if (this.result?.status === 'FAILED') {
      const screenshot = await this.page.screenshot()
      this.attach(screenshot, 'image/png')
    }
  } catch (error) {
    console.warn('Failed to take screenshot:', error.message)
  }
  
  await this.closeBrowser()
})

setWorldConstructor(CustomWorld)
