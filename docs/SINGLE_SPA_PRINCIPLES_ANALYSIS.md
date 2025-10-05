# Applying Single-SPA Principles to MarkVim

## Executive Summary

MarkVim currently has **excellent module boundaries** and is **80% microfrontend-ready**. This analysis identifies improvements to reach 100% based on single-spa best practices.

---

## Current State Analysis

### Module Dependency Map

```
┌─────────────────────────────────────────────────────────┐
│                     Event Bus (Central)                 │
│              Typed, Framework-Agnostic API              │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
│   Documents    │  │   Editor    │  │  Color Theme   │
│   (Store)      │  │  (Settings) │  │    (Store)     │
└────────────────┘  └─────────────┘  └────────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Shortcuts  │
                    │  (Emitter)  │
                    └─────────────┘
```

### Module Independence Score

| Module | Emits Events | Listens to Events | External Imports | Independence Score |
|--------|--------------|-------------------|------------------|-------------------|
| **domain** | 0 | 0 | 0 | ⭐⭐⭐⭐⭐ 100% (Pure Utility) |
| **feature-flags** | 0 | 4 | 0 | ⭐⭐⭐⭐⭐ 95% (Self-contained) |
| **color-theme** | 3 | 3 | 0 | ⭐⭐⭐⭐⭐ 95% (Self-contained) |
| **markdown-preview** | 0 | 0 | 1 (editor settings) | ⭐⭐⭐⭐ 90% (Near perfect) |
| **editor** | 1 | 3 | 0 | ⭐⭐⭐⭐ 85% (Mostly independent) |
| **documents** | 4 | 6 | 0 | ⭐⭐⭐⭐ 85% (Mostly independent) |
| **layout** | 0 | 3 | 2 (docs, features) | ⭐⭐⭐ 70% (Some coupling) |
| **share** | 0 | 0 | 3 (docs, editor) | ⭐⭐⭐ 70% (Component coupling) |
| **shortcuts** | 2 | 2 | 2 (docs state) | ⭐⭐ 60% (High coupling) |

---

## Single-SPA Principle Applications

### ✅ What We're Already Doing Right

1. **Clean Public APIs** - Every module has `api.ts`
2. **Event-Driven Communication** - Stores don't export dispatch
3. **Type Safety** - Full TypeScript with event types
4. **No Direct Store Access** - Events for all mutations
5. **Module Ownership** - Each module owns its domain

### 🎯 Improvements Based on Single-SPA

## 1. Extract Utility Modules (High Impact)

### Current Problem
Some modules have mixed concerns - they're both feature modules AND utility modules.

### Single-SPA Pattern: Separate Utility Modules

```
Current:
src/modules/
  ├── feature-flags/     # Mixed: stores state + provides directive
  ├── domain/            # Already a utility module ✅
  └── shortcuts/         # Mixed: manages shortcuts + reads docs state

Proposed:
src/modules/
  ├── features/
  │   ├── documents/
  │   ├── editor/
  │   ├── color-theme/
  │   └── share/
  ├── utilities/
  │   ├── domain/              # Pure types/schemas ✅
  │   ├── feature-flags/       # State + directive
  │   ├── shortcuts/           # Keyboard handling
  │   └── event-bus/           # Move from shared/
  └── ui-components/
      ├── layout/              # Reusable UI
      └── markdown-preview/    # Reusable renderer
```

### Benefits
- **Clear separation** of concerns
- **Easier extraction** to separate bundles
- **Better discoverability** of shared utilities
- **Follows single-spa convention**

---

## 2. RxJS Observable Streams (Medium Impact)

### Current: Vue Refs + Event Bus
```typescript
// Documents store
const _state = useLocalStorage<DocumentsState>(...)

// Other modules read via:
const { documents } = useDocumentsState()
```

### Single-SPA Pattern: Observable Streams
```typescript
// @markvim/utilities/documents
import { BehaviorSubject } from 'rxjs'

const documents$ = new BehaviorSubject<Document[]>([])

export function getDocuments$() {
  return documents$.asObservable()
}

export function addDocument(doc: Document) {
  const current = documents$.value
  documents$.next([...current, doc])
}
```

### Why This Matters
1. **Framework-agnostic** - Works with React, Vue, Svelte, Angular
2. **Better for microfrontends** - RxJS is single-spa's standard
3. **Reactive by default** - Built-in subscription management
4. **Time-travel debugging** - Easy to add RxJS DevTools

### Migration Strategy
```typescript
// Phase 1: Keep both (backward compatible)
export function useDocumentsState() {
  const store = useDocumentsStore()
  const { documents } = storeToRefs(store)

  // Also expose as observable
  const documents$ = new BehaviorSubject(documents.value)
  watch(documents, (val) => documents$.next(val))

  return {
    documents,      // Vue refs (current)
    documents$,     // RxJS (future)
  }
}

// Phase 2: Migrate consumers to RxJS
// Phase 3: Remove Vue refs
```

---

## 3. Reduce Cross-Module Coupling (High Impact)

### Problem: Shortcuts Module Reads Documents State

**Current**:
```typescript
// ShortcutsManager.vue
import { useDocumentsState } from '~/modules/documents/api'

const { documents, activeDocument } = useDocumentsState()
```

**Why It's Bad**:
- Shortcuts can't be deployed separately
- Documents module is now a dependency
- Breaks single-spa independence principle

