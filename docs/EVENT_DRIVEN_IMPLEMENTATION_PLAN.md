# Event-Driven Architecture: Implementation Plan

**Status:** 🟡 Ready to Execute
**Estimated Time:** 16-20 hours
**Risk Level:** Medium
**Priority:** High

---

## Overview

This plan fixes the inconsistent event-driven communication in MarkVim by implementing complete event definitions and migrating all cross-module communication to use events instead of direct store access.

### Goals

1. ✅ Complete all event definitions
2. ✅ Add event listeners to stores
3. ✅ Migrate all external callers to use events
4. ✅ Enforce patterns with ESLint
5. ✅ Update documentation to match reality

---

## Phase 1: Complete Event Definitions

**Timeline:** 2-4 hours
**Risk:** Low (additive changes only)
**Prerequisites:** None

### Task 1.1: Add Missing Document Events

**File:** `src/modules/documents/events.ts`

**Current:**
```typescript
export interface DocumentsEvents {
  'document:delete': { documentId: string, documentTitle: string }
  'document:select': { documentId: string }
}
```

**Changes:**
```typescript
export interface DocumentsEvents {
  // Selection
  'document:select': { documentId: string }

  // Creation
  'document:create': undefined
  'document:created': { documentId: string }

  // Updates
  'document:update': { documentId: string, content: string }
  'document:updated': { documentId: string }

  // Deletion (two-phase)
  'document:delete': { documentId: string, documentTitle: string }
  'document:delete:confirmed': { documentId: string }
  'document:deleted': { documentId: string }

  // Import/Add
  'document:import': { content: string }
  'document:add': { content: string }
}
```

**Testing:**
```bash
pnpm typecheck  # Should pass
```

---

### Task 1.2: Implement Editor Events

**File:** `src/modules/editor/events.ts`

**Current:**
```typescript
export interface EditorEvents {
  // No events currently defined
}
```

**Changes:**
```typescript
export interface EditorEvents {
  // Content changes
  'editor:content:update': {
    documentId: string
    content: string
  }

  // Text insertion
  'editor:text:insert': {
    text: string
  }

  // Vim mode
  'editor:vim:mode:change': {
    mode: string
    subMode?: string
  }
}
```

**Testing:**
```bash
pnpm typecheck
```

---

### Task 1.3: Create Color Theme Events

**File:** `src/modules/color-theme/events.ts` (NEW)

**Create:**
```typescript
import type { ColorTheme, OklchColor } from './store'

/**
 * Color Theme Module Events
 *
 * Events that the color-theme module publishes and responds to.
 */

export interface ColorThemeEvents {
  // Color updates
  'theme:color:update': {
    colorKey: keyof ColorTheme
    color: OklchColor
  }
  'theme:color:updated': {
    colorKey: keyof ColorTheme
    color: OklchColor
  }

  // Theme reset
  'theme:reset': undefined
  'theme:reset:complete': {
    theme: ColorTheme
  }

  // Theme import
  'theme:import': {
    theme: ColorTheme
  }
  'theme:imported': {
    theme: ColorTheme
  }
}
```

**Also Update:** `src/modules/color-theme/api.ts`

Add export:
```typescript
export type { ColorThemeEvents } from './events'
```

**Testing:**
```bash
pnpm typecheck
```

---

### Task 1.4: Update Event Bus Aggregation

**File:** `src/shared/utils/eventBus.ts`

**Current:**
```typescript
export interface AppEvents extends
  DocumentsEvents,
  EditorEvents,
  LayoutEvents,
  ShortcutsEvents,
  SharedEvents {}
```

**Changes:**
```typescript
import type { ColorThemeEvents } from '~/modules/color-theme/api'

export interface AppEvents extends
  DocumentsEvents,
  EditorEvents,
  LayoutEvents,
  ShortcutsEvents,
  ColorThemeEvents,  // ADD THIS
  SharedEvents {}
```

**Testing:**
```bash
pnpm typecheck
pnpm lint
```

---

### Phase 1 Checklist

