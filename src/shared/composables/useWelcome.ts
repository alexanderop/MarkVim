export function useWelcome() {
  const hasSeenWelcome = useLocalStorage('markvim_welcome_seen', false)

  const markWelcomeAsSeen = () => {
    hasSeenWelcome.value = true
  }

  return {
    hasSeenWelcome: readonly(hasSeenWelcome),
    markWelcomeAsSeen,
  }
}
