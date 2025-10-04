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

# Kill all running node/localhost server processes
pnpm kill:servers
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

### Code Quality Requirements
**IMPORTANT: After completing any task, you MUST:**
1. Run `pnpm typecheck` to verify TypeScript types
2. Run `pnpm lint` to verify ESLint rules
3. Fix any errors before considering the task complete
4. Update this CLAUDE.md file if you introduce new patterns or conventions

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
Nuxt is configured with `components: false` to disable automatic component registration. All components must be explicitly imported.

**Local components** are imported directly:
```ts
import BaseModal from '~/shared/components/BaseModal.vue'
```

**Nuxt UI components** must be imported from `#components`:
```ts
import { UButton, UCard, UInput } from '#components'
```

**Why `#components` for Nuxt UI?**
- Nuxt UI doesn't expose per-component ESM exports from `@nuxt/ui`
- It relies on Nuxt's component registry system
- `#components` gives explicit imports while using the registry
- This is the only way to import Nuxt UI components when auto-imports are disabled

**Examples:**
```vue
<script setup lang="ts">
// ✅ Correct - Nuxt UI components from #components
import { UButton, UModal } from '#components'

// ✅ Correct - Local components with path
import BaseModal from '~/shared/components/BaseModal.vue'

// ❌ Wrong - This doesn't work
import { UButton } from '@nuxt/ui'
import UButton from '#ui/components/Button.vue'
</script>
```

### Dependencies Overview
Key dependencies include:
- **Nuxt UI** - Comprehensive UI component library (import from `#components`)
- **CodeMirror 6** with vim extension (`@replit/codemirror-vim`)
- **Mermaid** for diagram rendering
- **Markdown-it** with plugins for footnotes and GitHub alerts
- **Shiki** for syntax highlighting
- **VueUse** for composable utilities
- **UnoCSS** for styling
- **Reka UI** for base components (use Nuxt UI when available)
- **Knip** for detecting unused exports, files, and dependencies

### Component Preferences
When implementing UI features:
1. **Prefer Nuxt UI components** over custom implementations or lower-level Reka UI components
2. **Check Nuxt UI first**: Before building custom components, check if Nuxt UI provides a suitable component
3. **Nuxt UI benefits**: Better accessibility, consistent styling, built-in features (fuzzy search, keyboard navigation, etc.)
4. **Example**: Use `UCommandPalette` instead of building custom search with Reka UI Dialog

**Nuxt UI has many powerful components available via the MCP server:**
- `UCommandPalette` - Fuzzy search with Fuse.js, keyboard navigation, grouping
- `UModal`, `UDrawer`, `USlideover` - Overlays with better UX than basic dialogs
- `UButton`, `UInput`, `UKbd` - Consistent, accessible form elements
- And many more - always check the Nuxt UI MCP before building custom

### Color System Rules

**CRITICAL: Never use hardcoded colors. All colors MUST be user-configurable via the theme system.**

#### Available Theme Colors (CSS Variables)
Use ONLY these dynamic CSS variables for colors:

**Core Colors:**
- `var(--accent)` - Primary interactive color (buttons, links, highlights)
- `var(--foreground)` - Primary text color
- `var(--background)` - Primary background color
- `var(--muted)` - Secondary backgrounds, subtle surfaces
- `var(--border)` - Borders, dividers, separators

**Alert/Semantic Colors:**
- `var(--alert-note)` - Info/note states (blue by default)
- `var(--alert-tip)` - Success/tips (green by default)
- `var(--alert-important)` - Important notices (purple by default)
- `var(--alert-warning)` - Warnings (orange by default)
- `var(--alert-caution)` - Errors/danger (red by default)

**Nuxt UI Components:**
Nuxt UI components automatically use theme colors via overrides in `src/shared/ui/tokens.css`:
- `color="primary"` → uses `var(--accent)`
- `color="error"` → uses `var(--alert-caution)`
- `color="success"` → uses `var(--alert-tip)`
- `color="info"` → uses `var(--alert-note)`
- `color="warning"` → uses `var(--alert-warning)`

#### Examples

✅ **CORRECT:**
```vue
<!-- Backgrounds and borders -->
<div class="bg-[var(--accent)]/10 border border-[var(--accent)]/20">
  <span class="text-[var(--accent)]">Accent text</span>
</div>

<!-- Success state -->
<div class="bg-[var(--alert-tip)]/10 text-[var(--alert-tip)]">
  Success message
</div>

<!-- Nuxt UI components -->
<UButton color="primary">Primary Button</UButton>
<UButton color="error">Delete</UButton>
```

❌ **WRONG:**
```vue
<!-- Never use hardcoded Tailwind colors -->
<div class="bg-blue-500 text-green-600 border-red-400">
  Hardcoded colors
</div>

<!-- Never use hex colors -->
<div style="color: #3b82f6; background: #10b981">
  Hardcoded hex colors
</div>
```

**Why?** Users can customize all theme colors. Hardcoded colors break this functionality and create visual inconsistencies.

When working with this codebase, prefer modifying existing modules over creating new files, and follow the established patterns for consistency.
