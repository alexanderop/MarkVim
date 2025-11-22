import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useMarkdown } from './useMarkdown'

describe('useMarkdown Sanitization', () => {
  it('should allow safe HTML tags', async () => {
    const content = ref('Hello <b>World</b>')
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    expect(renderedMarkdown.value).toContain('<b>World</b>')
  })

  it('should strip dangerous XSS vectors (scripts)', async () => {
    const content = ref('Hello <script>alert("XSS")</script>')
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    // If sanitization is missing, this will FAIL because markdown-it (with html:true) renders it
    expect(renderedMarkdown.value).not.toContain('<script>')
    expect(renderedMarkdown.value).toContain('Hello')
  })

  it('should strip dangerous attributes (onerror)', async () => {
    const content = ref('<img src=x onerror=alert(1)>')
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    // The onerror attribute must be gone
    expect(renderedMarkdown.value).not.toContain('onerror')
    // The image tag itself is usually fine, just not the handler
    expect(renderedMarkdown.value).toContain('<img')
  })

  it('should strip javascript: protocol in raw HTML links', async () => {
    const content = ref('<a href="javascript:alert(1)">Click me</a>')
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    expect(renderedMarkdown.value).not.toContain('javascript:')
    expect(renderedMarkdown.value).toContain('Click me')
  })

  it('should not render javascript: protocol as clickable Markdown links', async () => {
    // This is the attack vector: [Click me for a prize](javascript:alert(document.domain))
    const content = ref('[Click me for a prize](javascript:alert(document.domain))')
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    // The javascript: protocol must NOT be rendered as an executable href
    // markdown-it refuses to render javascript: URLs as links (security feature)
    // DOMPurify would strip it anyway if it were rendered
    expect(renderedMarkdown.value).not.toContain('href="javascript:')
    expect(renderedMarkdown.value).not.toContain('href=\'javascript:')
    expect(renderedMarkdown.value).toContain('Click me for a prize')
  })

  it('should strip dangerous event handlers (onload, onclick)', async () => {
    const content = ref('<div onload="alert(1)" onclick="alert(2)">Content</div>')
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    expect(renderedMarkdown.value).not.toContain('onload')
    expect(renderedMarkdown.value).not.toContain('onclick')
    expect(renderedMarkdown.value).toContain('Content')
  })
})
