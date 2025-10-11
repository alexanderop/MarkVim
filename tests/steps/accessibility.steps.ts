import type { MarkVimWorld } from '../support/world.js'
import AxeBuilder from '@axe-core/playwright'
import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { ensurePage } from '../support/utils.js'

Then('the page should have no accessibility violations', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  const accessibilityScanResults = await new AxeBuilder({ page })
    .exclude('nuxt-devtools-frame')
    .analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

Then('the page should meet WCAG {string} standards', async function (this: MarkVimWorld, level: string) {
  const page = await ensurePage(this)

  // Map WCAG level to axe-core tags (e.g., "2.1 AA" -> ["wcag21aa"])
  const normalizedLevel = level.toLowerCase().replace(/[.\s]/g, '')
  const tags = [`wcag${normalizedLevel}`]

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(tags)
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})

Then('the {string} should have no accessibility violations', async function (this: MarkVimWorld, elementSelector: string) {
  const page = await ensurePage(this)
  const accessibilityScanResults = await new AxeBuilder({ page })
    .include(elementSelector)
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})

Then('the page should have no critical accessibility violations', async function (this: MarkVimWorld) {
  const page = await ensurePage(this)
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

  // Filter only critical and serious violations
  const criticalViolations = accessibilityScanResults.violations.filter(
    violation => violation.impact === 'critical' || violation.impact === 'serious',
  )

  expect(criticalViolations).toEqual([])
})
