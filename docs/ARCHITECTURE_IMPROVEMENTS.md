# Architecture Improvements for Module Separation

This document tracks the improvements made to strengthen module boundaries in MarkVim.

## Completed Improvements

### 1. ESLint Module Boundary Enforcement ✅
- Added ESLint rules to prevent direct imports to module internals
- Blocks patterns like `~/modules/foo/store` or `~/modules/foo/internal/*`
- Forces use of public API: `~/modules/foo/api`
- Configured in `eslint.config.mjs:8-30`

**Limitation**: Currently only catches absolute path imports (`~/modules/...`), not relative imports (`../store`)

### 2. Moved Shared Utils to Module Ownership ✅
- Moved `shared/utils/markdown.ts` → `modules/markdown-preview/internal/markdown.ts`
- This 124-line Markdown renderer with Shiki/Mermaid integration was only used by markdown-preview module
- Clarifies ownership and module boundaries

### 3. Renamed Core Module to Domain ✅
- Renamed `modules/core` → `modules/domain`
- Better conveys purpose: shared domain types and schemas
- Updated all 10+ import references across the codebase
- Updated ESLint config to include domain module in boundary checks

### 4. Fixed Internal Module Imports ✅
- Updated color-theme components to import types from `~/modules/color-theme/api` instead of `../store`
- Updated documents composables to use public API functions
- Improved consistency: external AND internal consumers use the same public API

### 5. Organized Event Bus by Module ✅
- Added clear section headers to `shared/utils/eventBus.ts` grouping events by owning module
- Documents which module owns which events
- Added note about future potential split into per-module event files

### 6. Per-Module Event Definitions ✅
- Each module now defines its own events in a dedicated `events.ts` file
- Events exported via module's public API (`api.ts`)
- Event bus aggregates all module events using TypeScript's `extends` keyword
- **Created files**:
  - `modules/documents/events.ts` - 7 document-related events
  - `modules/editor/events.ts` - 3 editor-related events
  - `shared/layout/events.ts` - 2 layout events
  - `modules/shortcuts/events.ts` - 2 command palette events
  - `shared/events.ts` - 5 cross-cutting events (settings, data)
- **Benefits achieved**:
  - ✅ Clear module ownership of events (live with the code)
  - ✅ Visible cross-module dependencies (when shortcuts emits `document:select`, it imports `DocumentsEvents`)
  - ✅ Events are part of module's public contract
  - ✅ No circular dependencies (event bus imports FROM modules, one-way flow)
  - ✅ Zero runtime impact (pure type-level refactor)

## Future Improvements (Not Yet Implemented)

### TypeScript Project References
To add compile-time enforcement of module boundaries:

1. Create `tsconfig.json` for each module:
```json
// src/modules/documents/tsconfig.json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "../../../.nuxt/modules/documents"
  },
  "references": [
    { "path": "../domain" }
  ],
  "include": ["**/*"]
}
```

2. Update root `tsconfig.json` to reference all modules
3. Configure Nuxt to respect project references

**Benefits**:
- Compile-time errors for boundary violations
- Faster incremental builds
- Clear dependency graph

**Complexity**: Requires careful setup and testing with Nuxt's build system


## Current Module Boundary Status

✅ **Enforced by ESLint**:
- No direct imports to `modules/*/store.ts` (absolute paths)
- No direct imports to `modules/*/internal/*` (absolute paths)
- Must use `modules/*/api.ts` for all cross-module imports

✅ **Event Bus Module Ownership**:
- Each module defines its own events in `events.ts`
- Events exported via module API
- Event bus aggregates all module events
- Cross-module event usage is now visible in imports

⚠️ **Not Yet Enforced**:
- Relative imports within modules (e.g., `../store` from component)
- TypeScript compile-time boundaries via project references

## Architectural Guidelines

1. **Public API Pattern**: Every module exposes a single `api.ts` file as its public interface
2. **Module Naming**: Use `domain` for shared types, other modules for features
3. **Event Definitions**: Each module defines its events in `events.ts` and exports via `api.ts`
4. **Event Namespacing**: Events follow `<module>:<action>` pattern
5. **Internal Folder**: Use `internal/` for implementation details not meant for external use
6. **Store Access**: Modules can expose stores via their API, but prefer composables for controlled access
7. **Event Bus Pattern**: Aggregates module events, imports FROM modules (one-way dependency)

## Testing

All changes verified with:
- `pnpm typecheck` - ✅ Passing
- `pnpm lint` - ✅ Passing
- ESLint rules active and catching boundary violations
