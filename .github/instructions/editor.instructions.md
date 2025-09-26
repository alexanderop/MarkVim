---
description: "Instructions for working with the editor module - CodeMirror 6 integration, Vim mode, and editor settings"
applyTo: "src/modules/editor/**/*"
---

# Editor Module Instructions

## Module Purpose
Integrates CodeMirror 6 with Vim mode support, comprehensive editor settings, and seamless document content synchronization.

## Key Components
- `VimEditor.client.vue` - Main CodeMirror editor component
- `composables/useEditorSettings.ts` - Editor configuration management
- `composables/useVimBindings.ts` - Vim mode state management

## Editor Settings Structure

### Settings Interface
```typescript
interface EditorSettings {
  // Vim configuration
  vimMode: boolean
  vimKeymap: 'vim' | 'emacs' | 'sublime' | 'vscode'

  // Editor appearance
  fontSize: number
  fontFamily: 'mono' | 'sans'
  lineNumbers: boolean
  lineNumberMode: 'absolute' | 'relative' | 'both'
  lineWrapping: boolean

  // Code formatting
  tabSize: number
  insertSpaces: boolean
  autoIndent: boolean

  // Markdown specific
  livePreview: boolean
  previewSync: boolean
  markdownExtensions: {
    tables: boolean
    footnotes: boolean
    mathBlocks: boolean
    codeBlocks: boolean
  }

  // Editor behavior
  autoSave: boolean
  autoSaveDelay: number
  bracketMatching: boolean
  highlightActiveLine: boolean
}
```

## Development Guidelines

### CodeMirror 6 Integration
- Use composition-based extension system
- Configure extensions based on user settings
- Handle state synchronization with Vue reactivity
- Implement proper cleanup for editor instances

### Vim Mode Implementation
```typescript
// Vim state management
const { isVimMode, currentMode, vimModeDisplay, toggleVimMode, setVimMode } = useVimBindings()

// Mode tracking: 'normal' | 'insert' | 'visual'
// Display mode in status bar
// Handle mode transitions properly
```

### Settings Management
- Use `useState` with localStorage persistence
- Handle hydration safety with `useMounted`
- Merge user settings with defaults gracefully
- Auto-save settings changes

### CSS Custom Properties
```typescript
// Update CSS variables for responsive font size
const fontSizeVar = useCssVar('--font-size-base')
watchEffect(() => {
  fontSizeVar.value = `${settings.value.fontSize}px`
})
```

## Component Patterns

### Editor Configuration
- Apply settings to CodeMirror extensions dynamically
- Handle setting changes without editor re-creation
- Maintain cursor position during configuration updates
- Support theme integration with color system

### Document Synchronization
- Bind editor content to document store reactively
- Handle auto-save with debouncing
- Prevent infinite update loops
- Maintain editor state during document switches

### Performance Optimization
- Use lazy loading for heavy CodeMirror extensions
- Debounce expensive operations (save, preview sync)
- Optimize re-renders with proper dependency tracking
- Cache compiled editor configurations

## Common Tasks

### Adding Editor Extensions
1. Import CodeMirror extension
2. Add configuration to settings interface
3. Include in editor extension array conditionally
4. Update settings UI components

### Vim Mode Enhancements
- Extend vim keymap with custom commands
- Handle mode-specific UI updates
- Integrate with application shortcuts
- Provide vim command completion

### Settings Features
```typescript
// Settings operations
const {
  settings,
  toggleVimMode,
  toggleLineNumbers,
  updateFontSize,
  exportSettings,
  importSettings,
  resetToDefaults
} = useEditorSettings()
```

## CodeMirror Extensions

### Core Extensions
- Language support (Markdown)
- Syntax highlighting
- Bracket matching
- Line numbers (absolute/relative)
- Search/replace functionality

### Vim Extension
- Full vim modal editing
- Command line interface
- Register system
- Macro recording/playback
- Visual selection modes

### Custom Extensions
- Auto-save functionality
- Live preview synchronization
- Custom key bindings
- Markdown-specific features

## Integration Points
- Syncs with documents module for content management
- Works with layout module for responsive editor sizing
- Connects to shortcuts module for keyboard commands
- Integrates with color-theme module for syntax highlighting

## Performance Considerations
- Lazy load extensions based on settings
- Use virtual scrolling for large documents
- Optimize syntax highlighting for performance
- Handle large file editing efficiently

## Accessibility
- Support screen reader navigation
- Provide keyboard shortcuts for all functions
- Ensure high contrast mode compatibility
- Support assistive technology integration

## Mobile Responsiveness
- Adjust font size for mobile screens
- Handle virtual keyboard overlays
- Optimize touch interactions
- Provide mobile-specific vim alternatives

## Error Handling
- Handle CodeMirror initialization failures
- Validate editor configuration
- Provide fallback for unsupported features
- Show user-friendly error messages