- [ ] Task 1.1: Add missing document events
- [ ] Task 1.2: Implement editor events
- [ ] Task 1.3: Create color theme events
- [ ] Task 1.4: Update event bus aggregation
- [ ] Run `pnpm typecheck` - should pass
- [ ] Run `pnpm lint` - should pass
- [ ] Commit: `feat: complete event definitions for all modules`

---

## Phase 2: Add Event Listeners to Stores

**Timeline:** 4-6 hours
**Risk:** Medium (changes store behavior)
**Prerequisites:** Phase 1 complete

### Task 2.1: Add Listeners to Documents Store

**File:** `src/modules/documents/store.ts`

**Add after store definition, before return:**

```typescript
// EVENT LISTENERS - Enable event-driven communication
// External modules should emit events, not call dispatch directly
onAppEvent('document:create', () => {
  const newDocId = dispatch({ type: 'CREATE_DOCUMENT' })
  if (newDocId) {
    emitAppEvent('document:created', { documentId: newDocId })
  }
})

onAppEvent('document:select', (payload) => {
  dispatch({ type: 'SELECT_DOCUMENT', payload })
})

onAppEvent('document:update', (payload) => {
  dispatch({ type: 'UPDATE_DOCUMENT', payload })
  emitAppEvent('document:updated', { documentId: payload.documentId })
})

onAppEvent('document:delete:confirmed', (payload) => {
  dispatch({ type: 'DELETE_DOCUMENT', payload })
  emitAppEvent('document:deleted', { documentId: payload.documentId })
})

onAppEvent('document:import', (payload) => {
  const newDocId = dispatch({ type: 'ADD_DOCUMENT', payload })
  if (newDocId) {
    emitAppEvent('document:created', { documentId: newDocId })
  }
})

onAppEvent('document:add', (payload) => {
  const newDocId = dispatch({ type: 'ADD_DOCUMENT', payload })
  if (newDocId) {
    emitAppEvent('document:created', { documentId: newDocId })
  }
})
```

**Add imports:**
```typescript
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'
```

**Testing:**
```bash
# Test that both methods work
pnpm test:e2e --grep "Create new document"
```

---

### Task 2.2: Add Listeners to Color Theme Store

**File:** `src/modules/color-theme/store.ts`

**Add after store definition, before return:**

```typescript
// EVENT LISTENERS
onAppEvent('theme:color:update', (payload) => {
  dispatch({ type: 'UPDATE_COLOR', payload })
  emitAppEvent('theme:color:updated', payload)
})

onAppEvent('theme:reset', () => {
  dispatch({ type: 'RESET_TO_DEFAULTS' })
  emitAppEvent('theme:reset:complete', { theme: DEFAULT_COLOR_THEME })
})

onAppEvent('theme:import', (payload) => {
  dispatch({ type: 'IMPORT_THEME', payload })
  emitAppEvent('theme:imported', { theme: payload.theme })
})
```

**Add imports:**
```typescript
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'
```

**Testing:**
```bash
pnpm test:e2e --grep "color theme"
```

---

### Phase 2 Checklist

- [ ] Task 2.1: Add event listeners to documents store
- [ ] Task 2.2: Add event listeners to color theme store
- [ ] Test both direct dispatch and event-driven paths work
- [ ] Run `pnpm typecheck` - should pass
- [ ] Run `pnpm lint` - should pass
- [ ] Run `pnpm test:e2e` - should pass
- [ ] Commit: `feat: add event listeners to stores for decoupled communication`

---

## Phase 3: Migrate External Callers to Events

**Timeline:** 6-8 hours
**Risk:** Medium (broad changes)
**Prerequisites:** Phase 1 & 2 complete

### Task 3.1: Migrate ShortcutsManager

**File:** `src/modules/shortcuts/components/ShortcutsManager.vue`

**Current (line 44-46):**
```typescript
import { useDocumentsStore } from '~/modules/documents/api'

const documentsStore = useDocumentsStore()

function handleCreateDocument(): void {
  documentsStore.dispatch({ type: 'CREATE_DOCUMENT' })
}
```

**Changes:**

1. **Remove import:**
```typescript
// ❌ Remove this:
// import { useDocumentsStore } from '~/modules/documents/api'
// const documentsStore = useDocumentsStore()
```

