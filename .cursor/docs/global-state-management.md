# MarkVim Global State Management

MarkVim uses a composable-based architecture for global state management, leveraging Vue 3's Composition API and Nuxt 3's auto-imports. The application follows a decentralized state management pattern where each domain of functionality has its own composable that manages related state and behavior.

## Architecture Overview

### Core Principles

1. **Composable-based**: Each feature domain has its own composable (e.g., `useDocuments`, `useViewMode`)
2. **LocalStorage Persistence**: Critical user preferences are persisted across sessions using `useLocalStorage`
3. **Reactive State**: All state is reactive using Vue's `ref`, `computed`, and `readonly` primitives
4. **Single Source of Truth**: Each piece of state has one authoritative source
5. **No Global Store**: No Vuex/Pinia - state is managed through individual composables

### Key Technologies

- **Vue 3 Composition API**: Core reactivity system
- **Nuxt 3 Auto-imports**: Automatic import of Vue primitives and composables
- **VueUse**: Utility composables like `useLocalStorage`, `useMagicKeys`, `useMediaQuery`
- **TypeScript**: Full type safety for state interfaces

## State Domains

### 1. Document Management (`useDocuments`)

**Location**: `composables/useDocuments.ts`

**Responsibilities**:
- Managing the collection of markdown documents
- Tracking which document is currently active
- CRUD operations for documents
- Persistence to localStorage

**Key State**:
```typescript
interface Document {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}

// Persisted state
const documentsStorage = useLocalStorage<Document[]>('markvim-documents', [defaultDocument])
const activeDocumentId = useLocalStorage('markvim-active-document-id', defaultDocument.id)

// Computed state
const documents = computed(() => documentsStorage.value.sort(...))
const activeDocument = computed(() => documents.value.find(...))
```

**State Persistence**: Documents and active document ID are persisted to localStorage with keys:
- `markvim-documents`: Array of all documents
- `markvim-active-document-id`: ID of currently active document

### 2. View Mode Management (`useViewMode`)

**Location**: `composables/useViewMode.ts`

**Responsibilities**:
- Managing the current view mode (split/editor/preview)
- Computing visibility states for UI components
- Persisting user's preferred view mode

**Key State**:
```typescript
type ViewMode = 'split' | 'editor' | 'preview'

// Persisted state
const viewMode = useLocalStorage<ViewMode>('markvim-view-mode', 'split')

// Computed state
const isPreviewVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'preview')
const isSplitView = computed(() => viewMode.value === 'split')
const isEditorVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'editor')
```

**State Persistence**: View mode preference is persisted with key `markvim-view-mode`

### 3. Editor Settings (`useEditorSettings`)

**Location**: `composables/useEditorSettings.ts`

**Responsibilities**:
- Managing all editor configuration (Vim mode, line numbers, theme, etc.)
- Providing toggle functions for common settings
- Import/export functionality for settings
- Resetting to defaults

**Key State**:
```typescript
interface EditorSettings {
  vimMode: boolean
  theme: 'dark' | 'light' | 'auto'
  fontSize: number
  lineNumbers: boolean
  previewSync: boolean
  // ... many more settings
}

// Persisted state
const settings = useLocalStorage('markvim-settings', DEFAULT_EDITOR_CONFIG)
```

**State Persistence**: All editor settings are persisted with key `markvim-settings`

### 4. Resizable Panes (`useResizablePanes`)

**Location**: `composables/useResizablePanes.ts`

**Responsibilities**:
- Managing the split pane widths in split view
- Handling drag interactions for resizing
- Performance-optimized drag handling with RAF throttling
- Persisting pane width preferences

**Key State**:
```typescript
// Persisted state
const leftPaneWidth = useLocalStorage('markvim-pane-width', initialLeftWidth)

// Computed state
const rightPaneWidth = computed(() => 100 - leftPaneWidth.value)

// Interaction state
const isDragging = ref(false)
const containerRef = ref<HTMLElement>()
```

**State Persistence**: Pane width is persisted with key `markvim-pane-width`

### 5. Keyboard Shortcuts (`useShortcuts`)

**Location**: `composables/useShortcuts.ts`

**Responsibilities**:
- Managing global keyboard shortcuts registration
- Preventing shortcuts when typing in inputs
- Command palette integration
- Dynamic shortcut registration and cleanup

**Key State**:
```typescript
// Global state using Nuxt's useState
const registeredShortcuts = useState<Map<string, ShortcutAction>>('shortcuts', () => new Map())
const appCommands = useState<Map<string, ShortcutAction>>('appCommands', () => new Map())

// Input detection
const activeElement = useActiveElement()
const notUsingInput = computed(() => /* complex logic to detect input context */)
```

