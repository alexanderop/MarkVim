# MarkVim Testing Strategy ✅

## Overview

MarkVim uses a comprehensive End-to-End (E2E) testing strategy built on modern testing tools with **reusable, maintainable test patterns**. The strategy follows current industry best practices for Cucumber and Playwright integration.

## Testing Stack

### Core Testing Tools
- **Cucumber.js** - Behavior-Driven Development (BDD) framework for writing human-readable test scenarios
- **Playwright** - Browser automation for cross-browser testing and UI interactions  
- **TypeScript** - Type-safe test definitions and step implementations

### Refactored Architecture ✨

```
tests/
├── features/                    # Gherkin feature files (.feature)
│   ├── markvim-ui.feature      # Core UI functionality tests
│   └── markvim-navigation.feature # Navigation and view mode tests
├── steps/                       # TypeScript step definitions (REFACTORED)
│   ├── common.steps.ts         # 🆕 Reusable generic steps
│   ├── markvim-ui.steps.ts     # 🆕 MarkVim-specific UI steps
│   └── markvim.steps.ts        # Legacy compatibility
├── page-objects/               # 🆕 Page Object Model
│   └── markvim-page.ts         # MarkVim UI interactions
├── support/                    # 🆕 Test infrastructure
│   └── world.ts                # Browser/page lifecycle management
├── helpers/                    # 🆕 Utility functions
│   └── test-utils.ts           # Common test operations
└── tsconfig.json               # TypeScript configuration for tests
```

## ✅ Current Test Status

**All tests passing**: 13 scenarios, 91 steps ✅

**Test Coverage**:
- ✅ Core UI components visibility
- ✅ Command palette functionality  
- ✅ View mode switching (Editor/Split/Preview)
- ✅ Keyboard navigation
- ✅ Document management UI
- ✅ Sidebar functionality
- ✅ Note deletion with confirmation modal
- ✅ Document creation and vim-based text editing
- ✅ Markdown preview rendering and synchronization
- ✅ Keyboard shortcuts for view mode switching (1/2/3 keys)
- ✅ Sidebar toggle keyboard shortcut (Cmd+Shift+\)
- ✅ View mode localStorage persistence across page reloads

## 🔄 Refactoring Improvements

### 1. **Reusable Step Definitions**

**Common Steps** (`common.steps.ts`) - Generic interactions:
```gherkin
Given I navigate to the application
When I press the key "Cmd+K"  
When I click on element with testid "button"
Then element with testid "modal" should be visible
```

**Domain-Specific Steps** (`markvim-ui.steps.ts`) - MarkVim business logic:
```gherkin
Given I open the MarkVim homepage
When I switch to editor view
Then both editor and preview panes should be visible
```

### 2. **Page Object Model** 

Centralized UI element management:
```typescript
class MarkVimPage {
  readonly commandPalette: Locator
  readonly editorPane: Locator  
  readonly previewPane: Locator
  
  async switchToSplitView(): Promise<void>
  async verifyCommandPaletteVisible(): Promise<void>
}
```

### 3. **Improved World Management**

Reliable browser/page lifecycle with proper cleanup:
```typescript
export interface MarkVimWorld extends World {
  browser?: Browser
  page?: Page
  init(): Promise<void>
  cleanup(): Promise<void>
}
```

## Writing Tests

### Feature Files (Gherkin)
Tests are organized by functionality with reusable steps:

```gherkin
Feature: MarkVim Navigation and View Modes

  Background:
    Given I am on the MarkVim homepage

  Scenario: Switch between view modes
    When I switch to editor view
    Then the editor pane should be visible
    And the preview pane should not be visible
```

### Step Definitions Architecture

**Separation by Domain**:
- **Common steps**: Generic UI interactions (clicking, typing, navigation)
- **MarkVim steps**: Business logic specific to markdown editor
- **Page objects**: Complex UI interaction patterns

**Example Implementation**:
```typescript
// Domain-specific step
Given('I am on the MarkVim homepage', async function (this: MarkVimWorld) {
  const markVimPage = await getMarkVimPage(this)
  await markVimPage.navigate()
})

// Reusable common step  
When('I press the key {string}', async function (this: MarkVimWorld, key: string) {
When('I click on element with testid {string}', async function (this: MarkVimWorld, testid: string) {
  await this.page?.locator(`[data-testid="${testid}"]`).click()
})
```

#### 2. Domain-Specific Steps (`markvim-ui.steps.ts`)
MarkVim-specific business logic using page objects:

```typescript
Given('I open the MarkVim homepage', async function (this: MarkVimWorld) {
  const markVimPage = getMarkVimPage(this)
  await markVimPage.navigate()
})

When('I switch to editor view', async function (this: MarkVimWorld) {
  const markVimPage = getMarkVimPage(this)
  await markVimPage.viewModeEditor.click()
})
```

