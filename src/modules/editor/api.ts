/**
 * Editor Module API
 *
 * This file defines the public interface for the editor module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export components that are used externally
export { default as MarkdownEditor } from './components/MarkdownEditor.vue'
export { default as MarkdownEditorSkeleton } from './components/MarkdownEditorSkeleton.vue'

export { type EditorSettings, useEditorSettings } from './composables/useEditorSettings'
// Export composables that other modules might need
export { useVimMode } from './composables/useVimMode'
