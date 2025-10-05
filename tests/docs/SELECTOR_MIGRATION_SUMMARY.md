# Test Selector Migration Summary

## Changes Made

### 1. Added Accessibility Labels to Components

**LayoutHeader.vue:**
- Sidebar toggle: `aria-label="Hide sidebar" / "Show sidebar"`
- View mode buttons: `aria-label="Switch to Editor view"` etc.
- Delete button: `aria-label="Delete document"`
- Color theme button: `aria-label="Open color theme settings"`

**DocumentList.client.vue:**
- Create document button: `aria-label="Create new document"`

**ShareButton.vue:**
- Share button: `aria-label="Share document"` (dynamic based on state)

**SettingsModal.vue:**
- Settings button: `aria-label="Open settings"`

### 2. Updated Page Object (markvim-page.ts)

**Migrated to accessibility-first selectors:**
- ✅ View mode buttons: `getByRole('button', { name: /Switch to .* view/i })`
- ✅ Document sidebar: `getByRole('complementary', { name: 'Documents' })`
- ✅ Create document button: `getByRole('button', { name: /Create new document/i })`
- ✅ Sidebar toggle: `getByRole('button', { name: /(Hide|Show) sidebar/i })`
- ✅ Settings button: `getByRole('button', { name: /Open settings/i })`
- ✅ Share button: `getByRole('button', { name: /Share document/i })`
- ✅ Delete button: `getByRole('button', { name: /Delete document/i })`
- ✅ Color theme button: `getByRole('button', { name: /Open color theme settings/i })`

**Kept data-testid for:**
- Structural elements: `editor-pane`, `preview-pane`, `header-toolbar`, `status-bar`
- Complex UI: Color palette components, OKLCH inputs
- Feature toggles: Used as fallback alongside role-based selectors

### 3. Documentation

**Created:**
- `tests/docs/ACCESSIBILITY_SELECTOR_STRATEGY.md` - Complete migration guide
- `tests/docs/SELECTOR_MIGRATION_SUMMARY.md` - This summary

**Updated:**
- `CLAUDE.md` - Added test selector priority section

## Benefits

1. **Accessibility compliance**: Forces proper ARIA attributes on components
2. **User-centric testing**: Tests use the same selectors users rely on
3. **Refactor resilience**: Implementation changes don't break tests
4. **Self-documenting**: Clear intent (e.g., "Create new document" vs "create-document-btn")
5. **Playwright best practices**: Follows official recommendations

## Migration Statistics

- **Total selectors reviewed**: 50+
- **Migrated to role-based**: 8 primary buttons
- **Kept data-testid**: ~40 (structural/complex UI)
- **Components updated**: 5

## Next Steps

### Phase 1 (Complete) ✓
- High-impact interactive elements (buttons, modals)
- Document sidebar navigation
- Added comprehensive documentation

### Phase 2 (Future)
- Document list items → `getByRole('article')` or semantic selectors
- Form controls → `getByLabel()` where applicable
- Remove remaining unnecessary `data-testid` attributes

### Phase 3 (Future)
- Feature flag toggles (already use `getByRole('switch')` in methods)
- Color theme picker elements
- Settings form controls

## Testing

- ✅ TypeScript compilation passes
- ✅ ESLint passes (no new errors)
- ⏳ E2E tests (requires running dev server - not executed in this session)

## How to Use

When writing new tests:
1. Check `tests/docs/ACCESSIBILITY_SELECTOR_STRATEGY.md` for selector priority
2. Prefer `getByRole()`, `getByLabel()`, `getByText()` over `data-testid`
3. Only use `data-testid` for complex structural elements
4. Add `aria-label` to components that need accessible names

## References

- [Playwright Locators](https://playwright.dev/docs/locators)
- [Testing Library Query Priority](https://testing-library.com/docs/queries/about/#priority)
- [ARIA Roles Reference](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
