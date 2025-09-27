import { useCookie } from '#imports'
import { readonly } from 'vue'

export function useWelcome() {
  const hasSeenWelcome = useCookie<boolean>('markvim_welcome_seen', {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  const markWelcomeAsSeen = () => {
    hasSeenWelcome.value = true
  }

  return {
    hasSeenWelcome: readonly(hasSeenWelcome),
    markWelcomeAsSeen,
  }
}
