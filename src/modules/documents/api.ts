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
// Export events
export type { DocumentsEvents } from './events'
// Export store and TEA types
export { useDocumentsStore } from './store'
export type { DocumentMessage, DocumentsState } from './store'

// Note: useDocumentsStore follows The Elm Architecture (TEA) pattern with dispatch method
// Export types
export type { Document } from '~/modules/domain/api'

// Export utilities that might be needed by other modules
const TITLE_MAX_LENGTH = 50

export function getDocumentTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim() ?? ''
  let title = ''
  if (firstLine.startsWith('#')) {
    title = firstLine.replace(/^#+\s*/, '') || 'Untitled'
  }
  else {
    title = firstLine || 'Untitled'
  }

  if (title.length > TITLE_MAX_LENGTH) {
    return `${title.slice(0, TITLE_MAX_LENGTH)}…`
  }
  return title
}
