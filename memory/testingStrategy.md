This is the **Definitive MarkVim Testing Style Guide**. It provides concrete code examples, deep explanations, and the "Why" behind every decision.

This document is designed to be the single source of truth for onboarding new developers.

-----

# 📘 MarkVim Testing Strategy & Style Guide

## 1\. The Philosophy: "Fast Confidence"

We subscribe to the **Testing Trophy** philosophy (Kent C. Dodds).

  * **E2E Tests:** Few, slow, realistic. For critical user journeys (Login, Checkout).
  * **Integration Tests:** Many, fast, mocked I/O. For component logic, routing, and state. **(Our focus)**.
  * **Unit Tests:** Fast, isolated. For utilities, complex algorithms, and generic UI atoms.

**The Golden Rule:**

> "The more your tests resemble the way your software is used, the more confidence they give you."

-----

## 2\. Data Strategy: The Factory Pattern

**Problem:** Tests become brittle when we hardcode large JSON objects. If we add a required field to `User`, 50 tests break.
**Solution:** Centralized **Factories** using `fishery` and `@faker-js/faker`.

### 📄 Concrete Example

**File:** `tests/factories/documents.ts`

```typescript
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import type { Document } from '~/types/document'

export const documentFactory = Factory.define<Document>(({ sequence }) => ({
  id: `doc-${sequence}`,
  // Use faker for realistic, random data
  title: faker.system.fileName(),
  content: `# ${faker.lorem.sentence()}\n\n${faker.lorem.paragraphs(2)}`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isSynced: true,
}))
```

### 🔍 In Depth

  * **Defaults:** The factory defines valid defaults. You never worry about "missing fields."
  * **Overrides:** In tests, only specify what matters for *that specific test*.
    ```typescript
    // In a test:
    // We only care that this doc is unsynced. The content/id handles itself.
    const unsavedDoc = documentFactory.build({ isSynced: false })
    ```

-----

## 3\. Layer 1: Component Integration (Vitest)

This is where 70% of our testing effort goes. We test components **mounted** in a realistic environment (Nuxt context) but running in `jsdom` for speed.

**Pattern:** The Page Object Pattern (Local Factory).

### ❌ The Anti-Pattern (Don't do this)

```typescript
it('submits the form', async () => {
  render(Form)
  // ❌ Leaky details: implementation details (placeholder, class) inside the test
  await userEvent.type(screen.getByPlaceholderText('Email'), 'test@test.com')
  await userEvent.click(screen.getByClass('btn-primary'))
})
```

### ✅ The MarkVim Pattern

We encapsulate DOM interactions in a helper function at the bottom of the test file.

**File:** `tests/integration/pages/EditorPage.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EditorPage from '~/pages/editor.vue'
import { createTestRouter } from '../../utils/router' 
import { documentFactory } from '../../factories/documents'

describe('Feature: Editor Page', () => {
  it('updates the document title when typed', async () => {
    // 1. Arrange (Data)
    const doc = documentFactory.build({ title: 'Untitled' })
    
    // 2. Arrange (Mount via Page Object)
    const page = await createEditorPage({ initialDoc: doc })

    // 3. Act (User Language)
    await page.renameDocument('New Project')

    // 4. Assert (Business Logic)
    expect(page.getDocumentTitleInput()).toHaveValue('New Project')
  })
})

