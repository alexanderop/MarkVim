# MarkVim Development Instructions

MarkVim is a Nuxt 3 Markdown editor with Vim mode support, built using a modular architecture.

## Core Technologies & Framework Guidelines

- **Nuxt 3** - Vue.js meta-framework with auto-imports
- **Pinia** - State management with persistence to localStorage
- **CodeMirror 6** - Editor component with vim extension
- **UnoCSS** - Atomic CSS framework for styling
- **TypeScript** - Strict typing with interface definitions
- **Playwright + Cucumber** - E2E testing with BDD scenarios

## Development Commands

Install dependencies: `pnpm install`  
Start dev server: `pnpm dev`  
Build: `pnpm build`  
Lint: `pnpm lint`  
Type check: `pnpm typecheck`  
E2E tests: `pnpm test:e2e`

## Core Architectural Patterns

1. **Module-Based Architecture**: All features organized under `src/modules/` with dedicated components, composables, and stores
2. **Client-Only Rendering**: Use `<ClientOnly>` wrapper for components that access localStorage to avoid hydration mismatches
3. **Composables Pattern**: Extract business logic into reusable composables with clear naming conventions (`use*`)
4. **Store Persistence**: Use `useLocalStorage` from VueUse for persistent state management
5. **Auto-Imports**: Leverage Nuxt's auto-import system - avoid manual imports for Vue composables, Pinia stores, and utilities

## Code Style & Conventions

- Use TypeScript interfaces for all component props and data structures
- Prefer composition API with `<script setup>` syntax
- Use `defineProps<Props>()` with interface definitions
- Name client-only components with `.client.vue` suffix
- Use semantic CSS classes with UnoCSS atomic utilities
- Apply responsive design patterns (mobile-first)
- Implement proper ARIA labels for accessibility

## State Management

- Documents managed by centralized Pinia store (`src/modules/documents/store.ts`)
- Use `useLocalStorage` for client-side persistence
- Sync active document state with editor in real-time
- Handle hydration carefully with client-only patterns

## Testing Strategy

- Write E2E tests using Cucumber BDD scenarios
- Use page objects pattern for maintainable tests
- Cover core workflows: editing, document management, theme switching
- Test accessibility features and keyboard navigation

## Security & Performance

- Never commit secrets or expose sensitive data
- Use client-side only rendering for localStorage operations
- Optimize for mobile devices with responsive design
- Implement proper keyboard shortcuts and vim bindings

## Integration Guidelines

- Follow existing module patterns when adding new features
- Prefer modifying existing modules over creating new files
- Use the established event bus pattern for cross-component communication
- Maintain consistency with existing naming conventions and file structure

## Always look up Instructions first that could apply to a module