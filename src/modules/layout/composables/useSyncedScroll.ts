import { useEventListener, useScroll, useThrottleFn } from '@vueuse/core'
import { nextTick, onUnmounted, ref, type Ref, watch, watchEffect } from 'vue'

export function useSyncedScroll(previewSyncEnabled: Ref<boolean>): {
  editorScrollContainer: Ref<HTMLElement | undefined>
  previewScrollContainer: Ref<HTMLElement | undefined>
  editorArrivedState: any
  previewArrivedState: any
} {
  const editorScrollContainer = ref<HTMLElement>()
  const previewScrollContainer = ref<HTMLElement>()
  const isSyncing = ref(false)

  const { arrivedState: editorArrivedState } = useScroll(editorScrollContainer, {
    throttle: 16,
  })

  const { arrivedState: previewArrivedState } = useScroll(previewScrollContainer, {
    throttle: 16,
  })

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

  const isElementScrollable = (element: HTMLElement): boolean => {
    if (element.scrollHeight <= element.clientHeight)
      return false

    const styles = getComputedStyle(element)
    return styles.overflowY === 'auto' || styles.overflowY === 'scroll' || styles.overflowY === 'hidden'
  }

  const findScrollableBySelectors = (container: HTMLElement, selectors: string[]): HTMLElement | null => {
    for (const selector of selectors) {
      const element = container.querySelector(selector)
      if (element instanceof HTMLElement && isElementScrollable(element))
        return element
    }
    return null
  }

  const findScrollableInChildren = (container: HTMLElement): HTMLElement | null => {
    const allElements = container.querySelectorAll('*')
    for (const child of allElements) {
      if (!(child instanceof HTMLElement))
        continue
      const htmlChild = child
      if (htmlChild.scrollHeight > htmlChild.clientHeight) {
        const styles = getComputedStyle(htmlChild)
        if (styles.overflowY === 'auto' || styles.overflowY === 'scroll')
          return htmlChild
      }
    }
    return null
  }

  const getEditorScrollableElement = (container: HTMLElement): HTMLElement | null => {
    const editorSelectors = [
      '.cm-scroller',
      '.cm-editor .cm-scroller',
      '.cm-editor',
      '.cm-content',
    ]

    const element = findScrollableBySelectors(container, editorSelectors)
    return element || findScrollableInChildren(container)
  }

  const getPreviewScrollableElement = (container: HTMLElement): HTMLElement | null => {
    const previewSelectors = [
      '.overflow-auto',
      '[ref="scrollContainer"]',
      '[data-testid="preview-scroll-container"]',
    ]

    const element = findScrollableBySelectors(container, previewSelectors)
    if (element)
      return element

    if (container.scrollHeight > container.clientHeight) {
      const styles = getComputedStyle(container)
      if (styles.overflowY === 'auto' || styles.overflowY === 'scroll')
        return container
    }

    return null
  }

  const getScrollableElement = (container: HTMLElement, type: 'editor' | 'preview'): HTMLElement | null => {
    return type === 'editor'
      ? getEditorScrollableElement(container)
      : getPreviewScrollableElement(container)
  }

  const findScrollableElements = async (retries = 10): Promise<{ editorScroller: HTMLElement, previewScroller: HTMLElement } | null> => {
    if (!editorScrollContainer.value || !previewScrollContainer.value || !previewSyncEnabled.value)
      return null

    const editorScroller = getScrollableElement(editorScrollContainer.value, 'editor')
    const previewScroller = getScrollableElement(previewScrollContainer.value, 'preview')

    if (!editorScroller || !previewScroller) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return findScrollableElements(retries - 1)
      }
      return null
    }

    return { editorScroller, previewScroller }
  }

  // Store cleanup functions for event listeners
  const cleanupFunctions = ref<(() => void)[]>([])

  const cleanupEventListeners = (): void => {
    cleanupFunctions.value.forEach(cleanup => cleanup())
    cleanupFunctions.value = []
  }

  const setupScrollSync = async (): Promise<void> => {
    cleanupEventListeners()

    if (!previewSyncEnabled.value) {
      return
    }

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 1000))

    const elements = await findScrollableElements()
    if (!elements)
      return

    const { editorScroller, previewScroller } = elements

    const handleEditorScroll = (): void => {
      if (isSyncing.value || !previewSyncEnabled.value)
        return
      throttledSync(editorScroller, previewScroller)
    }

    const handlePreviewScroll = (): void => {
      if (isSyncing.value || !previewSyncEnabled.value)
        return
      throttledSync(previewScroller, editorScroller)
    }

    // Use VueUse's useEventListener for automatic cleanup
    const stopEditorListener = useEventListener(editorScroller, 'scroll', handleEditorScroll, { passive: true })
    const stopPreviewListener = useEventListener(previewScroller, 'scroll', handlePreviewScroll, { passive: true })

    // Store cleanup functions
    cleanupFunctions.value.push(stopEditorListener, stopPreviewListener)
  }

  // Watch for changes and setup sync
  watchEffect(() => {
    setupScrollSync()
  })

  // Watch for container changes and re-setup
  watch([editorScrollContainer, previewScrollContainer], () => {
    if (previewSyncEnabled.value) {
      setupScrollSync()
    }
  })

  // Watch for sync enabled state changes
  watch(previewSyncEnabled, (enabled) => {
    enabled ? setupScrollSync() : cleanupEventListeners()
  })

  onUnmounted(() => {
    cleanupEventListeners()
  })

  return {
    editorScrollContainer,
    previewScrollContainer,
    editorArrivedState,
    previewArrivedState,
  }
}
