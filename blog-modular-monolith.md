# Building Modular Monoliths: Lessons from MarkVim

Modern frontend applications grow complex fast. You start with a few components, add some state, wire up a few features, and suddenly you face a tangled mess where everything depends on everything. Teams struggle to understand where code belongs, changes ripple across the codebase, and refactoring becomes scary.

Modular monoliths offer a middle path. You organize code into independent modules within a single application, gaining the benefits of clear boundaries without the complexity of microservices. This architecture works particularly well for frontend applications where you need fast iteration but sustainable growth.

I'll show you how we built MarkVim—a Markdown editor with Vim mode—using modular architecture, the challenges we faced, and the tools we used to enforce our boundaries.

## The Application: MarkVim

MarkVim combines a CodeMirror-based editor with live Markdown preview, Vim keybindings, document management, theme customization, and document sharing. Built with Nuxt 3, Pinia, and UnoCSS, it demonstrates modular architecture in a real production application.

**Core features:**
- Multi-document management with localStorage persistence
- CodeMirror 6 editor with full Vim mode support
- Live Markdown preview with Mermaid diagrams
- Customizable OKLCH color themes
- Document sharing via compressed links
- Keyboard shortcuts and command palette
- Responsive layout with resizable panes

Each feature lives in its own module. Modules communicate through well-defined APIs. Shared utilities remain generic and reusable.

## The Flat Approach (What We Left Behind)

Traditional Vue/Nuxt projects organize code by technical layer:

```
src/
├── components/
│   ├── DocumentList.vue
│   ├── DocumentItem.vue
│   ├── EditorMarkdown.vue
│   ├── MarkdownPreview.vue
│   ├── ColorThemePicker.vue
│   ├── ShareButton.vue
│   └── ShortcutsPalette.vue
├── composables/
│   ├── useDocuments.ts
│   ├── useEditor.ts
│   ├── useColorTheme.ts
│   ├── useShare.ts
│   └── useShortcuts.ts
├── store/
│   ├── documents.ts
│   ├── colorTheme.ts
│   └── featureFlags.ts
└── utils/
    ├── markdown.ts
    ├── colors.ts
    └── storage.ts
```

This structure groups files by **what they are** (components, composables, stores), not **what they do**. Finding all code related to document management means jumping between four directories. Nothing prevents the color theme picker from directly accessing document store internals. Dependencies flow in every direction.

As features grow, this becomes painful:
- **No boundaries**: Components import from any store, composable, or utility
- **Hidden dependencies**: Changing document storage breaks the share feature
- **Unclear ownership**: Who maintains markdown rendering utilities?
- **Difficult refactoring**: Extracting a feature requires hunting through every folder

## The Modular Approach

We organize MarkVim by **feature** (business domain), not technical layer:

```
src/
├── app/
│   └── AppShell.vue           # Composition root
├── modules/
│   ├── color-theme/
│   │   ├── api.ts             # Public interface
│   │   ├── store.ts           # State (internal)
│   │   ├── components/        # UI (internal)
│   │   │   ├── ColorThemeModal.vue
│   │   │   ├── ColorThemePicker.vue
│   │   │   └── ColorThemeSliderChannel.vue
│   │   └── utils/             # Business logic (internal)
│   │       └── color-definitions.ts
│   ├── documents/
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── components/
│   │   │   ├── DocumentList.vue
│   │   │   ├── DocumentItem.vue
│   │   │   └── DocumentModalDelete.vue
│   │   ├── composables/
│   │   │   └── useDocumentDeletion.ts
│   │   └── utils/
│   │       ├── document-title.ts
│   │       └── update-handlers.ts
│   ├── editor/
│   │   ├── api.ts
│   │   ├── components/
│   │   │   └── EditorMarkdown.vue
│   │   └── composables/
│   │       ├── useVimMode.ts
│   │       └── useEditorSettings.ts
│   ├── markdown-preview/
│   ├── share/
│   └── shortcuts/
└── shared/
    ├── components/            # Generic UI components
    ├── composables/           # Cross-cutting concerns
    ├── utils/                 # Pure utility functions
    ├── types/                 # Shared type definitions
    └── api/                   # Cross-module facades
```

