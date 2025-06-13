# MarkVim Share Functionality Documentation

## Business Overview

The share functionality in MarkVim enables users to share their markdown documents with others via compressed URLs without requiring any server infrastructure or user accounts. This feature provides a simple, privacy-focused way to distribute documents.

### Key Business Features

**Document Sharing**
- Share any document via a generated URL
- No user registration or server storage required
- Document data is embedded directly in the URL fragment
- Complete privacy - data never touches external servers
- Works across different MarkVim installations

**Document Import**
- Import shared documents via URL links
- Automatic detection of share links in the URL
- Manual import option for pasting links
- Preview before importing

**Size Management**
- Advanced compression using fflate GZIP algorithm
- Maximum compressed size limit of 50KB to support larger documents
- Real-time feedback on document shareability
- Technical statistics for advanced users

### User Workflow

1. **Sharing a Document**
   - User clicks the share button in the header toolbar
   - System generates a compressed URL containing the document
   - User copies the link to share with others
   - Optional technical details show compression stats

2. **Importing a Document**
   - Automatic: User opens a MarkVim URL with `#share=` fragment - document is immediately imported and opened in preview mode
   - Manual: User pastes a share link into the import dialog
   - System validates and previews the document
   - User confirms import to add to their document collection

## Technical Architecture

### Module Structure

```
src/modules/share/
├── composables/
│   └── useDocumentShare.ts    # Core sharing logic
└── components/
    ├── ShareButton.vue        # Share button component
    ├── ShareDialog.vue        # Share link generation dialog
    ├── ShareManager.vue       # Auto-detection and import management
    └── ImportDialog.vue       # Manual/auto import dialog
```

### Core Composable: useDocumentShare()

**File**: `src/modules/share/composables/useDocumentShare.ts`

The main composable that handles all sharing and importing logic:

**Key Constants**:
- `MAX_COMPRESSED_SIZE = 50_000` - Maximum allowed compressed document size in bytes (50KB)

**Reactive State**:
- `isSharing` - Boolean indicating active sharing operation
- `isImporting` - Boolean indicating active import operation  
- `shareError` - Error message for sharing failures
- `importError` - Error message for import failures
- `clipboardSupported` - Browser clipboard API support detection

**Key Functions**:

#### generateShareLink(document: Document): string | null
- Compresses document data using fflate GZIP compression (level 9)
- Creates URL with `#share=` fragment containing base64-encoded compressed data
- Returns null if document too large or compression fails
- Handles error states and user feedback

#### shareDocument(document: Document): Promise<boolean>
- Generates share link and copies to clipboard
- Returns success/failure boolean
- Manages loading states during operation

#### parseShareUrl(url?: string): ShareableDocument | null
- Extracts and decompresses document data from URL fragment
- Validates document structure and content
- Handles malformed or corrupted share links

#### importFromUrl(url?: string): Promise<Document | null>
- Complete import flow from URL to Document object
- Generates new document ID and timestamps
- Error handling for invalid links

#### getShareStats(document: Document)
- Calculates compression statistics
- Determines if document can be shared (size limits)
- Provides technical details for advanced users

### Data Structures

#### ShareableDocument Interface
```typescript
interface ShareableDocument {
  id: string          // Original document ID
  title: string       // Extracted document title
  content: string     // Full markdown content
  createdAt: number   // Original creation timestamp
  sharedAt: number    // Share generation timestamp
}
```

#### Document Interface
Used throughout the application for document storage:
```typescript
interface Document {
  id: string          // Unique identifier
  content: string     // Markdown content
  createdAt: number   // Creation timestamp  
  updatedAt: number   // Last modification timestamp
}
```

### Component Architecture

#### ShareButton.vue
- Compact toolbar button for initiating share
- Disabled state for unshareable documents (too large)
- Loading indicator during share operations
- Integrates with ShareDialog for full share experience

**Props**:
- `document: Document | null` - Document to share
- `disabled?: boolean` - External disable state

#### ShareDialog.vue
- Modal dialog for share link generation and management
- Clipboard integration for easy copying
- Advanced statistics toggle for technical users
- Real-time link generation when opened

**Props**:
- `open: boolean` - Dialog visibility state
- `document: Document | null` - Document to share

**Features**:
- Auto-generates share link when opened
- Copy to clipboard with success feedback
- Expandable technical details section
- Error state handling for large documents

