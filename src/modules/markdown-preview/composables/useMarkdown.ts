import type MarkdownIt from 'markdown-it'
import DOMPurify from 'isomorphic-dompurify'
import { onMounted, ref, type Ref, watch } from 'vue'
import { tryCatchAsync } from '~/shared/utils/result'
import { addDataTestIdToAlerts, createMarkdownRenderer } from '../utils/markdown'

export function useMarkdown(markdownContent: Ref<string>): {
  renderedMarkdown: Ref<string>
  updateMarkdown: () => Promise<void>
} {
  let md: MarkdownIt | null = null

  const renderedMarkdown = ref('')

  const updateMarkdown = async (): Promise<void> => {
    md ??= await createMarkdownRenderer()

    const renderResult = await tryCatchAsync(
      () => Promise.resolve((() => {
        const rawHtml = md!.render(markdownContent.value)
        const sanitizedHtml = DOMPurify.sanitize(rawHtml)
        return addDataTestIdToAlerts(sanitizedHtml)
      })()),
      error => (error instanceof Error ? error : new Error(String(error))),
    )

    if (renderResult.ok) {
      renderedMarkdown.value = renderResult.value
      return
    }
    console.error('Failed to render markdown:', renderResult.error)
    const MarkdownIt = (await import('markdown-it')).default
    const basicMd = new MarkdownIt()
    const rawFallbackHtml = basicMd.render(markdownContent.value)
    renderedMarkdown.value = DOMPurify.sanitize(rawFallbackHtml)
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
