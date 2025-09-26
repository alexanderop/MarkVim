---
description: "Instructions for working with shared components, utilities, and design system patterns"
applyTo: "src/shared/**/*"
---

# Shared Components & Utilities Instructions

## Module Purpose
Provides reusable components, composables, utilities, and design system patterns used across all application modules.

## Directory Structure
- `components/` - Reusable UI components
- `composables/` - Shared Vue composables
- `utils/` - Pure utility functions
- `ui/` - UI-specific components and patterns

## Design System Components

### Base Components
```typescript
// BaseButton.vue - Primary button component
interface ButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  iconOnly?: boolean
  dataTestid?: string
}
```

### Component Patterns
- Use semantic color classes (e.g., `text-text-primary`, `bg-surface-primary`)
- Implement consistent focus states with ring utilities
- Support disabled states with opacity and pointer-events
- Include data-testid props for E2E testing

## Development Guidelines

### Component Creation
```vue
<script setup lang="ts">
// Use defineProps with TypeScript interface
interface Props {
  // Required props
  value: string
  // Optional props with defaults
  disabled?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: 'Enter text...'
})

const emit = defineEmits<Emits>()

// Define events with proper typing
interface Emits {
  (e: 'update:value', value: string): void
  (e: 'focus', event: FocusEvent): void
}
</script>
```

### Styling Conventions
- Use UnoCSS atomic classes for consistent design
- Apply semantic color tokens from theme system
- Implement responsive design with mobile-first approach
- Use CSS custom properties for dynamic theming

### Accessibility Standards
- Include proper ARIA labels and roles
- Ensure keyboard navigation support
- Maintain sufficient color contrast ratios
- Support screen reader announcements

## Shared Composables

### Data Management
```typescript
// useDataReset.ts - Global data reset functionality
const { clearAllData, onDataReset, offDataReset } = useDataReset()

// Event-driven architecture
const eventBus = useEventBus<DataResetEvent>('markvim-data-reset')

// localStorage cleanup with namespace prefix
const keysToRemove = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key?.startsWith('markvim-')) {
    keysToRemove.push(key)
  }
}
```

### UI Interaction
```typescript
// useKeyboardScroll.ts - Keyboard navigation
const { enableKeyboardScroll, disableKeyboardScroll } = useKeyboardScroll()

// useWelcome.ts - Welcome screen management
const { showWelcome, dismissWelcome } = useWelcome()
```

## Utility Functions

### Common Utilities
```typescript
// debounce.ts - Performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void

// bus.ts - Event bus implementation
export const bus = useEventBus<any>('global-bus')

// markdown.ts - Markdown processing utilities
export function createMarkdownRenderer(): Promise<MarkdownIt>
export function addDataTestIdToAlerts(html: string): string
```

### File Organization
- Group related utilities in single files
- Export individual functions for tree-shaking
- Use TypeScript for type safety
- Include JSDoc comments for complex functions

## Component Testing

### Testing Patterns
```typescript
// Include data-testid for E2E testing
<BaseButton
  data-testid="submit-button"
  @click="handleSubmit"
>
  Submit
</BaseButton>

// Use semantic selectors when possible
<div role="dialog" aria-labelledby="modal-title">
  <h2 id="modal-title">Modal Title</h2>
</div>
```

### Accessibility Testing
- Test with screen readers
- Verify keyboard navigation
- Check color contrast ratios
- Validate ARIA attributes

## Common Tasks

### Adding New Components
1. Create component in appropriate subdirectory
2. Define TypeScript interfaces for props and events
3. Implement consistent styling with design tokens
4. Add accessibility features (ARIA, keyboard support)
5. Include data-testid for testing
6. Document component API and usage examples

### Extending Design System
```typescript
// Add new variants to existing components
const variants = {
  // Existing variants...
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
  info: 'bg-info text-info-foreground hover:bg-info/90'
}

// Update TypeScript interfaces
variant?: 'default' | 'primary' | 'warning' | 'info' // Add new options
```

### Utility Function Creation
```typescript
// Follow consistent patterns
export function utilityName<T>(
  input: T,
  options?: UtilityOptions
): ReturnType {
  // Validate inputs
  // Process logic
  // Return typed result
}

// Include proper error handling
export function safeUtility(input: unknown): Result | null {
  try {
    // Process input
    return result
  }
  catch (error) {
    console.error('Utility failed:', error)
    return null
  }
}
```

## Performance Considerations

### Component Optimization
- Use `computed` for derived state
- Implement `shallowRef` for large objects
- Apply `defineAsyncComponent` for code splitting
- Use `v-once` for static content

### Bundle Size
- Tree-shake utilities with individual exports
- Lazy load heavy dependencies
- Use dynamic imports for optional features
- Minimize component dependencies

## Integration Guidelines

### Event Bus Usage
```typescript
// Use typed event bus for cross-component communication
interface CustomEvent {
  type: 'custom-action'
  payload: any
}

const customBus = useEventBus<CustomEvent>('custom-events')

// Emit events
customBus.emit({ type: 'custom-action', payload: data })

// Listen for events
customBus.on(({ type, payload }) => {
  if (type === 'custom-action') {
    handleCustomAction(payload)
  }
})
```

### Theme Integration
- Use CSS custom properties for dynamic theming
- Support both light and dark modes
- Implement smooth transitions between themes
- Test with high contrast modes

### Module Communication
- Export reusable patterns as composables
- Provide typed interfaces for component props
- Use event bus for loosely coupled communication
- Maintain clear separation of concerns

## Documentation Standards
- Include TypeScript interfaces for all public APIs
- Document component props and events
- Provide usage examples in code comments
- Maintain consistent naming conventions across modules
