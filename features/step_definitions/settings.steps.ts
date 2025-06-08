import type { CustomWorld } from '../support/world.js'
import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

When('I press {string} then {string}', async function (this: CustomWorld, firstKey: string, secondKey: string) {
  // Handle sequential key presses for shortcuts like "g s"
  await this.page.keyboard.press(firstKey)
  await this.page.waitForTimeout(100) // Small delay between keys
  await this.page.keyboard.press(secondKey)
  
  // Wait a moment for the action to complete
  await this.page.waitForTimeout(500)
})

When('I click the {string} button in the toolbar', async function (this: CustomWorld, buttonText: string) {
  // Look for the settings button - it has title "Settings (g s)"
  const settingsButton = this.page.locator('button[title*="Settings"]')
  await expect(settingsButton).toBeVisible({ timeout: 5000 })
  await settingsButton.click()
  
  // Wait for the modal to appear
  await this.page.waitForTimeout(1000)
})

Then('the settings modal should be open', async function (this: CustomWorld) {
  // Look for the modal content with the settings title
  const modal = this.page.getByTestId('modal-content')
  await expect(modal).toBeVisible({ timeout: 5000 })
  
  // Check that it's specifically the settings modal
  const modalTitle = this.page.getByTestId('modal-title')
  await expect(modalTitle).toHaveText('Settings', { timeout: 5000 })
})

Then('I should see the title {string}', async function (this: CustomWorld, expectedTitle: string) {
  const modalTitle = this.page.getByTestId('modal-title')
  await expect(modalTitle).toBeVisible({ timeout: 5000 })
  await expect(modalTitle).toHaveText(expectedTitle)
})

Given('the settings modal is open', async function (this: CustomWorld) {
  // Open the settings modal using the keyboard shortcut
  await this.page.keyboard.press('g')
  await this.page.waitForTimeout(100)
  await this.page.keyboard.press('s')
  await this.page.waitForTimeout(1000)
  
  // Verify it's open
  const modal = this.page.getByTestId('modal-content')
  await expect(modal).toBeVisible({ timeout: 5000 })
})

Then('the settings modal should be closed', async function (this: CustomWorld) {
  // Wait for the modal to disappear
  const modal = this.page.getByTestId('modal-content')
  await expect(modal).not.toBeVisible({ timeout: 5000 })
}) 