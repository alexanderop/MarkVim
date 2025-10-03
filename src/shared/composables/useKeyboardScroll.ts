import { useMagicKeys, useRafFn, useScroll, useTimestamp } from '@vueuse/core'
import { type ComputedRef, ref, type Ref, watchEffect } from 'vue'

/**
 * A Vue composable that provides smooth keyboard scrolling functionality with acceleration.
 *
 * Enables scrolling within a container using arrow keys (↑/↓) or vim-style keys (j/k).
 * Features progressive acceleration when keys are held down, starting slow and increasing
 * speed over time with an eased curve. Also supports vim-like navigation shortcuts for
 * jumping to top (gg) and bottom (G) of the scrollable content.
 *
 * @param scrollContainerRef - A Vue ref pointing to the HTML element that should be scrollable.
 *                            The element must be focusable or contain focusable elements for
 *                            keyboard events to be captured.
 *
 * @returns An object containing:
 *   - `stopAllScrolling`: Function to immediately stop any active scrolling animation
 *
 * @example
 * ```vue
 * <script setup>
 * const scrollContainer = ref<HTMLElement>()
 * const { stopAllScrolling } = useKeyboardScroll(scrollContainer)
 *
 * onUnmounted(() => {
 *   stopAllScrolling()
 * })
 * </script>
 *
 * <template>
 *   <div ref="scrollContainer" tabindex="0" class="overflow-auto">
 *     <!-- scrollable content -->
 *   </div>
 * </template>
 * ```
 *
 * @remarks
 * - Scrolling only activates when the scroll container or its children have focus
 * - Base scroll speed: 30px per frame
 * - Maximum scroll speed: 150px per frame (reached after 1 second of holding)
 * - Acceleration uses an eased-out cubic curve for smooth feel
 * - Supports both arrow keys (↑/↓) and vim-style navigation (j/k)
 * - Vim-like shortcuts: `gg` to scroll to top, `G` to scroll to bottom
 * - Double-g sequence timeout: 500ms (if second g not pressed within this time, sequence resets)
 * - Uses requestAnimationFrame for smooth 60fps scrolling
 *
 * @since 1.0.0
 */
