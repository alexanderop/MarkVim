import type { SharedEvents } from '../events'
import type { DocumentsEvents } from '~/modules/documents/api'
import type { EditorEvents } from '~/modules/editor/api'
import type { LayoutEvents } from '~/modules/layout/api'
import type { ShortcutsEvents } from '~/modules/shortcuts/api'
import { tryOnScopeDispose, useEventBus } from '@vueuse/core'

/**
 * Application Event Bus
 *
 * This aggregates all module events into a single typed interface.
 * Each module defines its own events in a separate file (e.g., modules/documents/events.ts)
 * and exports them via their public API.
 *
 * This approach provides:
 * - Clear module ownership of events
 * - Visible cross-module dependencies (if module A emits module B's events, it imports B's types)
 * - Events as part of module's public contract
 * - No circular dependencies (event bus imports from modules, not vice versa)
 */
export interface AppEvents extends
  DocumentsEvents,
  EditorEvents,
  LayoutEvents,
  ShortcutsEvents,
  SharedEvents {}

export type AppEventKey = keyof AppEvents

// Internal helper: always returns the shared bus for a key.
function busFor<K extends AppEventKey>(key: K): ReturnType<typeof useEventBus<AppEvents[K]>> {
  return useEventBus<AppEvents[K]>(key)
}

/**
 * Emit a typed event.
 * Overloads make `payload` optional when it is `undefined` in the type.
 */
export function emitAppEvent<K extends AppEventKey>(
  key: K,
  ...args: AppEvents[K] extends undefined ? [] | [undefined] : [AppEvents[K]]
): void {
  const bus = busFor(key)
  // eslint-disable-next-line ts/consistent-type-assertions
  bus.emit(args[0] as AppEvents[K])
}

/**
 * Listen to a typed event. Auto-unsubscribes on scope dispose.
 * Returns an explicit `off` in case you need manual control.
 */
export function onAppEvent<K extends AppEventKey>(
  key: K,
  handler: (payload: AppEvents[K]) => void,
): (() => void) {
  const bus = busFor(key)
  const off = bus.on(handler)
  tryOnScopeDispose(off)
  return off
}

/**
 * Listen once to a typed event.
 */
export function onceAppEvent<K extends AppEventKey>(
  key: K,
  handler: (payload: AppEvents[K]) => void,
): (() => void) {
  const bus = busFor(key)
  const off = bus.on((p) => {
    off()
    handler(p)
  })
  tryOnScopeDispose(off)
  return off
}

/**
 * Utility: narrow event keys by namespace.
 * Example: `AppEventKeys<'editor'>` gives only `editor:*` keys.
 */
export type AppEventKeys<N extends string>
  = Extract<AppEventKey, `${N}:${string}`>
