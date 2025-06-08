import type { CustomWorld } from '../support/world.js'
import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

When('I press {string} then {string}', async function (this: CustomWorld, firstKey: string, secondKey: string) {
  // Ensure we're focused on the main application area
  await this.page.waitForSelector('body', { timeout: 10000 })
  await this.page.locator('body').click()
  await this.page.waitForTimeout(300)

  // Handle sequential key presses for shortcuts like "g s"
  await this.page.keyboard.press(firstKey)
  await this.page.waitForTimeout(500) // Increased delay between keys for CI stability
  await this.page.keyboard.press(secondKey)

  // Wait for modal to appear with proper element waiting
  await this.page.waitForSelector('[data-testid="modal-content"]', {
    state: 'visible',
    timeout: 15000,
  })
})

When('I click the {string} button in the toolbar', async function (this: CustomWorld, _buttonText: string) {
  // Look for the settings button - it has title "Settings (g s)"
  const settingsButton = this.page.locator('button[title*="Settings"]')

  // Wait for button to be visible and enabled
  await expect(settingsButton).toBeVisible({ timeout: 10000 })
  await expect(settingsButton).toBeEnabled({ timeout: 5000 })

  // Scroll to button if needed and click
  await settingsButton.scrollIntoViewIfNeeded()
  await settingsButton.click()

  // Wait for modal to appear
  await this.page.waitForSelector('[data-testid="modal-content"]', {
    state: 'visible',
    timeout: 15000,
  })
})

Then('the settings modal should be open', async function (this: CustomWorld) {
  // Wait for modal to be present and visible
  const modal = this.page.getByTestId('modal-content')
  await expect(modal).toBeVisible({ timeout: 15000 })

  // Verify it's specifically the settings modal by checking the title
  const modalTitle = this.page.getByTestId('modal-title')
  await expect(modalTitle).toBeVisible({ timeout: 10000 })
  await expect(modalTitle).toHaveText('Settings', { timeout: 10000 })

  // Additional verification - check that modal is fully rendered
  await this.page.waitForFunction(() => {
    const modalElement = document.querySelector('[data-testid="modal-content"]')
    return modalElement && window.getComputedStyle(modalElement).opacity === '1'
  }, { timeout: 10000 })
})

Then('I should see the title {string}', async function (this: CustomWorld, expectedTitle: string) {
  const modalTitle = this.page.getByTestId('modal-title')
  await expect(modalTitle).toBeVisible({ timeout: 10000 })
  await expect(modalTitle).toHaveText(expectedTitle, { timeout: 5000 })
})

Given('the settings modal is open', async function (this: CustomWorld) {
  // First check if modal is already open
  const existingModal = this.page.getByTestId('modal-content')
  const isModalVisible = await existingModal.isVisible()

  if (!isModalVisible) {
    // Focus the main application area first
    await this.page.waitForSelector('body', { timeout: 10000 })
    await this.page.locator('body').click()
    await this.page.waitForTimeout(300)

    // Open the settings modal using the keyboard shortcut
    await this.page.keyboard.press('g')
    await this.page.waitForTimeout(500) // Increased delay for CI stability
    await this.page.keyboard.press('s')

    // Wait for modal to appear
    await this.page.waitForSelector('[data-testid="modal-content"]', {
      state: 'visible',
      timeout: 15000,
    })
  }

  // Verify it's open and fully rendered
  const modal = this.page.getByTestId('modal-content')
  await expect(modal).toBeVisible({ timeout: 15000 })

  // Verify it's the settings modal
  const modalTitle = this.page.getByTestId('modal-title')
  await expect(modalTitle).toHaveText('Settings', { timeout: 10000 })
})

Then('the settings modal should be closed', async function (this: CustomWorld) {
  // Wait for the modal to disappear with proper state checking
  const modal = this.page.getByTestId('modal-content')

  // Use waitFor with hidden state for more reliable waiting
  await expect(modal).toBeHidden({ timeout: 15000 })

  // Additional verification - ensure modal is completely removed or hidden
  await this.page.waitForFunction(() => {
    const modalElement = document.querySelector('[data-testid="modal-content"]')
    return !modalElement || window.getComputedStyle(modalElement).display === 'none'
      || window.getComputedStyle(modalElement).opacity === '0'
  }, { timeout: 10000 })
})
