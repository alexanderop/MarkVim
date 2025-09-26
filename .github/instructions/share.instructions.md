---
description: "Instructions for working with the share module - document compression, URL sharing, and import/export functionality"
applyTo: "src/modules/share/**/*"
---

# Share Module Instructions

## Module Purpose
Enables document sharing via compressed URLs, import/export functionality, and clipboard integration for seamless document distribution.

## Key Components
- `ShareDialog.vue` - Main sharing interface
- `ImportDialog.vue` - Document import interface
- `ShareButton.vue` - Share action trigger
- `ShareManager.vue` - Overall share/import management
- `composables/useDocumentShare.ts` - Core sharing logic

## Sharing System Architecture

### Document Compression
```typescript
// Uses fflate for gzip compression
const compressed = gzipSync(strToU8(jsonString), { level: 9 })
const encodedData = btoa(String.fromCharCode(...compressed))

// Size limits
const MAX_COMPRESSED_SIZE = 50_000 // 50KB limit
```

### Shareable Document Format
```typescript
interface ShareableDocument {
  id: string
  title: string
  content: string
  createdAt: number
  sharedAt: number
}
```

## Development Guidelines

### URL Generation
```typescript
function generateShareLink(document: Document): string | null {
  // 1. Create shareable document object
  // 2. JSON stringify and compress with gzip
  // 3. Base64 encode compressed data
  // 4. Generate URL with hash fragment
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#share=${encodedData}`
}
```

### Compression Strategy
- Use maximum gzip compression (level: 9)
- Convert to base64 for URL-safe encoding
- Validate size limits before sharing
- Handle compression errors gracefully

### Import/Export Flow
```typescript
// Import from URL
async function importFromUrl(url: string): Promise<Document | null> {
  // 1. Extract encoded data from URL hash
  // 2. Decode base64 to compressed data
  // 3. Decompress with gunzip
  // 4. Parse JSON to document object
  // 5. Validate document structure
}

// Export as file
function exportDocument(document: Document, format: 'md' | 'json') {
  // Generate downloadable file
  // Handle different export formats
}
```

## Component Patterns

### Share Dialog Implementation
```vue
<script setup>
const { shareDocument, generateShareLink, isSharing, shareError } = useDocumentShare()
</script>

<template>
  <DialogModal>
    <div class="share-options">
      <ShareLinkGenerator :document="activeDocument" />
      <ExportOptions :document="activeDocument" />
    </div>
  </DialogModal>
</template>
```

### Error Handling
```typescript
// Comprehensive error states
const shareError = ref<string | null>(null)
const importError = ref<string | null>(null)

// Error scenarios:
// - Document too large for URL sharing
// - Compression/decompression failures
// - Invalid share data format
// - Clipboard access denied
```

### Loading States
```typescript
const isSharing = ref(false)
const isImporting = ref(false)

// Show loading indicators during:
// - URL generation and compression
// - Clipboard operations
// - File download/upload
// - Document validation
```

## Common Tasks

### Adding Export Formats
1. Extend export function with new format
2. Add format-specific processing logic
3. Update UI with new export option
4. Test export/import round-trip

### Share Link Optimization
```typescript
// Optimize compression:
// - Remove unnecessary whitespace
// - Minimize JSON keys
// - Use efficient data structures
// - Implement content-specific compression
```

### Import Validation
```typescript
function validateImportedDocument(data: any): Document | null {
  // Validate required fields
  // Sanitize content
  // Check data integrity
  // Ensure backward compatibility
}
```

## Security Considerations

### Content Sanitization
- Validate imported document structure
- Sanitize markdown content
- Prevent XSS in shared content
- Limit document size to prevent DoS

### URL Safety
- Use hash fragments (not query params) for data
- Validate encoded data format
- Handle malformed share URLs gracefully
- Avoid exposing sensitive information

## Performance Optimization

### Compression Efficiency
```typescript
// Optimize for size:
// - Use highest compression level
// - Remove redundant data
// - Compress only necessary fields
// - Cache compression results when possible
```

### Large Document Handling
- Check size limits before processing
- Provide chunked import for large files
- Show progress indicators for long operations
- Implement streaming for very large documents

## Integration Points
- Works with documents module for document management
- Integrates with clipboard API for sharing
- Connects to layout module for modal dialogs
- Uses shared utilities for document title extraction

## User Experience

### Share Flow
1. User clicks share button
2. System generates compressed URL
3. URL automatically copied to clipboard
4. Success feedback shown to user
5. Share link can be manually copied if needed

### Import Flow
1. User pastes share URL or uploads file
2. System validates and decompresses data
3. Document preview shown for confirmation
4. User confirms import to add to documents
5. New document becomes active

## Browser Compatibility
- Use feature detection for clipboard API
- Provide fallback for manual copy/paste
- Handle different compression support levels
- Test across major browsers

## Testing Considerations
- Test compression/decompression round-trips
- Verify URL generation and parsing
- Check size limit enforcement
- Test clipboard integration
- Validate import error handling

## Accessibility Features
- Keyboard navigation for all share actions
- Screen reader announcements for status changes
- Clear error messages for failed operations
- Alternative sharing methods when clipboard unavailable

## File Export Formats
- **Markdown (.md)**: Raw markdown content
- **JSON (.json)**: Full document with metadata
- Future: PDF, HTML, other formats as needed
