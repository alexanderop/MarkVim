# CLAUDE.md - MarkVim Development Guide

## Project Overview

MarkVim is a Nuxt 3-based Markdown editor that provides a full Vim editing experience in the browser. It features live preview, document management, and enhanced Markdown capabilities including Mermaid diagrams and GitHub-style alerts.

### Tech Stack
- **Framework**: Nuxt 3, Vue 3
- **Editor**: CodeMirror 6 with Vim bindings (@replit/codemirror-vim)
- **State Management**: Pinia with localStorage persistence
- **Styling**: UnoCSS with Wind4 preset
- **Markdown**: markdown-it with extensions (Mermaid, footnotes, GitHub alerts)
- **Testing**: Cucumber + Playwright (BDD approach)
- **Language**: TypeScript with strict mode

## Development Commands

### Essential Commands
```bash
# Install dependencies (use pnpm)
pnpm install

# Start development server (http://localhost:3000)
pnpm dev

# Run linting and fix issues
pnpm run lint:fix

# Type checking
pnpm run typecheck

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing Commands
```bash
# Run E2E tests (headless) - REQUIRES DEV SERVER RUNNING
pnpm run test:e2e

# Run E2E tests with browser UI - REQUIRES DEV SERVER RUNNING
pnpm run test:e2e:headed

# Run tests with auto-started server (RECOMMENDED FOR DEBUGGING)
pnpm run test:e2e:with-server

# IMPORTANT: Always use test:e2e:with-server when debugging E2E tests
# This automatically starts the dev server before running tests
```

## Project Structure

```
MarkVim/
├── src/                    # Main source code
│   ├── app/               # Root application components
│   │   └── AppShell.vue   # Main application shell (397 lines)
│   ├── modules/           # Feature modules (modular architecture)
│   │   ├── color-theme/   # Theme customization
│   │   ├── documents/     # Document management
│   │   ├── editor/        # CodeMirror editor
│   │   ├── layout/        # UI layout & resizing
│   │   ├── markdown-preview/ # Markdown rendering
│   │   ├── share/         # Import/export features
│   │   └── shortcuts/     # Keyboard shortcuts
│   └── shared/            # Shared utilities
│       ├── components/    # Base UI components
│       ├── composables/   # Shared hooks
│       └── utils/         # Helper functions
├── tests/                 # E2E test suite
│   ├── features/          # Gherkin test scenarios
│   ├── steps/             # Step definitions
│   └── page-objects/      # Page Object Model
└── Configuration files
```

## Key Features & Implementation

### 1. Vim Mode Editor
- **Location**: `src/modules/editor/`
- **Main Component**: `MyCodeMirror.vue`
- **Settings**: Stored in localStorage via `useEditorSettings()`
- **Features**: Relative line numbers, Vim keybindings, customizable font size

### 2. Document Management
- **Location**: `src/modules/documents/`
- **Store**: `store.ts` - Pinia store with localStorage persistence
- **Features**: CRUD operations, auto-save, document list in sidebar
- **Default Content**: Template in `default-content.ts`

### 3. Markdown Preview
- **Location**: `src/modules/markdown-preview/`
- **Composables**: `useMarkdown()`, `useMermaid()`
- **Features**:
  - Syntax highlighting (Shiki)
  - Mermaid diagrams
  - GitHub alerts
  - Footnotes
  - Synchronized scrolling

### 4. Keyboard Shortcuts
- **Location**: `src/modules/shortcuts/`
- **Implementation**: `useShortcuts()` composable with `useMagicKeys()`
- **Command Palette**: Accessible via `Cmd/Ctrl+K`
- **Common Shortcuts**:
  - `Cmd/Ctrl+K`: Command palette
  - `Cmd/Ctrl+S`: Save document
  - `Cmd/Ctrl+N`: New document
  - `Cmd/Ctrl+/`: Toggle shortcuts modal

### 5. Theme System
- **OKLCH Color Support**: Dynamic color customization
- **CSS Variables**: Defined in `src/shared/ui/tokens.css`
- **Dark Mode**: Pre-configured in `nuxt.config.ts`
- **Custom Themes**: Persisted to localStorage

## Development Guidelines

### Code Style
- Follow existing patterns in the codebase
- Use TypeScript strict mode
- Prefer composition API and `<script setup>`
- Use `data-testid` attributes for E2E testing
- Run `pnpm run lint:fix` before committing

### Component Structure
```vue
<script setup lang="ts">
// Imports first
import { computed, ref } from 'vue'

