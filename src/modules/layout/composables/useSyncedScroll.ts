export function useSyncedScroll(previewSyncEnabled: Ref<boolean>) {
  const editorScrollContainer = ref<HTMLElement>()
  const previewScrollContainer = ref<HTMLElement>()
  const isSyncing = ref(false)

  const { arrivedState: editorArrivedState } = useScroll(editorScrollContainer, {
    throttle: 16, // ~60fps for smooth scrolling
  })

  const { arrivedState: previewArrivedState } = useScroll(previewScrollContainer, {
    throttle: 16,
  })

  // Throttled function to prevent infinite scroll loops
  const throttledSync = useThrottleFn((sourceElement: HTMLElement, targetElement: HTMLElement) => {
    if (isSyncing.value || !previewSyncEnabled.value)
      return

    isSyncing.value = true

    // Calculate scroll percentage from source
    const sourceScrollTop = sourceElement.scrollTop
    const sourceScrollHeight = sourceElement.scrollHeight - sourceElement.clientHeight
    const scrollPercentage = sourceScrollHeight > 0 ? sourceScrollTop / sourceScrollHeight : 0

    // Apply proportional scroll to target
    const targetScrollHeight = targetElement.scrollHeight - targetElement.clientHeight
    const targetScrollTop = Math.max(0, scrollPercentage * targetScrollHeight)

    targetElement.scrollTo({
      top: targetScrollTop,
      behavior: 'auto',
    })

    // Reset sync flag after a brief delay
    nextTick(() => {
      setTimeout(() => {
        isSyncing.value = false
      }, 50)
    })
  }, 32)

  // Helper to get scrollable element from container
  const getScrollableElement = (container: HTMLElement, type: 'editor' | 'preview'): HTMLElement | null => {
    if (type === 'editor') {
      // Try CodeMirror specific selectors first
      let element = container.querySelector('.cm-scroller') as HTMLElement
      if (element && element.scrollHeight > element.clientHeight) {
        return element
      }

      element = container.querySelector('.cm-editor .cm-scroller') as HTMLElement
      if (element && element.scrollHeight > element.clientHeight) {
        return element
      }

      element = container.querySelector('.cm-editor') as HTMLElement
      if (element && element.scrollHeight > element.clientHeight) {
        return element
      }

      // Check all child elements that might be scrollable
      const scrollableChildren = container.querySelectorAll('*')
      for (const child of scrollableChildren) {
        const htmlChild = child as HTMLElement
        if (htmlChild.scrollHeight > htmlChild.clientHeight
          && getComputedStyle(htmlChild).overflowY !== 'visible') {
          return htmlChild
        }
      }

      return null
    }
    else {
      // Try preview specific selectors
      let element = container.querySelector('.overflow-auto') as HTMLElement
      if (element && element.scrollHeight > element.clientHeight) {
        return element
      }

      element = container.querySelector('[ref="root"]') as HTMLElement
      if (element && element.scrollHeight > element.clientHeight) {
        return element
      }

      // Check if container itself is scrollable
      if (container.scrollHeight > container.clientHeight) {
        return container
      }
    }

    return null
  }

  // Helper function to find scrollable elements with retries
  const findScrollableElements = async (retries = 5): Promise<{ editorScroller: HTMLElement, previewScroller: HTMLElement } | null> => {
    if (!editorScrollContainer.value || !previewScrollContainer.value || !previewSyncEnabled.value)
      return null

    const editorScroller = getScrollableElement(editorScrollContainer.value, 'editor')
    const previewScroller = getScrollableElement(previewScrollContainer.value, 'preview')

    if (!editorScroller || !previewScroller) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 200))
        return findScrollableElements(retries - 1)
      }
      return null
    }

    return { editorScroller, previewScroller }
  }

  // Setup bidirectional scroll sync with proper async handling
  watchEffect(async () => {
    if (!previewSyncEnabled.value) {
      return
    }

    // Wait a bit for DOM to be ready
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))

    const elements = await findScrollableElements()
    if (!elements)
      return

    const { editorScroller, previewScroller } = elements

    const handleEditorScroll = () => {
      if (isSyncing.value || !previewSyncEnabled.value)
        return
      throttledSync(editorScroller, previewScroller)
    }

    const handlePreviewScroll = () => {
      if (isSyncing.value || !previewSyncEnabled.value)
        return
      throttledSync(previewScroller, editorScroller)
    }

    editorScroller.addEventListener('scroll', handleEditorScroll, { passive: true })
    previewScroller.addEventListener('scroll', handlePreviewScroll, { passive: true })

    return () => {
      editorScroller.removeEventListener('scroll', handleEditorScroll)
      previewScroller.removeEventListener('scroll', handlePreviewScroll)
    }
  })

  onUnmounted(() => {
    // Cleanup code if needed
  })

  return {
    editorScrollContainer,
    previewScrollContainer,
    editorArrivedState,
    previewArrivedState,
  }
}
