import type { Highlighter } from 'shiki'
import markdownItMermaid from '@markslides/markdown-it-mermaid'
import { fromHighlighter } from '@shikijs/markdown-it/core'
import MarkdownIt from 'markdown-it'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItGitHubAlerts from 'markdown-it-github-alerts'
import { createHighlighter } from 'shiki'

let markdownInstance: MarkdownIt | null = null
let shikiHighlighter: Highlighter | null = null
const cssClassMap = new Map<string, string>()
let cssCounter = 0

function stripInlineStyles(html: string): string {
  const styleAttr = /style=(["'])(.*?)\1/g

  return html.replace(styleAttr, (...args) => {
    const styleContent = args[2]
    if (!cssClassMap.has(styleContent)) {
      cssClassMap.set(styleContent, `shiki-${cssCounter++}`)
    }
    return `class="${cssClassMap.get(styleContent)}"`
  })
}

async function getShikiHighlighter() {
  if (!shikiHighlighter) {
    shikiHighlighter = await createHighlighter({
      themes: ['night-owl'],
      langs: [
        'javascript',
        'typescript',
        'vue',
        'html',
        'css',
        'json',
        'markdown',
        'bash',
        'shell',
        'python',
        'java',
        'cpp',
        'c',
        'rust',
        'go',
        'php',
        'ruby',
        'swift',
        'kotlin',
        'sql',
        'yaml',
        'xml',
        'dockerfile',
        'plaintext',
      ],
    })
  }
  return shikiHighlighter
}

export function addDataTestIdToAlerts(html: string): string {
  // Add data-testid attributes to GitHub alert elements
  return html.replace(
    /<div class="markdown-alert markdown-alert-(\w+)"/g,
    '<div class="markdown-alert markdown-alert-$1" data-testid="github-alert-$1"',
  )
}

export async function createMarkdownRenderer() {
  if (markdownInstance) {
    return markdownInstance
  }

  try {
    const highlighter = await getShikiHighlighter()

    markdownInstance = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })

    markdownInstance.use(
      fromHighlighter(highlighter, {
        theme: 'night-owl',
      }),
    )

    markdownInstance.use(markdownItMermaid)
    markdownInstance.use(markdownItFootnote)
    markdownInstance.use(markdownItGitHubAlerts)

    const originalFence = markdownInstance.renderer.rules.fence || function () {
      return ''
    }
    markdownInstance.renderer.rules.fence = function (tokens, idx, options, env, slf) {
      const token = tokens[idx]
      const langName = token.info.trim().split(/\s+/g)[0] || 'plaintext'

      if (langName === 'mermaid') {
        return `<div class="mermaid">\n${token.content}\n</div>`
      }

      const result = originalFence.call(this, tokens, idx, options, env, slf)
      const stripped = stripInlineStyles(result)

      return stripped.replace('<pre', `<pre data-language="${langName}"`)
    }

    return markdownInstance
  }
  catch (error) {
    console.error('Failed to initialize markdown renderer:', error)
    markdownInstance = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })
    markdownInstance.use(markdownItFootnote)
    markdownInstance.use(markdownItGitHubAlerts)
    return markdownInstance
  }
}

export function generateShikiCSS(): string {
  const cssRules = Array.from(cssClassMap.entries())
    .map(([style, className]) => `.${className} { ${style} }`)
    .join('\n')

  return cssRules ? `@layer syntax { ${cssRules} }` : ''
}

export function resetShikiCSS() {
  cssClassMap.clear()
  cssCounter = 0
}
