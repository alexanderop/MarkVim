export function useWelcome() {
  const isMounted = useMounted()

  const hasSeenWelcome = useState<boolean>('markvim-welcome-seen', () => {
    if (isMounted.value && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('markvim_welcome_seen')
      return saved === 'true'
    }
    return false
  })

  const saveToLocalStorage = () => {
    if (isMounted.value && typeof localStorage !== 'undefined') {
      localStorage.setItem('markvim_welcome_seen', hasSeenWelcome.value.toString())
    }
  }

  // Watch for mount state and update from localStorage when available
  watchEffect(() => {
    if (isMounted.value && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('markvim_welcome_seen')
      const savedValue = saved === 'true'
      if (savedValue !== hasSeenWelcome.value) {
        hasSeenWelcome.value = savedValue
      }
    }
  })

  // Watch for changes and save to localStorage
  watch(hasSeenWelcome, saveToLocalStorage, { immediate: false })

  const markWelcomeAsSeen = () => {
    hasSeenWelcome.value = true
  }

  return {
    hasSeenWelcome: readonly(hasSeenWelcome),
    markWelcomeAsSeen,
  }
}
