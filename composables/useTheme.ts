import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

export function useTheme() {
  const colorMode = useColorMode({
    storageKey: 'markvim-theme',
    selector: 'html',
    attribute: 'class',
  })

  const theme = computed({
    get: () => colorMode.value,
    set: (value) => {
      colorMode.value = value
    },
  })

  return {
    theme,
  }
}
