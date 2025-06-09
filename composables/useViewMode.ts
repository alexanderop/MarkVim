export type ViewMode = 'split' | 'editor' | 'preview'

export function useViewMode() {
  const viewMode = useLocalStorage<ViewMode>('markvim-view-mode', 'split')

  const isPreviewVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'preview')
  const isSplitView = computed(() => viewMode.value === 'split')
  const isEditorVisible = computed(() => viewMode.value === 'split' || viewMode.value === 'editor')

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  function switchToEditor() {
    setViewMode('editor')
  }

  function switchToSplit() {
    setViewMode('split')
  }

  function switchToPreview() {
    setViewMode('preview')
  }

  return {
    viewMode: readonly(viewMode),
    isPreviewVisible,
    isSplitView,
    isEditorVisible,
    setViewMode,
    switchToEditor,
    switchToSplit,
    switchToPreview,
  }
} 