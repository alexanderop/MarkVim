# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server at http://localhost:3000
pnpm build            # Production build
pnpm typecheck        # Run TypeScript type checking
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
```

## Testing

E2E tests use Playwright + Cucumber with Gherkin syntax:

```bash
pnpm test:e2e                    # Run tests (requires dev server running)
pnpm test:e2e:with-server        # Run tests with auto-started server
pnpm test:e2e:headed             # Run tests in headed browser mode

# Run specific feature file
NODE_OPTIONS='--import tsx' pnpm exec cucumber-js tests/features/documents.feature

# Run specific scenario by name
NODE_OPTIONS='--import tsx' pnpm exec cucumber-js tests/features/documents.feature --name "Create new document"
```

Test structure:
- `tests/features/*.feature` - Gherkin scenarios
- `tests/steps/` - Step definitions (01-given, 02-when, 03-then)
- `tests/support/world.ts` - Shared browser context

## Architecture

MarkVim is a Nuxt 4 markdown editor with Vim mode, built on a modular architecture.

### Module System

Located in `src/modules/`, each module is self-contained:
- `color-theme` - OKLCH color picker and theme customization
- `documents` - Document CRUD with localStorage persistence
- `editor` - CodeMirror 6 with Vim mode (@replit/codemirror-vim)
- `markdown-preview` - Live preview with Mermaid, Shiki syntax highlighting
- `share` - URL-based document sharing (fflate compression)
- `shortcuts` - Keyboard shortcuts and command palette

**Module boundaries are enforced:**
- Each module exposes a public `api.ts` file
- Import modules via `@modules/name` alias (resolves to api.ts)
- Direct imports to module internals are blocked by ESLint
- Run `pnpm analyze:modules` to check module independence scores

### Event Bus

Cross-module communication uses a typed event bus (`src/shared/utils/eventBus.ts`):
```typescript
import { emitAppEvent, onAppEvent } from '~/shared/utils/eventBus'

emitAppEvent('document:selected', { id: '123' })
onAppEvent('document:selected', (payload) => { /* ... */ })
```

Each module defines its events in `events.ts` and exports types via api.ts.

### Shared Code

`src/shared/` contains cross-cutting utilities:
- `components/` - Layout components (Header, StatusBar, Settings)
- `composables/` - useViewMode, useSyncedScroll, useResizablePanes
- `utils/result.ts` - Rust-like Result<T, E> type for error handling
- `store/feature-flags.ts` - Feature flag management

### Key Patterns

**Result type for error handling:** Try/catch and throw are forbidden by ESLint. Use Result<T, E>:
```typescript
import { ok, err, type Result } from '~/shared/utils/result'

function parse(input: string): Result<Data, Error> {
  if (!valid) return err(new Error('Invalid'))
  return ok(parsedData)
}
```

**No else statements:** Use early returns or ternary operators.

**No auto-imports:** Components and composables must be explicitly imported.

## Code Style Rules

Key ESLint rules enforced:
- `complexity`: max 13
- `max-depth`: max 3 (nesting levels)
- `no-magic-numbers`: except -1, 0, 1, 2
- `ts/explicit-function-return-type`: required
- `ts/consistent-type-assertions`: "never" (no `as` casts)
- Vue: `<script>` before `<template>`, PascalCase components, type-based emits/props

## Analysis Tools

```bash
pnpm analyze:modules         # Check module independence scores
pnpm knip:exports            # Find unused exports
pnpm depcruise               # Dependency graph analysis
```


