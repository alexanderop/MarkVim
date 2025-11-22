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
}

export async function mountFullApp(): Promise<AppPageHelpers> {
  const user = userEvent.setup()
  const wrapper = await mountSuspended(App, { route: '/' })

  const helpers: AppPageHelpers = {
    wrapper,
    user,

    html: () => wrapper.html(),

    getDocumentCount: (): number => {
      const html = wrapper.html()
      // Look for the count in the badge: <span class="...rounded-full..."><span>N</span></span>
      const match = html.match(/rounded-full[^>]*>\s*<span[^>]*>(\d+)<\/span>/)
      return match && match[1] ? Number.parseInt(match[1], 10) : 0
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
  }

  return helpers
}
