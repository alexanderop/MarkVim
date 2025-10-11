/**
 * Shortcuts Module API
 *
 * This file defines the public interface for the shortcuts module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export components that are used externally
export { default as ShortcutsManager } from './components/ShortcutsManager.vue'

// Export composables that other modules need
export { type Command, type ShortcutAction, useShortcuts } from './composables/useShortcuts'

// Export types
export type { ShortcutsEvents } from './events'
