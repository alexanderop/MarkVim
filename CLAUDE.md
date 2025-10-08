# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo. Keep files small, predictable, and testable.

---

## Common Development Commands

### Development

```bash
pnpm install            # Install dependencies (first)
pnpm dev                # Start dev server at http://localhost:3000
pnpm build              # Build for production
pnpm preview            # Preview production build
pnpm kill:servers       # Kill all running node/localhost servers
```

### Testing & Quality

```bash
pnpm lint               # Lint
pnpm lint:fix           # Auto-fix lint issues
pnpm typecheck          # Type checking
pnpm knip               # Detect unused exports/files/deps
pnpm knip:exports       # Only unused exports (API boundaries)
pnpm test:e2e           # E2E (requires dev server)
pnpm test:e2e:headed    # E2E with visible browser
pnpm test:e2e:with-server  # E2E with auto server start
```

**Running Specific E2E Tests** (recommended when fixing issues - running all 39 scenarios takes 2-3 minutes):

```bash
# Run individual feature file (shortcuts available)
pnpm test:e2e:documents
pnpm test:e2e:smoke
pnpm test:e2e:sharing
pnpm test:e2e:accessibility
pnpm test:e2e:color
pnpm test:e2e:theme
pnpm test:e2e:editing
pnpm test:e2e:scroll-sync
pnpm test:e2e:document-persistence

# Run with dev server included
pnpm test:e2e:with-server tests/features/documents.feature

# Run single scenario by name pattern (optional filter, slower)
NODE_OPTIONS='--import tsx' pnpm exec cucumber-js tests/features/documents.feature --name "Create new document"
```

**Fail-Fast Configuration**: E2E tests are configured to stop on first failure (`failFast: true` in `cucumber.js`). This speeds up development by letting you fix one issue at a time instead of running the entire suite.

**Available feature files** (matches CI matrix for fast isolation):
- `pnpm test:e2e:smoke` - Basic smoke tests
- `pnpm test:e2e:documents` - Document management
- `pnpm test:e2e:editing` - Editor/preview functionality
- `pnpm test:e2e:color` - Color theme features
- `pnpm test:e2e:theme` - Theme system
- `pnpm test:e2e:sharing` - Share functionality
- `pnpm test:e2e:scroll-sync` - Scroll synchronization
- `pnpm test:e2e:document-persistence` - Persistence features
- `pnpm test:e2e:accessibility` - Accessibility compliance

### Git Hooks

Husky pre-commit runs `pnpm lint` on staged files.

### Code Quality Requirements

After any task, **must**:

1. `pnpm typecheck`  2) `pnpm lint`  3) fix errors  4) update CLAUDE.md if you add patterns/conventions.

### Unused Exports Detection

Use **Knip** (see `knip.json`). ESLint's import plugin misreads Vue `<script>` imports and yields false positives; Knip handles Vue SFCs correctly.

* Run before module-API refactors: `pnpm knip:exports`
* Clean up unused code: `pnpm knip`
* Use in CI to block unused exports

### Architecture Fitness Function

**Automated architectural governance** using **Dependency Cruiser** to enforce architectural boundaries and validate import rules.

```bash
# Validate all dependency rules (fitness function)
pnpm depcruise                    # Validate and show violations
pnpm depcruise:ci                 # CI format (used in GitHub Actions)

# Generate visualizations
pnpm depcruise:graph:modules      # Module dependency graph (DOT format)
pnpm depcruise:archi              # Architecture diagram
```

**Enforced rules** (configured in `.dependency-cruiser.cjs`):

1. **Module boundaries**: Modules can only import via `api.ts` facades
2. **No cross-module imports**: Direct implementation imports forbidden
3. **Shared code boundaries**: Only `~/shared/*`, `~/types/*` allowed
4. **No circular dependencies**: Prevents circular imports
5. **Layer architecture**: Components → composables → utils (one-way)

**CI Integration**: Runs automatically on all PRs via `.github/workflows/ci.yml` (Dependency Rules job)

**Optional Development Tools**:

Module Independence Analyzer provides additional insights during development (not used in CI):