**State Persistence**: No persistence - shortcuts are registered on app mount

### 6. Additional Composables

#### `useSyncedScroll` (Preview Synchronization)
- Manages synchronized scrolling between editor and preview
- Tracks scroll positions and maps between editor lines and preview elements

#### `useMarkdown` (Markdown Processing)
- Handles markdown rendering with syntax highlighting
- Manages Shiki CSS injection for code highlighting

#### `useCommandHistory` (Command Palette History)
- Tracks recently used commands
- Persists command usage for better UX

## State Flow in Main App

The main application (`app.vue`) orchestrates all these composables:

```typescript
// Document state
const { documents, activeDocument, activeDocumentId, createDocument, ... } = useDocuments()

// View state
const { viewMode, isPreviewVisible, isSplitView, isEditorVisible, setViewMode } = useViewMode()

// Editor state
const { settings, toggleVimMode, toggleLineNumbers, togglePreviewSync } = useEditorSettings()

// Layout state
const { leftPaneWidth, rightPaneWidth, isDragging, containerRef, startDrag } = useResizablePanes()

// App-level state (not in composables)
const isSidebarVisible = useLocalStorage('markvim-sidebar-visible', true)
const currentVimMode = ref<string>('NORMAL')
const commandPaletteOpen = ref(false)
```

## Persistence Strategy

### LocalStorage Keys Used

| Key | Purpose | Default Value |
|-----|---------|---------------|
| `markvim-documents` | Document collection | `[defaultDocument]` |
| `markvim-active-document-id` | Active document ID | `defaultDocument.id` |
| `markvim-view-mode` | Current view mode | `'split'` |
| `markvim-settings` | Editor settings | `DEFAULT_EDITOR_CONFIG` |
| `markvim-pane-width` | Split pane width | `50` |
| `markvim-sidebar-visible` | Sidebar visibility | `true` |

### Data Migration Strategy

The app handles missing or invalid localStorage data gracefully:
- Missing documents: Creates default welcome document
- Invalid active document ID: Falls back to first available document
- Missing settings: Uses `DEFAULT_EDITOR_CONFIG`
- Corrupted data: Falls back to defaults and continues

## Reactivity Patterns

### 1. useLocalStorage with Computed
Most composables use this pattern for derived state:
```typescript
const baseValue = useLocalStorage('key', defaultValue)
const derivedValue = computed(() => /* transformation */)
```

### 2. Readonly Exposure
Composables expose readonly refs to prevent external mutations:
```typescript
return {
  value: readonly(internalValue),
  setValue: (newValue) => { internalValue.value = newValue }
}
```

### 3. Computed State Aggregation
Complex computed values aggregate multiple reactive sources:
```typescript
const activeMarkdown = computed({
  get: () => activeDocument.value?.content || '',
  set: (value: string) => {
    if (activeDocument.value) {
      updateDocument(activeDocument.value.id, value)
    }
  },
})
```

## Performance Considerations

### 1. Throttled Updates
The resizable panes composable uses RAF throttling for smooth 60fps performance:
```typescript
const throttledUpdate = () => {
  if (animationId) return
  animationId = requestAnimationFrame(() => {
    // Update logic
    animationId = null
  })
}
```

### 2. Computed Caching
Vue's computed properties automatically cache results and only recompute when dependencies change.

### 3. Selective Reactivity
Only necessary state is made reactive - temporary interaction state like drag positions use regular variables until commit.

## Testing Implications

### State Isolation
Each composable can be tested in isolation since they don't depend on a global store.

### Mocking LocalStorage
Tests need to mock `useLocalStorage` calls or provide test-specific storage.

### Computed Dependencies
Testing computed values requires setting up their reactive dependencies correctly.

## Anti-Patterns Avoided

### 1. No Global Mutable State
All state mutations go through controlled functions, never direct property assignment.

### 2. No Prop Drilling
State is accessed directly through composables rather than passed down through component props.

### 3. No Mixed Concerns
Each composable has a single, well-defined responsibility.

## Future Considerations

### Potential Improvements

1. **State Validation**: Add runtime validation for localStorage data
2. **Migration System**: Implement versioned state migration for breaking changes
3. **Optimistic Updates**: Add optimistic UI updates for better perceived performance
4. **State Devtools**: Custom devtools integration for debugging state changes
5. **Selective Persistence**: Not all state needs localStorage - some could be session-only

### Scalability

The current architecture scales well by:
- Adding new composables for new features
- Keeping composables focused and independent
- Using TypeScript for compile-time safety
- Leveraging Vue's reactivity for efficient updates

This architecture provides a clean, maintainable, and performant approach to state management that fits well with Vue 3 and Nuxt 3's philosophy while avoiding the complexity of a centralized store for this application's needs. 