export function useKeyboardScroll(scrollContainerRef: Ref<HTMLElement | null>): {
  stopAllScrolling: () => void
} {
  const SCROLL_SPEED_BASE_PX = 30
  const SCROLL_SPEED_MAX_PX = 150
  const ACCELERATION_DURATION_MS = 1000
  const DOUBLE_G_SEQUENCE_TIMEOUT_MS = 500
  const ACCELERATION_RAMP_UP_DELAY_MS = 100

  const { y: scrollPosition } = useScroll(scrollContainerRef, { behavior: 'auto' })
  const currentTimestamp = useTimestamp({ interval: 16 })

  const scrollState = useScrollState()
  const doubleGSequence = useDoubleGSequence(currentTimestamp)
  const keyBindings = useKeyBindings()

  setupUpScrollingKeys()
  setupDownScrollingKeys()
  setupJumpToTopKey()
  setupJumpToBottomKey()
  setupSequenceCleanup()

  function useScrollState(): {
    keyHoldStartTime: Ref<number>
    currentDirection: Ref<'up' | 'down' | null>
  } {
    const keyHoldStartTime = ref(0)
    const currentDirection = ref<'up' | 'down' | null>(null)

    return {
      keyHoldStartTime,
      currentDirection,
    }
  }

  function useDoubleGSequence(timestamp: Ref<number>): {
    isWaitingForSecondG: Ref<boolean>
    startSequence: () => void
    completeSequence: () => void
    isSequenceExpired: () => boolean
    resetIfExpired: () => void
  } {
    const firstGPressTime = ref(0)
    const isWaitingForSecondG = ref(false)

    function startSequence(): void {
      isWaitingForSecondG.value = true
      firstGPressTime.value = timestamp.value
    }

    function completeSequence(): void {
      isWaitingForSecondG.value = false
      firstGPressTime.value = 0
    }

    function isSequenceExpired(): boolean {
      return timestamp.value - firstGPressTime.value > DOUBLE_G_SEQUENCE_TIMEOUT_MS
    }

    function resetIfExpired(): void {
      if (isWaitingForSecondG.value && isSequenceExpired()) {
        completeSequence()
      }
    }

    return {
      isWaitingForSecondG,
      startSequence,
      completeSequence,
      isSequenceExpired,
      resetIfExpired,
    }
  }

  function useKeyBindings(): {
    arrowUp: ComputedRef<boolean> | undefined
    arrowDown: ComputedRef<boolean> | undefined
    vimUp: ComputedRef<boolean> | undefined
    vimDown: ComputedRef<boolean> | undefined
    g: ComputedRef<boolean> | undefined
    shift: ComputedRef<boolean> | undefined
  } {
    const keys = useMagicKeys()

    return {
      arrowUp: keys.ArrowUp,
      arrowDown: keys.ArrowDown,
      vimUp: keys.k,
      vimDown: keys.j,
      g: keys.g,
      shift: keys.shift,
    }
  }

  function calculateAcceleratedScrollSpeed(holdDurationMs: number): number {
    if (holdDurationMs < ACCELERATION_RAMP_UP_DELAY_MS) {
      return SCROLL_SPEED_BASE_PX
    }

    const accelerationProgress = Math.min(
      (holdDurationMs - ACCELERATION_RAMP_UP_DELAY_MS) / ACCELERATION_DURATION_MS,
      1,
    )

    const easeOutCubic = 1 - (1 - accelerationProgress) ** 3
    const speedRange = SCROLL_SPEED_MAX_PX - SCROLL_SPEED_BASE_PX

    return SCROLL_SPEED_BASE_PX + speedRange * easeOutCubic
  }

  function performContinuousScroll(): void {
    if (!scrollContainerRef.value || !scrollState.currentDirection.value) {
      return
    }

    const holdDuration = currentTimestamp.value - scrollState.keyHoldStartTime.value
    const scrollSpeed = calculateAcceleratedScrollSpeed(holdDuration)

    if (scrollState.currentDirection.value === 'up') {
      scrollPosition.value = Math.max(0, scrollPosition.value - scrollSpeed)
      return
    }

    scrollPosition.value = scrollPosition.value + scrollSpeed
  }

  function jumpToTop(): void {
    if (!scrollContainerRef.value)
      return
    scrollPosition.value = 0
  }

  function jumpToBottom(): void {
    if (!scrollContainerRef.value)
      return

    const maxScrollPosition = scrollContainerRef.value.scrollHeight - scrollContainerRef.value.clientHeight
    scrollPosition.value = Math.max(0, maxScrollPosition)
  }

  function isScrollContainerFocused(): boolean {
    return scrollContainerRef.value?.contains(document.activeElement) ?? false
  }

  const { pause: pauseScrollAnimation, resume: resumeScrollAnimation } = useRafFn(
    performContinuousScroll,
    { immediate: false },
  )

  function startContinuousScrolling(direction: 'up' | 'down'): void {
    if (scrollState.currentDirection.value === direction) {
      return
    }

    scrollState.currentDirection.value = direction
    scrollState.keyHoldStartTime.value = currentTimestamp.value
    resumeScrollAnimation()
  }

  function stopContinuousScrolling(): void {
    scrollState.currentDirection.value = null
    pauseScrollAnimation()
  }

  function handleDoubleGPress(): void {
    if (!isScrollContainerFocused())
      return
    if (keyBindings.shift?.value)
      return

    const isCompletingSequence = doubleGSequence.isWaitingForSecondG.value
      && !doubleGSequence.isSequenceExpired()

    if (isCompletingSequence) {
      jumpToTop()
      doubleGSequence.completeSequence()
      return
    }

    doubleGSequence.startSequence()
  }

  function setupUpScrollingKeys(): void {
    watchEffect(() => {
      if (!isScrollContainerFocused())
        return

      if (keyBindings.arrowUp?.value || keyBindings.vimUp?.value) {
        startContinuousScrolling('up')
        return
      }

      if (scrollState.currentDirection.value === 'up') {
        stopContinuousScrolling()
      }
    })
  }

  function setupDownScrollingKeys(): void {
    watchEffect(() => {
      if (!isScrollContainerFocused())
        return

      if (keyBindings.arrowDown?.value || keyBindings.vimDown?.value) {
        startContinuousScrolling('down')
        return
      }

      if (scrollState.currentDirection.value === 'down') {
        stopContinuousScrolling()
      }
    })
  }

  function setupJumpToTopKey(): void {
    watchEffect(() => {
      if (keyBindings.g?.value) {
        handleDoubleGPress()
      }
    })
  }

  function setupJumpToBottomKey(): void {
    watchEffect(() => {
      if (!isScrollContainerFocused())
        return

      if (keyBindings.shift?.value && keyBindings.g?.value) {
        jumpToBottom()
      }
    })
  }

  function setupSequenceCleanup(): void {
    watchEffect(() => {
      doubleGSequence.resetIfExpired()
    })
  }

  return {
    stopAllScrolling: stopContinuousScrolling,
  }
}
