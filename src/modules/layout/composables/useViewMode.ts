import { useState } from '#imports'
import { useLocalStorage, useMounted } from '@vueuse/core'
import { computed, readonly, ref, watch, watchEffect } from 'vue'
import { z } from 'zod'
import { useDataReset } from '@/shared/composables/useDataReset'
import { onAppEvent } from '@/shared/utils/eventBus'

export type ViewMode = 'split' | 'editor' | 'preview'

const ViewModeSchema = z.enum(['split', 'editor', 'preview'])

export function useViewMode() {
  const isMounted = useMounted()

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

  const saveToLocalStorage = () => {
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

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  function toggleViewMode() {
    const modes: ViewMode[] = ['split', 'editor', 'preview']
    const currentIndex = modes.indexOf(viewMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setViewMode(modes[nextIndex])
  }

  function toggleSidebar() {
    isSidebarVisible.value = !isSidebarVisible.value
  }

  // Listen for view:set events from the event bus
  onAppEvent('view:set', (payload) => {
    setViewMode(payload.viewMode)
  })

  // Listen for sidebar:toggle events from the event bus
  onAppEvent('sidebar:toggle', () => {
    toggleSidebar()
  })

  return {
    viewMode: readonly(viewMode),
    isSidebarVisible,
    isPreviewVisible,
    isSplitView,
    isEditorVisible,
    setViewMode,
    toggleViewMode,
    toggleSidebar,
  }
}
