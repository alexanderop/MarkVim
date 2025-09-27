/**
 * Shortcuts Module API
 *
 * This file defines the public interface for the shortcuts module.
 * Other modules should import from this API file, not directly from internal files.
 */

export { useCommandHistory } from './composables/useCommandHistory'
// Export composables that other modules might need
export { type Command, type ShortcutAction, useShortcuts } from './composables/useShortcuts'
