export function useWelcome() {
  // Always start with false (show welcome) for consistent SSR/client rendering
  const hasSeenWelcome = useState<boolean>('markvim-welcome-seen', () => false)

  // Check localStorage after mount and update state
  onMounted(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('markvim_welcome_seen')
      if (saved === 'true') {
        hasSeenWelcome.value = true
      }
    }
  })

  // Watch for changes and save to localStorage
  watch(hasSeenWelcome, (newValue) => {
    if (import.meta.client && typeof localStorage !== 'undefined') {
      localStorage.setItem('markvim_welcome_seen', newValue.toString())
    }
  }, { immediate: false })

  const markWelcomeAsSeen = () => {
    hasSeenWelcome.value = true
  }

  return {
    hasSeenWelcome: readonly(hasSeenWelcome),
    markWelcomeAsSeen,
  }
}
