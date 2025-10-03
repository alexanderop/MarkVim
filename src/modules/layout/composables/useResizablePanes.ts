import { useLocalStorage, useMediaQuery } from '@vueuse/core'
import { computed, type ComputedRef, onUnmounted, readonly, ref, type Ref } from 'vue'
import { useDataReset } from '@/shared/composables/useDataReset'

// Percentage constants
const FULL_WIDTH_PERCENTAGE = 100
const MIN_PANE_WIDTH_PERCENTAGE = 20
const MAX_PANE_WIDTH_PERCENTAGE = 80

export function useResizablePanes(initialLeftWidth: number = 50): {
  leftPaneWidth: Readonly<Ref<number>>
  rightPaneWidth: ComputedRef<number>
  isDragging: Readonly<Ref<boolean>>
  containerRef: Ref<HTMLElement | undefined>
  startDrag: (event: PointerEvent) => void
} {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const leftPaneWidth = useLocalStorage('markvim-pane-width', initialLeftWidth)
  const rightPaneWidth = computed(() => FULL_WIDTH_PERCENTAGE - leftPaneWidth.value)

  const { onDataReset } = useDataReset()
  onDataReset(() => {
    leftPaneWidth.value = initialLeftWidth
  })

  const isDragging = ref(false)
  const containerRef = ref<HTMLElement>()

  // Performance optimizations
  let animationId: number | null = null
  let pendingUpdate: number | null = null
  let currentPointerX = 0
  let containerRect: DOMRect | null = null

  // Throttle updates to requestAnimationFrame for smooth 60fps performance
  const throttledUpdate = (): void => {
    if (animationId)
      return

    animationId = requestAnimationFrame(() => {
      if (pendingUpdate !== null && containerRef.value) {
        // Only update if we have a pending change and container exists
        if (!containerRect) {
          containerRect = containerRef.value.getBoundingClientRect()
        }

        const relativeX = pendingUpdate - containerRect.left
        const percentage = Math.max(MIN_PANE_WIDTH_PERCENTAGE, Math.min(MAX_PANE_WIDTH_PERCENTAGE, (relativeX / containerRect.width) * FULL_WIDTH_PERCENTAGE))

        // Batch the update
        leftPaneWidth.value = percentage
        pendingUpdate = null
      }
      animationId = null
    })
  }

  const handlePointerMove = (event: PointerEvent): void => {
    if (!isDragging.value)
      return

    // Store the position but don't update immediately
    currentPointerX = event.clientX
    pendingUpdate = currentPointerX

    // Throttle to RAF
    throttledUpdate()
  }

  const stopDrag = (event?: PointerEvent): void => {
    if (!isDragging.value)
      return

    isDragging.value = false
    containerRect = null // Reset cached rect

    // Process any final pending update
    if (pendingUpdate !== null && containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect()
      const relativeX = pendingUpdate - rect.left
      const percentage = Math.max(MIN_PANE_WIDTH_PERCENTAGE, Math.min(MAX_PANE_WIDTH_PERCENTAGE, (relativeX / rect.width) * FULL_WIDTH_PERCENTAGE))
      leftPaneWidth.value = percentage
      pendingUpdate = null
    }

    // Cancel any pending animation frame
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }

    // Restore normal state
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.body.style.pointerEvents = ''

    // Remove global listeners
    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', stopDrag)
    document.removeEventListener('pointercancel', stopDrag)

    // Release pointer capture if event is available
    if (event && event.target instanceof Element) {
      try {
        event.target.releasePointerCapture(event.pointerId)
      }
      catch {
        // Ignore errors if capture was already released
      }
    }
  }

  const startDrag = (event: PointerEvent): void => {
    // Disable resizing on mobile
    if (isMobile.value) {
      return
    }

    event.preventDefault()

    // Capture the pointer to ensure we get all events
    if (!(event.target instanceof Element))
      return
    const target = event.target
    target.setPointerCapture(event.pointerId)

    isDragging.value = true
    currentPointerX = event.clientX

    // Cache container rect once at start of drag for better performance
    if (containerRef.value) {
      containerRect = containerRef.value.getBoundingClientRect()
    }

    // Disable text selection and set cursor
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.body.style.pointerEvents = 'none' // Disable pointer events during drag for smoother performance

    // Add global pointer event listeners
    document.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerup', stopDrag)
    document.addEventListener('pointercancel', stopDrag)
  }

  const cleanup = (): void => {
    if (isDragging.value) {
      stopDrag()
    }
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  onUnmounted(cleanup)

  return {
    leftPaneWidth: readonly(leftPaneWidth),
    rightPaneWidth,
    isDragging: readonly(isDragging),
    containerRef,
    startDrag,
  }
}