2. **Update function:**
```typescript
import { emitAppEvent } from '@/shared/utils/eventBus'

function handleCreateDocument(): void {
  emitAppEvent('document:create')
}
```

3. **Update store references:**

Remove this line:
```typescript
const { documents, activeDocument } = storeToRefs(documentsStore)
```

Replace with direct import for read access:
```typescript
import { storeToRefs } from 'pinia'
import { useDocumentsStore } from '~/modules/documents/api'

// Only for reading data in template
const documentsStore = useDocumentsStore()
const { documents, activeDocument } = storeToRefs(documentsStore)
```

Keep the store reference ONLY for read access in the command palette display. All mutations should use events.

**Testing:**
```bash
NODE_OPTIONS='--import tsx' pnpm exec cucumber-js tests/features/documents.feature --name "Create new document"
```

---

### Task 3.2: Migrate ShareManager

**File:** `src/modules/share/components/ShareManager.vue`

**Current (lines 4, 15, 54, 66):**
```typescript
import { useDocumentsStore } from '~/modules/documents/api'

const documentsStore = useDocumentsStore()

function handleAutoImport(document: Document): void {
  documentsStore.dispatch({ type: 'ADD_DOCUMENT', payload: { content: document.content } })
  // ...
}

function handleImportConfirm(document: Document): void {
  documentsStore.dispatch({ type: 'ADD_DOCUMENT', payload: { content: document.content } })
  // ...
}
```

**Changes:**

1. **Remove import:**
```typescript
// ❌ Remove:
// import { useDocumentsStore } from '~/modules/documents/api'
// const documentsStore = useDocumentsStore()
```

2. **Update both functions:**
```typescript
import { emitAppEvent } from '@/shared/utils/eventBus'

function handleAutoImport(document: Document): void {
  emitAppEvent('document:import', { content: document.content })

  // Switch to preview mode
  setViewMode('preview')
  emit('documentImported', document)
  clearShareFromUrl()
}

function handleImportConfirm(document: Document): void {
  emitAppEvent('document:import', { content: document.content })

  emit('documentImported', document)
  clearShareFromUrl()
  showImportDialog.value = false
  autoImportDocument.value = null
}
```

**Testing:**
```bash
NODE_OPTIONS='--import tsx' pnpm exec cucumber-js tests/features/sharing.feature --name "Successfully generate and import a share link"
```

---

### Task 3.3: Migrate useDocumentDeletion Composable

**File:** `src/modules/documents/composables/useDocumentDeletion.ts`

**Current:**
```typescript
import { useDocumentsStore } from '~/modules/documents/api'

const documentsStore = useDocumentsStore()

const confirmDeleteDocument = (): void => {
  if (documentToDelete.value) {
    documentsStore.dispatch({ type: 'DELETE_DOCUMENT', payload: { documentId: documentToDelete.value.id } })
    deleteModalOpen.value = false
    documentToDelete.value = null
  }
}
```

**Changes:**

1. **Remove store import:**
```typescript
// ❌ Remove:
// import { useDocumentsStore } from '~/modules/documents/api'
// const documentsStore = useDocumentsStore()
```

2. **Use event instead:**
```typescript
import { emitAppEvent } from '@/shared/utils/eventBus'

const confirmDeleteDocument = (): void => {
  if (documentToDelete.value) {
    emitAppEvent('document:delete:confirmed', {
      documentId: documentToDelete.value.id
    })
    deleteModalOpen.value = false
    documentToDelete.value = null
  }
}
```

**Testing:**
```bash
NODE_OPTIONS='--import tsx' pnpm exec cucumber-js tests/features/documents.feature --name "Delete document confirmation modal"
```

---

### Task 3.4: Update DocumentManagerAction

**File:** `src/modules/documents/components/DocumentManagerAction.vue`

This component is WITHIN the documents module, so it can keep using the store directly. But let's check if it should emit an event instead for consistency.

**Analysis:** This is an internal module component, so direct store access is acceptable. However, we could make it use the same `useDocumentDeletion` composable pattern.

**Decision:** Keep as-is (internal module component can use store directly).

---

### Phase 3 Checklist