Each module owns everything related to its feature. The `api.ts` file acts as the module's **public contract**—the only entry point for external code.

### The Public API Pattern

Every module exposes a facade through `api.ts`. Here's how documents module defines its public interface:

```typescript
// modules/documents/api.ts - PUBLIC FACADE
export function useDocuments(): {
  // Readonly state
  documents: Ref<Document[]>
  activeDocument: Ref<Document | null>
  activeDocumentTitle: Ref<string>

  // Helper methods
  getDocumentTitle: (content: string) => string
  getDocumentById: (id: string) => Document | undefined

  // Actions
  createDocument: (content?: string) => string | void
  selectDocument: (documentId: string) => void
  updateDocument: (documentId: string, content: string) => void
  deleteDocument: (documentId: string) => void
  importDocument: (content: string) => string | void
} {
  const store = useDocumentsStore() // Internal implementation
  const { documents, activeDocument } = storeToRefs(store)

  return {
    documents,
    activeDocument,
    activeDocumentTitle,
    getDocumentTitle: store.getDocumentTitle,
    getDocumentById: store.getDocumentById,
    createDocument: (content?) =>
      store.dispatch({ type: 'CREATE_DOCUMENT', payload: content ? { content } : undefined }),
    selectDocument: (documentId) =>
      store.dispatch({ type: 'SELECT_DOCUMENT', payload: { documentId } }),
    updateDocument: (documentId, content) =>
      store.dispatch({ type: 'UPDATE_DOCUMENT', payload: { documentId, content } }),
    deleteDocument: (documentId) =>
      store.dispatch({ type: 'DELETE_DOCUMENT', payload: { documentId } }),
    importDocument: (content) =>
      store.dispatch({ type: 'ADD_DOCUMENT', payload: { content } }),
  }
}
```

The facade wraps internal store implementation, exposing only what other modules need. Store details remain private. Other modules never import `useDocumentsStore` directly.

### Internal Store Implementation

Inside each module, we use The Elm Architecture (TEA) pattern with Pinia:

```typescript
// modules/documents/store.ts - INTERNAL ONLY
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

function update(currentState: DocumentsState, message: DocumentMessage): DocumentsState {
  switch (message.type) {
    case 'CREATE_DOCUMENT':
      return handleCreateDocument(currentState, message.payload)
    case 'SELECT_DOCUMENT':
      return handleSelectDocument(currentState, message.payload)
    case 'UPDATE_DOCUMENT':
      return handleUpdateDocument(currentState, message.payload)
    case 'DELETE_DOCUMENT':
      return handleDeleteDocument(currentState, message.payload)
    default:
      return currentState
  }
}

export const useDocumentsStore = defineStore('documents', () => {
  const _state = useLocalStorage<DocumentsState>('markvim-documents', {
    documents: [defaultDoc],
    activeDocumentId: defaultDoc.id,
  })

  const documents = computed(() =>
    [..._state.value.documents].sort((a, b) => b.updatedAt - a.updatedAt)
  )

  const activeDocument = computed(() =>
    documents.value.find(doc => doc.id === _state.value.activeDocumentId)
  )

  function dispatch(message: DocumentMessage): string | void {
    const newState = update(_state.value, message)
    _state.value = newState

    if (message.type === 'CREATE_DOCUMENT' || message.type === 'ADD_DOCUMENT') {
      return newState.activeDocumentId
    }
  }

  return {
    state: readonly(_state),
    documents,
    activeDocument,
    dispatch,
  }
})
```

The store uses pure functions for state updates, making logic testable and predictable. But this complexity stays hidden—consumers only see the clean facade.

## The Central Challenge: Modules vs Shared

The hardest question in modular architecture: **What belongs in a module versus shared?**

### Bad Decisions Create Pain

Put too much in shared, and you lose modularity:
- Generic utilities accumulate feature-specific code
- Shared composables depend on multiple modules
- Changes to "shared" code break everything

Put too little in shared, and you duplicate code:
- Every module implements its own debounce
- Multiple modules parse the same data format
- Testing utilities exist in five places