// Composables
const { someFunction } = useComposable()

// State
const state = ref('')

// Computed
const computedValue = computed(() => state.value)

// Methods
function handleAction() {
  // Implementation
}
</script>

<template>
  <div data-testid="component-name">
    <!-- Template -->
  </div>
</template>
```

### State Management
- Use Pinia stores for global state
- Module-specific stores in `modules/[module]/store.ts`
- Persist to localStorage when needed
- Use `storeToRefs()` for reactive destructuring

### Testing Approach
- BDD with Cucumber + Playwright
- Write Gherkin scenarios first
- Use Page Object Model pattern
- Always use `data-testid` for element selection
- Test user behavior, not implementation

## Common Tasks

### Adding a New Feature Module
1. Create directory: `src/modules/[feature-name]/`
2. Add components in `components/`
3. Add composables in `composables/`
4. Create store if needed: `store.ts`
5. Register in relevant components

### Adding Keyboard Shortcuts
1. Open `src/app/AppShell.vue`
2. Find the `registerShortcuts()` section
3. Add new shortcut registration:
```typescript
registerShortcut({
  keys: 'cmd+shift+p',
  description: 'My new action',
  action: () => {
    // Implementation
  },
  category: 'General',
})
```

### Modifying Editor Settings
1. Edit `src/modules/editor/composables/useEditorSettings.ts`
2. Update `EditorSettings` interface
3. Add to `DEFAULT_EDITOR_CONFIG`
4. Create toggle/update methods if needed

### Adding Markdown Extensions
1. Edit `src/modules/markdown-preview/composables/useMarkdown.ts`
2. Import and configure the extension
3. Update the markdown-it instance
4. Test rendering in preview pane

## Troubleshooting

### Common Issues

**Editor not loading**
- Check console for CodeMirror errors
- Verify Vim extension is properly imported
- Clear localStorage and reload

**Document not saving**
- Check localStorage quota
- Verify document store is properly initialized
- Look for errors in console

**Tests failing**
- Ensure dev server is running for E2E tests
- Check for missing `data-testid` attributes
- Review test output for specific failures

**Styling issues**
- Run `pnpm run lint:fix` for formatting
- Check UnoCSS configuration
- Verify CSS variables are defined

## Performance Considerations

- Use lazy loading for heavy components
- Implement virtual scrolling for long documents
- Debounce markdown rendering (already implemented)
- Minimize localStorage reads/writes
- Use `v-show` instead of `v-if` for frequently toggled elements

## Security Notes

- All data stored locally in browser
- No server-side storage or authentication
- Be cautious with markdown content (sanitized by default)
- Export/import features use client-side only

## Contributing

1. Fork the repository
2. Create feature branch
3. Write tests first (BDD approach)
4. Implement feature
5. Run `pnpm run lint:fix`
6. Run `pnpm run test:e2e`
7. Submit PR with clear description

## Architecture Decisions

- **Modular structure**: Each feature is self-contained for maintainability
- **Composables pattern**: Reusable logic across components
- **localStorage persistence**: Simple, no backend required
- **BDD testing**: User-focused test scenarios
- **OKLCH colors**: Modern color system with better perceptual uniformity
- **CodeMirror 6**: Modern, extensible editor framework

## Resources

- [Nuxt 3 Documentation](https://nuxt.com)
- [CodeMirror 6 Guide](https://codemirror.net/docs/guide/)
- [Vim Bindings](https://github.com/replit/codemirror-vim)
- [UnoCSS Documentation](https://unocss.dev)
- [Pinia Documentation](https://pinia.vuejs.org)
