- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.


## Changesets


To add a changeset, write a new file to the `.changeset` directory.

The file should be named `0000-your-change.md`. Decide yourself whether to make it a patch, minor, or major change.

The format of the file should be:

```md
---
"evalite": patch
---

Description of the change.

The description of the change should be user-facing, describing which features were added or bugs were fixed.

## GitHub

- Your primary method for interacting with GitHub should be the GitHub CLI

you have access to the tree command 

## Project Overview

MarkVim is a Nuxt 3 Markdown editor with full Vim editing experience. Built with CodeMirror 6, it provides live preview, document management, and enhanced Markdown features including Mermaid diagrams and GitHub alerts.

**Tech Stack:**
- Nuxt 3 (Vue.js meta-framework with auto-imports disabled)
- Pinia (state management with localStorage persistence)
- CodeMirror 6 with vim extension
- UnoCSS (atomic CSS framework)
- Playwright + Cucumber (E2E testing with BDD)

**Package Manager:** pnpm (required)

## Development Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm lint          # Check for errors
pnpm lint:fix      # Auto-fix errors
pnpm test:e2e                    # Run all tests (requires server running)
pnpm test:e2e:with-server        # Start server + run tests
pnpm test:e2e:headed             # Run with browser visible
pnpm test:e2e:<feature-name>     # Run specific feature (accessibility, color, documents, editing, sharing, smoke, theme, document-persistence)

```

## Architecture

MarkVim follows a **modular architecture** designed for microfrontend readiness, inspired by single-spa patterns. Each module is loosely coupled and communicates via explicit boundaries.

### Directory Structure

```
src/
├── modules/          # Feature modules (self-contained)
│   ├── color-theme/
│   ├── documents/
│   ├── editor/
│   ├── markdown-preview/
│   ├── share/
│   └── shortcuts/
├── shared/          # Shared utilities (module-agnostic)
│   ├── api/
│   ├── components/
│   ├── composables/
│   ├── contracts/
│   ├── events/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── ui/
│   └── utils/
├── types/           # Global TypeScript types
├── app/            # Nuxt app configuration
└── plugins/        # Nuxt plugins
```

### Module Architecture

Each module follows this structure:

```
modules/<module-name>/
├── api.ts              # Public interface (ONLY entry point for other modules)
├── events.ts           # Event contracts (optional)
├── store.ts            # Pinia store (optional)
├── components/         # Vue components
├── composables/        # Business logic
└── utils/              # Module-specific utilities
```

**Critical Rules:**

1. **api.ts is the only public interface** - Other modules MUST import via `@modules/<name>` which resolves to `api.ts`
2. **No direct cross-module imports** - Never import `~/modules/foo/store.ts` or `~/modules/foo/composables/useBar.ts` from another module
3. **Shared code is module-agnostic** - `~/shared/` cannot depend on feature modules
4. **No circular dependencies** - Enforced by dependency-cruiser
5. **Components use composables, not stores** - Prefer `useDocuments()` over `useDocumentsStore()`

### Module Aliases

The following aliases are defined in `nuxt.config.ts`:

```ts
@modules/color-theme     → src/modules/color-theme/api.ts
@modules/documents       → src/modules/documents/api.ts
@modules/editor          → src/modules/editor/api.ts
@modules/layout          → src/modules/layout/api.ts
@modules/markdown-preview → src/modules/markdown-preview/api.ts
@modules/share           → src/modules/share/api.ts
@modules/shortcuts       → src/modules/shortcuts/api.ts
```

### Event System

Modules communicate asynchronously via a type-safe event bus:

- **Module events** - Defined in `<module>/events.ts`
- **Shared events** - Defined in `~/shared/events.ts`
- **Event contracts** - Documented with producer/consumer examples
- **Usage pattern:**
  ```ts
  // Producer
  emitAppEvent('document:selected', { documentId })

  // Consumer
  onAppEvent('document:selected', ({ documentId }) => {
    // React to event
  })
  ```

### State Management

- **Pinia stores** - Located at `modules/<name>/store.ts`
- **Persistence** - Use `useLocalStorage` from VueUse for client-side persistence
- **Client-only rendering** - Wrap localStorage-dependent components with `<ClientOnly>`
- **Hydration safety** - Always check for browser context before accessing localStorage

## Code Style & Conventions

### TypeScript

- **Auto-imports disabled** - All imports must be explicit
- **Strict typing** - `noUncheckedIndexedAccess: true` enabled
- **Interface definitions** - Use interfaces for component props and data structures
- **Composition API** - Use `<script setup>` syntax exclusively
- **Props definition** - `defineProps<Props>()` with interface

