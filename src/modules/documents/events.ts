/**
 * Documents Module Events
 *
 * Events that the documents module publishes and responds to.
 * Other modules can emit these events to interact with the documents module.
 */

export interface DocumentsEvents {
  // ========================================
  // Deletion Events (Two-Phase)
  // ========================================

  /**
   * Request document deletion confirmation modal.
   *
   * **Purpose:** Trigger UI confirmation before deleting a document.
   * **Type:** Fire-and-forget UI signal (no state mutation)
   *
   * **Producer:**
   * ```ts
   * // DocumentItem.vue - when user clicks delete in context menu
   * import { emitAppEvent } from '@/shared/utils/eventBus'
   *
   * function handleDeleteDocument(): void {
   *   emitAppEvent('document:delete', {
   *     documentId: document.id,
   *     documentTitle: getDocumentTitle(document.content)
   *   })
   * }
   * ```
   *
   * **Consumer:**
   * ```ts
   * // DocumentManagerAction.vue - shows confirmation modal
   * import { onAppEvent } from '@/shared/utils/eventBus'
   *
   * onAppEvent('document:delete', (payload) => {
   *   documentToDelete.value = {
   *     id: payload.documentId,
   *     title: payload.documentTitle
   *   }
   *   deleteModalOpen.value = true
   * })
   * ```
   */
  'document:delete': {
    documentId: string
    documentTitle: string
  }
}
