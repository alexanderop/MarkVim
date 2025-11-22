import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useMarkdown } from './useMarkdown'

describe('useMarkdown Reverse Tabnabbing Protection', () => {
  it('should add rel="noopener noreferrer" to external links', async () => {
    const content = ref('[External Link](https://example.com)')
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    // External links should have noopener noreferrer to prevent reverse tabnabbing
    expect(renderedMarkdown.value).toContain('rel="noopener noreferrer"')
    expect(renderedMarkdown.value).toContain('href="https://example.com"')
  })

  it('should add rel="noopener noreferrer" to links with target="_blank"', async () => {
    // Raw HTML link with target="_blank"
    const content = ref('<a href="https://evil.com" target="_blank">Click me</a>')
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    // Must have noopener noreferrer when target="_blank" is present
    expect(renderedMarkdown.value).toContain('rel="noopener noreferrer"')
    expect(renderedMarkdown.value).toContain('Click me')
  })

  it('should preserve existing safe rel attributes', async () => {
    const content = ref('<a href="https://example.com" rel="nofollow" target="_blank">Link</a>')
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    // Should have noopener noreferrer in addition to or merged with existing rel
    expect(renderedMarkdown.value).toContain('noopener')
    expect(renderedMarkdown.value).toContain('noreferrer')
  })
})

describe('useMarkdown Sanitization', () => {
  it('should sanitize XSS in Mermaid code blocks', async () => {
    // This is a Mermaid XSS attack vector - the content inside the mermaid
    // code block should be escaped to prevent script injection
    const content = ref(`\`\`\`mermaid
graph TD
A[<img src=x onerror=alert('XSS')>] --> B
\`\`\``)
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    // The onerror handler must be stripped from mermaid content
    expect(renderedMarkdown.value).not.toContain('onerror')
    expect(renderedMarkdown.value).not.toContain('alert')
    // The mermaid div should still be present
    expect(renderedMarkdown.value).toContain('mermaid')
  })

  it('should sanitize script tags in Mermaid code blocks', async () => {
    const content = ref(`\`\`\`mermaid
graph TD
A[<script>alert('XSS')</script>] --> B
\`\`\``)
    const { renderedMarkdown, updateMarkdown } = useMarkdown(content)

    await updateMarkdown()

    // Script tags must be stripped
    expect(renderedMarkdown.value).not.toContain('<script>')
    expect(renderedMarkdown.value).not.toContain('</script>')
    expect(renderedMarkdown.value).toContain('mermaid')
  })

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
