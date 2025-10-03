import { useCookie } from '#imports'
import { readonly, type Ref } from 'vue'

export function useWelcome(): {
  hasSeenWelcome: Readonly<Ref<boolean>>
  markWelcomeAsSeen: () => void
} {
  const hasSeenWelcome = useCookie<boolean>('markvim_welcome_seen', {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  const markWelcomeAsSeen = (): void => {
    hasSeenWelcome.value = true
  }

  return {
    hasSeenWelcome: readonly(hasSeenWelcome),
    markWelcomeAsSeen,
  }
}