```bash
pnpm analyze:modules              # Text report with recommendations
pnpm analyze:modules:json         # JSON output
pnpm analyze:modules:mermaid      # Mermaid diagram
```

### Boundary Enforcement (Three Layers)

**MarkVim enforces module boundaries using a three-layer defense:**

**1. TypeScript Path Aliases (Type Fences)**
- Module facades mapped to ergonomic shortcuts: `@modules/documents`, `@modules/editor`, etc.
- All aliases resolve directly to `api.ts` (e.g., `@modules/documents` → `src/modules/documents/api`)
- Internal imports require verbose/obvious escapes (`~/modules/documents/store`)
- IDE autocomplete guides developers to public APIs first

**2. ESLint Rules (Developer Feedback)**
- `no-restricted-imports`: Blocks deep imports to module internals (both absolute and `@modules` paths)
- `import/no-internal-modules`: Catches remaining patterns including relative imports
- Fast feedback in editor and pre-commit hooks

**3. Dependency Cruiser (CI Enforcement)**
- Runtime validation of all import rules
- Blocks PRs that violate architectural boundaries
- Comprehensive pattern matching for edge cases

**Import Examples:**

```typescript
// ✅ Correct: Use path aliases to module facades
import { useDocuments } from '@modules/documents'
import { useColorTheme } from '@modules/color-theme'
import { useEditor } from '@modules/editor'

// ✅ Also correct: Full path to api.ts
import { useDocuments } from '~/modules/documents/api'

// ❌ Wrong: Direct imports to internals (blocked by all three layers)
import { useDocumentsStore } from '~/modules/documents/store'
import { useDocumentsStore } from '../documents/store'
import DocumentList from '@modules/documents/components/DocumentList.vue'
```

**Why Three Layers:**
- **Path aliases**: Make the right way the easy way (pit of success)
- **ESLint**: Fast feedback during development
- **Dependency Cruiser**: Comprehensive enforcement in CI (catches edge cases)

Each layer catches different violations, creating a robust defense-in-depth.

---

## High-Level Architecture

**MarkVim** = Nuxt 3 Markdown editor with Vim mode, modular.

**Core tech**: Nuxt 3, Pinia, CodeMirror 6 (vim), UnoCSS, Playwright + Cucumber.

**Project structure**

```
src/
├── app/              # App-level components/layouts
├── modules/          # Feature modules
├── shared/           # Shared utilities/components
│   ├── components/
│   ├── composables/
│   ├── ui/
│   └── utils/
└── types/            # Type definitions
```

**Module Structure**

Each module contains:
* `api.ts` – **Public interface only.** Exports ONLY what can be used outside the module.
* `components/` – Vue components
* `composables/` – Composables (reactivity, wiring)
* `utils/` – Pure functions, business logic, helpers
* `store.ts` – Optional Pinia store

**Rules**:
1. No `internal/` folder. Use appropriate folders (`utils/`, `composables/`, etc.)
2. `api.ts` exports ONLY what external modules need
3. Internal implementation details stay private to the module

**Modules**

* color-theme – OKLCH theme picker (+ `store.ts`)
* documents  – CRUD + localStorage (+ `store.ts`)
* editor     – CodeMirror + vim
* layout     – Header, status bar, resizable panes
* markdown-preview – Live preview + Mermaid
* share      – Import/export
* shortcuts  – Shortcuts + command palette

**Key architectural choices**

1. Client-only rendering where needed (`<ClientOnly>`)
2. Business logic in composables
3. Store persistence to localStorage
4. Typed event bus (`src/shared/utils/eventBus.ts`)
5. Feature modules own their own implementation details
6. Responsive, mobile-first

---

## Vue Components & Composables Style Guide

Goal: top of file reads like a table of contents; details live below. Keep templates simple, logic testable, data flow clear.

### Components

* Separate behavior vs presentation: leaf UI = props in / events out; orchestration in parent views wiring composables → children.
* Keep templates flat: large `v-if` branches → small child; complex `v-for` lists → list child.
* Pass cohesive data: for app-specific children prefer one domain object over many scalars; for reusable libs keep props explicit.
* Choose implementations by intent: map keys → `<component :is>` instead of big conditionals.
* Split by concern: unrelated prop clusters → focused children (keep stable parent API). If a child is tightly coupled, inline it.
* Template-driven reuse when needed: expose behavior + slots when consumer must own markup; otherwise prefer composables.

