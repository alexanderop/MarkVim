import presetWebFonts from '@unocss/preset-web-fonts'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import presetWind4 from '@unocss/preset-wind4'
import { defineConfig, presetTypography } from 'unocss'

export default defineConfig({
  // ①  Wind4 first → base utilities & reset
  presets: [
    presetWind4({
      preflights: {
        reset: true, // use the built-in Tailwind-4 reset
        theme: 'on-demand', // only emit CSS vars you actually use (default)
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
      processors: createLocalFontProcessor(),
    }),
  ],

  // ③  Wind4 theme keys
  theme: {
    // your colours stay unchanged
    colors: {
      editor: { bg: '#0c0d11', border: '#1d1f23', divider: '#1d1f23', hover: '#2a2d3a', active: '#5e6ad2' },
      text: { primary: '#9ca3af', secondary: '#6c7383' },
      window: { close: '#ff5f57', minimize: '#ffbd2e', maximize: '#28ca42' },
      surface: { primary: '#0c0d11', secondary: '#1d1f23' },
    },
  },

  // ④  keep your custom prose / codeblock overrides
  preflights: [
    {
      getCSS() {
        return `
          /* Default font family for the entire app */
          :root {
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'avenir next', avenir, 'segoe ui', 'helvetica neue', helvetica, Ubuntu, roboto, noto, arial, sans-serif;
            --font-mono: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
          }
          
          * {
            font-family: var(--font-sans);
          }
          
          /* Ensure code elements use monospace */
          code, pre, kbd, samp {
            font-family: var(--font-mono);
          }

          /* Enhanced prose code block styling for Shiki integration */
          .prose pre {
            background-color: #1e1f22 !important;
            border: 1px solid var(--color-editor-border);
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            overflow-x: auto;
            position: relative;
          }

          .prose pre[data-language]::before {
            content: attr(data-language);
            position: absolute;
            top: 0.5rem;
            right: 0.75rem;
            font-size: 0.75rem;
            color: #8b949e;
            text-transform: uppercase;
            font-weight: 500;
            letter-spacing: 0.05em;
            opacity: 0.7;
            z-index: 1;
          }

          .prose pre code {
            background: transparent !important;
            padding: 0 !important;
            border-radius: 0 !important;
            font-size: 0.875rem;
            line-height: 1.6;
            color: inherit;
          }

          .prose :not(pre) > code {
            background: rgba(110, 118, 129, 0.15) !important;
            color: #ff7b72 !important;
            padding: 0.125rem 0.375rem !important;
            border-radius: 0.25rem !important;
            font-size: 0.875em;
            font-weight: 400;
          }

          /* Syntax highlighting layer */
          @layer syntax {
            /* This layer will be populated by Shiki */
          }

          /* Enhanced scrollbars for code blocks */
          .prose pre::-webkit-scrollbar {
            height: 6px;
          }

          .prose pre::-webkit-scrollbar-track {
            background: var(--color-editor-bg);
            border-radius: 3px;
          }

          .prose pre::-webkit-scrollbar-thumb {
            background: #3a3f52;
            border-radius: 3px;
          }

          .prose pre::-webkit-scrollbar-thumb:hover {
            background: #4a5068;
          }
        `
      },
    },
  ],
})
