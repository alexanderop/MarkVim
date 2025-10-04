/**
 * Shortcuts Module API
 *
 * This file defines the public interface for the shortcuts module.
 * Other modules should import from this API file, not directly from internal files.
 */

export { default as ShortcutsManager } from './components/ShortcutsManager.vue'
// Export components that are used externally
export { default as ShortcutsPaletteCommand } from './components/ShortcutsPaletteCommand.vue'

export { useCommandHistory } from './composables/useCommandHistory'
// Export composables that other modules might need
export { type Command, type ShortcutAction, useShortcuts } from './composables/useShortcuts'

// Export events
export type { ShortcutsEvents } from './events'
