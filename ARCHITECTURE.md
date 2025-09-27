# Module Architecture and Import Guidelines

This document outlines the modular architecture of MarkVim and provides clear guidelines for developers on how to properly import functionality between modules.

## Module Boundaries

MarkVim follows a strict modular architecture where each module is self-contained and communicates with other modules only through well-defined APIs.

### Module Structure

```
src/modules/
├── color-theme/         # Theme customization
├── documents/           # Document CRUD operations  
├── editor/              # CodeMirror integration
├── layout/              # App layout components
├── markdown-preview/    # Live preview rendering
├── share/               # Import/export functionality
└── shortcuts/           # Keyboard shortcuts
```

Each module contains:
- `api.ts` - Public interface (the only file other modules should import from)
- `components/` - Vue components 
- `composables/` - Composition functions
- `stores/` - Pinia stores (if applicable)
- `internal/` - Private implementation details

## Import Rules

### ✅ ALLOWED Imports

1. **From module APIs only:**
   ```typescript
   // ✅ Good - Import from module API
   import type { Document } from '~/modules/documents/api'
   import { useDocumentShare } from '~/modules/share/api'
   ```

2. **Shared utilities and components:**
   ```typescript
   // ✅ Good - Shared utilities are globally available
   import { emitAppEvent } from '@/shared/utils/eventBus'
   // Components from shared/ are auto-imported without prefix
   <BaseButton />
   ```

3. **Within the same module:**
   ```typescript
   // ✅ Good - Internal imports within the same module
   import { someInternalUtil } from './internal/utils'
   import { MyComposable } from '../composables/useMyFeature'
   ```

### ❌ FORBIDDEN Imports

1. **Direct cross-module imports:**
   ```typescript
   // ❌ Bad - Direct import from another module's internals
   import type { Document } from '~/modules/documents/store'
   import { useDocumentShare } from '~/modules/share/composables/useDocumentShare'
   ```

2. **Module internals from outside:**
   ```typescript
   // ❌ Bad - Importing internal files from other modules
   import { internalHelper } from '~/modules/documents/internal/helper'
   import { MyComponent } from '~/modules/editor/components/MyComponent.vue'
   ```

## Component Usage

Components from modules are now prefixed to make their origin explicit:

```vue
<template>
  <!-- ✅ Good - Prefixed component names show module origin -->
  <DocumentsList />        <!-- from documents module -->
  <EditorMarkdownEditor /> <!-- from editor module -->
  <ShareButton />          <!-- from share module -->
  
  <!-- ✅ Good - Shared components don't need prefix -->
  <BaseButton />           <!-- from shared/components -->
  <Icon />                 <!-- from shared/components -->
</template>
```

## Auto-Import Changes

### Before (Global Auto-Imports)
All module composables were globally available, leading to unclear dependencies:

```typescript
// Any module could use any composable without explicit imports
const { createDocument } = useDocumentsStore() // unclear dependency
const { shareDocument } = useDocumentShare()   // unclear dependency
```

### After (Controlled Auto-Imports)  
Only shared utilities are globally available. Module functionality must be explicitly imported:

```typescript
// ✅ Explicit import from module API
import { useDocumentsStore } from '~/modules/documents/api'
import { useDocumentShare } from '~/modules/share/api'

const { createDocument } = useDocumentsStore()
const { shareDocument } = useDocumentShare()
```

## Module APIs

Each module exposes a controlled API through its `api.ts` file:

### Documents Module API
```typescript
// ~/modules/documents/api.ts
export type { Document } from './store'
export { useDocumentsStore } from './store'
export function getDocumentTitle(content: string): string
```

### Share Module API
```typescript
// ~/modules/share/api.ts
export { useDocumentShare } from './composables/useDocumentShare'
export type { ShareableDocument } from './composables/useDocumentShare'
```

### Layout Module API
```typescript
// ~/modules/layout/api.ts
export { useViewMode } from './composables/useViewMode'
export { useResizablePanes } from './composables/useResizablePanes'
export { useSyncedScroll } from './composables/useSyncedScroll'
```

## ESLint Enforcement

The architecture is enforced by ESLint rules that will catch violations:

```bash
# This will catch and report boundary violations
pnpm lint
```

Example violations caught:
```
error: Direct imports between modules are not allowed. Use module APIs instead. 
Import from '~/modules/documents/api' if you need functionality from the documents module.
```

## Communication Patterns

### Event Bus (Recommended)
Use the typed event bus for cross-module communication:

```typescript
// ✅ Good - Event-driven communication
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'

// Emit events
emitAppEvent('document:create', { title: 'New Doc' })

// Listen to events  
onAppEvent('document:select', (payload) => {
  // Handle document selection
})
```

### Module APIs (When Needed)
Import from module APIs when you need direct access to functionality:

```typescript
// ✅ Good - Direct API usage when appropriate
import { useDocumentsStore } from '~/modules/documents/api'

const { documents, createDocument } = useDocumentsStore()
```

## Guidelines for Developers

1. **Think API-First**: When adding new functionality, consider what should be publicly exposed via the module's API

2. **Use Events for Actions**: Prefer event bus for triggering actions across modules

3. **Use APIs for Data**: Use module APIs when you need to access data or state from other modules

4. **Keep Modules Focused**: Each module should have a single, clear responsibility

5. **Test Boundaries**: Run `pnpm lint` regularly to catch boundary violations

6. **Document APIs**: Update module API files when adding new public functionality

## Migration Guide

If you encounter ESLint errors after these changes:

1. **Identify the violation**: Look at the ESLint error message
2. **Find the module API**: Check the target module's `api.ts` file  
3. **Update the import**: Change from internal import to API import
4. **Test the change**: Ensure functionality still works

Example migration:
```typescript
// Before (violates boundaries)
import type { Document } from '~/modules/documents/store'

// After (uses API)
import type { Document } from '~/modules/documents/api'
```

## Benefits

This architecture provides:

- **Clear Dependencies**: Explicit imports make module relationships obvious
- **Maintainability**: Changes to module internals don't break other modules
- **Testability**: Modules can be tested in isolation
- **Scalability**: New modules can be added without affecting existing ones
- **Team Collaboration**: Clear boundaries reduce conflicts between developers

## Questions?

If you're unsure about module boundaries or imports:

1. Check the module's `api.ts` file to see what's publicly available
2. Run `pnpm lint` to catch violations early
3. Use the event bus for loose coupling between modules
4. When in doubt, prefer explicit imports from module APIs