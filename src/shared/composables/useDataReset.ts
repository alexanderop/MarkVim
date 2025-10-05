import { localStorageService } from '@/shared/services/LocalStorageService'
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'

// Delay to allow event handlers to register before clearing storage
const STORAGE_CLEAR_DELAY_MS = 100

export function useDataReset(): {
  clearAllData: () => void
  onDataReset: (callback: () => void) => (() => void)
} {
  const clearAllData = (): void => {
    if (import.meta.client) {
      // Emit through main event bus for better coordination
      emitAppEvent('data:reset', undefined)

      setTimeout(() => {
        // Use the storage service for centralized storage management
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('markvim-')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorageService.remove(key))
      }, STORAGE_CLEAR_DELAY_MS)
    }
  }

  const onDataReset = (callback: () => void): (() => void) => {
    return onAppEvent('data:reset', callback)
  }

  return {
    clearAllData,
    onDataReset,
  }
}