### Vue Components

- **Client-only components** - Suffix with `.client.vue` for components accessing localStorage
- **ClientOnly wrapper** - Use `<ClientOnly>` for hydration-sensitive components
- **Composables pattern** - Extract business logic into `use*` composables
- **Component imports** - Must be explicit (auto-imports disabled)

### CSS

- **UnoCSS** - Use atomic utility classes
- **Semantic classes** - Prefer semantic names over generic utilities
- **Mobile-first** - Apply responsive design patterns
- **Accessibility** - Include proper ARIA labels

### Accessibility

- Implement keyboard navigation for all interactive elements
- Provide ARIA labels for screen readers
- Test with Playwright + axe-core (see `tests/features/accessibility.feature`)
- Support vim keybindings throughout the application

## Testing Strategy

### E2E Tests (Playwright + Cucumber)

**Location:** `tests/features/*.feature`

**Features tested:**
- Smoke tests (basic functionality)
- Documents (CRUD operations, sidebar)
- Editing (Markdown rendering, Mermaid diagrams)
- Sharing (export/import)
- Color themes (customization)
- Accessibility (WCAG 2.1 AA compliance)
- Document persistence (localStorage)

**Test structure:**
- `tests/features/` - Gherkin feature files
- `tests/steps/` - Step definitions (01-given, 02-when, 03-then pattern)
- `tests/page-objects/` - Page object models
- `tests/support/` - Test utilities and hooks

**Running tests:**
```bash
# All tests with server
pnpm test:e2e:with-server

# Specific feature
pnpm test:e2e:documents

# Debug mode (visible browser)
pnpm test:e2e:headed

# Run specific scenario by name
NODE_OPTIONS='--import tsx' pnpm exec cucumber-js tests/features/documents.feature --name "Toggle sidebar"
```

### Test Development

- Use page object pattern for maintainability
- Write BDD scenarios in Gherkin syntax
- Cover core workflows and edge cases
- Test accessibility with axe-core integration

## Key Architectural Patterns

### 1. Module Facade Pattern

Each module exports a public API via `api.ts`:

```ts
// modules/documents/api.ts
export function useDocuments() {
  const store = useDocumentsStore()
  return {
    // Readonly state
    documents: readonly(store.documents),
    activeDocument: readonly(store.activeDocument),
    // Actions
    createDocument: (content?: string) => store.dispatch({ type: 'CREATE_DOCUMENT', payload: { content } }),
    selectDocument: (id: string) => store.dispatch({ type: 'SELECT_DOCUMENT', payload: { documentId: id } }),
  }
}
```

### 2. Event-Driven Communication

Cross-module communication happens via events:

```ts
// modules/documents/events.ts
export interface DocumentsEvents {
  'document:selected': { documentId: string }
  'document:created': { documentId: string }
  'document:updated': { documentId: string }
  'document:deleted': { documentId: string }
}
```

### 3. Dependency Injection via Composables

Business logic lives in composables, not components:

```ts
// modules/editor/composables/useEditorSettings.ts
export function useEditorSettings() {
  const settings = useLocalStorage<EditorSettings>('editor-settings', getDefaultSettings())

  function toggleVimMode() {
    settings.value.vimMode = !settings.value.vimMode
  }

  return { settings, toggleVimMode }
}
```

### 4. Client-Side Persistence

Use VueUse's `useLocalStorage` for persistence:

```ts
import { useLocalStorage } from '@vueuse/core'

const state = useLocalStorage('key', defaultValue)
```

## Common Gotchas

1. **Auto-imports disabled** - You must import Vue APIs, Pinia stores, and components explicitly
2. **Hydration mismatches** - Always use `<ClientOnly>` for localStorage-dependent components
3. **Module boundaries** - Never bypass api.ts to access module internals
4. **Circular dependencies** - Run `pnpm depcruise:ci` before committing
5. **Event naming** - Use `module:action` pattern (e.g., `document:selected`)
6. **Client-only rendering** - Server-side rendering is disabled for components accessing browser APIs

## CI/CD Validation

The following checks run in CI:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Architectural rules
pnpm depcruise:ci

# Module independence
pnpm analyze:modules:ci

# Dead code detection
pnpm knip

# E2E tests
pnpm test:e2e:with-server
```

## Module Independence Targets

When adding features or refactoring:

- **Target:** All modules ≥ 80% independence score
- **Current blockers:**
  - Break layout ↔ share circular dependency
  - Reduce documents module event coupling
  - Refactor layout to use dependency injection
- **Use registration pattern** - For parent-child module relationships, prefer registration over direct imports
- **Batch related events** - Combine frequent events to reduce coupling penalties
