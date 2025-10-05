# Accessibility-First Selector Strategy

## Philosophy

Tests should interact with the application the same way users do. This means:
1. Prefer user-facing selectors over implementation details
2. Use semantic HTML and ARIA roles
3. Rely on accessible names and labels
4. Only use `data-testid` as a last resort

## Selector Priority (Playwright Recommended)

### 1. Role-Based Selectors (Highest Priority)
Use `getByRole()` for interactive elements:

```typescript
// ✅ Good - uses semantic role
page.getByRole('button', { name: 'Create Document' })
page.getByRole('dialog', { name: 'Settings' })
page.getByRole('switch', { name: 'Synchronized Scrolling' })
page.getByRole('textbox', { name: 'Search' })

// ❌ Bad - uses data-testid
page.locator('[data-testid="create-document-btn"]')
page.locator('[data-testid="settings-modal"]')
page.locator('[data-testid="sync-scroll-toggle"]')
```

**Common roles:**
- `button`, `link`, `checkbox`, `radio`, `switch`
- `dialog`, `alertdialog`, `menu`, `menuitem`
- `textbox`, `searchbox`, `combobox`
- `heading`, `article`, `navigation`, `complementary`
- `listbox`, `option`, `tab`, `tabpanel`

### 2. Label-Based Selectors
Use `getByLabel()` for form controls:

```typescript
// ✅ Good - uses label association
page.getByLabel('Font Size')
page.getByLabel('Enable Vim Mode')

// ❌ Bad - uses data-testid
page.locator('[data-testid="font-size-input"]')
```

### 3. Text-Based Selectors
Use `getByText()` for visible content:

```typescript
// ✅ Good - uses visible text
page.getByText('Welcome to MarkVim')
page.getByText('Document created successfully')

// ❌ Bad - uses CSS class or data-testid
page.locator('.welcome-message')
```

### 4. Placeholder-Based Selectors
Use `getByPlaceholder()` for inputs:

```typescript
// ✅ Good - uses placeholder
page.getByPlaceholder('Enter document title...')

// ❌ Bad - uses data-testid
page.locator('[data-testid="document-title-input"]')
```

### 5. Semantic HTML Selectors
Use semantic selectors when appropriate:

```typescript
// ✅ Good - semantic HTML
page.locator('nav')
page.locator('article')
page.locator('main')

// ❌ Bad - generic div with data-testid
page.locator('[data-testid="navigation"]')
```

### 6. Test IDs (Last Resort)
Only use `data-testid` when:
- No semantic role exists
- No accessible name/label available
- Element is purely decorative
- Testing complex component state

```typescript
// ✅ Acceptable - no better alternative
page.locator('[data-testid="editor-pane"]')
page.locator('[data-testid="preview-pane"]')
page.locator('[data-testid="color-palette-preview"]')

// ❌ Bad - role-based alternative exists
page.locator('[data-testid="delete-button"]')
// Should be: page.getByRole('button', { name: 'Delete' })
```

## Migration Plan

### Phase 1: High-Impact Elements (Priority)
Migrate buttons, modals, and form controls:
- All buttons → `getByRole('button', { name: '...' })`
- All modals → `getByRole('dialog', { name: '...' })`
- All toggles → `getByRole('switch', { name: '...' })`
- Form inputs → `getByLabel()` or `getByPlaceholder()`

### Phase 2: Navigation & Document Elements
- Sidebar → `getByRole('complementary', { name: 'Documents' })`
- Document list items → `getByRole('listitem')` or `getByRole('article')`
- Header → `getByRole('banner')`

### Phase 3: Editor & Preview Panes
These may retain `data-testid` due to complex CodeMirror internals:
- `.cm-content` for editor content (semantic selector)
- `.prose` for preview content (semantic selector)
- Keep `data-testid="editor-pane"` and `data-testid="preview-pane"`

### Phase 4: Feature Flags & Settings
- Feature toggles → `getByRole('switch', { name: 'Feature Name' })`
- Settings sections → `getByRole('group', { name: 'Section Name' })`

## Benefits

1. **Accessibility compliance**: Forces better ARIA attributes
2. **User-centric testing**: Tests mirror real user interactions
3. **Resilience**: Less brittle than implementation-specific selectors
4. **Self-documenting**: Clear what element is being tested
5. **Refactor-safe**: Component restructuring won't break tests

## Implementation Checklist

For each component/element:
- [ ] Ensure proper semantic HTML (`<button>`, `<nav>`, `<article>`)
- [ ] Add ARIA roles where needed (`role="dialog"`, `role="switch"`)
- [ ] Add accessible names (`aria-label`, `aria-labelledby`)
- [ ] Update page object to use role/label/text selectors
- [ ] Remove `data-testid` if no longer needed
- [ ] Verify tests pass

## Examples from MarkVim

### Current (data-testid heavy)
```typescript
readonly sidebarToggleBtn: Locator = page.locator('[data-testid="sidebar-toggle"]')
readonly settingsButton: Locator = page.locator('[data-testid="settings-button"]')
readonly shareButton: Locator = page.locator('[data-testid="share-button"]')
readonly createDocumentBtn: Locator = page.locator('[data-testid="create-document-btn"]')
```

### Improved (accessibility-first)
```typescript
readonly sidebarToggleBtn: Locator = page.getByRole('button', { name: 'Toggle Sidebar' })
readonly settingsButton: Locator = page.getByRole('button', { name: 'Settings' })
readonly shareButton: Locator = page.getByRole('button', { name: 'Share' })
readonly createDocumentBtn: Locator = page.getByRole('button', { name: 'Create Document' })
```

## References
- [Playwright Locators Guide](https://playwright.dev/docs/locators)
- [Testing Library Guiding Principles](https://testing-library.com/docs/queries/about/#priority)
- [ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
