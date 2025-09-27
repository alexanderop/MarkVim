import { defineNuxtPlugin, nextTick } from '#imports'
import { useColorThemeStore } from '~/modules/color-theme/store'

export default defineNuxtPlugin(() => {
  // Force color theme store initialization on client hydration
  const colorThemeStore = useColorThemeStore()

  // Ensure colors are applied immediately during hydration
  if (import.meta.client) {
    nextTick(() => {
      // Access the theme to trigger watchEffect and apply colors
      const _theme = colorThemeStore.theme
      // Use void to acknowledge the unused expression
      void _theme
    })
  }
})