### Our Decision Framework

We follow these guidelines:

**Shared gets:**
1. **Generic utilities with zero business logic**
   - `debounce.ts` - timing utility used across features
   - `result.ts` - Result type for error handling
   - `eventBus.ts` - typed event system infrastructure

2. **Cross-cutting technical concerns**
   - `useResizablePanes.ts` - layout behavior used by app shell
   - `useSyncedScroll.ts` - editor-preview synchronization
   - `useViewMode.ts` - viewport state management

3. **Infrastructure and contracts**
   - `DocumentRepository.ts` - interface defining storage contract
   - `StorageService.ts` - localStorage abstraction
   - `Document.ts` - shared type used by multiple modules

4. **Truly reusable UI components**
   - `BaseLayout.vue` - structural wrapper
   - `ResizableSplitter.vue` - generic split pane control
   - `LayoutHeader.vue` - app-level header

**Modules get:**
1. **Feature-specific business logic**
   - `document-title.ts` - extracts title from markdown (documents module)
   - `color-definitions.ts` - OKLCH color calculations (color-theme module)
   - `markdown.ts` - markdown-it configuration (markdown-preview module)

2. **Feature-specific UI**
   - `DocumentList.vue` - specific to document management
   - `ColorThemePicker.vue` - specific to theme customization
   - `EditorMarkdown.vue` - specific to editor functionality

3. **Feature-specific state**
   - Document list and active document (documents module)
   - Color theme values (color-theme module)
   - Editor settings and Vim mode (editor module)

### Example: Where Does getDocumentTitle Belong?

`getDocumentTitle` extracts the first heading from markdown content. Initially, you might think "shared utility—it works with markdown!" But:

1. **It's business logic**: Defining what makes a document title is a business rule
2. **It has a single user**: Only documents module cares about document titles
3. **It may evolve**: Requirements for title extraction might become more complex
4. **It creates coupling**: If shared, changes require coordinating with all modules

We put it in `modules/documents/utils/document-title.ts` and export it through `documents/api.ts` for any module that needs it:

```typescript
// modules/documents/utils/document-title.ts
export function getDocumentTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim() ?? ''
  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, '') || 'Untitled'
  }
  return firstLine || 'Untitled'
}

// modules/documents/api.ts
export { getDocumentTitle } from './utils/document-title'

// modules/share/composables/useDocumentShare.ts
import { getDocumentTitle } from '~/modules/documents/api'

const shareableDoc: ShareableDocument = {
  title: getDocumentTitle(document.content),
  // ...
}
```

Share module imports from documents' public API—clear, explicit, and enforceable.

## Keeping Modules Encapsulated

Encapsulation means modules hide their internals and expose only their public API. Here's how we enforce this:

### 1. Internal Implementation Stays Private

Components, stores, and utilities inside modules are **internal by default**. Only `api.ts` exports public interfaces:

```typescript
// ✅ Correct: Import via public API
import { useDocuments, DocumentList } from '~/modules/documents/api'

const { documents, createDocument } = useDocuments()

// ❌ Wrong: Direct import of internal implementation
import { useDocumentsStore } from '~/modules/documents/store'
import DocumentList from '~/modules/documents/components/DocumentList.vue'
```

### 2. Facades Enforce Contracts

The facade pattern creates a stable contract between modules. Store implementations use TEA internally, but consumers only see simple function calls:

```typescript
// AppShell.vue - The composition root
import { useDocuments } from '~/modules/documents/api'
import { useColorTheme } from '~/modules/color-theme/api'

const { activeDocument, updateDocument } = useDocuments()
const { theme, updateColor } = useColorTheme()

// Direct action calls - no knowledge of stores or messages
updateDocument(activeDocument.value.id, newContent)
updateColor('accent', { l: 0.6, c: 0.2, h: 240 })
```

### 3. Single Responsibility

Each module owns one feature domain:
- **documents**: CRUD operations, active document, persistence
- **editor**: CodeMirror setup, Vim bindings, editor settings
- **markdown-preview**: Rendering markdown, Mermaid diagrams
- **color-theme**: OKLCH color picker, theme persistence
- **share**: Compression, base64 encoding, URL generation
- **shortcuts**: Keyboard shortcuts, command palette