#### ShareManager.vue
- Handles automatic share link detection on page load
- Automatically imports shared documents without user confirmation
- Switches to preview mode after auto-import
- Integrates with document storage system
- URL cleanup after successful imports

**Key Functions**:
- `detectShareInUrl()` - Automatic detection of share fragments and immediate import
- `handleAutoImport()` - Processes automatic imports and switches to preview mode
- `handleImportConfirm()` - Processes confirmed manual imports
- `openManualImport()` - Exposes manual import functionality

#### ImportDialog.vue
- Dual-mode dialog for auto and manual imports
- Document preview before confirming import
- URL validation and error handling
- User-friendly import experience

**Props**:
- `open: boolean` - Dialog visibility state
- `autoImportDocument?: Document | null` - Pre-loaded document for auto-import

**Modes**:
- **Auto Import**: Shows preview of detected document
- **Manual Import**: Text area for pasting share links

### Integration Points

#### Auto-Imports Configuration
The share module is configured for auto-imports in `nuxt.config.ts`:

```typescript
components: [
  {
    path: './modules/share/components',
    pathPrefix: false,
  },
],
imports: {
  dirs: [
    'modules/share/composables',
  ],
},
```

#### Main Application Integration
In `src/app/AppShell.vue`:
```vue
<ShareManager @document-imported="handleDocumentImported" />
```

#### Header Toolbar Integration
In `src/modules/layout/components/HeaderToolbar.vue`:
```vue
<ShareButton :document="activeDocument" />
```

### Dependencies

**External Dependencies**:
- `fflate` (^0.8.2) - High-performance document compression/decompression
- `@vueuse/core` - Clipboard API integration (`useClipboard`)

**Internal Dependencies**:
- `~/modules/documents/composables/useDocuments` - Document management
- Various UI components from shared component library

### Technical Implementation Details

#### Compression Strategy
- Uses fflate's GZIP compression with maximum level (9) for optimal compression ratios
- Base64 encoding for URL-safe transmission in fragments
- Typical compression ratios: 70-85% size reduction (better than previous LZ-string)
- URL fragment storage avoids server round-trips
- 50KB compressed size limit accommodates larger documents while maintaining browser compatibility

#### Privacy & Security
- No server storage - everything client-side
- Document data never leaves the user's browser except via shared URLs
- URL fragments don't appear in server logs
- No authentication or user tracking

#### Browser Compatibility
- Modern browsers with clipboard API support
- Graceful degradation for older browsers
- URL fragment support universal across browsers

#### Error Handling
- Comprehensive error states for all operations
- User-friendly error messages
- Automatic cleanup of malformed share data
- Size limit enforcement with clear feedback

### Testing

The share functionality includes comprehensive end-to-end tests in:
- `tests/features/markvim-share.feature` - Cucumber scenarios
- `tests/steps/markvim-share.steps.ts` - Step implementations
- `tests/page-objects/markvim-page.ts` - Page object methods

**Test Coverage**:
- Share button visibility and states
- Share dialog functionality
- Link generation and copying
- Advanced statistics display
- Import dialog workflows
- Auto-detection of share URLs
- Error handling scenarios

### Development Guidelines

#### Adding New Share Features
1. Extend the `useDocumentShare` composable for new functionality
2. Update relevant components to expose new features
3. Add test coverage for new functionality
4. Consider size limits and compression impact

#### Debugging Share Issues
1. Check browser console for compression errors
2. Verify document size against `MAX_COMPRESSED_SIZE` (50KB limit)
3. Test URL parsing with malformed share links
4. Validate clipboard API availability
5. Monitor fflate compression performance for very large documents

#### Performance Considerations
- fflate provides faster compression/decompression than previous LZ-string implementation
- GZIP compression happens synchronously - generally fast enough for documents up to 50KB
- URL parsing is lightweight but validate input sanitization
- Component lazy loading already configured via Nuxt
- Bundle size reduced with fflate's tree-shakable architecture

### Future Enhancements

**Potential Improvements**:
- Explore even newer compression algorithms (Brotli, ZSTD) as browser support improves
- Batch sharing of multiple documents
- Share link expiration or access controls
- Analytics on share link generation (privacy-preserving)
- Integration with external sharing platforms

**Technical Debt**:
- Consider async compression for documents approaching the 50KB limit
- Improve error recovery for partial share failures
- Enhanced clipboard integration across browsers
- Better mobile sharing experience
- Evaluate compression level trade-offs (speed vs. size) for user experience 