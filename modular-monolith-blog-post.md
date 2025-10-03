# How to Build a Modular Monolith with Vue 3 and Nuxt

Published: [Date]

💪
TL;DR

Single codebase with clear module boundaries. Nuxt 3 + Vue 3 + Pinia. Each module exports a public API (`api.ts`). Typed event bus for cross-module communication. ESLint enforces boundaries. Public/private store pattern. Domain module for shared types. Component auto-import from modules.

Code: https://github.com/yourusername/MarkVim

⚠️
Who should read this

You know Vue and Nuxt basics. You want to scale a monolith without jumping to microservices. You need clear module boundaries in a single codebase. If you have multiple teams requiring independent deployments, you might need microfrontends or microservices instead.

I built MarkVim to explore how far you can push a modular monolith before needing distributed architecture. This post shows the patterns that work.

## Scope

We build a modular monolith for a Vue 3 SPA using Nuxt. The focus is on organizing code around business capabilities with enforced boundaries, not on distributed systems or microservices.

## What is a Modular Monolith?

A modular monolith is a single deployable application organized into modules that represent business capabilities. Each module has:

- **Clear boundaries** - explicit public API, internal implementation hidden
- **Loose coupling** - modules communicate through events or public APIs
- **High cohesion** - related features live together

Unlike a microservices architecture, everything runs in one process and deploys as one unit. Unlike a traditional monolith, you cannot accidentally create spaghetti code across domains.

## MarkVim in one minute

MarkVim is a markdown editor with vim mode support. It demonstrates real-world module boundaries:

- **Documents** - CRUD operations and persistence
- **Editor** - CodeMirror integration with vim bindings
- **Preview** - Live markdown rendering with Mermaid diagrams
- **Layout** - Resizable panes, header, status bar
- **Shortcuts** - Command palette and keyboard shortcuts
- **Share** - Import and export documents
- **Color Theme** - OKLCH color customization
- **Domain** - Shared types and contracts

![MarkVim Application](placeholder-screenshot.png)
*MarkVim: A modular markdown editor demonstrating module boundaries*

## Architecture decisions

| Question | Decision | Notes |
|----------|----------|-------|
| Code organization | Modules under `src/modules/` | Each module represents a business capability |
| Module boundaries | ESLint enforced API pattern | Only `import from '~/modules/X/api'` allowed |
| Communication | Typed event bus (VueUse) | Low coupling, explicit contracts |
| State management | Pinia with public/private pattern | Mutations only via events |
| Shared types | Domain module | Document types, contracts, schemas |
| Component discovery | Nuxt auto-import | Scans module component folders |
| Styling | UnoCSS + scoped styles | Module-local styles prevent leaks |
| Type safety | TypeScript strict mode | Catch boundary violations at compile time |

## Repository layout

```
src/
├── modules/
│   ├── documents/          # Document CRUD and persistence
│   │   ├── api.ts         # PUBLIC interface
│   │   ├── events.ts      # Event type definitions
│   │   ├── store.ts       # Pinia store
│   │   ├── components/    # Vue components
│   │   ├── composables/   # Reusable logic
│   │   └── defaultContent.ts
│   ├── editor/            # CodeMirror + vim mode
│   ├── markdown-preview/  # Markdown rendering
│   ├── layout/            # Header, status, panes
│   ├── shortcuts/         # Command palette
│   ├── color-theme/       # Theme customization
│   ├── share/             # Import/export
│   └── domain/            # Shared types
│       ├── api.ts
│       ├── types/
│       ├── contracts/
│       └── schemas/
├── shared/
│   ├── components/        # Reusable UI
│   ├── composables/       # Shared logic
│   ├── utils/             # Event bus, helpers
│   └── ui/                # Design tokens
└── app/
    └── AppShell.vue       # Composes all modules
```

## High level view

```
┌─────────────────────────────────────────────────┐
│              AppShell.vue                       │
│  (imports from module APIs only)                │
└─────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │documents│   │  editor  │   │  layout  │
   │   /api  │   │   /api   │   │   /api   │
   └─────────┘   └──────────┘   └──────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Typed Event    │
              │      Bus        │
              └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Domain Module   │
              │ (shared types)  │
              └─────────────────┘
```

Each module depends only on the domain module and the event bus. The app shell composes modules. Modules never import from each other directly.

## Implementation

### Module structure pattern

💡 Every module follows the same structure

Each module under `src/modules/` has this layout:

```
documents/
├── api.ts              # PUBLIC: only file other modules can import
├── events.ts           # Event type definitions
├── store.ts            # Pinia store (private implementation)
├── components/         # Vue components
│   ├── DocumentList.client.vue
│   ├── DocumentActionManager.vue
│   └── ...
├── composables/        # Reusable logic
│   ├── useActiveDocument.ts
│   ├── useDocumentsProxy.ts
│   └── ...
├── defaultContent.ts   # Module-private utilities
└── (no internal/ folder in this module)
```

The rule: **other modules can only import from `api.ts`**. Everything else is private.

### The API pattern

The `api.ts` file defines what a module exposes. Here is the documents module API:

```ts
// src/modules/documents/api.ts

// Components
export { default as DocumentActionManager } from './components/DocumentActionManager.vue'
export { default as DocumentList } from './components/DocumentList.client.vue'
export { default as DocumentListSkeleton } from './components/DocumentListSkeleton.vue'

// Composables
export { useActiveDocument } from './composables/useActiveDocument'
export { useDocumentsProxy } from './composables/useDocumentsProxy'

// Events
export type { DocumentsEvents } from './events'

// Store (read-only)
export { useDocumentsStore } from './store'

// Types
export type { Document } from '~/modules/domain/api'

// Utilities
export function getDocumentTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim() ?? ''
  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, '') || 'Untitled'
  }
  return firstLine || 'Untitled'
}
```

What this exports:
- **Components** that other modules render
- **Composables** for read and write operations
- **Event types** for typed communication
- **Store** for read-only reactive state
- **Utilities** for common operations

What stays hidden:
- Store mutations (only via events)
- Internal helpers
- Private composables

The app shell imports everything it needs from module APIs:

```ts
// src/app/AppShell.vue
import { ColorThemeModal, useColorThemeStore } from '~/modules/color-theme/api'
import { DocumentActionManager, DocumentList, useActiveDocument, useDocumentsProxy } from '~/modules/documents/api'
import { MarkdownEditor, useEditorSettings } from '~/modules/editor/api'
import { HeaderToolbar, StatusBar, useResizablePanes, useViewMode } from '~/modules/layout/api'
import { MarkdownPreview } from '~/modules/markdown-preview/api'
import { ShareManager } from '~/modules/share/api'
import { ShortcutsManager } from '~/modules/shortcuts/api'
```

Clean. Explicit. No surprises.

### Enforcing boundaries with ESLint

📢 Rules, not discipline

You can document module boundaries in a wiki. Developers will still forget. Use ESLint to enforce them.

Here is the rule that blocks deep imports:

```js
// eslint.config.mjs
const modules = [
  'color-theme',
  'documents',
  'editor',
  'layout',
  'markdown-preview',
  'share',
  'shortcuts',
  'domain',
]

const restrictedPatterns = []
modules.forEach((module) => {
  restrictedPatterns.push({
    group: [`~/modules/${module}/**`, `!~/modules/${module}/api`],
    message: `Direct imports to module internals are not allowed. Use the public API instead: import from '~/modules/${module}/api'`,
  })
})

export default antfu({
  // ... other config
}, {
  rules: {
    'no-restricted-imports': ['error', { patterns: restrictedPatterns }],
  },
})
```

Try to import `~/modules/documents/store` directly? ESLint fails the build. The only way through is `~/modules/documents/api`.

This keeps boundaries real. No exceptions.

### Typed event bus

💪 The event bus is the backbone

Modules communicate through a typed event bus built on VueUse. No shared global store. No direct function calls across modules.

Why this works:
- **Low coupling** - modules do not import each other
- **Explicit contracts** - event types are part of module API
- **Visible dependencies** - if module A emits module B events, it imports B's types
- **No circular deps** - event bus imports from modules, not vice versa

Each module defines its events:

```ts
// src/modules/documents/events.ts
export interface DocumentsEvents {
  'document:delete': {
    documentId: string
    documentTitle: string
  }
  'document:delete-confirmed': {
    documentId: string
  }
  'document:select': {
    documentId: string
  }
  'document:create': undefined
  'document:update': {
    documentId: string
    content: string
  }
  'documents:add': {
    content: string
  }
  'documents:import': {
    content: string
  }
}
```

The event bus aggregates all module events:

```ts
// src/shared/utils/eventBus.ts
import type { DocumentsEvents } from '~/modules/documents/api'
import type { EditorEvents } from '~/modules/editor/api'
import type { LayoutEvents } from '~/modules/layout/api'
import type { ShortcutsEvents } from '~/modules/shortcuts/api'
import type { SharedEvents } from '../events'

export interface AppEvents extends
  DocumentsEvents,
  EditorEvents,
  LayoutEvents,
  ShortcutsEvents,
  SharedEvents {}

export type AppEventKey = keyof AppEvents

export function emitAppEvent<K extends AppEventKey>(
  key: K,
  ...args: AppEvents[K] extends undefined ? [] | [undefined] : [AppEvents[K]]
): void {
  const bus = useEventBus<AppEvents[K]>(key)
  bus.emit(args[0] as AppEvents[K])
}

export function onAppEvent<K extends AppEventKey>(
  key: K,
  handler: (payload: AppEvents[K]) => void,
) {
  const bus = useEventBus(key)
  const off = bus.on(handler)
  tryOnScopeDispose(off)
  return off
}
```

TypeScript knows every event and its payload. Emit an event with the wrong payload? Compile error.

Example: the app shell emits `document:update` when content changes:

```ts
// src/app/AppShell.vue
function handleContentUpdate(value: string) {
  if (activeDocument.value) {
    emitAppEvent('document:update', { documentId: activeDocument.value.id, content: value })
  }
}
```

The documents store listens and updates localStorage:

```ts
// src/modules/documents/store.ts (private)
onAppEvent('document:update', (payload) => {
  updateDocument(payload.documentId, payload.content)
})

function updateDocument(id: string, content: string): void {
  const docIndex = _documents.value.findIndex(d => d.id === id)
  if (docIndex !== -1) {
    const doc = _documents.value[docIndex]
    if (doc) {
      _documents.value[docIndex] = {
        ...doc,
        content,
        updatedAt: Date.now(),
      }
    }
  }
}
```

One event. One listener. Clear flow.

### Public/private store pattern

The documents module uses a two-tier Pinia store:

1. **Private store** - holds state and actions, listens to events
2. **Public store** - read-only computed properties, no mutations

Why split them?

- **Enforce event-driven mutations** - outside code cannot call store actions directly
- **Clear read/write boundary** - read from public store, write via events
- **Easy testing** - mock event bus, not store internals

Here is the private store (simplified):

```ts
// src/modules/documents/store.ts
export const useDocumentsStorePrivate = defineStore('documents-private', () => {
  const _documents = useLocalStorage<Document[]>('markvim-documents', [defaultDoc])
  const _activeDocumentId = useLocalStorage('markvim-active-document-id', defaultDoc.id)

  const documents = computed(() => {
    return [..._documents.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const activeDocument = computed(() => {
    return documents.value.find(doc => doc.id === _activeDocumentId.value) ?? documents.value[0] ?? null
  })

  function createDocument(content?: string): string {
    const now = Date.now()
    const newDoc: Document = {
      id: crypto.randomUUID(),
      content: content || '# New Note\n\nStart writing...',
      createdAt: now,
      updatedAt: now,
    }
    _documents.value.unshift(newDoc)
    _activeDocumentId.value = newDoc.id
    return newDoc.id
  }

  function updateDocument(id: string, content: string): void {
    const docIndex = _documents.value.findIndex(d => d.id === id)
    if (docIndex !== -1) {
      const doc = _documents.value[docIndex]
      if (doc) {
        _documents.value[docIndex] = {
          ...doc,
          content,
          updatedAt: Date.now(),
        }
      }
    }
  }

  function deleteDocument(id: string): void {
    const docIndex = _documents.value.findIndex(d => d.id === id)
    if (docIndex === -1) return
    _documents.value.splice(docIndex, 1)
    if (_activeDocumentId.value === id) {
      if (_documents.value.length === 0) {
        createDocument()
      } else {
        _activeDocumentId.value = _documents.value[0]?.id ?? ''
      }
    }
  }

  // Listen to events
  onAppEvent('document:create', () => createDocument())
  onAppEvent('document:select', (payload) => setActiveDocument(payload.documentId))
  onAppEvent('document:update', (payload) => updateDocument(payload.documentId, payload.content))
  onAppEvent('document:delete-confirmed', (payload) => deleteDocument(payload.documentId))

  return {
    documents,
    activeDocument,
    activeDocumentId,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentTitle,
    getDocumentById,
  }
})
```

The private store listens to events and mutates state. It is exported but not in the public API.

Here is the public store:

```ts
// src/modules/documents/store.ts
export const useDocumentsStore = defineStore('documents', () => {
  const privateStore = useDocumentsStorePrivate()

  return {
    // Read-only computed - no mutations
    documents: computed(() => privateStore.documents),
    activeDocument: computed(() => privateStore.activeDocument),
    activeDocumentId: computed(() => privateStore.activeDocumentId),

    // Utility functions that don't mutate
    getDocumentTitle: privateStore.getDocumentTitle,
    getDocumentById: privateStore.getDocumentById,
  }
})
```

The public store is in `api.ts`. Components import it and read state. To change state, they emit events.

For cases where direct store access is needed (like within the module itself), a proxy composable provides safe access:

```ts
// src/modules/documents/composables/useDocumentsProxy.ts
export function useDocumentsProxy() {
  const store = useDocumentsStore()
  const privateStore = useDocumentsStorePrivate()

  return {
    // Read-only reactive state
    documents: computed(() => store.documents),
    activeDocumentId: computed(() => store.activeDocumentId),
    activeDocument: computed(() => store.activeDocument),

    // Direct calls to private store for mutations (used within module)
    createDocument: privateStore.createDocument,
    updateDocument: (id: string, updates: Partial<Document>) => {
      if (updates.content !== undefined) {
        return privateStore.updateDocument(id, updates.content)
      }
    },
    deleteDocument: privateStore.deleteDocument,
    selectDocument: privateStore.setActiveDocument,
  }
}
```

This proxy is also in `api.ts` for module-internal components. Outside modules use events.

### Cross-module communication flow

💡 Events make dependencies visible

Let's trace a full flow: user clicks "Import Document" → document added → UI updates.

```
┌──────────────┐      emit        ┌──────────────┐
│ Share Module │  'documents:     │ Documents    │
│ (component)  │   import'        │ Store        │
└──────────────┘ ────────────────▶└──────────────┘
                 { content }              │
                                          │ addDocument()
                                          │ (mutate state)
                                          ▼
                                   localStorage
                                          │
                                          │ reactive
                                          ▼
                                  ┌──────────────┐
                                  │ DocumentList │
                                  │ (re-renders) │
                                  └──────────────┘
```

The share module does not know about the documents store. It just emits:

```ts
// src/modules/share/composables/useDocumentShare.ts
import { emitAppEvent } from '@/shared/utils/eventBus'

function importDocument(content: string) {
  emitAppEvent('documents:import', { content })
}
```

The documents store listens and reacts:

```ts
// src/modules/documents/store.ts
onAppEvent('documents:import', (payload) => {
  addDocument(payload.content)
})
```

The UI updates automatically because components watch the public store.

No direct coupling. The share module could be deleted tomorrow. The documents module would still work.

### Domain module as foundation

The domain module is special. It holds shared types and contracts. No business logic. No state. Just definitions.

```ts
// src/modules/domain/api.ts

// Contracts/Interfaces
export type { DocumentRepository } from './contracts/DocumentRepository'
export type { StorageService } from './contracts/StorageService'

// Schemas
export { documentsArraySchema, documentSchema, parseDocument, parseDocuments } from './schemas/document.schema'

// Domain Types
export type { Document } from './types/Document'
```

Example type:

```ts
// src/modules/domain/types/Document.ts
export interface Document {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}
```

Example schema with Zod:

```ts
// src/modules/domain/schemas/document.schema.ts
import { z } from 'zod'

export const documentSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
})

export const documentsArraySchema = z.array(documentSchema)

export function parseDocument(data: unknown) {
  return documentSchema.parse(data)
}

export function parseDocuments(data: unknown) {
  return documentsArraySchema.parse(data)
}
```

Every module can import from `~/modules/domain/api`. No other module dependencies needed.

This keeps the dependency graph clean:

```
domain
  └── (no dependencies)

documents
  └── domain

editor
  └── domain

layout
  └── (no dependencies to other modules)

share
  └── domain
```

### Component auto-import

Nuxt scans module component folders and auto-imports components. No manual registration.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  components: [
    {
      path: '~/modules/*/components',
      pathPrefix: false, // use component name, not folder prefix
    },
    {
      path: '~/shared/components',
      pathPrefix: false,
    },
  ],
})
```

Now you can use `<DocumentList>` or `<MarkdownEditor>` anywhere without imports.

This keeps templates clean:

```vue
<template>
  <ClientOnly>
    <DocumentList
      :documents="documents"
      :active-document-id="activeDocumentId"
    />
    <template #fallback>
      <DocumentListSkeleton />
    </template>
  </ClientOnly>