Modules don't leak concerns. The editor doesn't know about documents. The preview doesn't manage editor state. Share doesn't handle persistence.

### 4. Explicit Dependencies

When modules need each other, they import through public APIs. In `ShareManager.vue`, we combine three modules:

```vue
<script setup lang="ts">
import { useDocuments } from '~/modules/documents/api'
import { useDocumentShare } from '~/modules/share/api'
import { useViewMode } from '~/shared/api/layout'

const { importDocument } = useDocuments()
const { parseShareUrl, clearShareFromUrl } = useDocumentShare()
const { setViewMode } = useViewMode()

function handleAutoImport(document: Document): void {
  importDocument(document.content)  // Documents facade
  setViewMode('preview')             // Layout facade
  clearShareFromUrl()                // Share facade
}
</script>
```

Dependencies are visible, typed, and traceable. No hidden coupling through global state or magic auto-imports.

## The App Shell Pattern

MarkVim uses a single-page application shell that composes all modules. `AppShell.vue` acts as the **composition root**:

```vue
<script setup lang="ts">
import { ColorThemeModal, useColorTheme } from '~/modules/color-theme/api'
import { DocumentList, DocumentManagerAction, useDocuments } from '~/modules/documents/api'
import { EditorMarkdown, useEditorSettings } from '~/modules/editor/api'
import { MarkdownPreview } from '~/modules/markdown-preview/api'
import { ShareManager } from '~/modules/share/api'
import { ShortcutsManager } from '~/modules/shortcuts/api'
import { LayoutHeader, LayoutStatusBar, useResizablePanes, useViewMode } from '~/shared/api/layout'

const { documents, activeDocument, updateDocument } = useDocuments()
const { settings } = useEditorSettings()
const { viewMode, setViewMode } = useViewMode()
const { leftPaneWidth, rightPaneWidth, startDrag } = useResizablePanes()

useColorTheme()  // Initialize theme system

function handleContentUpdate(value: string): void {
  if (activeDocument.value) {
    updateDocument(activeDocument.value.id, value)
  }
}
</script>

<template>
  <div class="flex flex-col h-screen">
    <LayoutHeader
      :view-mode="viewMode"
      :active-document-title="activeDocumentTitle"
      @update:view-mode="setViewMode"
    />

    <div class="flex flex-1">
      <DocumentList
        v-if="isSidebarVisible"
        :documents="documents"
        :active-document-id="activeDocumentId"
      />

      <main class="flex flex-1">
        <EditorMarkdown
          v-if="isEditorVisible"
          :content="activeDocument?.content || ''"
          :settings="settings"
          @update:content="handleContentUpdate"
        />

        <MarkdownPreview
          v-if="isPreviewVisible"
          :content="activeDocument?.content || ''"
        />
      </main>
    </div>

    <LayoutStatusBar />

    <ShortcutsManager />
    <DocumentManagerAction />
    <ShareManager />
    <ColorThemeModal />
  </div>
</template>
```

The app shell:
1. **Imports** all top-level module components
2. **Wires** data between modules (documents → editor, editor → preview)
3. **Handles** cross-module coordination (view mode affects layout)
4. **Remains** simple—no business logic, just composition

### Multi-Site Scenario

MarkVim has one page, so one app shell suffices. In multi-site applications, you create multiple shells:

```
src/
├── app/
│   ├── shells/
│   │   ├── MarketingShell.vue    # Landing pages
│   │   ├── DashboardShell.vue    # Admin area
│   │   └── EditorShell.vue       # Editor workspace
├── modules/
│   ├── auth/
│   ├── billing/
│   ├── documents/
│   └── analytics/
└── pages/
    ├── index.vue                 # Uses MarketingShell
    ├── dashboard.vue             # Uses DashboardShell
    └── editor/[id].vue           # Uses EditorShell
```

Each shell composes different module subsets:
- **MarketingShell**: auth module only
- **DashboardShell**: auth + billing + analytics modules
- **EditorShell**: auth + documents + editor + share modules

