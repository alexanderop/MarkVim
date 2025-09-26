---
description: "Instructions for working with the shortcuts module - keyboard shortcuts, command palette, and application commands"
applyTo: "src/modules/shortcuts/**/*"
---

# Shortcuts Module Instructions

## Module Purpose
Manages application keyboard shortcuts, command palette functionality, and command history for efficient user interaction.

## Key Components
- `CommandPalette.vue` - Searchable command interface
- `composables/useShortcuts.ts` - Keyboard shortcut management
- `composables/useCommandHistory.ts` - Command usage tracking

## Shortcut System Architecture

### Command Interface
```typescript
interface Command {
  id: string
  label: string
  description?: string
  shortcut?: string
  action: () => void
  group?: string
  icon?: string
}

interface ShortcutAction {
  keys: string
  description: string
  action: () => void
  category?: string
  disabled?: ComputedRef<boolean> | Ref<boolean>
  allowInEditor?: boolean
  icon?: string
  id?: string
}
```

### Shortcut Registration
```typescript
const { registerShortcuts, registerAppCommand } = useShortcuts()

// Register keyboard shortcuts
registerShortcuts([
  {
    keys: 'cmd+n',
    description: 'Create new document',
    action: () => createNewDocument(),
    category: 'Documents'
  }
])

// Register command palette only commands
registerAppCommand({
  id: 'toggle-theme',
  keys: 'theme', // Search term
  description: 'Toggle color theme',
  action: () => toggleTheme()
})
```

## Development Guidelines

### Input Context Awareness
```typescript
// Automatically detects when user is in input fields
const notUsingInput = computed(() => {
  const el = activeElement.value
  
  // Checks for:
  // - Standard input/textarea elements
  // - Contenteditable elements
  // - CodeMirror editor instances
  // - Elements with role="textbox"
})
```

### Editor Integration
```typescript
// Some shortcuts work even in editor context
const shortcut: ShortcutAction = {
  keys: 'cmd+s',
  description: 'Save document',
  action: () => saveDocument(),
  allowInEditor: true // Works even when editor is focused
}
```

### Global State Management
```typescript
// Use Nuxt's useState for server-side compatibility
const registeredShortcuts = useState<Map<string, ShortcutAction>>('shortcuts', () => new Map())
const appCommands = useState<Map<string, ShortcutAction>>('appCommands', () => new Map())
```

## Command Palette Features

### Search Functionality
- Fuzzy search across command labels and descriptions
- Search by keyboard shortcut keys
- Filter by command categories
- Show recently used commands first

### Command History
```typescript
const { trackCommandUsage, sortCommandsByHistory } = useCommandHistory()

// Track command execution
trackCommandUsage(commandId)

// Sort commands by usage frequency
const sortedCommands = sortCommandsByHistory(allCommands)
```

### Visual Presentation
- Display keyboard shortcuts with platform-specific formatting
- Group commands by categories
- Show command icons when available
- Highlight search matches

## Component Patterns

### Command Palette Setup
```vue
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="command-palette-overlay">
      <div class="command-palette">
        <SearchInput v-model="searchQuery" />
        <CommandList 
          :commands="filteredCommands"
          @execute="executeCommand"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const { allCommands, formatKeys } = useShortcuts()
const { sortCommandsByHistory } = useCommandHistory()
</script>
```

### Shortcut Registration Pattern
```typescript
// In component setup
onMounted(() => {
  registerShortcuts([
    {
      keys: 'cmd+k',
      description: 'Open command palette',
      action: () => openCommandPalette(),
      category: 'Navigation'
    },
    {
      keys: 'escape',
      description: 'Close modal',
      action: () => closeModal(),
      disabled: computed(() => !modalOpen.value)
    }
  ])
})
```

## Common Tasks

### Adding New Shortcuts
1. Define shortcut action with keys and handler
2. Add to appropriate category
3. Register in component or globally
4. Test cross-platform key combinations
5. Update documentation

### Platform-Specific Keys
```typescript
// Use cmd on Mac, ctrl on Windows/Linux
const formatKeys = (keys: string) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return keys.replace('cmd', isMac ? '⌘' : 'Ctrl')
}
```

### Conditional Shortcuts
```typescript
const shortcut: ShortcutAction = {
  keys: 'cmd+d',
  description: 'Delete document',
  action: () => deleteDocument(),
  disabled: computed(() => !hasActiveDocument.value),
  category: 'Documents'
}
```

## Command Categories

### Standard Categories
- **Documents**: Document management (new, save, delete)
- **Editor**: Text editing operations
- **Navigation**: View switching and navigation
- **View**: Layout and display options
- **Tools**: Utility functions and settings

### Custom Categories
```typescript
// Add new categories as needed
registerShortcuts([{
  keys: 'cmd+shift+p',
  description: 'Custom action',
  action: () => customAction(),
  category: 'Custom Tools' // New category
}])
```

## Performance Optimization

### Shortcut Registration
- Use Map for O(1) lookup performance
- Lazy register shortcuts on component mount
- Debounce search input for large command sets
- Cache filtered results when possible

### Memory Management
```typescript
onUnmounted(() => {
  // Clean up registered shortcuts
  unregisterShortcuts(componentShortcuts)
  // Clear event listeners
})
```

## Integration Points
- Works with all modules for command registration
- Integrates with layout module for modal display
- Connects to documents module for document actions
- Syncs with editor module for text operations

## Accessibility Features
- Full keyboard navigation support
- Screen reader announcements for commands
- High contrast mode compatibility
- Focus management for modal dialogs
- ARIA labels for all interactive elements

## Testing Considerations
- Test keyboard shortcuts across platforms
- Verify command palette search functionality
- Check shortcut conflicts and priorities
- Test with screen readers
- Validate command history persistence

## Key Formatting
```typescript
// Platform-specific key display
const formatKeys = (keys: string): string => {
  // Convert logical keys to display format
  // Handle platform differences (cmd vs ctrl)
  // Add visual key symbols (⌘, ⌃, ⌥, ⇧)
}
```

## Command Execution Flow
1. User presses keyboard shortcut or selects from palette
2. System checks if shortcut is disabled
3. Verifies input context (not in editor unless allowed)
4. Executes command action
5. Tracks usage in command history
6. Provides user feedback as needed