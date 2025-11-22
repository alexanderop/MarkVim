/**
 * Full App Page Object for BDD Integration Tests
 *
 * This mounts the entire app.vue and provides helpers for interacting
 * with the UI as a real user would.
 *
 * Usage:
 * ```typescript
 * const wrapper = await mountFullApp()
 * await wrapper.clickCreateDocument()
 * expect(wrapper.getDocumentCount()).toBe(2)
 * ```
 */
import { mountSuspended } from '@nuxt/test-utils/runtime'
import userEvent from '@testing-library/user-event'
import App from '~/app.vue'

type MountSuspendedResult = Awaited<ReturnType<typeof mountSuspended>>

export interface AppPageHelpers {
  wrapper: MountSuspendedResult
  user: ReturnType<typeof userEvent.setup>
  html: () => string
  getDocumentCount: () => number
  hasElement: (testId: string) => boolean
  containsText: (text: string) => boolean
  clickCreateDocument: () => Promise<void>
  clickButton: (testId: string) => Promise<void>
  // Teleport helpers - for testing modals/dialogs that render outside the wrapper
  bodyHtml: () => string
  bodyContainsText: (text: string) => boolean
  bodyContainsTestId: (testId: string) => boolean
  queryBody: (selector: string) => Element | null
  clickInBody: (testId: string) => void
}

export async function mountFullApp(): Promise<AppPageHelpers> {
  const user = userEvent.setup()
  const wrapper = await mountSuspended(App, { route: '/' })

  const helpers: AppPageHelpers = {
    wrapper,
    user,

    html: () => wrapper.html(),

    getDocumentCount: (): number => {
      // Find the document sidebar by its accessible label and read the visible badge count
      const sidebar = wrapper.find('[aria-label="Documents"]')
      if (!sidebar.exists())
        return 0
      // The badge is visible text showing document count to users
      const badge = sidebar.find('.rounded-full span')
      if (!badge.exists())
        return 0
      const count = Number.parseInt(badge.text(), 10)
      return Number.isNaN(count) ? 0 : count
    },

    hasElement: (testId: string): boolean => {
      return wrapper.html().includes(`data-testid="${testId}"`)
    },

    containsText: (text: string): boolean => {
      return wrapper.html().includes(text)
    },

    clickCreateDocument: async (): Promise<void> => {
      const btn = wrapper.find('[data-testid="create-document-btn"]')
      await btn.trigger('click')
    },

    clickButton: async (testId: string): Promise<void> => {
      const btn = wrapper.find(`[data-testid="${testId}"]`)
      await btn.trigger('click')
    },

    // Teleport helpers - for testing modals/dialogs rendered via Vue Teleport
    // These query document.body directly since teleported content is outside the wrapper
    bodyHtml: (): string => document.body.innerHTML,

    bodyContainsText: (text: string): boolean => {
      return document.body.textContent?.includes(text) ?? false
    },

    bodyContainsTestId: (testId: string): boolean => {
      return document.body.querySelector(`[data-testid="${testId}"]`) !== null
    },

    queryBody: (selector: string): Element | null => {
      return document.body.querySelector(selector)
    },

    clickInBody: (testId: string): void => {
      const el = document.body.querySelector(`[data-testid="${testId}"]`)
      el?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    },
  }

  return helpers
}