// ---------------------------------------------------------
// 🏗️ PAGE OBJECT FACTORY (The "How")
// ---------------------------------------------------------
async function createEditorPage(options: { initialDoc?: any } = {}) {
  const user = userEvent.setup()
  const router = createTestRouter() // Real router instance

  // Mock external API, but keep Store/Router real
  vi.mock('~/composables/useDocApi', () => ({
    useDocApi: () => ({ 
      fetch: () => Promise.resolve(options.initialDoc) 
    })
  }))

  await mountSuspended(EditorPage, {
    global: { plugins: [router] }
  })

  return {
    // Expose internals for assertions if strictly necessary
    router,
    
    // 🔍 Getters (Semantic Queries)
    getDocumentTitleInput: () => screen.getByLabelText(/document title/i),
    getSaveStatus: () => screen.getByTestId('save-status'),

    // ⚡ Actions (User Intentions)
    renameDocument: async (newTitle: string) => {
      const input = screen.getByLabelText(/document title/i)
      await user.clear(input)
      await user.type(input, newTitle)
    }
  }
}
```

### 🔍 In Depth

  * **Decoupling:** If we change the input from `<input>` to a custom `<EditableLabel>`, we only update `renameDocument` in the factory. The test itself (`await page.renameDocument(...)`) remains unchanged.
  * **Readability:** The `it` block reads like a user story.

-----

## 4\. Layer 2: End-to-End (Cucumber + Playwright)

We use **Cucumber** (Gherkin) to describe features and **Playwright** to automate the browser.

### A. Step Consolidation Strategy

To avoid having 50 step files (one per feature), we consolidate steps by their **Grammatical Role**. This forces code reuse.

  * `tests/steps/01-given.steps.ts`: Setup (Navigation, Auth, Data Seeding).
  * `tests/steps/02-when.steps.ts`: Interactions (Clicks, Typing, Dragging).
  * `tests/steps/03-then.steps.ts`: Assertions (Visibility, URL checks, Accessibility).

### B. The 3-Level Architecture

**Level 1: The Feature (English)**
`tests/features/sharing.feature`

```gherkin
Feature: Document Sharing
  Scenario: User copies share link
    Given I navigate to the App
    When I click the share button
    Then the share dialog should be visible
```

**Level 2: The Step Definition (Binding)**
`tests/steps/02-when.steps.ts`

```typescript
import { When } from '@cucumber/cucumber'
import { getMarkVimPage } from '../page-objects/markvim-page'

// 💡 Generic Step! Can be reused for "save button", "settings button", etc.
When('I click the {word} button', async function (this: MarkVimWorld, buttonName: string) {
  const page = getMarkVimPage(this)
  
  // Map the English word to the Page Object method
  const actionMap: Record<string, () => Promise<void>> = {
    'share': () => page.clickShareButton(),
    'save': () => page.clickSaveButton(),
    'settings': () => page.openSettings()
  }
  
  if (!actionMap[buttonName]) throw new Error(`Unknown button: ${buttonName}`)
  
  await actionMap[buttonName]()
})
```

**Level 3: The Playwright Page Object (Implementation)**
`tests/page-objects/markvim-page.ts`

```typescript
import { Page, expect } from '@playwright/test'

export class MarkVimPage {
  constructor(public page: Page) {}

  // Encapsulate the nasty selector details here
  async clickShareButton() {
    // Prefer role selectors for A11y
    await this.page.getByRole('button', { name: /share/i }).click()
  }
  
  async verifyShareDialogVisible() {
    await expect(this.page.getByTestId('share-modal')).toBeVisible()
  }
}
```

### 🔍 In Depth

  * **World Context:** `this` in the steps refers to the "World". It holds the shared `page` instance so steps can talk to the same browser tab.
  * **Accessibility:** We bake `axe-core` into our `Then` steps.
    ```typescript
    Then('the page should have no accessibility violations', async function (this: MarkVimWorld) {
       // Runs an actual audit on the current page state
       const results = await new AxeBuilder({ page: this.page! }).analyze()
       expect(results.violations).toEqual([])
    })
    ```

-----

## 5\. Best Practices & Rules

### 🟢 Selectors (In Order of Preference)

1.  **`getByRole`**: `getByRole('button', { name: 'Submit' })`. Ensures element is accessible and interactive.
2.  **`getByLabelText`**: `getByLabelText('Email')`. Ensures inputs are labeled correctly.
3.  **`getByText`**: `getByText('Success')`. Good for non-interactive content.
4.  **`getByTestId`**: `getByTestId('complex-grid')`. **Last resort.** Use only when visual layout makes semantic HTML impossible, or for container `divs`.

### 🔴 Anti-Patterns (Strictly Forbidden)

  * **Mocking the Router manually:** Never do `const router = { push: vi.fn() }`. This hides bugs where navigation guards fail. Use `createRouter` with `createWebHistory`.
  * **Sleeping:** Never use `await new Promise(r => setTimeout(r, 5000))`. Use `await expect(el).toBeVisible()`.
  * **Testing Implementation Details:** Don't test `vm.isModalOpen = true`. Test `expect(modal).toBeVisible()`.

### 🔄 The Workflow

1.  **New Feature?** Start with a `.feature` file (BDD).
2.  **Complex Logic?** Write Unit tests for the store/composables.
3.  **UI Flow?** Write an Integration test with a Page Object.
4.  **Ready?** Run `pnpm test:e2e` to verify it works in a real browser.