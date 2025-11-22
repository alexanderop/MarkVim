---
description: Refactor a Vue component test to use the Page Object Pattern
argument-hint: [test-file-path]
---

# Page Object Pattern Refactoring

Refactor the test file located at @$1 to use the **Page Object Pattern**.

## Context
Analyze the component import in @$1 to understand the component being tested. You need to abstract all UI interactions into a helper function.

## Refactoring Rules

1.  **Create the Page Object Factory**:
    * Define an async function `create<ComponentName>Page()` at the **bottom** of the test file.
    * Move the `renderApp` or component rendering logic inside this function.
    * Return an object containing getters and action methods.

2.  **Encapsulate Elements**:
    * Create getters (e.g., `getSubmitButton`, `getSearchInput`).
    * Use semantic queries: `getByRole`, `getByLabelText`, `getByPlaceholderText`.
    * **Strict rule**: Do not expose `screen` or `userEvent` directly in the test body; they must be accessed via the page object.

3.  **Define Actions**:
    * Create semantic action methods (e.g., `searchFor(term)`, `submitForm()`).
    * Return promises for all actions.

4.  **Test Body Cleanup**:
    * Instantiate the page object at the start of each test: `const page = await createXyzPage();`.
    * Replace all `await user.type(...)` and `screen.getBy...` calls with methods from `page`.

## Target Code Style

Use this example as the ground truth for the desired output structure:

```typescript
// BEFORE:
// const searchInput = screen.getByPlaceholderText('Search...');
// await user.type(searchInput, 'test');

// AFTER:
// const page = await createMyComponentPage();
// await page.searchFor('test');

// Page Object Structure (at bottom of file):
async function createMyComponentPage() {
  await renderApp(MyComponent, {}, '/my-route');
  
  return {
    // Getters
    getSearchInput: () => screen.getByPlaceholderText('Search...'),
    getSubmitButton: () => screen.getByRole('button', { name: 'Submit' }),
    
    // Actions
    searchFor: async (term: string) => {
      await user.type(screen.getByPlaceholderText('Search...'), term);
      await user.click(screen.getByRole('button', { name: 'Submit' }));
    }
  };
}