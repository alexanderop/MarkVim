import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import { useMarkdown } from './useMarkdown'

/**
 * Helper to test useMarkdown composable within a component context.
 * This avoids Vue warnings about onMounted being called outside setup().
 */
function withMarkdownComposable(content: Ref<string>): {
  renderedMarkdown: Ref<string>
  updateMarkdown: () => Promise<void>
} {
  let result: ReturnType<typeof useMarkdown>

  const TestComponent = defineComponent({
    setup() {
      result = useMarkdown(content)
      return () => h('div')
    },
  })

  render(TestComponent)
  return result!
}

async function flushPromises(): Promise<void> {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('useMarkdown', () => {
  describe('when rendering external links', () => {
    it('should add rel="noopener noreferrer" to external links', async () => {
      const content = ref('[External Link](https://example.com)')
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).toContain('rel="noopener noreferrer"')
      expect(renderedMarkdown.value).toContain('href="https://example.com"')
    })

    it('should add rel="noopener noreferrer" to links with target="_blank"', async () => {
      const content = ref('<a href="https://evil.com" target="_blank">Click me</a>')
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).toContain('rel="noopener noreferrer"')
      expect(renderedMarkdown.value).toContain('Click me')
    })

    it('should preserve existing safe rel attributes', async () => {
      const content = ref('<a href="https://example.com" rel="nofollow" target="_blank">Link</a>')
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).toContain('noopener')
      expect(renderedMarkdown.value).toContain('noreferrer')
    })
  })

  describe('when sanitizing Mermaid code blocks', () => {
    it('should strip XSS onerror handlers', async () => {
      const content = ref(`\`\`\`mermaid
graph TD
A[<img src=x onerror=alert('XSS')>] --> B
\`\`\``)
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).not.toContain('onerror')
      expect(renderedMarkdown.value).not.toContain('alert')
      expect(renderedMarkdown.value).toContain('mermaid')
    })

    it('should strip script tags', async () => {
      const content = ref(`\`\`\`mermaid
graph TD
A[<script>alert('XSS')</script>] --> B
\`\`\``)
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).not.toContain('<script>')
      expect(renderedMarkdown.value).not.toContain('</script>')
      expect(renderedMarkdown.value).toContain('mermaid')
    })
  })

  describe('when sanitizing HTML content', () => {
    it('should allow safe HTML tags', async () => {
      const content = ref('Hello <b>World</b>')
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).toContain('<b>World</b>')
    })

    it('should strip script tags', async () => {
      const content = ref('Hello <script>alert("XSS")</script>')
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).not.toContain('<script>')
      expect(renderedMarkdown.value).toContain('Hello')
    })

    it('should strip onerror attributes from images', async () => {
      const content = ref('<img src=x onerror=alert(1)>')
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).not.toContain('onerror')
      expect(renderedMarkdown.value).toContain('<img')
    })

    it('should strip javascript: protocol in raw HTML links', async () => {
      const content = ref('<a href="javascript:alert(1)">Click me</a>')
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).not.toContain('javascript:')
      expect(renderedMarkdown.value).toContain('Click me')
    })

    it('should not render javascript: protocol as clickable Markdown links', async () => {
      const content = ref('[Click me for a prize](javascript:alert(document.domain))')
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).not.toContain('href="javascript:')
      expect(renderedMarkdown.value).not.toContain('href=\'javascript:')
      expect(renderedMarkdown.value).toContain('Click me for a prize')
    })

    it('should strip dangerous event handlers (onload, onclick)', async () => {
      const content = ref('<div onload="alert(1)" onclick="alert(2)">Content</div>')
      const { renderedMarkdown, updateMarkdown } = withMarkdownComposable(content)

      await updateMarkdown()
      await flushPromises()

      expect(renderedMarkdown.value).not.toContain('onload')
      expect(renderedMarkdown.value).not.toContain('onclick')
      expect(renderedMarkdown.value).toContain('Content')
    })
  })
})
