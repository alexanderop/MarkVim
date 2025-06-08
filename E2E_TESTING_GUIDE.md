# MarkVim E2E Testing Guide

This guide covers the comprehensive end-to-end (E2E) testing setup implemented for the MarkVim application using Cucumber and Playwright.

## Overview

Your MarkVim application now has a complete E2E testing framework that covers the most important user journeys:

1. **Document Management**: Creating, selecting, and deleting notes
2. **Markdown Editing**: Writing markdown in the CodeMirror editor
3. **Live Preview**: Seeing the rendered HTML update in real-time
4. **View Modes**: Switching between editor-only, preview-only, and split views

## Setup Complete

The following components have been installed and configured:

### Dependencies Added
- `@playwright/test` - Browser automation framework
- `@cucumber/cucumber` - BDD testing framework
- `ts-node` - TypeScript execution for Node.js

### Files Created

```
features/
├── support/
│   ├── world.ts          # Playwright browser management
│   └── hooks.ts          # Setup/teardown for each test
├── step_definitions/
│   ├── document_management.steps.ts  # Document CRUD operations
│   └── editing.steps.ts              # Editor and preview testing
├── document_management.feature       # Document management scenarios
└── editing.feature                   # Editing and preview scenarios
cucumber.js                           # Cucumber configuration
```

### Package.json Updated
- Added `test:e2e` script to run the tests

## Running the Tests

### Prerequisites
1. Make sure your Nuxt development server is running:
   ```bash
   pnpm dev
   ```

2. In a separate terminal, run the E2E tests:
   ```bash
   pnpm test:e2e
   ```

### Test Output
- Terminal output shows test progress and results
- `cucumber-report.html` file is generated with detailed test report

## Test Features Explained

### Document Management (`features/document_management.feature`)

**Scenario 1: Creating a new document**
- Tests clicking the "New note" button
- Verifies the document title updates in the header
- Checks that the editor content contains the new note template

**Scenario 2: Deleting a document**
- Tests the delete confirmation workflow
- Verifies the modal appears with correct content
- Confirms the document is removed from the list

### Editing & Preview (`features/editing.feature`)

**Background Setup**
- Ensures the application is loaded
- Sets the view mode to "split" for testing both editor and preview

**Scenario: Editor content updates the preview**
- Tests clearing the editor content
- Verifies that typing markdown updates the preview in real-time
- Checks that different markdown elements (headings, bold text) render correctly

## Key Implementation Details

### Browser Management (`features/support/world.ts`)
- Uses Chromium in headless mode for fast execution
- Creates fresh browser context for each test scenario
- Manages page navigation to `http://localhost:3000`

### Test Isolation (`features/support/hooks.ts`)
- Clears localStorage before each test for clean state
- Opens and closes browser instances automatically
- Ensures tests don't interfere with each other

### Robust Selectors
The step definitions use multiple selector strategies:
- **Role-based selectors**: `getByRole('button', { name: 'New note' })`
- **CSS selectors**: `.cm-content` for CodeMirror editor
- **Text-based selectors**: For finding specific content
- **Aria selectors**: For accessibility-friendly testing

## Extending the Tests

### Adding New Feature Files
1. Create a new `.feature` file in the `features/` directory
2. Write scenarios in Gherkin syntax
3. Create corresponding step definitions in `features/step_definitions/`

### Example: Testing Settings Modal
```gherkin
Feature: Settings Configuration
  As a user
  I want to customize editor settings
  So I can work more efficiently

  Scenario: Toggle Vim mode
    Given I am on the MarkVim application
    When I open the settings modal
    And I toggle the "Vim mode" switch
    Then the status bar should show the Vim indicator
```

### Adding Test IDs for Better Reliability
Consider adding `data-testid` attributes to your Vue components:

```html
<!-- In HeaderToolbar.vue -->
<button
  data-testid="delete-document-button"
  @click="$emit('deleteDocument')"
>
  <Icon name="lucide:trash-2" />
</button>
```

Then use in tests:
```typescript
await this.page.getByTestId('delete-document-button').click();
```

## Best Practices Implemented

1. **Test Isolation**: Each test starts with a clean state
2. **Readable Scenarios**: Gherkin syntax makes tests understandable by non-technical team members
3. **Maintainable Selectors**: Uses semantic selectors that are less likely to break
4. **Cross-platform Support**: Handles different operating systems for keyboard shortcuts
5. **Async Handling**: Proper waiting for elements and actions

## Continuous Integration

To add E2E tests to your CI/CD pipeline, update `.github/workflows/deploy.yml`:

```yaml
- name: Run E2E Tests
  run: |
    pnpm dev &
    sleep 10  # Wait for dev server to start
    pnpm test:e2e
    pkill -f "nuxt dev"  # Stop dev server
```

## Troubleshooting

### Common Issues

1. **Dev server not running**: Ensure `pnpm dev` is running on port 3000
2. **Timing issues**: Add explicit waits if elements load slowly
3. **Selector changes**: Update selectors if UI components change

### Debug Mode
Run tests in headed mode for debugging:
```typescript
// In features/support/world.ts
this.browser = await chromium.launch({ headless: false });
```

## Performance Considerations

- Tests run sequentially to avoid resource conflicts
- Browser instances are reused within scenarios but fresh for each test
- Headless mode ensures faster execution in CI environments

## Next Steps

Consider adding tests for:
- **Command Palette**: Test keyboard shortcuts and command execution
- **Vim Mode**: Test Vim-specific key bindings and behaviors
- **File Operations**: Test save/load functionality if implemented
- **Responsive Design**: Test different viewport sizes
- **Error Handling**: Test error states and recovery

This E2E testing setup provides a solid foundation for ensuring your MarkVim application's critical features always work as expected, giving you confidence to refactor and add new features without introducing regressions.