</template>
```

No import statements. Nuxt resolves them at build time.

## Styling

Styles follow module boundaries:

1. **Design tokens** in `src/shared/ui/tokens.css` (CSS variables)
2. **Shared components** in `src/shared/components/` use tokens
3. **Module components** use Vue scoped styles or BEM with module prefix
4. **UnoCSS** for utility classes

Example with scoped styles:

```vue
<!-- src/modules/documents/components/DocumentItem.client.vue -->
<template>
  <div class="document-item">
    <h3 class="title">{{ title }}</h3>
  </div>
</template>

<style scoped>
.document-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.title {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
}
</style>
```

Scoped styles prevent leaks. Tokens keep the design consistent.

## Benefits and tradeoffs

### Benefits

✅ **Single deployment** - one build, one deploy, simple CI/CD
✅ **Shared code is easy** - domain module, shared UI, no duplication
✅ **Atomic refactors** - rename types, update imports, done
✅ **Clear boundaries** - ESLint enforces them, no guessing
✅ **Easy local development** - one repo, one npm install, one dev server
✅ **Fast iteration** - no network calls between modules
✅ **Simple debugging** - stack traces stay in one codebase

### Tradeoffs

⚠️ **Cannot deploy modules independently** - ship the whole app
⚠️ **Discipline required** - ESLint helps but humans can disable it
⚠️ **Growth path** - scaling to microservices requires refactor
⚠️ **Shared runtime** - one module crash can affect others
⚠️ **Team coordination** - need agreement on domain module changes

## When to use this

Use a modular monolith when:

- **Single team or tight collaboration** - you can coordinate changes
- **Simple deployment model** - ship the whole app together
- **Shared domain logic** - modules share types and business rules
- **Fast iteration matters** - build and test everything at once
- **Clear business capabilities** - you know the module boundaries

Do NOT use a modular monolith when:

- **Independent team deploys** - teams ship on different schedules
- **Distributed scaling** - modules need different resources
- **Language diversity** - teams want different tech stacks
- **Regulatory isolation** - modules have different compliance needs

If you start with a modular monolith and grow into microservices, the module boundaries make the split easier. You already know the seams.

## Common patterns

### When to create a new module

Create a module when you have:

- **A distinct business capability** (documents, editor, checkout)
- **Potential for separate team ownership** (even if not today)
- **A clear user workflow** (create, edit, share)

Do NOT create a module for:

- **Technical layers** (services, repositories, validators)
- **Shared utilities** (use `shared/` instead)
- **Single components** (put them in the nearest module)

### Module communication guidelines

**Use events for actions**:
```ts
emitAppEvent('document:create')
```

**Use public APIs for queries**:
```ts
const { documents } = useDocumentsStore()
```

**Use domain module for shared types**:
```ts
import type { Document } from '~/modules/domain/api'
```

**Never import module internals**:
```ts
// ❌ WRONG
import { useDocumentsStorePrivate } from '~/modules/documents/store'

