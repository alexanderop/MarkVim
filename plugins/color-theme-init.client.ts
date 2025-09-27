import { defineNuxtPlugin } from '#imports'
import { useColorThemeStore } from '~/modules/color-theme/store'

export default defineNuxtPlugin(() => {
  // Initialize color theme store on client side to ensure CSS variables are set
  // This will trigger the watchEffect in the store to set CSS variables
  useColorThemeStore()
})
