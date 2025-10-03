import { readonly, ref, type Ref } from 'vue'

export function useVimMode(): {
  currentVimMode: Readonly<Ref<string>>
  handleVimModeChange: (mode: string, subMode?: string) => void
} {
  const currentVimMode = ref<string>('NORMAL')

  function handleVimModeChange(mode: string, subMode?: string): void {
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
