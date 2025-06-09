# MarkVim E2E Tests

This directory contains end-to-end tests for MarkVim using Cucumber and Playwright.

## Setup

Tests are automatically configured when you install dependencies:

```bash
pnpm install
```

## Running Tests

1. Start the development server:
```bash
pnpm dev
```

2. In another terminal, run the tests:
```bash
pnpm run test:e2e
```

## Test Structure

- `features/` - Gherkin feature files describing test scenarios
- `steps/` - TypeScript step definitions implementing the test logic
- `world.ts` - Shared browser context for all tests

## CI/CD

Tests run automatically in GitHub Actions on pushes to main/develop branches. The workflow:
1. Builds the Nuxt app
2. Starts the preview server
3. Runs Cucumber tests with Playwright
4. Uploads test reports on failure

## Writing New Tests

1. Add scenarios to `.feature` files using Gherkin syntax
2. Implement step definitions in the `steps/` directory
3. Use Playwright's locators and expectations for assertions
