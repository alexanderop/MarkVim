/**
 * Shared Application Events
 *
 * Cross-cutting events that don't belong to a specific module.
 * These are typically global application concerns.
 */

export interface SharedEvents {
  // ========================================
  // Data Events
  // ========================================

  /**
   * Request all application data to be reset.
   *
   * **Purpose:** Notify all modules to clear their persisted state before localStorage is wiped.
   * **Type:** Fire-and-forget UI signal (triggers cleanup, not direct state mutation)
   *
   * **Producer:**
   * ```ts
   * // SettingsModal.vue - when user clicks "Reset All Data"
   * import { useDataReset } from '@/shared/composables/useDataReset'
   *
   * const { clearAllData } = useDataReset()
   *
   * function handleResetAllData(): void {
   *   clearAllData() // Internally emits 'data:reset' event
   * }
   * ```
   *
   * **Consumers:**
   * ```ts
   * // useEditorSettings.ts - reset editor settings to defaults
   * import { useDataReset } from '@/shared/composables/useDataReset'
   *
   * const { onDataReset } = useDataReset()
   * onDataReset(() => {
   *   // Reset to default settings
   *   settings.value = getDefaultEditorSettings()
   * })
   * ```
   *
   * ```ts
   * // documents/store.ts - clear all documents
   * import { useDataReset } from '@/shared/composables/useDataReset'
   *
   * const { onDataReset } = useDataReset()
   * onDataReset(() => {
   *   // Reset to initial state
   *   _state.value = getInitialState()
   * })
   * ```
   */
  'data:reset': undefined
}