- [ ] Task 3.1: Migrate ShortcutsManager to events
- [ ] Task 3.2: Migrate ShareManager to events
- [ ] Task 3.3: Migrate useDocumentDeletion to events
- [ ] Task 3.4: Verify DocumentManagerAction (keep as-is)
- [ ] Run all E2E tests: `pnpm test:e2e:with-server`
- [ ] Fix any broken tests
- [ ] Run `pnpm typecheck` - should pass
- [ ] Run `pnpm lint` - should pass
- [ ] Commit: `refactor: migrate external modules to use events instead of direct store access`

---

## Phase 4: Enforce Patterns & Document

**Timeline:** 2-3 hours
**Risk:** Low (documentation & tooling)
**Prerequisites:** Phase 1-3 complete

### Task 4.1: Create ESLint Rule for Cross-Module Stores

**File:** `eslint-rules/no-cross-module-stores.js` (NEW)

**Create:**
```javascript
/**
 * @fileoverview Prevent importing stores from other modules
 * @author MarkVim Team
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent importing stores from other modules. Use events instead.',
      category: 'Architecture',
      recommended: true,
    },
    messages: {
      noCrossModuleStore: 'Do not import {{storeName}} from {{moduleName}}. Use emitAppEvent(\'{{moduleName}}:action\', payload) instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value
        const currentFile = context.getFilename()

        // Skip if not in modules directory
        if (!currentFile.includes('/modules/')) {
          return
        }

        // Extract current module from file path
        const currentModuleMatch = currentFile.match(/\/modules\/([^/]+)\//)
        const currentModule = currentModuleMatch ? currentModuleMatch[1] : null

        // Check if importing from another module's API
        const apiImportMatch = source.match(/\/modules\/([^/]+)\/api/)
        if (!apiImportMatch || !currentModule) {
          return
        }

        const importedModule = apiImportMatch[1]

        // Same module? That's fine
        if (importedModule === currentModule) {
          return
        }

        // Check for store imports
        const importNames = node.specifiers
          .filter(spec => spec.type === 'ImportSpecifier')
          .map(spec => spec.imported.name)

        const storeImports = importNames.filter(name =>
          name.toLowerCase().includes('store') &&
          name.startsWith('use') &&
          name.includes('Store')
        )

        if (storeImports.length > 0) {
          context.report({
            node,
            messageId: 'noCrossModuleStore',
            data: {
              storeName: storeImports.join(', '),
              moduleName: importedModule,
            },
          })
        }
      },
    }
  },
}
```

---

### Task 4.2: Register ESLint Rule

**File:** `eslint.config.mjs`

**Add to plugins section:**
```javascript
import noCrossModuleStores from './eslint-rules/no-cross-module-stores.js'

export default [
  // ... existing config ...
  {
    plugins: {
      'markvim': {
        rules: {
          'no-cross-module-stores': noCrossModuleStores,
          // ... other rules
        },
      },
    },
    rules: {
      'markvim/no-cross-module-stores': 'error',
      // ... other rules
    },
  },
]
```

**Testing:**
```bash
pnpm lint  # Should pass now that we've migrated everything
```

---

### Task 4.3: Update CLAUDE.md Guidelines

**File:** `CLAUDE.md`

**Add section after "Event System":**

```markdown
## Cross-Module Communication Rules

**CRITICAL: All cross-module communication MUST use events.**

### ✅ Correct Pattern

```typescript
// External module emitting event
import { emitAppEvent } from '@/shared/utils/eventBus'

function createDocument(): void {
  emitAppEvent('document:create')
}

function deleteDocument(id: string): void {
  emitAppEvent('document:delete:confirmed', { documentId: id })
}
```

### ❌ Incorrect Pattern

```typescript
// ❌ NEVER import stores from other modules
import { useDocumentsStore } from '~/modules/documents/api'

const store = useDocumentsStore()
store.dispatch({ ... })  // WRONG!
```

### Internal Module Communication

Components within the SAME module can:
- Import and use the module's store directly
- Use internal composables
- Call internal utilities

### Exception: Read-Only Access

If you need to READ data for display (not mutate):
```typescript
import { storeToRefs } from 'pinia'
import { useDocumentsStore } from '~/modules/documents/api'