// ✅ CORRECT
import { useDocumentsStore } from '~/modules/documents/api'
```

### Testing modules

Test composables in isolation:

```ts
// tests/modules/documents/useDocumentsProxy.test.ts
import { describe, it, expect } from 'vitest'
import { useDocumentsProxy } from '~/modules/documents/api'

describe('useDocumentsProxy', () => {
  it('creates a document', () => {
    const { createDocument, documents } = useDocumentsProxy()
    const id = createDocument('# Test')
    expect(documents.value).toHaveLength(1)
  })
})
```

Test components with Testing Library:

```ts
import { render, screen } from '@testing-library/vue'
import DocumentList from '~/modules/documents/components/DocumentList.client.vue'

test('renders documents', () => {
  render(DocumentList, {
    props: {
      documents: [{ id: '1', content: '# Test', createdAt: 0, updatedAt: 0 }],
      activeDocumentId: '1',
    },
  })
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```

Test cross-module flows with E2E (Playwright + Cucumber):

```gherkin
Feature: Document Management
  Scenario: Import a document
    Given I am on the app
    When I import a document with content "# Imported"
    Then I should see "Imported" in the document list
```

## Summary

A modular monolith scales a single codebase with clear boundaries. It gives you:

- **Module isolation** without microservice complexity
- **Event-driven communication** without a message queue
- **Enforced boundaries** with ESLint and TypeScript
- **Fast iteration** with one deployment

The patterns in MarkVim work for teams that need structure but do not need distributed systems yet.

Start modular. Stay modular. Split when you must.

Code: https://github.com/yourusername/MarkVim

## Stay Updated

Subscribe to my newsletter for more TypeScript, Vue, and web dev insights directly in your inbox.

Background information about the articles
Weekly Summary of all the interesting blog posts that I read
Small tips and tricks

[Subscribe Now](#)

---

*Tagged: vue, nuxt, modular-monolith, architecture*
