import { useCookie } from '#imports'
import { readonly, type Ref } from 'vue'

// Time constants for cookie expiration
const SECONDS_IN_MINUTE = 60
const MINUTES_IN_HOUR = 60
const HOURS_IN_DAY = 24
const DAYS_IN_YEAR = 365
const ONE_YEAR_IN_SECONDS = SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY * DAYS_IN_YEAR

export function useWelcome(): {
  hasSeenWelcome: Readonly<Ref<boolean>>
  markWelcomeAsSeen: () => void
} {
  const hasSeenWelcome = useCookie<boolean>('markvim_welcome_seen', {
    default: () => false,
    maxAge: ONE_YEAR_IN_SECONDS,
  })

  const markWelcomeAsSeen = (): void => {
    hasSeenWelcome.value = true
  }

  return {
    hasSeenWelcome: readonly(hasSeenWelcome),
    markWelcomeAsSeen,
  }
}
