/**
 * Documents Module API
 *
 * This file defines the public interface for the documents module.
 * Other modules should import from this API file, not directly from internal files.
 */

export { default as DocumentList } from './components/DocumentList.vue'

// Export components that are used externally
export { default as DocumentManagerAction } from './components/DocumentManagerAction.vue'
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
  const title = firstLine.startsWith('#')
    ? firstLine.replace(/^#+\s*/, '') || 'Untitled'
    : firstLine || 'Untitled'

  if (title.length > TITLE_MAX_LENGTH) {
    return `${title.slice(0, TITLE_MAX_LENGTH)}…`
  }
  return title
}