### Component Naming

**Pattern**: `Module` → `ComponentType` → `Modifier`

* Module components: prefix with module name (e.g., `DocumentList`, `EditorMarkdown`, `ShareButton`)
* Order: highest-level (module) → general (type) → specific (modifier)
* Groups related components alphabetically for easy discovery

**Examples (correct)**
- `DocumentModalDelete` (not `DocumentDeleteModal`)
- `ColorThemeSliderChannel` (not `ColorThemeChannelSlider`)
- `ShareDialogImport` (not `ShareImportDialog`)

**Why**: Alphabetical grouping by module/type improves navigation and shows relationships at a glance.

### Composables

* Thin and testable: heavy business rules in pure functions; composable handles reactivity/wiring. Inputs = values/refs; outputs = small, named.
* Flexible inputs: accept values/refs/computed; normalize with `toValue` helpers. Prefer options object over long arg lists.
* Control reactivity: introduce boundaries (snapshots/copies/computed) to prevent cascades.
* Fit return shape to use case: minimal surface; advanced outputs behind flags or factory options.
* Lightweight shared state: for local features, prefer module-scoped `reactive`/simple store composable over global store.

### Ideal SFC layout

```vue
<script setup lang="ts">
import { ref, computed, toValue, type Ref } from 'vue'
import { useSomethingShared } from '@/shared/composables/useSomethingShared'

// 1) Shared state
const shared = useSomethingShared()

// 2) Story at a glance
const { count, inc, dec } = useCounter()
const { message, setMessage } = useMessage()
const { isValid, validate } = useValidation(count)

// 3) Details below
function useCounter() {
  const count = ref(0)
  const inc = () => { count.value++ }
  const dec = () => { count.value-- }
  return { count, inc, dec }
}
function useMessage() {
  const message = ref('')
  const setMessage = (t: string) => { message.value = t }
  return { message, setMessage }
}
function useValidation(count: Ref<number>) {
  const isValid = computed(() => count.value > 0)
  const validate = () => isValid.value
  return { isValid, validate }
}
</script>
```

Use inline local composables when logic is component-specific or evolving. Extract to shared composables when reused or deserving dedicated tests.

**PR checklist (Vue)**

1. Leaf components only render/emit
2. Big conditionals split out
3. Big lists extracted
4. Cohesive object props for app-specific children
5. Unrelated concerns split
6. Over-coupled child inlined
7. Implementation selected via mapping + `<component :is>`
8. Composables thin with pure functions
9. Accept refs/values; normalize inputs
10. Use options object
11. Reactive boundaries in place
12. Minimal return surface

---

## State Management

* Documents: Pinia (`src/modules/documents/store.ts`)
* Color theme: Pinia (`src/modules/color-theme/store.ts`)
* Feature flags: Pinia (`src/shared/feature-flags/store.ts`)
* **Pattern:** Modules expose public facades via `use[Module]()` composables
* **Mutations:** ALL state changes happen via facade action methods
* Active document ↔ editor sync via direct facade calls
* Persist settings/documents to localStorage

**Facade API Pattern:**

```typescript
// ❌ Wrong: Don't export stores
export { useDocumentsStore } from './store'

// ✅ Correct: Facade pattern
export function useDocuments() {
  const store = useDocumentsStore()
  const { documents, activeDocument } = storeToRefs(store)

  return {
    // Readonly state
    documents,
    activeDocument,

    // Actions
    createDocument: () => store.dispatch({ type: 'CREATE_DOCUMENT' }),
    selectDocument: (id: string) => store.dispatch({ type: 'SELECT_DOCUMENT', payload: { documentId: id } }),
    updateDocument: (id: string, content: string) => store.dispatch({ type: 'UPDATE_DOCUMENT', payload: { documentId: id, content } }),
    deleteDocument: (id: string) => store.dispatch({ type: 'DELETE_DOCUMENT', payload: { documentId: id } }),
  }
}
```

See **State Management & Module Communication Pattern** section below for full details.

## Testing Strategy