Modules remain independent. Shells determine which features combine for each user journey.

## Module Communication Patterns

Modules communicate through two mechanisms: **facade method calls** for state mutations, and **events** for notifications.

### Pattern 1: Facade Method Calls (State Mutations)

When one module needs to change another module's state, it calls facade methods:

```vue
<script setup lang="ts">
// share/components/ShareManager.vue
import { useDocuments } from '~/modules/documents/api'

const { importDocument } = useDocuments()

function handleImportConfirm(document: Document): void {
  // Direct mutation via facade - clear, type-safe, traceable
  importDocument(document.content)

  clearShareFromUrl()
  showImportDialog.value = false
}
</script>
```

**Benefits:**
- **Type-safe**: TypeScript ensures correct parameters
- **Traceable**: IDE go-to-definition shows exactly what happens
- **Testable**: Easy to mock facades in tests
- **Explicit**: Dependencies visible in imports

### Pattern 2: Events (Notifications and UI Coordination)

For notifications and UI coordination that doesn't change state, we use a typed event bus:

```typescript
// shared/utils/eventBus.ts
export interface AppEvents extends
  DocumentsEvents,
  EditorEvents,
  ColorThemeEvents,
  ShortcutsEvents,
  LayoutEvents {}

export function emitAppEvent<K extends AppEventKey>(
  key: K,
  payload: AppEvents[K]
): void {
  const bus = useEventBus<AppEvents[K]>(key)
  bus.emit(payload)
}

export function onAppEvent<K extends AppEventKey>(
  key: K,
  handler: (payload: AppEvents[K]) => void
): (() => void) {
  const bus = useEventBus(key)
  const off = bus.on(handler)
  tryOnScopeDispose(off)
  return off
}
```

Modules define their own events:

```typescript
// modules/documents/events.ts
export interface DocumentsEvents {
  'document:create': undefined
  'document:delete': { documentId: string }
  'document:created': { documentId: string }
  'document:updated': { documentId: string, content: string }
}

// modules/shortcuts/composables/useShortcuts.ts
import { emitAppEvent } from '~/shared/utils/eventBus'

function registerShortcuts() {
  // Emit event to open modal
  emitAppEvent('document:create')
}

// modules/documents/components/DocumentManagerAction.vue
import { onAppEvent } from '~/shared/utils/eventBus'

onAppEvent('document:create', () => {
  showCreateModal.value = true
})
```

**Events work for:**
- Opening modals/dialogs: `'command-palette:open'`
- UI notifications: `'document:created'`
- Analytics/logging: `'document:updated'`
- Side effects: `'theme:changed'`

**Events DON'T work for:**
- State mutations (use facade methods)
- Returning values (use facade methods)
- Required responses (use facade methods)

### When to Use Each Pattern

| Scenario | Pattern | Example |
|----------|---------|---------|
| Create a document | Facade | `createDocument(content)` |
| Update theme color | Facade | `updateColor('accent', color)` |
| Get active document | Facade | `const doc = activeDocument.value` |
| Open command palette | Event | `emitAppEvent('command-palette:open')` |
| Show delete confirmation | Event | `emitAppEvent('document:delete', { id })` |
| Log analytics | Event | `onAppEvent('document:created', track)` |

**Rule of thumb:** If it changes state or returns data, use facades. If it triggers UI or notifies, use events.

## Enforcing Architecture with Tooling

Good intentions fade without enforcement. We use **Dependency Cruiser** to automatically validate architectural rules in CI:

