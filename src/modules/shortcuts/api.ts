/**
 * Shortcuts Module API
 *
 * This file defines the public interface for the shortcuts module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export components that are used externally
export { default as CommandPalette } from './components/CommandPalette.vue'
export { default as ShortcutsManager } from './components/ShortcutsManager.vue'

export { useCommandHistory } from './composables/useCommandHistory'
// Export composables that other modules might need
export { type Command, type ShortcutAction, useShortcuts } from './composables/useShortcuts'
