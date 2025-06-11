import { computed, ref } from 'vue'

export function useVimBindings() {
  const isVimMode = ref(false)
  const currentMode = ref<'normal' | 'insert' | 'visual'>('normal')

  const vimModeDisplay = computed(() => {
    if (!isVimMode.value)
      return ''
    return currentMode.value.toUpperCase()
  })

  function toggleVimMode() {
    isVimMode.value = !isVimMode.value
    if (!isVimMode.value) {
      currentMode.value = 'normal'
    }
  }

  function setVimMode(mode: 'normal' | 'insert' | 'visual') {
    currentMode.value = mode
  }

  return {
    isVimMode,
    currentMode,
    vimModeDisplay,
    toggleVimMode,
    setVimMode,
  }
}