#### 3. Page Object Model (`markvim-page.ts`)
Encapsulates UI interactions and element selectors:

```typescript
export class MarkVimPage {
  readonly page: Page
  readonly editorPane: Locator
  readonly previewPane: Locator

  constructor(page: Page) {
    this.page = page
    this.editorPane = page.locator('[data-testid="editor-pane"]')
    this.previewPane = page.locator('[data-testid="preview-pane"]')
  }

  async navigate(url: string = 'http://localhost:3000'): Promise<void> {
    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')
  }

  // localStorage testing methods
  async verifyViewModeInLocalStorage(expectedMode: string): Promise<void>
  async verifyCurrentViewMode(expectedMode: string): Promise<void>
  async reloadPage(): Promise<void>
}
```

#### 4. Custom World Context (`world.ts`)
Centralized browser and page management:

```typescript
export interface MarkVimWorld extends World {
  browser?: Browser
  page?: Page
  init(): Promise<void>
  cleanup(): Promise<void>
}

Before(async function (this: MarkVimWorld) {
  await this.init()
})

After(async function (this: MarkVimWorld) {
  await this.cleanup()
})
```

## Test Data Strategy

### Test Identifiers
- Use `data-testid` attributes for reliable element selection
- Follow naming convention: `feature-component-action` (e.g., `command-palette-search`)
- Avoid coupling tests to CSS classes or DOM structure
- **Active state indicators**: Use specific testids like `view-mode-{mode}-active` for state-dependent elements
- **Toolbar buttons**: Each button has both base testid (`view-mode-editor`) and active state testid (`view-mode-editor-active`)

### Environment Variables
- `HEADED=true` - Controls browser visibility
- `NODE_OPTIONS` - Configures TypeScript loader for ES modules

## Best Practices Implementation

### Test Architecture Principles

#### 1. Separation of Concerns
- **Common steps** for generic UI interactions that work across features
- **Domain-specific steps** for MarkVim business logic
- **Page objects** for UI element management and complex interactions
- **Utility helpers** for shared testing operations

#### 2. Reusability and DRY Principle
- Avoid duplicate step definitions using parameterized steps
- Create helper methods for complex operations
- Use page objects to encapsulate UI interactions
- Organize steps by domain to prevent naming conflicts

#### 3. Step Definition Organization
```
common.steps.ts          → "I navigate to {string}"
markvim-ui.steps.ts      → "I open the MarkVim homepage"
responsive.steps.ts      → "I set viewport to {string}"
```

### Test Isolation
- Each test scenario starts with a fresh browser page via custom World
- Tests clean up after themselves using centralized `After` hooks
- No shared state between test scenarios
- Browser lifecycle managed in `world.ts`

### Wait Strategies
- Use `waitForLoadState('networkidle')` for initial page loads
- Use `expect().toBeVisible()` for element appearance
- Use `waitFor({ state: 'visible' })` for specific element states
- Prefer semantic waiting over arbitrary timeouts
- Implement stable element waiting for dynamic content

### Error Handling
- Tests fail fast with descriptive error messages
- Browser automatically closes on test completion or failure
- Screenshots can be captured using utility helpers
- Custom error messages for better debugging

### Step Definition Best Practices

#### Use Parameterized Steps
```typescript
// ✅ Good - Reusable
When('I click on element with testid {string}', async function (testid: string) {
  await this.page?.locator(`[data-testid="${testid}"]`).click()
})

// ❌ Bad - Specific and non-reusable
When('I click on the editor pane', async function () {
  await this.page?.locator('[data-testid="editor-pane"]').click()
})
```

#### Organize by Domain
```typescript
// common.steps.ts - Generic UI interactions
Given('I navigate to {string}', ...)
When('I press the key {string}', ...)

// markvim-ui.steps.ts - MarkVim-specific actions
When('I switch to editor view', ...)
When('I open the command palette', ...)
```

#### Use Page Objects for Complex Interactions
```typescript
// In step definition
When('I validate the UI is loaded', async function () {
  const markVimPage = getMarkVimPage(this)
  await markVimPage.validateElementsVisible(['editor-pane', 'preview-pane'])
})

// In page object
async validateElementsVisible(testids: string[]): Promise<void> {
  const results = await Promise.all(
    testids.map(testid => this.isElementVisible(testid))
  )
  // ... validation logic
}
```

## Development Workflow

