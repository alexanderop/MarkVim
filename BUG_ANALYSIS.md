# MarkVim Document Persistence Bug Analysis

## Issue Summary
Users always see the default document on page reload instead of their active document, even though they may have created and been working on other documents.

## Root Cause Analysis

### Primary Issues Identified

1. **SSR/Client Hydration Mismatch**
   - Server renders with default values (no localStorage access)
   - Client loads different localStorage values during hydration
   - Creates state inconsistencies and console warnings

2. **Document Store Initialization Problems**
   - Store initializes twice (SSR + client hydration)
   - Different document counts and activeDocumentId between server/client
   - `useLocalStorage` behaves differently during SSR vs client-side

3. **Timestamp Generation Issues**
   - `Date.now()` calls generate different values on server vs client
   - Causes hydration warnings about timestamp formatting

### Console Log Evidence

```
SSR: activeDocumentId: 'default-welcome-document-id', documentsCount: 1
Client: activeDocumentId: '626c0539-7d8e-4d7d-aedc-f6ba00bb40db', documentsCount: 2

Hydration warnings:
- Text content mismatch on timestamp spans
- Style mismatch on editor/preview panes
```

## Technical Details

### File: `src/modules/documents/store.ts`

**Problems:**
- `createDefaultDocument()` uses `Date.now()` for timestamps (line ~95)
- `useLocalStorage` returns defaults during SSR but real values during client hydration
- No client-side guards for localStorage-dependent operations

**Current Problematic Code:**
```typescript
function createDefaultDocument(): Document {
  return {
    id: DEFAULT_DOCUMENT_ID,
    content: defaultDocumentContent,
    createdAt: Date.now(), // Different on server vs client
    updatedAt: Date.now(), // Different on server vs client
  }
}

// No SSR guards
const _documents = useLocalStorage<Document[]>('markvim-documents', [defaultDoc])
const _activeDocumentId = useLocalStorage('markvim-active-document-id', defaultDoc.id)
```

## Recommended Fixes

### 1. Fix Timestamp Generation
```typescript
function createDefaultDocument(): Document {
  // Use fixed timestamp for SSR consistency
  const fixedTimestamp = 1640995200000 // Jan 1, 2022

  return {
    id: DEFAULT_DOCUMENT_ID,
    content: defaultDocumentContent,
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
  }
}
```

### 2. Add Client-Side Guards
```typescript
const _documents = import.meta.client
  ? useLocalStorage<Document[]>('markvim-documents', [defaultDoc])
  : ref<Document[]>([defaultDoc])

const _activeDocumentId = import.meta.client
  ? useLocalStorage('markvim-active-document-id', defaultDoc.id)
  : ref(defaultDoc.id)
```

### 3. Consider Nuxt SSR Configuration
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // or false for client-side only
})
```

## Secondary Concerns

### Document Creation Flow
- Users might not be successfully creating new documents
- Need to verify new document button/shortcuts work correctly
- Add better visual feedback for document creation

### Testing Strategy
- Write E2E tests that reproduce the bug
- Test document creation → reload → verify active document
- Test multiple documents persistence
- Test activeDocumentId restoration

## Files Involved

- `src/modules/documents/store.ts` - Main store logic
- `src/modules/documents/default-content.ts` - Default document content
- `src/app/AppShell.vue` - Main application shell
- `nuxt.config.ts` - SSR configuration

## Hydration Warnings to Fix

1. **Timestamp formatting mismatch:**
   - Server: "08:14 AM"
   - Client: "08:14"

2. **Style property mismatch:**
   - Server: `width: 50%`
   - Client: `width: 50.04576359832637%`

## Next Steps

1. Implement the timestamp and client-side guard fixes
2. Write comprehensive E2E tests that fail with current code
3. Verify document creation flow works properly
4. Test fixes resolve hydration warnings
5. Ensure localStorage persistence works correctly after fixes

## Impact Assessment

**Current Impact:**
- Users lose their work on page reload
- Poor user experience with document management
- Console warnings indicate unstable hydration

**After Fix:**
- Documents persist correctly across reloads
- Active document is properly restored
- Clean hydration without warnings
- Reliable document management experience
