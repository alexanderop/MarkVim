import { useAsyncState, useCssVar, useMutationObserver } from '@vueuse/core'
import { computed, nextTick, type Ref } from 'vue'

export function useMermaid(rootElement: Ref<HTMLElement | undefined>) {
  let mermaid: any = null

  const primaryColor = useCssVar('--accent')
  const primaryTextColor = useCssVar('--foreground')
  const primaryBorderColor = useCssVar('--border')
  const lineColor = useCssVar('--foreground')
  const sectionBkgColor = useCssVar('--background')
  const altSectionBkgColor = useCssVar('--muted')
  const gridColor = useCssVar('--border')
  const secondaryColor = useCssVar('--border')
  const tertiaryColor = useCssVar('--muted')
  const background = useCssVar('--background')
  const mainBkg = useCssVar('--background')
  const secondBkg = useCssVar('--muted')
  const secondaryTextColor = useCssVar('--foreground')
  const errorBkgColor = computed(() => `oklch(from ${primaryColor.value} calc(l - 0.2) c calc(h + 180))`)
  const errorTextColor = useCssVar('--foreground')
  const fillType0 = useCssVar('--accent')
  const fillType1 = useCssVar('--muted')
  const fillType2 = computed(() => `color-mix(in oklch, ${primaryColor.value} 20%, ${tertiaryColor.value})`)
  const fillType3 = useCssVar('--muted')

  const isDark = () => document.documentElement.classList.contains('dark')

  const initializeMermaid = () => {
    if (!mermaid?.default)
      return

    const isCurrentlyDark = isDark()

    try {
      mermaid.default.initialize({
        startOnLoad: false,
        theme: isCurrentlyDark ? 'dark' : 'base',
        darkMode: isCurrentlyDark,
        themeVariables: {
          primaryColor: primaryColor.value,
          primaryTextColor: primaryTextColor.value,
          primaryBorderColor: primaryBorderColor.value,
          lineColor: lineColor.value,
          sectionBkgColor: sectionBkgColor.value,
          altSectionBkgColor: altSectionBkgColor.value,
          gridColor: gridColor.value,
          secondaryColor: secondaryColor.value,
          tertiaryColor: tertiaryColor.value,
          background: background.value,
          mainBkg: mainBkg.value,
          secondBkg: secondBkg.value,
          secondaryTextColor: secondaryTextColor.value,
          errorBkgColor: errorBkgColor.value,
          errorTextColor: errorTextColor.value,
          fillType0: fillType0.value,
          fillType1: fillType1.value,
          fillType2: fillType2.value,
          fillType3: fillType3.value,
        },
      })
    }
    catch (error) {
      console.error('Failed to initialize Mermaid:', error)
    }
  }

  const renderDiagrams = async () => {
    if (!mermaid?.default || !rootElement.value)
      return

    try {
      const nodes = rootElement.value.querySelectorAll('.mermaid') ?? []
      if (nodes.length > 0) {
        initializeMermaid()

        nodes.forEach((node) => {
          const element = node as HTMLElement
          if (element.hasAttribute('data-processed')) {
            element.removeAttribute('data-processed')
            const originalContent = element.dataset.mermaidSource || element.textContent
            if (originalContent) {
              element.innerHTML = originalContent
              element.removeAttribute('id')
            }
          }
          else {
            element.dataset.mermaidSource = element.textContent || ''
          }
        })

        await mermaid.default.run({ nodes: Array.from(nodes) as HTMLElement[] })
      }
    }
    catch (error) {
      console.error('Failed to render Mermaid diagrams:', error)
    }
  }

  const { execute: setupMermaid, isLoading, isReady } = useAsyncState(
    async () => {
      mermaid = await import('mermaid')
      return mermaid
    },
    null,
    {
      immediate: false,
      onSuccess: () => {
        initializeMermaid()
        renderDiagrams()
      },
    },
  )

  const { stop } = useMutationObserver(
    () => (import.meta.client ? document.documentElement : null),
    () => {
      nextTick(renderDiagrams)
    },
    {
      attributes: true,
      attributeFilter: ['class'],
    },
  )

  return {
    setupMermaid: () => setupMermaid(),
    renderDiagrams,
    cleanup: stop,
    isLoading,
    isReady,
  }
}
