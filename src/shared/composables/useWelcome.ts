export function useWelcome() {
  // Use VueUse's useLocalStorage with initOnMounted to prevent hydration mismatch
  const hasSeenWelcome = useLocalStorage('markvim_welcome_seen', false, {
    initOnMounted: true,
  })

  const markWelcomeAsSeen = () => {
    hasSeenWelcome.value = true
  }

  return {
    hasSeenWelcome: readonly(hasSeenWelcome),
    markWelcomeAsSeen,
  }
}
