/**
 * Shortcuts Module Events
 *
 * Events that the shortcuts module publishes and responds to.
 */

export interface ShortcutsEvents {
  /**
   * Open the command palette at an optional position.
   *
   * **Purpose:** Trigger the command palette to open, optionally at a specific position.
   * **Type:** Fire-and-forget UI signal (no state mutation)
   *
   * **Producer:**
   * ```ts
   * // ShortcutsManager.vue - when user presses Cmd+K
   * import { emitAppEvent } from '@/shared/utils/eventBus'
   *
   * function openCommandPalette(event?: KeyboardEvent): void {
   *   emitAppEvent('command-palette:open', {
   *     position: event ? { x: event.clientX, y: event.clientY } : undefined
   *   })
   * }
   * ```
   *
   * **Consumer:**
   * ```ts
   * // ShortcutsManager.vue - listens and opens modal
   * import { onAppEvent } from '@/shared/utils/eventBus'
   *
   * onAppEvent('command-palette:open', () => {
   *   commandPaletteOpen.value = true
   * })
   * ```
   */
  'command-palette:open': {
    position?: { x: number, y: number }
  }

  /**
   * Close the command palette.
   *
   * **Purpose:** Trigger the command palette to close.
   * **Type:** Fire-and-forget UI signal (no state mutation)
   *
   * **Producer:**
   * ```ts
   * // ShortcutsManager.vue - when user presses Escape
   * import { emitAppEvent } from '@/shared/utils/eventBus'
   *
   * function handleGlobalKeydown(event: KeyboardEvent): void {
   *   if (event.key === 'Escape' && commandPaletteOpen.value) {
   *     emitAppEvent('command-palette:close')
   *   }
   * }
   * ```
   *
   * **Consumer:**
   * ```ts
   * // ShortcutsManager.vue - listens and closes modal
   * import { onAppEvent } from '@/shared/utils/eventBus'
   *
   * onAppEvent('command-palette:close', () => {
   *   commandPaletteOpen.value = false
   * })
   * ```
   */
  'command-palette:close': undefined
}
