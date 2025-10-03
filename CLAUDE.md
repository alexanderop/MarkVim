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

# Detect unused exports, files, and dependencies
pnpm knip

# Check only for unused exports (recommended for checking module API boundaries)
pnpm knip:exports

# Run E2E tests (requires dev server running)
pnpm test:e2e

# Run E2E tests with browser visible
pnpm test:e2e:headed

# Run E2E tests with automatic server start
pnpm test:e2e:with-server
```

### Git Hooks
The project uses Husky with pre-commit hooks that automatically run `pnpm lint` on staged files.

### Unused Exports Detection

The project uses **Knip** for detecting unused exports in module API files. While ESLint has plugins for this (`import/no-unused-modules`), they have limitations with Vue Single File Components:

- **Issue**: ESLint's import plugin cannot parse imports from Vue `<script>` blocks, leading to false positives
- **Solution**: Knip properly handles Vue SFCs and provides accurate unused export detection

**When to run Knip:**
- Before refactoring module APIs: `pnpm knip:exports`
- To clean up unused code: `pnpm knip` (checks exports, files, dependencies, etc.)
- In CI/CD pipelines to prevent unused exports from being merged

See `knip.json` for configuration details.

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
├── modules/          # Feature modules (see below)
├── shared/           # Shared utilities and components
│   ├── components/   # Reusable components
│   ├── composables/  # Shared composables
│   ├── ui/          # UI tokens and styles
│   └── utils/       # Utility functions
└── types/            # TypeScript type definitions
```

### Module Structure
Each module under `src/modules/` follows a consistent structure:

- **color-theme** - Theme customization with OKLCH color picker
  - `api/`, `components/`, `composables/`, `internal/`, `store.ts`
- **documents** - Document CRUD operations and persistence via localStorage  
  - `api/`, `components/`, `composables/`, `internal/`, `store.ts`
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
5. **Modular Structure**: Each module contains its own API, components, composables, and internal logic
6. **Responsive Design**: Mobile-first with adaptive layouts

### State Management
- Documents are managed by Pinia store (`src/modules/documents/store.ts`)
- Color theme managed by Pinia store (`src/modules/color-theme/store.ts`)
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
- **Knip** for detecting unused exports, files, and dependencies

When working with this codebase, prefer modifying existing modules over creating new files, and follow the established patterns for consistency.