* E2E: Playwright + Cucumber, BDD scenarios, Page Objects
* Cover: editing, document management, theme switching

### Test Selector Priority (Accessibility-First)

**Always prefer accessibility-friendly selectors over `data-testid`:**

1. **Role-based** (highest priority): `getByRole('button', { name: 'Create Document' })`
2. **Label-based**: `getByLabel('Font Size')`
3. **Text-based**: `getByText('Welcome to MarkVim')`
4. **Placeholder**: `getByPlaceholder('Search...')`
5. **Semantic HTML**: `.cm-content`, `nav`, `article`
6. **Test IDs** (last resort): `[data-testid="editor-pane"]` - only for complex structural elements

**Why**: Tests mirror real user interactions, improve accessibility, and are more resilient to refactoring.

See `tests/docs/ACCESSIBILITY_SELECTOR_STRATEGY.md` for complete guidelines.

## State Management & Module Communication Pattern

**CRITICAL: All modules expose public facades via `api.ts`. All state mutations happen through facade actions.**

### Facade Pattern Overview

Each module's internal implementation (Pinia stores or composables) is private. Only the public API (`api.ts`) is exposed. This creates clear boundaries and enforces proper encapsulation.

**Key Principles:**
1. Stores/composables are internal implementation details
2. Public API exposes readonly state + action methods
3. Same-module and cross-module code both use the same facade
4. No events for state mutations (events only for UI notifications)

### Public Facade Structure

Every module's `api.ts` exports a composable that provides:
- **Readonly state** - via `storeToRefs()` or computed refs
- **Helper methods** - pure functions for common operations
- **Action methods** - wrappers around internal dispatch/mutations

**Example: Documents Module**

```typescript
// modules/documents/api.ts - PUBLIC FACADE
export function useDocuments() {
  const store = useDocumentsStore() // Internal store
  const { documents, activeDocument } = storeToRefs(store)

  return {
    // Readonly state
    documents,
    activeDocument,

    // Helper methods
    getDocumentTitle: store.getDocumentTitle,
    getDocumentById: store.getDocumentById,

    // Actions
    createDocument: (content?: string) => store.dispatch({ type: 'CREATE_DOCUMENT', payload: content ? { content } : undefined }),
    selectDocument: (id: string) => store.dispatch({ type: 'SELECT_DOCUMENT', payload: { documentId: id } }),
    updateDocument: (id: string, content: string) => store.dispatch({ type: 'UPDATE_DOCUMENT', payload: { documentId: id, content } }),
    deleteDocument: (id: string) => store.dispatch({ type: 'DELETE_DOCUMENT', payload: { documentId: id } }),
    importDocument: (content: string) => store.dispatch({ type: 'ADD_DOCUMENT', payload: { content } }),
  }
}
```

### Usage Pattern (All Modules)

**✅ Correct: Use facade from any module (preferred: path aliases)**

```typescript
// Any component or composable (same module or different)
// Prefer @modules/* path aliases (shorter, enforced by TypeScript)
import { useDocuments } from '@modules/documents'
import { useColorTheme } from '@modules/color-theme'
import { useEditor } from '@modules/editor'

const { documents, activeDocument, createDocument, selectDocument, deleteDocument } = useDocuments()
const { theme, updateColor, resetTheme } = useColorTheme()

// Direct action calls
createDocument()
selectDocument('doc-id-123')
updateColor('accent', { l: 0.6, c: 0.2, h: 240 })
```

**✅ Also correct: Full path to api.ts**

```typescript
// Full paths work too, but are more verbose
import { useDocuments } from '~/modules/documents/api'
import { useColorTheme } from '~/modules/color-theme/api'
```

**❌ Incorrect: Direct store access**

```typescript
// ❌ NEVER import stores directly
import { useDocumentsStore } from '~/modules/documents/store'

const store = useDocumentsStore()
store.dispatch({ ... })  // WRONG! Bypasses facade
```

**❌ Incorrect: Events for state mutations**

```typescript
// ❌ NEVER use events for state mutations
import { emitAppEvent } from '@/shared/utils/eventBus'

emitAppEvent('document:create')  // WRONG! Use facade actions instead
```