### Adding New Tests (Refactored Approach)
1. **Identify the domain** - Determine if it's UI, navigation, responsive, etc.
2. **Write feature file** in appropriate `tests/features/` file or create new one
3. **Use existing reusable steps** from `common.steps.ts` when possible
4. **Add domain-specific steps** to appropriate `*steps.ts` file
5. **Update page objects** if new UI elements are involved
6. **Add necessary `data-testid` attributes** to components
7. **Verify tests pass** in both headless and headed modes

### Step Definition Strategy
```typescript
// 1. Check if common steps can be used
Given('I navigate to the application')  // ✅ Use existing

// 2. Create domain-specific steps for business logic
When('I switch to editor view')          // ✅ MarkVim-specific

// 3. Avoid duplicating existing functionality
When('I click on editor button')         // ❌ Use common step instead
```

### localStorage Testing Strategy
The test suite includes comprehensive localStorage persistence testing:

```gherkin
Scenario: View mode preference persists across page reloads
  Given I am on the MarkVim homepage
  When I switch to editor view
  Then the view mode should be stored in localStorage as "editor"
  
  When I reload the page
  Then the view mode should be "editor"
```

**Implementation Details**:
- **localStorage Verification**: Tests verify that `markvim-view-mode` key is correctly set
- **Page Reload Testing**: Uses `page.reload()` to simulate browser refresh
- **State Persistence**: Validates that UI state matches localStorage after reload
- **Cross-Session Testing**: Ensures view mode preferences survive browser navigation
- **Active State Detection**: Uses `view-mode-{mode}-active` testids for reliable active state verification

### Debugging Failed Tests
1. **Run in headed mode**: `pnpm run test:e2e:headed`
2. **Use page object methods** for better error messages
3. **Add strategic debugging** with `await this.page.pause()`
4. **Use utility helpers** for screenshots and element highlighting
5. **Check browser DevTools** for element inspection
6. **Monitor network tab** for failed requests

### Test Maintenance Strategy

#### Refactoring Guidelines
- **Extract common patterns** into `common.steps.ts`
- **Group related steps** by domain in separate files
- **Update page objects** when UI structure changes
- **Keep feature files** focused on user behavior
- **Use Background sections** for common setup

#### Code Organization
```
tests/
├── features/           # Group by feature area
├── steps/
│   ├── common.steps.ts      # ← Generic, reusable steps
│   ├── domain.steps.ts      # ← Feature-specific steps
├── page-objects/       # ← UI interaction layer
├── helpers/           # ← Utility functions
└── support/           # ← Infrastructure
```

## Migration from Legacy Implementation

### Before (Original)
```typescript
// Everything in markvim.steps.ts
Given('I open the MarkVim homepage', async function () {
  if (!this.browser) {
    await this.init()
  }
  this.page = await this.browser.newPage()
  await this.page.goto('http://localhost:3000')
})
```

### After (Refactored)
```typescript
// world.ts - Centralized browser management
Before(async function (this: MarkVimWorld) {
  await this.init()
})

// markvim-ui.steps.ts - Domain-specific with page objects
Given('I open the MarkVim homepage', async function (this: MarkVimWorld) {
  const markVimPage = getMarkVimPage(this)
  await markVimPage.navigate()
})

// markvim-page.ts - Page object encapsulation
async navigate(url: string = 'http://localhost:3000'): Promise<void> {
  await this.page.goto(url)
  await this.page.waitForLoadState('networkidle')
}
```

## Integration with Development

### Pre-commit Testing
Run tests organized by priority using tags:
```bash
# Quick smoke tests
pnpm run test:e2e -- --tags "@smoke"

# Full test suite
pnpm run test:e2e
```

### Continuous Integration
Enhanced CI configuration with parallel execution:
```javascript
// cucumber.cjs
module.exports = {
  default: {
    parallel: 2,  // Run tests in parallel
    format: [
      'progress',
      'json:reports/cucumber_report.json',
      'html:reports/cucumber_report.html'
    ]
  }
}
```

### Local Development
- Use **headed mode** during development for visual debugging
- Leverage **page objects** for faster test creation
- Utilize **common steps** to avoid reinventing functionality
- Take advantage of **utility helpers** for complex operations

## Benefits of Refactored Architecture

### Maintainability
- **Reduced duplication** through reusable steps
- **Clear separation** of concerns by domain
- **Easier updates** when UI changes (page objects)
- **Better organization** with logical file structure

### Scalability
- **Easy to add** new features without step conflicts
- **Parameterized steps** handle multiple scenarios
- **Domain organization** prevents naming collisions
- **Utility helpers** support complex test operations

### Developer Experience
- **Faster test writing** with reusable components
- **Better debugging** with improved error messages
- **Type safety** with TypeScript throughout
- **Clear patterns** for new team members

This refactored testing strategy ensures MarkVim maintains high quality while supporting rapid development, confident refactoring, and seamless team collaboration. 