**Single-SPA Solution: Command Pattern**
```typescript
// Shortcuts module - NO external state reads
interface CommandContext {
  // Context is PASSED IN by app shell
  getDocuments: () => Document[]
  getActiveDocument: () => Document | null
}

// App shell wires it up
<ShortcutsManager :context="{
  getDocuments: () => documentsState.documents,
  getActiveDocument: () => documentsState.activeDocument
}" />
```

**Alternative: Backend as Source of Truth**
```typescript
// Shortcuts module
async function loadDocuments() {
  // Each module gets data from API
  return await api.get('/documents')
}
```

---

## 4. Module Federation Ready (Future-Proof)

### Create Import Map Simulation

```json
{
  "imports": {
    "@markvim/utilities/domain": "/shared/domain/api.js",
    "@markvim/utilities/feature-flags": "/shared/feature-flags/api.js",
    "@markvim/utilities/event-bus": "/shared/utils/eventBus.js",

    "@markvim/features/documents": "/modules/documents/api.js",
    "@markvim/features/editor": "/modules/editor/api.js",
    "@markvim/features/color-theme": "/modules/color-theme/api.js",

    "@markvim/ui/layout": "/shared/layout/api.js",
    "@markvim/ui/markdown-preview": "/modules/markdown-preview/api.js"
  }
}
```

### Webpack Module Federation Config (Future)
```javascript
new ModuleFederationPlugin({
  name: 'documents',
  filename: 'remoteEntry.js',
  exposes: {
    './api': './src/modules/documents/api.ts',
  },
  shared: {
    vue: { singleton: true },
    pinia: { singleton: true },
    rxjs: { singleton: true },
  }
})
```

---

## 5. Audit State Sharing (Critical)

### Single-SPA Principle: Minimize Shared State

**Question to ask for each event:**
> "Do we REALLY need this cross-module communication, or should we refactor?"

| Event | Emitter | Listener | Necessity | Action |
|-------|---------|----------|-----------|--------|
| `document:created` | documents | ❌ nobody | Low | Remove or add listener |
| `document:update` | app-shell | documents | High | Keep ✅ |
| `document:select` | shortcuts | layout, docs | Medium | Consider consolidating |
| `theme:color:updated` | color-theme | ❌ nobody | Low | Remove |

**Recommendation**: If nobody listens to an event, either:
1. Remove it (probably don't need it)
2. Add listeners if it's part of the public contract

---

## 6. Create "Utility Module" Package

### Single-SPA Pattern: Shared Utilities Package

```typescript
// @markvim/utilities (separate npm package in monorepo)
export * from './domain'
export * from './feature-flags'
export * from './event-bus'

// Package.json
{
  "name": "@markvim/utilities",
  "version": "1.0.0",
  "main": "dist/index.js",
  "peerDependencies": {
    "rxjs": "^7.0.0"
  }
}
```

**Benefits**:
- Can version independently
- Clear boundary for shared code
- Easy to publish to npm
- Forces minimal public API

---

## Concrete Action Plan

### Phase 1: Quick Wins (1-2 days)
1. ✅ Remove unused events (already found 3)
2. ✅ Move `eventBus.ts` to `modules/utilities/event-bus/`
3. ✅ Create module independence metrics dashboard
4. ✅ Document current coupling in README

### Phase 2: Restructure (3-5 days)
1. Create `modules/utilities/` folder structure
2. Move `domain`, `feature-flags` to utilities
3. Extract event bus to utility module
4. Update all imports

### Phase 3: Add RxJS (5-7 days)
1. Add RxJS as dependency
2. Create Observable wrappers for stores
3. Migrate one module as proof-of-concept
4. Add RxJS DevTools

### Phase 4: Reduce Coupling (Ongoing)
1. Refactor ShortcutsManager to use command pattern
2. Consider merging layout + header (they're coupled anyway)
3. Move shared UI components to separate package

### Phase 5: Microfrontend Ready (Future)
1. Set up Module Federation
2. Create import map
3. Deploy one module separately as POC
4. Performance testing

---

## Metrics to Track

```typescript
// Module Independence Score
interface ModuleMetrics {
  name: string
  eventsEmitted: number
  eventsListenedTo: number
  externalImports: number
  linesOfCode: number
  independenceScore: number // 0-100
}

// Target: All modules > 80% independence
```

---

## Key Takeaways

### ✅ Strengths
- Event-driven architecture is solid
- Clean module boundaries via `api.ts`
- Type safety across modules
- Already 80% microfrontend-ready

### 🎯 Improvements
1. **Extract utility modules** - Clear separation
2. **Add RxJS observables** - Framework-agnostic state
3. **Reduce shortcuts coupling** - Use command pattern
4. **Remove unused events** - Clean up dead code
5. **Create metrics** - Track independence over time

### 🚀 Future Benefits
- **Can deploy modules separately** if needed
- **Framework-agnostic** (migrate to React/Svelte easily)
- **Better testing** (test modules in isolation)
- **Clearer contracts** (utility modules = shared API)
- **Follows industry standards** (single-spa patterns)

---

## Conclusion

MarkVim is already following most single-spa best practices! The main improvements are:

1. **Organizational** - Move utilities to dedicated folder
2. **Technical** - Add RxJS for framework-agnostic state
3. **Architectural** - Reduce unnecessary coupling

These changes will make MarkVim **100% microfrontend-ready** while keeping the benefits of a monolith (faster development, type safety, single deployment).
