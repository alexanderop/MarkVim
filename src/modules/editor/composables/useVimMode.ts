import { readonly, ref, type Ref } from 'vue'

export function useVimMode(): {
  currentVimMode: Readonly<Ref<string>>
  handleVimModeChange: (mode: string, subMode?: string) => void
} {
  const currentVimMode = ref<string>('NORMAL')

  function handleVimModeChange(mode: string, subMode?: string): void {
    currentVimMode.value = subMode
      ? `${mode.toUpperCase()} (${subMode.toUpperCase()})`
      : mode.toUpperCase()
  }

  return {
    currentVimMode: readonly(currentVimMode),
    handleVimModeChange,
  }
}
