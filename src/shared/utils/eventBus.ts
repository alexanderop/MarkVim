import { tryOnScopeDispose, useEventBus } from '@vueuse/core'

/**
 * Typed event contracts.
 * Keep namespaced keys: "<module>:<action>"
 */
export interface AppEvents {
  /** Fired after a document is deleted by the user. */
  'document:delete': {
    documentId: string
    documentTitle: string
  }
  /** Fired when a document becomes the active selection. */
  'document:select': {
    documentId: string
  }
  /** Fired after a new document is created. */
  'document:create': undefined

  /** Switch the main view mode. */
  'view:set': {
    viewMode: 'editor' | 'split' | 'preview'
  }

  /** Open the command palette at an optional position. */
  'command-palette:open': {
    position?: { x: number, y: number }
  }
  /** Close the command palette. */
  'command-palette:close': undefined

  /** Toggle the sidebar. */
  'sidebar:toggle': undefined

  /** Vim mode changed in the editor. */
  'vim-mode:change': {
    mode: string
    subMode?: string
  }

  /** Toggle editor settings. */
  'settings:toggle-vim': undefined
  'settings:toggle-line-numbers': undefined
  'settings:toggle-preview-sync': undefined
  'settings:save-document': undefined

  /** Programmatically insert text at cursor. */
  'editor:insert-text': {
    text: string
  }
  /** Editor content changed for a specific document. */
  'editor:content-update': {
    documentId: string
    content: string
  }
}

export type AppEventKey = keyof AppEvents

// Internal helper: always returns the shared bus for a key.
function busFor<K extends AppEventKey>(key: K) {
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
  bus.emit(args[0] as AppEvents[K])
}

/**
 * Listen to a typed event. Auto-unsubscribes on scope dispose.
 * Returns an explicit `off` in case you need manual control.
 */
export function onAppEvent<K extends AppEventKey>(
  key: K,
  handler: (payload: AppEvents[K]) => void,
) {
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
) {
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
