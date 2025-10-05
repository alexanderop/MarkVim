import type { ComputedRef, Ref } from 'vue'
import { useState } from '#imports'
import { useLocalStorage, useMediaQuery, useMounted } from '@vueuse/core'
import { computed, readonly, ref, watch, watchEffect } from 'vue'
import { z } from 'zod'
import { useDataReset } from '@/shared/composables/useDataReset'

export type ViewMode = 'split' | 'editor' | 'preview'

const ViewModeSchema = z.enum(['split', 'editor', 'preview'])

export function useViewMode(): {
  viewMode: Readonly<Ref<ViewMode>>
  isSidebarVisible: Ref<boolean>
  isPreviewVisible: ComputedRef<boolean>
  isSplitView: ComputedRef<boolean>
  isEditorVisible: ComputedRef<boolean>
  isMobile: Readonly<Ref<boolean>>
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
  toggleSidebar: () => void
} {
  const isMounted = useMounted()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const viewMode = useState<ViewMode>('markvim-view-mode', () => {
    if (isMounted.value && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('markvim-view-mode')
      const result = ViewModeSchema.safeParse(saved)
      if (result.success) {
        return result.data
      }
    }
    return 'split'
  })

  // Client-safe localStorage for sidebar visibility
  const isSidebarVisible = import.meta.client
    ? useLocalStorage('markvim-sidebar-visible', true)
    : ref(true)

  const { onDataReset } = useDataReset()
  onDataReset(() => {
    viewMode.value = 'split'
    isSidebarVisible.value = true
  })

  const saveToLocalStorage = (): void => {
    if (isMounted.value && typeof localStorage !== 'undefined') {
      localStorage.setItem('markvim-view-mode', viewMode.value)
    }
  }

  // Watch for mount state and update from localStorage when available
  watchEffect(() => {
    if (isMounted.value && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('markvim-view-mode')
      const result = ViewModeSchema.safeParse(saved)
      if (result.success && result.data !== viewMode.value) {
        viewMode.value = result.data
      }
    }
  })

  // Watch for changes and save to localStorage
  watch(viewMode, saveToLocalStorage, { immediate: false })

  const isPreviewVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'preview')
  const isSplitView = computed(() => viewMode.value === 'split')
  const isEditorVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'editor')

  function setViewMode(mode: ViewMode): void {
    viewMode.value = mode
  }

  function toggleViewMode(): void {
    const modes: ViewMode[] = ['split', 'editor', 'preview']
    const currentIndex = modes.indexOf(viewMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    const nextMode = modes[nextIndex]
    if (nextMode) {
      setViewMode(nextMode)
    }
  }

  function toggleSidebar(): void {
    isSidebarVisible.value = !isSidebarVisible.value
  }

  return {
    viewMode: readonly(viewMode),
    isSidebarVisible,
    isPreviewVisible,
    isSplitView,
    isEditorVisible,
    isMobile: readonly(isMobile),
    setViewMode,
    toggleViewMode,
    toggleSidebar,
  }
}
