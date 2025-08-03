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

### Module Structure
The application is organized into feature modules under `src/modules/`:

- **color-theme** - Theme customization with OKLCH color picker
- **documents** - Document CRUD operations and persistence via localStorage
- **editor** - CodeMirror integration with vim mode support
- **layout** - App layout components (header, status bar, resizable panes)
- **markdown-preview** - Live preview with Mermaid diagram support
- **share** - Document import/export functionality
- **shortcuts** - Keyboard shortcuts and command palette

### Key Architectural Patterns

1. **Client-Only Rendering**: Document management components use `<ClientOnly>` to avoid hydration mismatches
2. **Composables Pattern**: Business logic extracted into composables for reusability
3. **Store Persistence**: Documents and settings persist to localStorage
4. **Event Bus**: Cross-component communication via VueUse event bus
5. **Responsive Design**: Mobile-first with adaptive layouts

### State Management
- Documents are managed by Pinia store (`src/modules/documents/store.ts`)
- Active document syncs with editor in real-time
- Color theme persists via dedicated store

### Testing Strategy
- E2E tests use Cucumber for BDD-style scenarios
- Page objects pattern for maintainable tests
- Tests cover core workflows: editing, document management, theme switching

When working with this codebase, prefer modifying existing modules over creating new files, and follow the established patterns for consistency.
