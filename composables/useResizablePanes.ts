export function useResizablePanes(initialLeftWidth: number = 50) {
  const leftPaneWidth = ref(initialLeftWidth)
  const rightPaneWidth = computed(() => 100 - leftPaneWidth.value)
  
  const isDragging = ref(false)
  const { x: mouseX } = useMouse()
  const containerRef = ref<HTMLElement>()

  const startDrag = (event: MouseEvent) => {
    event.preventDefault()
    isDragging.value = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const stopDrag = () => {
    isDragging.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const cleanup = () => {
    stopDrag()
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const mouseUpListener = useEventListener('mouseup', stopDrag)
  const mouseLeaveListener = useEventListener('mouseleave', stopDrag)

  onUnmounted(() => {
    cleanup()
    mouseUpListener()
    mouseLeaveListener()
  })

  watch(mouseX, (newX) => {
    if (!isDragging.value || !containerRef.value) return
    
    const containerRect = containerRef.value.getBoundingClientRect()
    const relativeX = newX - containerRect.left
    const percentage = Math.max(20, Math.min(80, (relativeX / containerRect.width) * 100))
    
    leftPaneWidth.value = percentage
  })

  return {
    leftPaneWidth: readonly(leftPaneWidth),
    rightPaneWidth: readonly(rightPaneWidth),
    isDragging: readonly(isDragging),
    containerRef,
    startDrag
  }
} 