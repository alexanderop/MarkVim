/**
 * Share Module API
 *
 * This file defines the public interface for the share module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export components that are used externally
export { default as ShareButton } from './components/ShareButton.vue'

export { default as ShareDialog } from './components/ShareDialog.vue'
export { default as ShareDialogImport } from './components/ShareDialogImport.vue'
export { default as ShareManager } from './components/ShareManager.vue'
// Export composables that other modules might need
export { useDocumentShare } from './composables/useDocumentShare'

// Export types that might be used by other modules
export type { ShareableDocument } from './composables/useDocumentShare'
