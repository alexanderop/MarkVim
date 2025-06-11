export interface DataResetEvent {
  type: 'clear-all-data'
  timestamp: number
}

export function useDataReset() {
  const eventBus = useEventBus<DataResetEvent>('markvim-data-reset')

  const clearAllData = () => {
    if (import.meta.client) {
      eventBus.emit({
        type: 'clear-all-data',
        timestamp: Date.now(),
      })

      setTimeout(() => {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('markvim-')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }, 100)
    }
  }

  const onDataReset = (callback: (event: DataResetEvent) => void) => {
    eventBus.on(callback)
  }

  const offDataReset = (callback: (event: DataResetEvent) => void) => {
    eventBus.off(callback)
  }

  return {
    clearAllData,
    onDataReset,
    offDataReset,
  }
}
