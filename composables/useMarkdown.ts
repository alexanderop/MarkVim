import type MarkdownIt from 'markdown-it'
import { createMarkdownRenderer, generateShikiCSS } from '~/utils/markdown'

export function useMarkdown(markdownContent: Ref<string>) {
  let md: MarkdownIt | null = null

  const renderedMarkdown = ref('')
  const shikiCSS = ref('')

  const updateMarkdown = async () => {
    try {
      if (!md) {
        md = await createMarkdownRenderer()
      }
      renderedMarkdown.value = md.render(markdownContent.value)
      shikiCSS.value = generateShikiCSS()
    }
    catch (error) {
      console.error('Failed to render markdown:', error)
      const MarkdownIt = (await import('markdown-it')).default
      const basicMd = new MarkdownIt()
      renderedMarkdown.value = basicMd.render(markdownContent.value)
    }
  }

  watch(markdownContent, updateMarkdown, { immediate: false })

  onMounted(async () => {
    await updateMarkdown()
  })

  return {
    renderedMarkdown,
    shikiCSS,
    updateMarkdown,
  }
}