// ✅ OK for read-only display
const { documents } = storeToRefs(useDocumentsStore())
```

For mutations, always use events.

### ESLint Enforcement

The `markvim/no-cross-module-stores` rule blocks cross-module store imports. If you hit this error, you should:
1. Define an event in the target module's `events.ts`
2. Use `emitAppEvent()` to trigger the action
3. Let the target module's store listen and handle the event
```

---

### Task 4.4: Update Architecture Documentation

**File:** `docs/EVENT_COMMUNICATION.md`

**Add new section after "Best Practices":**

```markdown
## Migration Complete ✅

As of [DATE], all cross-module communication uses events exclusively:

- ✅ All event definitions complete
- ✅ Stores listen to events
- ✅ External modules emit events only
- ✅ ESLint enforces patterns
- ✅ Documentation matches implementation

### Verified Event Flows

1. **Document Creation**: `emitAppEvent('document:create')` → Documents Store
2. **Document Import**: `emitAppEvent('document:import', ...)` → Documents Store
3. **Document Deletion**: `emitAppEvent('document:delete:confirmed', ...)` → Documents Store
4. **Theme Updates**: `emitAppEvent('theme:color:update', ...)` → Color Theme Store

### Testing

All event flows are covered by E2E tests:
- `tests/features/documents.feature` - Document events
- `tests/features/sharing.feature` - Import events
- `tests/features/color.feature` - Theme events
```

---

### Task 4.5: Create Migration Summary

**File:** `docs/EVENT_MIGRATION_SUMMARY.md` (NEW)

**Create:**
```markdown
# Event-Driven Migration Summary

**Completed:** [DATE]
**Time Invested:** ~18 hours
**Risk Level:** Medium
**Outcome:** ✅ Success

## What Changed

### Event Definitions Added

- **Documents Module**: 9 events (was 2)
- **Editor Module**: 3 events (was 0)
- **Color Theme Module**: 6 events (new file)

### Stores Updated

- **Documents Store**: Added 6 event listeners
- **Color Theme Store**: Added 3 event listeners

### External Callers Migrated

- `ShortcutsManager.vue`: Now uses `document:create` event
- `ShareManager.vue`: Now uses `document:import` event
- `useDocumentDeletion.ts`: Now uses `document:delete:confirmed` event

### Enforcement Added

- ESLint rule: `markvim/no-cross-module-stores`
- Documentation updated: `CLAUDE.md`, `EVENT_COMMUNICATION.md`

## Before & After

### Before: Direct Coupling ❌

```typescript
// ShortcutsManager importing Documents store
import { useDocumentsStore } from '~/modules/documents/api'
const store = useDocumentsStore()
store.dispatch({ type: 'CREATE_DOCUMENT' })
```

### After: Event-Driven ✅

```typescript
// ShortcutsManager emitting event
import { emitAppEvent } from '@/shared/utils/eventBus'
emitAppEvent('document:create')

// Documents store listening (in store.ts)
onAppEvent('document:create', () => {
  dispatch({ type: 'CREATE_DOCUMENT' })
})
```

## Benefits Achieved

1. ✅ **True Decoupling**: Modules don't depend on each other's internals
2. ✅ **Easy Testing**: Mock events instead of stores
3. ✅ **Clear Contracts**: Event definitions serve as API
4. ✅ **Enforced Patterns**: ESLint catches violations
5. ✅ **Consistent**: Same pattern across entire codebase

## Testing Results

All tests passing:
- ✅ `pnpm typecheck`
- ✅ `pnpm lint`
- ✅ `pnpm test:e2e` (39/39 scenarios)

## Lessons Learned

1. **Gradual Migration**: Phase-by-phase approach reduced risk
2. **Dual Interface**: Keeping dispatch for internal use helped migration
3. **Testing Critical**: E2E tests caught integration issues early
4. **Documentation Sync**: Keeping docs updated prevented confusion

## Future Improvements

- Consider removing direct dispatch access in stores (strict event-only)
- Add event logging in dev mode for debugging
- Create event flow visualizations in DevTools
```

