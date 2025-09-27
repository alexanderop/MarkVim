import { localStorageService } from '@/services/LocalStorageService'
import { emitAppEvent, onAppEvent } from '@/shared/utils/eventBus'

export function useDataReset() {
  const clearAllData = () => {
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
      }, 100)
    }
  }

  const onDataReset = (callback: () => void) => {
    return onAppEvent('data:reset', callback)
  }

  return {
    clearAllData,
    onDataReset,
  }
}
