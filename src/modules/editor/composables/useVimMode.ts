import { readonly, ref } from 'vue'
import { emitAppEvent } from '@/shared/utils/eventBus'

export function useVimMode() {
  const currentVimMode = ref<string>('NORMAL')

  function handleVimModeChange(mode: string, subMode?: string) {
    if (subMode) {
      currentVimMode.value = `${mode.toUpperCase()} (${subMode.toUpperCase()})`
    }
    else {
      currentVimMode.value = mode.toUpperCase()
    }
    emitAppEvent('vim-mode:change', { mode, subMode })
  }

  return {
    currentVimMode: readonly(currentVimMode),
    handleVimModeChange,
  }
}
