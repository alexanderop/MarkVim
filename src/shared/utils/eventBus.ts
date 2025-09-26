import { useEventBus } from '@vueuse/core'

export interface AppEvents {
  'document:delete': {
    documentId: string
    documentTitle: string
  }
  'document:select': {
    documentId: string
  }
  'document:create': undefined
  'view:set': {
    viewMode: 'editor' | 'split' | 'preview'
  }
  'command-palette:open': {
    position?: { x: number, y: number }
  }
  'command-palette:close': undefined
  'sidebar:toggle': undefined
  'vim-mode:change': {
    mode: string
    subMode?: string
  }
  'settings:toggle-vim': undefined
  'settings:toggle-line-numbers': undefined
  'settings:toggle-preview-sync': undefined
  'settings:save-document': undefined
  'editor:insert-text': {
    text: string
  }
}

export type AppEventKey = keyof AppEvents

// Create typed event bus functions
export function createAppEventBus<K extends AppEventKey>(eventKey: K) {
  return useEventBus<AppEvents[K]>(eventKey)
}

// Main event bus instance for general app events
export const appEventBus = useEventBus('markvim-app-events')

// Convenience function to emit typed events
export function emitAppEvent<K extends AppEventKey>(
  eventKey: K,
  payload: AppEvents[K],
) {
  const bus = createAppEventBus(eventKey)
  bus.emit(payload)
}

// Convenience function to listen to typed events
export function onAppEvent<K extends AppEventKey>(
  eventKey: K,
  handler: (payload: AppEvents[K]) => void,
) {
  const bus = createAppEventBus(eventKey)
  return bus.on(handler)
}