```javascript
// .dependency-cruiser.cjs
module.exports = {
  forbidden: [
    {
      name: 'no-cross-module-imports',
      comment: 'Modules can only communicate via public api.ts facades',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: [
          '^src/modules/$1/',              // Same module OK
          '^src/modules/[^/]+/api\\.ts$',  // Public API OK
        ],
      },
    },

    {
      name: 'no-internal-imports',
      comment: 'Internal implementation cannot be imported from outside the module',
      severity: 'error',
      from: { pathNot: '^src/modules/([^/]+)/' },
      to: { path: '^src/modules/([^/]+)/(store\\.ts$|composables/|utils/|components/)' },
    },

    {
      name: 'modules-only-import-shared',
      comment: 'Modules should only import from shared/, types/, or other module APIs',
      severity: 'error',
      from: { path: '^src/modules/' },
      to: {
        path: '^src/',
        pathNot: [
          '^src/shared/',
          '^src/types/',
          '^src/modules/[^/]+/api\\.ts$',
          '^src/modules/[^/]+/',  // Same module
        ],
      },
    },

    {
      name: 'shared-no-module-imports',
      comment: 'Shared code cannot depend on feature modules',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: '^src/modules/' },
    },

    {
      name: 'no-circular',
      comment: 'Circular dependencies create tight coupling',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
}
```

### Validation in Development and CI

```bash
# Validate all dependency rules
pnpm depcruise

# CI format (used in GitHub Actions)
pnpm depcruiser:ci

# Generate module dependency graph
pnpm depcruise:graph:modules

# Generate architecture diagram
pnpm depcruise:archi
```

When someone tries to break the rules:

```typescript
// ❌ This fails validation
import { useDocumentsStore } from '~/modules/documents/store'
```

```
error no-internal-imports: src/modules/share/composables/useDocumentShare.ts →
  src/modules/documents/store.ts

Internal implementation cannot be imported from outside the module. Use api.ts instead.
```

CI blocks the PR until fixed. No reviews needed—tooling enforces architecture automatically.

### Additional Tooling

**Knip** detects unused exports, helping maintain clean module APIs:

```bash
# Check for unused exports
pnpm knip:exports

# Full unused code detection
pnpm knip
```

If you export something from `api.ts` that nobody uses, Knip catches it. Keep APIs minimal and intentional.

## Key Takeaways

Building MarkVim taught us several lessons about modular monoliths:

### 1. Modules Organize by Feature, Not Technology

Group code by what it does (documents, editor, themes) rather than what it is (components, stores, utils). Related code lives together. Changes stay local.

### 2. The Facade Pattern Creates Clean APIs

Every module exposes a single `api.ts` file. Internal implementation—stores, components, utilities—stays private. Consumers only see clean, documented interfaces.

### 3. Shared Code Needs Discipline

Fight the urge to put everything in `shared/`. Only truly generic, reusable utilities belong there. Feature-specific code, even if used by multiple modules, belongs in the appropriate feature module's public API.

### 4. Facades Beat Events for State

When modules need to change each other's state, direct facade method calls work better than events. They're type-safe, traceable, and testable. Reserve events for notifications and UI coordination.

### 5. The App Shell Composes Modules

The composition root (app shell) imports top-level components from each module and wires them together. It handles cross-module coordination but contains no business logic.

### 6. Tooling Enforces Architecture

Good architecture needs automated enforcement. Dependency Cruiser validates import rules in CI, preventing architectural decay before it starts.

### 7. Start Small, Grow Thoughtfully

Begin with 2-3 modules for major features. Extract new modules when features emerge. Avoid premature modularization—wait until boundaries become clear.

## Conclusion

Modular monoliths give you the boundaries of microservices without the complexity. For frontend applications, this architecture offers:
- **Clear ownership**: Each module owns its feature domain
- **Sustainable growth**: Add features without expanding global complexity
- **Safe refactoring**: Change internals without breaking other modules
- **Better testing**: Test modules in isolation
- **Easier onboarding**: New developers understand one module at a time

MarkVim demonstrates these principles in a real production application. Six modules, clear boundaries, and automated enforcement create a codebase that scales without breaking.

Start with your messiest feature area. Extract it into a module. Add an `api.ts` facade. Set up dependency validation. Then repeat for the next feature.

You'll build applications that grow cleanly, refactor safely, and make sense six months later.

---

**Resources:**
- [MarkVim Source Code](https://github.com/alexanderopalic/markvim)
- [Dependency Cruiser](https://github.com/sverweij/dependency-cruiser)
- [The Elm Architecture](https://guide.elm-lang.org/architecture/)
- [Module Boundaries in Frontend](https://martinfowler.com/articles/modular-monoliths.html)
