# RxJS Observable Migration Example

## Why RxJS for Microfrontends?

Single-spa strongly recommends RxJS because it's:
- **Framework-agnostic** - Works with Vue, React, Angular, Svelte
- **Standard pattern** - Used across enterprise microfrontends
- **Powerful** - Built-in operators for complex state transformations
- **Reactive** - Automatic subscription management

---

## Side-by-Side Comparison

### Current: Vue Refs + Pinia

```typescript
// src/modules/documents/store.ts (current)
export const useDocumentsStore = defineStore('documents', () => {
  const _state = useLocalStorage<DocumentsState>('docs', {...})

  const documents = computed(() => _state.value.documents)
  const activeDocument = computed(() =>
    documents.value.find(d => d.id === _state.value.activeDocumentId)
  )

  return { documents, activeDocument, state: readonly(_state) }
})
```

```vue
<!-- Consumer (Vue only) -->
<script setup>
import { useDocumentsState } from '~/modules/documents/api'

const { documents, activeDocument } = useDocumentsState()
</script>

<template>
  <div>{{ documents.length }} documents</div>
</template>
```

**Problems:**
- ❌ Only works in Vue
- ❌ Can't use in React/Svelte microfrontends
- ❌ Hard to test without Vue runtime
- ❌ Difficult to add middleware/logging

---

### With RxJS: Framework-Agnostic

```typescript
// src/modules/utilities/documents/state.ts (new)
import { BehaviorSubject, combineLatest } from 'rxjs'
import { map, distinctUntilChanged } from 'rxjs/operators'

// Private state (single source of truth)
const documentsSubject = new BehaviorSubject<Document[]>([])
const activeDocumentIdSubject = new BehaviorSubject<string>('')

// Public observables (read-only streams)
export const documents$ = documentsSubject.asObservable()

export const activeDocumentId$ = activeDocumentIdSubject.asObservable()

export const activeDocument$ = combineLatest([
  documents$,
  activeDocumentId$
]).pipe(
  map(([docs, id]) => docs.find(d => d.id === id) ?? null),
  distinctUntilChanged()
)

// Mutation functions (like events)
export function setDocuments(docs: Document[]) {
  documentsSubject.next(docs)
}

export function setActiveDocumentId(id: string) {
  activeDocumentIdSubject.next(id)
}

export function addDocument(doc: Document) {
  const current = documentsSubject.value
  documentsSubject.next([...current, doc])
}
```

**Usage in Vue:**
```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { documents$, activeDocument$ } from '@markvim/utilities/documents'

const documents = ref([])
const activeDocument = ref(null)

let docsSub, activeSub

onMounted(() => {
  docsSub = documents$.subscribe(docs => documents.value = docs)
  activeSub = activeDocument$.subscribe(doc => activeDocument.value = doc)
})

onUnmounted(() => {
  docsSub?.unsubscribe()
  activeSub?.unsubscribe()
})
</script>
```

**Usage in React:**
```typescript
import { useEffect, useState } from 'react'
import { documents$, activeDocument$ } from '@markvim/utilities/documents'

function DocumentList() {
  const [documents, setDocuments] = useState([])
  const [activeDocument, setActiveDocument] = useState(null)

  useEffect(() => {
    const docsSub = documents$.subscribe(setDocuments)
    const activeSub = activeDocument$.subscribe(setActiveDocument)

    return () => {
      docsSub.unsubscribe()
      activeSub.unsubscribe()
    }
  }, [])

  return <div>{documents.length} documents</div>
}
```

**Usage in Svelte:**
```svelte
<script>
import { onDestroy } from 'svelte'
import { documents$, activeDocument$ } from '@markvim/utilities/documents'

let documents = []
let activeDocument = null

const docsSub = documents$.subscribe(val => documents = val)
const activeSub = activeDocument$.subscribe(val => activeDocument = val)

onDestroy(() => {
  docsSub.unsubscribe()
  activeSub.unsubscribe()
})
</script>

<div>{documents.length} documents</div>
```

