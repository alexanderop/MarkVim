---
description: "Instructions for working with the documents module - CRUD operations, localStorage persistence, and client-only patterns"
applyTo: "src/modules/documents/**/*"
---

# Documents Module Instructions

## Module Purpose
Manages document lifecycle including creation, reading, updating, deletion, and persistence using localStorage with client-only rendering patterns.

## Key Components
- `DocumentList.client.vue` - Client-only document listing component
- `DocumentDeleteModal.vue` - Confirmation modal for deletions
- `DocumentListSkeleton.vue` - Loading state placeholder
- `store.ts` - Pinia store for document state management
- `composables/useDocumentDeletion.ts` - Document deletion workflow

## Document Data Structure

### Document Interface
```typescript
interface Document {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}
```

### Default Document Handling
- Uses consistent `DEFAULT_DOCUMENT_ID` for hydration safety
- Fixed timestamps prevent hydration mismatches
- Default content loaded from `defaultContent.ts`

## Development Guidelines

### Client-Only Patterns
- Use `.client.vue` suffix for components accessing localStorage
- Wrap with `<ClientOnly>` when needed to avoid hydration issues
- Handle loading states with skeleton components
- Use `import.meta.client` checks for conditional client-side logic

### Store Implementation
```typescript
// Client-safe localStorage usage
const _documents = useLocalStorage<Document[]>('markvim-documents', [defaultDoc])
const _activeDocumentId = useLocalStorage('markvim-active-document-id', defaultDoc.id)
```

### Document Operations
- **Create**: Generate unique IDs with current timestamps
- **Read**: Use computed properties for reactive document access
- **Update**: Update both content and `updatedAt` timestamp
- **Delete**: Implement confirmation modal workflow

### Title Generation
- Extract titles from markdown content (first heading or fallback)
- Use consistent title generation across components
- Handle edge cases (empty content, no headings)

## Component Patterns

### Document Listing
- Use virtualization for large document lists
- Implement search/filter functionality
- Show creation/modification dates
- Handle empty states gracefully

### Document Deletion
```typescript
// Use composable pattern for deletion workflow
const { deleteModalOpen, documentToDelete, handleDeleteDocument, confirmDeleteDocument, cancelDeleteDocument } = useDocumentDeletion()
```

### Active Document Management
- Sync active document with editor content
- Handle document switching smoothly
- Maintain cursor position when possible
- Auto-save document changes

## Common Tasks

### Adding Document Metadata
1. Update `Document` interface in store
2. Handle migration for existing localStorage data
3. Update creation/update functions
4. Modify UI components to display new fields

### Implementing Document Features
- Use composable pattern for reusable logic
- Extract complex operations into separate composables
- Maintain reactive state synchronization
- Handle error states appropriately

### Performance Optimization
- Use `shallowRef` for large document collections
- Implement virtual scrolling for document lists
- Debounce save operations
- Cache computed title values

## Storage Management

### localStorage Schema
```typescript
// Key patterns
'markvim-documents' // Document array
'markvim-active-document-id' // Active document ID
```

### Data Migration
- Use `mergeDefaults` for backward compatibility
- Handle schema changes gracefully
- Provide data reset functionality
- Validate localStorage data integrity

### Persistence Strategy
- Auto-save document changes
- Batch operations for performance
- Handle storage quota exceeded errors
- Provide export/backup functionality

## Integration Points
- Syncs with editor module for real-time content updates
- Works with share module for import/export operations
- Integrates with shortcuts for document navigation
- Connects to layout module for responsive document management

## Error Handling
- Handle localStorage access failures
- Validate document data structure
- Provide fallback for corrupted data
- Show user-friendly error messages

## Accessibility
- Ensure keyboard navigation for document lists
- Provide screen reader announcements for operations
- Use semantic HTML structure
- Support high contrast mode