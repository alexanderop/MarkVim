# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo. Keep files small, predictable, and testable.

---

## Common Development Commands

### Development

```bash
pnpm install            # Install dependencies (first)
pnpm dev                # Start dev server at http://localhost:3000
pnpm build              # Build for production
pnpm preview            # Preview production build
pnpm kill:servers       # Kill all running node/localhost servers
```

### Testing & Quality

```bash
pnpm lint               # Lint
pnpm lint:fix           # Auto-fix lint issues
pnpm typecheck          # Type checking
pnpm knip               # Detect unused exports/files/deps
pnpm knip:exports       # Only unused exports (API boundaries)
pnpm test:e2e           # E2E (requires dev server)
pnpm test:e2e:headed    # E2E with visible browser
pnpm test:e2e:with-server  # E2E with auto server start
```

### Git Hooks

Husky pre-commit runs `pnpm lint` on staged files.

### Code Quality Requirements

After any task, **must**:

1. `pnpm typecheck`  2) `pnpm lint`  3) fix errors  4) update CLAUDE.md if you add patterns/conventions.

### Unused Exports Detection

Use **Knip** (see `knip.json`). ESLint's import plugin misreads Vue `<script>` imports and yields false positives; Knip handles Vue SFCs correctly.

* Run before module-API refactors: `pnpm knip:exports`
* Clean up unused code: `pnpm knip`
* Use in CI to block unused exports

---

## High-Level Architecture

**MarkVim** = Nuxt 3 Markdown editor with Vim mode, modular.

**Core tech**: Nuxt 3, Pinia, CodeMirror 6 (vim), UnoCSS, Playwright + Cucumber.

**Project structure**

```
src/
├── app/              # App-level components/layouts
├── modules/          # Feature modules
├── shared/           # Shared utilities/components
│   ├── components/
│   ├── composables/
│   ├── ui/
│   └── utils/
└── types/            # Type definitions
```

**Module Structure**

Each module contains:
* `api.ts` – **Public interface only.** Exports ONLY what can be used outside the module.
* `components/` – Vue components
* `composables/` – Composables (reactivity, wiring)
* `utils/` – Pure functions, business logic, helpers
* `store.ts` – Optional Pinia store

**Rules**:
1. No `internal/` folder. Use appropriate folders (`utils/`, `composables/`, etc.)
2. `api.ts` exports ONLY what external modules need
3. Internal implementation details stay private to the module

**Modules**

* color-theme – OKLCH theme picker (+ `store.ts`)
* documents  – CRUD + localStorage (+ `store.ts`)
* editor     – CodeMirror + vim
* layout     – Header, status bar, resizable panes
* markdown-preview – Live preview + Mermaid
* share      – Import/export
* shortcuts  – Shortcuts + command palette

**Key architectural choices**

1. Client-only rendering where needed (`<ClientOnly>`)
2. Business logic in composables
3. Store persistence to localStorage
4. Typed event bus (`src/shared/utils/eventBus.ts`)
5. Feature modules own their own implementation details
6. Responsive, mobile-first

---

## Vue Components & Composables Style Guide

Goal: top of file reads like a table of contents; details live below. Keep templates simple, logic testable, data flow clear.

### Components

* Separate behavior vs presentation: leaf UI = props in / events out; orchestration in parent views wiring composables → children.
* Keep templates flat: large `v-if` branches → small child; complex `v-for` lists → list child.
* Pass cohesive data: for app-specific children prefer one domain object over many scalars; for reusable libs keep props explicit.
* Choose implementations by intent: map keys → `<component :is>` instead of big conditionals.
* Split by concern: unrelated prop clusters → focused children (keep stable parent API). If a child is tightly coupled, inline it.
* Template-driven reuse when needed: expose behavior + slots when consumer must own markup; otherwise prefer composables.

### Component Naming

**Pattern**: `Module` → `ComponentType` → `Modifier`

* Module components: prefix with module name (e.g., `DocumentList`, `EditorMarkdown`, `ShareButton`)
* Order: highest-level (module) → general (type) → specific (modifier)
* Groups related components alphabetically for easy discovery

**Examples (correct)**
- `DocumentModalDelete` (not `DocumentDeleteModal`)
- `ColorThemeSliderChannel` (not `ColorThemeChannelSlider`)
- `ShareDialogImport` (not `ShareImportDialog`)

**Why**: Alphabetical grouping by module/type improves navigation and shows relationships at a glance.

### Composables

* Thin and testable: heavy business rules in pure functions; composable handles reactivity/wiring. Inputs = values/refs; outputs = small, named.
* Flexible inputs: accept values/refs/computed; normalize with `toValue` helpers. Prefer options object over long arg lists.
* Control reactivity: introduce boundaries (snapshots/copies/computed) to prevent cascades.
* Fit return shape to use case: minimal surface; advanced outputs behind flags or factory options.
* Lightweight shared state: for local features, prefer module-scoped `reactive`/simple store composable over global store.