---

## Hybrid Approach: Best of Both Worlds

Keep Pinia for Vue-specific features, expose RxJS for microfrontends:

```typescript
// src/modules/documents/store.ts
import { BehaviorSubject } from 'rxjs'
import { defineStore } from 'pinia'

export const useDocumentsStore = defineStore('documents', () => {
  // Internal: Vue/Pinia state
  const _state = useLocalStorage<DocumentsState>('docs', {...})

  // Internal: RxJS subjects for cross-framework sharing
  const documents$ = new BehaviorSubject<Document[]>([])
  const activeDocument$ = new BehaviorSubject<Document | null>(null)

  // Keep Vue refs in sync with RxJS
  watch(() => _state.value.documents, (docs) => {
    documents$.next(docs)
  }, { immediate: true })

  watch(() => activeDocument.value, (doc) => {
    activeDocument$.next(doc)
  }, { immediate: true })

  const documents = computed(() => _state.value.documents)
  const activeDocument = computed(() =>
    documents.value.find(d => d.id === _state.value.activeDocumentId) ?? null
  )

  return {
    // Vue API (for internal use)
    documents,
    activeDocument,

    // RxJS API (for microfrontends)
    documents$: documents$.asObservable(),
    activeDocument$: activeDocument$.asObservable(),
  }
})
```

```typescript
// src/modules/documents/api.ts
export function useDocumentsState() {
  const store = useDocumentsStore()

  return {
    // Vue refs (current consumers)
    documents: store.documents,
    activeDocument: store.activeDocument,

    // Observables (future microfrontends)
    documents$: store.documents$,
    activeDocument$: store.activeDocument$,
  }
}
```

---

## Advanced RxJS Patterns

### 1. Derived State with Operators

```typescript
import { map, filter, debounceTime } from 'rxjs/operators'

// Only active documents
export const activeDocuments$ = documents$.pipe(
  map(docs => docs.filter(d => !d.archived))
)

// Search with debounce
export const searchResults$ = combineLatest([
  documents$,
  searchQuery$
]).pipe(
  debounceTime(300),
  map(([docs, query]) => docs.filter(d =>
    d.content.includes(query)
  ))
)

// Document count
export const documentCount$ = documents$.pipe(
  map(docs => docs.length),
  distinctUntilChanged()
)
```

### 2. Side Effects with Tap

```typescript
import { tap } from 'rxjs/operators'

export const documents$ = documentsSubject.pipe(
  tap(docs => {
    // Auto-save to localStorage
    localStorage.setItem('docs', JSON.stringify(docs))
  }),
  tap(docs => {
    // Analytics
    analytics.track('documents_changed', { count: docs.length })
  })
)
```

### 3. Error Handling

```typescript
import { catchError, retry } from 'rxjs/operators'
import { of } from 'rxjs'

export const documentsFromApi$ = fromFetch('/api/documents').pipe(
  retry(3),
  catchError(error => {
    console.error('Failed to fetch documents:', error)
    return of([]) // Return empty array as fallback
  })
)
```

### 4. Combining Multiple Sources

```typescript
// Merge localStorage + API
const localDocs$ = new BehaviorSubject(getFromLocalStorage())
const apiDocs$ = fromFetch('/api/documents')

export const documents$ = merge(
  localDocs$,
  apiDocs$.pipe(
    tap(docs => saveToLocalStorage(docs))
  )
)
```

---

## Migration Strategy

### Phase 1: Add RxJS Alongside (No Breaking Changes)

```typescript
// Add RxJS exports without removing Vue refs
export function useDocumentsState() {
  const store = useDocumentsStore()

  return {
    // Existing Vue API (keep for backward compatibility)
    documents: store.documents,
    activeDocument: store.activeDocument,

    // New RxJS API (opt-in)
    documents$: store.documents$,
    activeDocument$: store.activeDocument$,
  }
}
```

