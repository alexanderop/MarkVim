/**
 * Documents Module API
 *
 * This file defines the public interface for the documents module.
 * Other modules should import from this API file, not directly from internal files.
 */

// Export components that are used externally
export { default as DocumentActionManager } from './components/DocumentActionManager.vue'

export { default as DocumentList } from './components/DocumentList.client.vue'

export { default as DocumentListSkeleton } from './components/DocumentListSkeleton.vue'
// Export types
export type { Document } from './store'
// Export composables and utilities
export { useDocumentsStore } from './store'

// Export utilities that might be needed by other modules
export function getDocumentTitle(content: string): string {
  const firstLine = content.split('\n')[0].trim()
  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, '') || 'Untitled'
  }
  return firstLine || 'Untitled'
}
