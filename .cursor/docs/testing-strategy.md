# MarkVim Testing Strategy

## Overview

MarkVim uses a comprehensive End-to-End (E2E) testing strategy built on modern testing tools that ensure the markdown editor functionality works correctly across different scenarios.

## Testing Stack

### Core Testing Tools
- **Cucumber.js** - Behavior-Driven Development (BDD) framework for writing human-readable test scenarios
- **Playwright** - Browser automation for cross-browser testing and UI interactions
- **TypeScript** - Type-safe test definitions and step implementations

### Test Structure

```
tests/
├── features/           # Gherkin feature files (.feature)
├── steps/             # TypeScript step definitions
│   ├── world.ts       # Test world configuration and browser setup
│   └── markvim.steps.ts  # Step implementations
├── tsconfig.json      # TypeScript configuration for tests
└── README.md          # Test-specific documentation
```

## Test Execution Modes

### Headless Mode (Default)
```bash
pnpm run test:e2e
```
- Runs tests without visible browser window
- Faster execution
- Ideal for CI/CD pipelines
- Default behavior for automated testing

### Headed Mode (Debug)
```bash
pnpm run test:e2e:headed
```
- Runs tests with visible browser window
- Slower but allows visual debugging
- Perfect for test development and troubleshooting
- Uses `HEADED=true` environment variable

### CI Mode
```bash
pnpm run test:e2e:ci
```
- Waits for localhost:3000 to be available
- Runs headless tests after server startup
- Designed for continuous integration environments

## Browser Configuration

The test environment uses Chromium with optimized settings:

```typescript
{
  headless: !isHeaded,           // Controlled by HEADED env var
  args: [
    '--no-sandbox',              // Required for CI environments
    '--disable-dev-shm-usage'    // Prevents memory issues in containers
  ]
}
```

## Writing Tests

### Feature Files (Gherkin)
Tests are written in natural language using Gherkin syntax:

```gherkin
Feature: MarkVim Core Functionality
  Scenario: User opens the application
    Given I open the MarkVim homepage
    Then the following elements are visible
      | testid |
      | editor-pane |
      | preview-pane |
```

### Step Definitions
TypeScript implementations that connect Gherkin steps to browser actions:

```typescript
Given('I open the MarkVim homepage', async function () {
  if (!this.browser) {
    await this.init()
  }
  this.page = await this.browser.newPage()
  await this.page.goto('http://localhost:3000')
  await this.page.waitForLoadState('networkidle')
})
```

## Test Data Strategy

### Test Identifiers
- Use `data-testid` attributes for reliable element selection
- Follow naming convention: `feature-component-action` (e.g., `command-palette-search`)
- Avoid coupling tests to CSS classes or DOM structure

### Environment Variables
- `HEADED=true` - Controls browser visibility
- `NODE_OPTIONS` - Configures TypeScript loader for ES modules

## Best Practices

### Test Isolation
- Each test scenario starts with a fresh browser page
- Tests clean up after themselves using `After` hooks
- No shared state between test scenarios

### Wait Strategies
- Use `waitForLoadState('networkidle')` for initial page loads
- Use `expect().toBeVisible()` for element appearance
- Prefer semantic waiting over arbitrary timeouts

### Error Handling
- Tests fail fast with descriptive error messages
- Browser automatically closes on test completion or failure
- Screenshots can be captured in `After` hooks for debugging

## Development Workflow

### Adding New Tests
1. Write feature file in `tests/features/`
2. Run tests to see undefined steps
3. Implement step definitions in `tests/steps/markvim.steps.ts`
4. Add necessary `data-testid` attributes to components
5. Verify tests pass in both headless and headed modes

### Debugging Failed Tests
1. Run in headed mode: `pnpm run test:e2e:headed`
2. Add strategic `await this.page.pause()` calls
3. Use browser DevTools for element inspection
4. Check network tab for failed requests

### Test Maintenance
- Keep feature files focused on user behavior, not implementation
- Update step definitions when UI changes
- Regularly review and refactor common patterns
- Maintain test data and selectors

## Integration with Development

### Pre-commit Testing
Tests should be run before committing changes to ensure functionality remains intact.

### Continuous Integration
The `test:e2e:ci` command is designed for automated environments where the application needs to be started before testing.

### Local Development
Use headed mode during development to see exactly what the tests are doing and debug issues quickly.

This testing strategy ensures MarkVim maintains high quality while supporting rapid development and confident refactoring. 