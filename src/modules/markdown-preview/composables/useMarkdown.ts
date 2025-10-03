import type MarkdownIt from 'markdown-it'
import { onMounted, ref, type Ref, watch } from 'vue'
import { tryCatchAsync } from '~/shared/utils/result'
import { addDataTestIdToAlerts, createMarkdownRenderer } from '../internal/markdown'

export function useMarkdown(markdownContent: Ref<string>): {
  renderedMarkdown: Ref<string>
  updateMarkdown: () => Promise<void>
} {
  let md: MarkdownIt | null = null

  const renderedMarkdown = ref('')

  const updateMarkdown = async (): Promise<void> => {
    if (!md) {
      md = await createMarkdownRenderer()
    }

    const renderResult = await tryCatchAsync(
      () => Promise.resolve((() => {
        const rawHtml = md!.render(markdownContent.value)
        return addDataTestIdToAlerts(rawHtml)
      })()),
      error => (error instanceof Error ? error : new Error(String(error))),
    )

    if (renderResult.ok) {
      renderedMarkdown.value = renderResult.value
    }
    else {
      console.error('Failed to render markdown:', renderResult.error)
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