### Ideal SFC layout

```vue
<script setup lang="ts">
import { ref, computed, toValue, type Ref } from 'vue'
import { useSomethingShared } from '@/shared/composables/useSomethingShared'

// 1) Shared state
const shared = useSomethingShared()

// 2) Story at a glance
const { count, inc, dec } = useCounter()
const { message, setMessage } = useMessage()
const { isValid, validate } = useValidation(count)

// 3) Details below
function useCounter() {
  const count = ref(0)
  const inc = () => { count.value++ }
  const dec = () => { count.value-- }
  return { count, inc, dec }
}
function useMessage() {
  const message = ref('')
  const setMessage = (t: string) => { message.value = t }
  return { message, setMessage }
}
function useValidation(count: Ref<number>) {
  const isValid = computed(() => count.value > 0)
  const validate = () => isValid.value
  return { isValid, validate }
}
</script>
```

Use inline local composables when logic is component-specific or evolving. Extract to shared composables when reused or deserving dedicated tests.

**PR checklist (Vue)**

1. Leaf components only render/emit
2. Big conditionals split out
3. Big lists extracted
4. Cohesive object props for app-specific children
5. Unrelated concerns split
6. Over-coupled child inlined
7. Implementation selected via mapping + `<component :is>`
8. Composables thin with pure functions
9. Accept refs/values; normalize inputs
10. Use options object
11. Reactive boundaries in place
12. Minimal return surface

---

## State Management

* Documents: Pinia (`src/modules/documents/store.ts`)
* Color theme: Pinia (`src/modules/color-theme/store.ts`)
* Active document ↔ editor sync via event bus
* Persist settings/documents to localStorage

## Testing Strategy

* E2E: Playwright + Cucumber, BDD scenarios, Page Objects
* Cover: editing, document management, theme switching

## Event System

Typed event bus (`src/shared/utils/eventBus.ts`) with events:

* `document:*` (create/delete/select)
* `editor:*` (content/insert)
* `view:*` (mode switch)
* `command-palette:*` (open/close)
* `vim-mode:*` (mode changes)
* `settings:*` (toggles)

## Component Auto-Import

Nuxt config: `components: false`. All components must be explicitly imported.

**Local components**

```ts
import BaseModal from '~/shared/components/BaseModal.vue'
```

**Nuxt UI components** (must import from `#components`)

```ts
import { UButton, UCard, UInput, UModal } from '#components'
```

**Why**: Nuxt UI uses the component registry, not per-component ESM exports. `#components` is the supported import path when auto-imports are disabled.

**Anti-examples (do NOT do)**

```ts
// import { UButton } from '@nuxt/ui'
// import UButton from '#ui/components/Button.vue'
```

## Dependencies Overview

* Nuxt UI (import via `#components`)
* CodeMirror 6 + `@replit/codemirror-vim`
* Mermaid
* Markdown-it (+ footnotes + GitHub alerts)
* Shiki
* VueUse
* UnoCSS
* Reka UI (prefer Nuxt UI when possible)
* Knip

## Component Preferences

1. Prefer Nuxt UI over custom/Reka UI
2. Check Nuxt UI first before building
3. Benefits: a11y, consistent styling, built-ins (fuzzy search, keyboard nav, etc.)
4. Example: use `UCommandPalette` instead of a custom dialog search

**Nuxt UI via MCP offers**: `UCommandPalette`, `UModal`, `UDrawer`, `USlideover`, `UButton`, `UInput`, `UKbd`, etc. Always check MCP first.

---

## Color System Rules

**Critical: no hardcoded colors.** All colors must be user-configurable via theme.

**CSS variables (use ONLY these)**

* `var(--accent)` – Primary interactive
* `var(--foreground)` – Primary text
* `var(--background)` – Primary background
* `var(--muted)` – Subtle surfaces
* `var(--border)` – Borders/dividers
* `var(--alert-note)` – Info
* `var(--alert-tip)` – Success
* `var(--alert-important)` – Important
* `var(--alert-warning)` – Warning
* `var(--alert-caution)` – Error

**Examples (correct)**

```vue
<div class="bg-[var(--accent)]/10 border border-[var(--accent)]/20">
  <span class="text-[var(--accent)]">Accent text</span>
</div>
<div class="bg-[var(--alert-tip)]/10 text-[var(--alert-tip)]">Success</div>
<UButton color="primary">Primary</UButton>
<UButton color="error">Delete</UButton>
```

**Examples (wrong)**

```vue
<div class="bg-blue-500 text-green-600 border-red-400">Hardcoded</div>
<div style="color:#3b82f6;background:#10b981">Hardcoded</div>
```

**Why**: Users can customize theme colors; hardcoding breaks this and causes inconsistency.

---

Prefer modifying existing modules over creating new files. Follow established patterns for consistency.
