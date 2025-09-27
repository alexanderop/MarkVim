import type MarkdownIt from 'markdown-it'
import { onMounted, ref, type Ref, watch } from 'vue'
import { addDataTestIdToAlerts, createMarkdownRenderer } from '~/shared/utils/markdown'

export function useMarkdown(markdownContent: Ref<string>) {
  let md: MarkdownIt | null = null

  const renderedMarkdown = ref('')

  const updateMarkdown = async () => {
    try {
      if (!md) {
        md = await createMarkdownRenderer()
      }
      const rawHtml = md.render(markdownContent.value)
      renderedMarkdown.value = addDataTestIdToAlerts(rawHtml)
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
    updateMarkdown,
  }
}
