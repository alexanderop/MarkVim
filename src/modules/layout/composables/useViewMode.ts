export type ViewMode = 'split' | 'editor' | 'preview'

export function useViewMode() {
  const isMounted = useMounted()

  const viewMode = useState<ViewMode>('markvim-view-mode', () => {
    if (isMounted.value && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('markvim-view-mode')
      if (saved && ['split', 'editor', 'preview'].includes(saved)) {
        return saved as ViewMode
      }
    }
    return 'split'
  })

  const { onDataReset } = useDataReset()
  onDataReset(() => {
    viewMode.value = 'split'
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
      if (saved && ['split', 'editor', 'preview'].includes(saved) && saved !== viewMode.value) {
        viewMode.value = saved as ViewMode
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

  return {
    viewMode: readonly(viewMode),
    isPreviewVisible,
    isSplitView,
    isEditorVisible,
    setViewMode,
    toggleViewMode,
  }
}
