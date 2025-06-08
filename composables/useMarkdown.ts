import type MarkdownIt from 'markdown-it'
import { createMarkdownRenderer, generateShikiCSS } from '~/utils/markdown'

export function useMarkdown(initialContent = '') {
  let md: MarkdownIt | null = null

  const markdown = useLocalStorage('markvim-markdown-content', initialContent)
  const renderedMarkdown = ref('')
  const shikiCSS = ref('')

  const updateMarkdown = async () => {
    try {
      if (!md) {
        md = await createMarkdownRenderer()
      }
      renderedMarkdown.value = md.render(markdown.value)
      shikiCSS.value = generateShikiCSS()
    }
    catch (error) {
      console.error('Failed to render markdown:', error)
      const MarkdownIt = (await import('markdown-it')).default
      const basicMd = new MarkdownIt()
      renderedMarkdown.value = basicMd.render(markdown.value)
    }
  }

  watch(markdown, updateMarkdown, { immediate: false })

  onMounted(async () => {
    await updateMarkdown()
  })

  return {
    markdown,
    renderedMarkdown,
    shikiCSS,
    updateMarkdown,
  }
}
