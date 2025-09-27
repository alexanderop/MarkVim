# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
```bash
# Install dependencies (required first)
pnpm install

# Start development server on http://localhost:3000
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing & Quality
```bash
# Run linter
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Type checking
pnpm typecheck

# Run E2E tests (requires dev server running)
pnpm test:e2e

# Run E2E tests with browser visible
pnpm test:e2e:headed

# Run E2E tests with automatic server start
pnpm test:e2e:with-server
```

### Git Hooks
The project uses Husky with pre-commit hooks that automatically run `pnpm lint` on staged files.

## High-Level Architecture

MarkVim is a Nuxt 3 Markdown editor with Vim mode support, built using a modular architecture:

### Core Technologies
- **Nuxt 3** - Vue.js meta-framework
- **Pinia** - State management
- **CodeMirror 6** - Editor component with vim extension
- **UnoCSS** - Atomic CSS framework
- **Playwright + Cucumber** - E2E testing

### Project Structure
The application follows a modular architecture with organized directories:

```
src/
├── app/              # App-level components and layouts
├── composables/      # Global composables
├── modules/          # Feature modules (see below)
├── platform/         # Platform abstraction layer
│   ├── commands/     # Command system
│   ├── events/       # Event handling
│   ├── keyboard/     # Keyboard management
│   └── storage/      # Storage abstraction
├── plugins/          # Nuxt plugins
├── shared/           # Shared utilities and components
│   ├── components/   # Reusable components
│   ├── composables/  # Shared composables
│   ├── ui/          # UI tokens and styles
│   └── utils/       # Utility functions
├── types/            # TypeScript type definitions
├── ui/              # UI system
│   ├── components/   # Base UI components
│   └── tokens/       # Design tokens
└── utils/           # App-level utilities
```

### Module Structure
Each module under `src/modules/` follows a consistent structure:

- **color-theme** - Theme customization with OKLCH color picker
  - `api/`, `components/`, `composables/`, `internal/`, `stores/`
- **documents** - Document CRUD operations and persistence via localStorage  
  - `api/`, `components/`, `composables/`, `internal/`, `stores/`
- **editor** - CodeMirror integration with vim mode support
  - `api/`, `components/`, `composables/`, `internal/`
- **layout** - App layout components (header, status bar, resizable panes)
  - `api/`, `components/`, `composables/`, `internal/`
- **markdown-preview** - Live preview with Mermaid diagram support
  - `components/`, `composables/`
- **share** - Document import/export functionality
  - `components/`, `composables/`
- **shortcuts** - Keyboard shortcuts and command palette
  - `api/`, `components/`, `composables/`, `internal/`

### Key Architectural Patterns

1. **Client-Only Rendering**: Document management components use `<ClientOnly>` to avoid hydration mismatches
2. **Composables Pattern**: Business logic extracted into composables for reusability
3. **Store Persistence**: Documents and settings persist to localStorage
4. **Typed Event Bus**: Cross-component communication via typed event bus (`src/shared/utils/eventBus.ts`)
5. **Platform Abstraction**: Platform layer provides abstractions for commands, events, keyboard, and storage
6. **Modular Structure**: Each module contains its own API, components, composables, and internal logic
7. **Responsive Design**: Mobile-first with adaptive layouts

### State Management
- Documents are managed by Pinia store (`src/modules/documents/stores/store.ts`)
- Color theme managed by Pinia store (`src/modules/color-theme/stores/store.ts`)
- Active document syncs with editor in real-time via event bus
- Settings and documents persist to localStorage

### Testing Strategy
- E2E tests use Cucumber for BDD-style scenarios
- Page objects pattern for maintainable tests
- Tests cover core workflows: editing, document management, theme switching

### Event System
The application uses a typed event bus (`src/shared/utils/eventBus.ts`) for cross-component communication with events like:
- `document:*` - Document lifecycle events (create, delete, select)
- `editor:*` - Editor content and text insertion events  
- `view:*` - View mode switching events
- `command-palette:*` - Command palette open/close events
- `vim-mode:*` - Vim mode change events
- `settings:*` - Settings toggle events

### Component Auto-Import
Nuxt is configured to auto-import components from:
- All module component directories (`src/modules/*/components/`)
- Shared components (`src/shared/components/`)
- App components (`src/app/`)

### Dependencies Overview
Key dependencies include:
- **CodeMirror 6** with vim extension (`@replit/codemirror-vim`)
- **Mermaid** for diagram rendering
- **Markdown-it** with plugins for footnotes and GitHub alerts
- **Shiki** for syntax highlighting
- **VueUse** for composable utilities
- **UnoCSS** for styling
- **Reka UI** for base components

When working with this codebase, prefer modifying existing modules over creating new files, and follow the established patterns for consistency.
