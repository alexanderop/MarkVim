import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'

export function useVimBindings(): {
  isVimMode: Ref<boolean>
  currentMode: Ref<'normal' | 'insert' | 'visual'>
  vimModeDisplay: ComputedRef<string>
  toggleVimMode: () => void
  setVimMode: (mode: 'normal' | 'insert' | 'visual') => void
} {
  const isVimMode = ref(false)
  const currentMode = ref<'normal' | 'insert' | 'visual'>('normal')

  const vimModeDisplay = computed(() => {
    if (!isVimMode.value)
      return ''
    return currentMode.value.toUpperCase()
  })

  function toggleVimMode(): void {
    isVimMode.value = !isVimMode.value
    if (!isVimMode.value) {
      currentMode.value = 'normal'
    }
  }

  function setVimMode(mode: 'normal' | 'insert' | 'visual'): void {
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