**Timeline:** 1 week
**Risk:** None (additive only)

### Phase 2: Create Helper Hook (Easier Adoption)

```typescript
// src/shared/composables/useObservable.ts
import { ref, onMounted, onUnmounted, Ref } from 'vue'
import { Observable } from 'rxjs'

export function useObservable<T>(
  observable$: Observable<T>,
  initialValue: T
): Ref<T> {
  const value = ref<T>(initialValue) as Ref<T>
  let subscription: any

  onMounted(() => {
    subscription = observable$.subscribe(val => value.value = val)
  })

  onUnmounted(() => {
    subscription?.unsubscribe()
  })

  return value
}
```

```vue
<!-- Usage is now identical to current code! -->
<script setup>
import { useObservable } from '@/shared/composables/useObservable'
import { documents$, activeDocument$ } from '~/modules/documents/api'

const documents = useObservable(documents$, [])
const activeDocument = useObservable(activeDocument$, null)
</script>

<template>
  <div>{{ documents.length }} documents</div>
</template>
```

**Timeline:** 2 days
**Risk:** Low (helper simplifies migration)

### Phase 3: Migrate One Module (Proof of Concept)

Pick the simplest module (e.g., `feature-flags`):

```typescript
// Before
export function useFeatureFlagsState() {
  const store = useFeatureFlagsStore()
  const { state } = storeToRefs(store)
  return { state }
}

// After
import { BehaviorSubject } from 'rxjs'

const flagsSubject = new BehaviorSubject(DEFAULT_FLAGS)

export const flags$ = flagsSubject.asObservable()

export function useFeatureFlagsState() {
  return {
    flags: useObservable(flags$, DEFAULT_FLAGS),
    flags$, // Also expose observable
  }
}
```

**Timeline:** 3-5 days
**Risk:** Medium (test thoroughly)

### Phase 4: Gradually Migrate Remaining Modules

**Timeline:** 2-3 months
**Risk:** Low (incremental approach)

---

## Testing Benefits

### Current: Requires Vue Test Utils

```typescript
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

describe('DocumentList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders documents', () => {
    const wrapper = mount(DocumentList)
    // ...
  })
})
```

### With RxJS: Pure JavaScript Testing

```typescript
import { documents$, addDocument } from '@markvim/utilities/documents'

describe('Documents State', () => {
  it('adds document to stream', (done) => {
    const doc = { id: '1', content: 'test' }

    documents$.subscribe(docs => {
      expect(docs).toContainEqual(doc)
      done()
    })

    addDocument(doc)
  })

  it('filters documents', (done) => {
    const docs$ = documents$.pipe(
      map(docs => docs.filter(d => d.archived))
    )

    docs$.subscribe(docs => {
      expect(docs.length).toBe(0)
      done()
    })
  })
})
```

**Benefits:**
- No Vue dependency in tests
- Test state logic in isolation
- Faster test execution
- Can test RxJS operators

---

## When to Use What?

### Use Vue Refs When:
- ✅ Only Vue consumers
- ✅ Simple local component state
- ✅ Leveraging Vue-specific features (directives, etc.)

### Use RxJS When:
- ✅ Shared across multiple frameworks
- ✅ Complex async operations
- ✅ Need operators (debounce, retry, etc.)
- ✅ Microfrontend architecture
- ✅ Want framework-agnostic tests

### Use Both When:
- ✅ Migrating gradually
- ✅ Supporting multiple consumers
- ✅ Want best of both worlds

---

## Conclusion

RxJS isn't a replacement for Pinia/Vue refs - it's a **complementary pattern** for cross-framework state sharing.

**Recommendation:**
1. **Short term:** Add RxJS observables alongside Vue refs
2. **Medium term:** Migrate utility modules to RxJS
3. **Long term:** Use RxJS as single source of truth

This keeps MarkVim **microfrontend-ready** while maintaining Vue's DX benefits!
