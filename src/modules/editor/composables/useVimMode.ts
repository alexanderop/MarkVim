import { readonly, ref } from 'vue'

export function useVimMode() {
  const currentVimMode = ref<string>('NORMAL')

  function handleVimModeChange(mode: string, subMode?: string) {
    if (subMode) {
      currentVimMode.value = `${mode.toUpperCase()} (${subMode.toUpperCase()})`
    }
    else {
      currentVimMode.value = mode.toUpperCase()
    }
  }

  return {
    currentVimMode: readonly(currentVimMode),
    handleVimModeChange,
  }
}