### Internal Store Pattern (Pinia + TEA)

Stores use The Elm Architecture internally but are **never** exported from `api.ts`:

```typescript
// modules/documents/store.ts - INTERNAL ONLY
export const useDocumentsStore = defineStore('documents', () => {
  const _state = useLocalStorage<DocumentsState>(...)

  function dispatch(message: DocumentMessage) {
    _state.value = update(_state.value, message)
  }

  return {
    state: readonly(_state),
    documents,
    activeDocument,
    dispatch,  // Exposed to facade only
  }
})
```

### When to Use Events

Events are **only** for notifications or UI coordination, not for state mutations:

**✅ Use events for:**
- Modal/dialog triggers: `document:delete` (opens confirmation modal)
- UI notifications: `command-palette:open`, `command-palette:close`
- Side effects: `document:created`, `document:updated` (for logging, analytics, etc.)

**❌ Do NOT use events for:**
- State mutations (use facade actions instead)
- Cross-module data changes
- Triggering store updates

### Benefits of Facade Pattern

1. **Clear API boundaries** - Only intended functionality is exposed
2. **Direct function calls** - Easier to trace than event emissions
3. **Type-safe mutations** - TypeScript ensures correct parameters
4. **Refactor safety** - Internal implementation can change without affecting consumers
5. **TEA benefits preserved** - Pure update functions, predictable state changes
6. **Better tooling** - IDE autocomplete, go-to-definition, find-all-references work perfectly

## Component Auto-Import

Nuxt config: `components: false`. All components must be explicitly imported.

**Local components**

```ts
import BaseModal from '~/shared/components/BaseModal.vue'
```

**Nuxt UI components** (must import from `#components`)

```ts
import { UButton, UCard, UInput, UModal } from '#components'
```

**Why**: Nuxt UI uses the component registry, not per-component ESM exports. `#components` is the supported import path when auto-imports are disabled.

**Anti-examples (do NOT do)**

```ts
// import { UButton } from '@nuxt/ui'
// import UButton from '#ui/components/Button.vue'
```

## Dependencies Overview

* Nuxt UI (import via `#components`)
* CodeMirror 6 + `@replit/codemirror-vim`
* Mermaid
* Markdown-it (+ footnotes + GitHub alerts)
* Shiki
* VueUse
* UnoCSS
* Reka UI (prefer Nuxt UI when possible)
* Knip

## Component Preferences

1. Prefer Nuxt UI over custom/Reka UI
2. Check Nuxt UI first before building
3. Benefits: a11y, consistent styling, built-ins (fuzzy search, keyboard nav, etc.)
4. Example: use `UCommandPalette` instead of a custom dialog search

**Nuxt UI via MCP offers**: `UCommandPalette`, `UModal`, `UDrawer`, `USlideover`, `UButton`, `UInput`, `UKbd`, etc. Always check MCP first.

---

## Color System Rules

**Critical: no hardcoded colors.** All colors must be user-configurable via theme.

**CSS variables (use ONLY these)**

* `var(--accent)` – Primary interactive
* `var(--foreground)` – Primary text
* `var(--background)` – Primary background
* `var(--muted)` – Subtle surfaces
* `var(--border)` – Borders/dividers
* `var(--alert-note)` – Info
* `var(--alert-tip)` – Success
* `var(--alert-important)` – Important
* `var(--alert-warning)` – Warning
* `var(--alert-caution)` – Error

**Examples (correct)**

```vue
<div class="bg-[var(--accent)]/10 border border-[var(--accent)]/20">
  <span class="text-[var(--accent)]">Accent text</span>
</div>
<div class="bg-[var(--alert-tip)]/10 text-[var(--alert-tip)]">Success</div>
<UButton color="primary">Primary</UButton>
<UButton color="error">Delete</UButton>
```

**Examples (wrong)**

```vue
<div class="bg-blue-500 text-green-600 border-red-400">Hardcoded</div>
<div style="color:#3b82f6;background:#10b981">Hardcoded</div>
```

**Why**: Users can customize theme colors; hardcoding breaks this and causes inconsistency.

---

Prefer modifying existing modules over creating new files. Follow established patterns for consistency.