---

### Phase 4 Checklist

- [ ] Task 4.1: Create ESLint rule for cross-module stores
- [ ] Task 4.2: Register ESLint rule in config
- [ ] Task 4.3: Update CLAUDE.md with communication rules
- [ ] Task 4.4: Update EVENT_COMMUNICATION.md
- [ ] Task 4.5: Create migration summary document
- [ ] Run `pnpm lint` - should pass with new rule
- [ ] Commit: `docs: update architecture guidelines and add ESLint enforcement`

---

## Final Verification

### Pre-Release Checklist

- [ ] All phases complete (1-4)
- [ ] All tests passing: `pnpm test:e2e:with-server`
- [ ] Type checking passing: `pnpm typecheck`
- [ ] Linting passing: `pnpm lint`
- [ ] No ESLint warnings about cross-module stores
- [ ] Documentation updated and accurate
- [ ] Migration summary created

### Test Each Flow Manually

- [ ] Create new document (Cmd+N) - works via events
- [ ] Import shared document - works via events
- [ ] Delete document - works via events
- [ ] Change color theme - works via events
- [ ] Switch view modes - works via events

### Code Review Checklist

- [ ] No `import { useDocumentsStore }` from external modules
- [ ] No `import { useColorThemeStore }` from external modules
- [ ] All cross-module communication uses `emitAppEvent()`
- [ ] Stores have event listeners with `onAppEvent()`
- [ ] Event definitions complete in all `events.ts` files
- [ ] ESLint rule catches violations

---

## Rollback Plan

If issues arise:

### Rollback Phase 3 & 4
```bash
git revert HEAD~2  # Revert last 2 commits
```

### Rollback Phase 2
```bash
git revert HEAD~3  # Revert last 3 commits
```

### Rollback Everything
```bash
git revert HEAD~4  # Revert all 4 phase commits
```

Event definitions from Phase 1 are safe to keep (additive only).

---

## Success Metrics

### Technical Metrics
- ✅ 100% of cross-module calls use events (0% direct store access)
- ✅ All event definitions documented in `events.ts` files
- ✅ ESLint catches 100% of violations
- ✅ 0 failing tests

### Developer Experience
- ✅ Clear pattern to follow (use events for cross-module)
- ✅ Compile-time errors for violations
- ✅ Self-documenting event contracts
- ✅ Easy to test (mock events)

### Maintainability
- ✅ Modules truly independent
- ✅ Safe to refactor internals
- ✅ Clear module boundaries
- ✅ Scalable architecture

---

## Timeline Summary

| Phase | Tasks | Time | Risk |
|-------|-------|------|------|
| Phase 1 | Complete event definitions | 2-4h | Low |
| Phase 2 | Add store listeners | 4-6h | Medium |
| Phase 3 | Migrate external callers | 6-8h | Medium |
| Phase 4 | Enforce & document | 2-3h | Low |
| **Total** | **16 tasks** | **14-21h** | **Medium** |

**Recommended Schedule:**
- Week 1: Phase 1 & 2 (Foundation)
- Week 2: Phase 3 (Migration)
- Week 3: Phase 4 (Polish & enforce)

---

## Getting Started

To begin implementation:

1. **Create feature branch:**
   ```bash
   git checkout -b feat/event-driven-architecture
   ```

2. **Start with Phase 1:**
   - Begin with Task 1.1 (Document events)
   - Test after each task
   - Commit frequently

3. **Use this document:**
   - Check off tasks as you complete them
   - Follow code examples exactly
   - Run tests after each task

4. **Get help if stuck:**
   - Review `docs/EVENT_COMMUNICATION.md`
   - Check existing event patterns
   - Ask in team chat

---

## Contact & Support

**Questions?** Check:
- `docs/EVENT_COMMUNICATION.md` - Event system overview
- `docs/EVENT_DRIVEN_IMPROVEMENTS.md` - Problem analysis
- `CLAUDE.md` - Coding guidelines

**Blockers?** Review:
- Rollback plan above
- Risk mitigation strategies
- Alternative approaches in improvement docs

---

**Ready to begin? Start with Phase 1, Task 1.1!** 🚀
