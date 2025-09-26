---
description: "Instructions for E2E testing with Playwright and Cucumber - BDD scenarios, page objects, and test automation"
applyTo: "tests/**/*"
---

# Testing Instructions

## Testing Strategy
MarkVim uses Behavior-Driven Development (BDD) with Cucumber and Playwright for comprehensive end-to-end testing.

## Test Architecture
- **Cucumber/Gherkin** - Feature files with human-readable scenarios
- **Playwright** - Browser automation and testing framework
- **Page Objects** - Maintainable test abstractions
- **TypeScript** - Type-safe test implementation

## Directory Structure
```
tests/
├── features/           # Gherkin feature files (.feature)
├── steps/             # Step definitions (TypeScript)
├── page-objects/      # Page object models
├── support/           # Test configuration and setup
└── helpers/           # Utility functions for tests
```

## Development Guidelines

### Writing Feature Files
```gherkin
Feature: Feature Name
  As a [user type]
  I want to [goal]
  So that [benefit]

  Background:
    Given I navigate to the App
    When the page is loaded

  Scenario: Descriptive scenario name
    Given [initial state]
    When [action performed]
    Then [expected outcome]
    And [additional verification]
```

### Page Object Pattern
```typescript
export class MarkVimPage {
  readonly page: Page
  readonly documentList: Locator
  readonly editorContent: Locator
  readonly previewPane: Locator

  constructor(page: Page) {
    this.page = page
    this.documentList = page.locator('[data-testid="document-list"]')
    this.editorContent = page.locator('.cm-content')
    this.previewPane = page.locator('[data-testid="preview-pane"]')
  }

  async createDocument() {
    await this.createDocumentBtn.click()
    await expect(this.documentItems).toHaveCount(2)
  }
}
```

### Step Definitions
```typescript
import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

Given('the sidebar is visible', async function () {
  await expect(this.markVimPage.documentList).toBeVisible()
})

When('I create a new document', async function () {
  await this.markVimPage.createDocument()
})

Then('a new document should be created', async function () {
  await expect(this.markVimPage.documentItems).toHaveCount(2)
})
```

## Testing Patterns

### Data-TestId Strategy
```typescript
// Components include data-testid for reliable selection
<div data-testid="document-list">
<button data-testid="create-document-btn">
<div data-testid="document-item-${document.id}">

// Page objects use these for element location
readonly documentList: Locator = page.locator('[data-testid="document-list"]')
readonly createDocumentBtn: Locator = page.locator('[data-testid="create-document-btn"]')
```

### Keyboard Shortcuts Testing
```typescript
// Test keyboard interactions
async pressKeyboardShortcut(keys: string) {
  const parts = keys.split('+')
  const modifiers = parts.slice(0, -1)
  const key = parts[parts.length - 1]
  
  await this.page.keyboard.press(`${modifiers.join('+')}+${key}`)
}

// Usage in step definitions
When('I press the "g+t" keyboard shortcut', async function () {
  await this.markVimPage.pressKeyboardShortcut('g+t')
})
```

### Async Operations Testing
```typescript
// Wait for dynamic content
async waitForDocumentLoad() {
  await expect(this.documentList).toBeVisible()
  await expect(this.documentItems).toHaveCount(1, { timeout: 5000 })
}

// Test loading states
async expectLoadingState() {
  await expect(this.loadingIndicator).toBeVisible()
  await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 })
}
```

## Common Test Scenarios

### Document Management
```gherkin
Scenario: Create and edit document
  Given the sidebar is visible
  When I create a new document
  And I type "# New Document" in the editor
  Then the document should show "New Document" in the preview
  And the document list should show "New Document"
```

### Theme Testing
```gherkin
Scenario: Theme customization
  Given I open the color theme modal
  When I change the accent color
  And I accept the color change
  Then the theme should be updated
  And the changes should persist after reload
```

### Responsive Testing
```typescript
// Test mobile viewport
test.describe('Mobile Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('should hide sidebar on mobile', async ({ page }) => {
    const markVimPage = new MarkVimPage(page)
    await expect(markVimPage.documentList).not.toBeVisible()
  })
})
```

## Common Tasks

### Adding New Test Scenarios
1. Write Gherkin scenario in appropriate feature file
2. Implement step definitions in TypeScript
3. Update page objects with new locators
4. Add data-testid attributes to components
5. Run tests to verify implementation

### Testing New Features
```typescript
// Add new page object methods
async shareDocument() {
  await this.shareButton.click()
  await expect(this.shareDialog).toBeVisible()
  await this.copyShareLinkBtn.click()
}

// Create step definitions
When('I share the document', async function () {
  await this.markVimPage.shareDocument()
})

Then('the share link should be copied', async function () {
  // Verify clipboard or show success message
  await expect(this.markVimPage.shareSuccessMessage).toBeVisible()
})
```

### Accessibility Testing
```typescript
// Test keyboard navigation
async testKeyboardNavigation() {
  await this.page.keyboard.press('Tab')
  await expect(this.firstFocusableElement).toBeFocused()
  
  await this.page.keyboard.press('Tab')
  await expect(this.secondFocusableElement).toBeFocused()
}

// Test ARIA attributes
async verifyAccessibility() {
  const modal = this.page.locator('[role="dialog"]')
  await expect(modal).toHaveAttribute('aria-labelledby')
  await expect(modal).toHaveAttribute('aria-describedby')
}
```

## Test Commands

### Running Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with browser visible
pnpm test:e2e:headed

# Run specific feature
pnpm test:e2e --grep "Documents Management"

# Run with automatic server start
pnpm test:e2e:with-server
```

### Development Workflow
1. Start development server: `pnpm dev`
2. Write/modify feature files
3. Implement step definitions
4. Run tests: `pnpm test:e2e`
5. Debug with headed mode if needed

## CI/CD Integration

### GitHub Actions
- Tests run on every push/PR
- Builds production app first
- Starts preview server
- Executes full test suite
- Uploads artifacts on failure

### Test Reports
- Cucumber HTML reports generated
- Screenshots captured on failures
- Video recordings for debugging
- Test results in CI summaries

## Best Practices

### Test Organization
- Group related scenarios in feature files
- Use descriptive scenario names
- Keep step definitions reusable
- Maintain clear page object APIs

### Reliability
- Use data-testid for stable selectors
- Wait for elements to be visible/stable
- Handle async operations properly
- Avoid hard-coded timeouts when possible

### Maintenance
- Update page objects when UI changes
- Keep feature files synchronized with implementation
- Regular test runs to catch regressions
- Document complex test scenarios

### Performance
- Run tests in parallel when possible
- Use efficient selectors
- Minimize test data setup time
- Clean up test state between scenarios