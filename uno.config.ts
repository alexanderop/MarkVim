import presetWebFonts from '@unocss/preset-web-fonts'
import presetWind4 from '@unocss/preset-wind4'
import { defineConfig, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetTypography(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Geist:400,500,600,700',
        mono: 'Fira Code:300,400,450,500,600,700',
      },
      themeKey: 'font',
    }),
  ],
  theme: {
    colors: {
      'background': 'var(--background)',
      'foreground': 'var(--foreground)',
      'accent': 'var(--accent)',
      'muted': 'var(--muted)',
      'border': 'var(--border)',

      // Window decoration (for fake window UI)
      'window': {
        close: '#ff5f57',
        minimize: '#ffbd2e',
        maximize: '#28ca42',
      },
    },
  },
  preflights: [
    {
      getCSS: () => {
        return `
          body {
            font-family: 'Geist', sans-serif;
            background-color: var(--background);
            color: var(--foreground);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          code, pre, kbd, samp {
            font-family: 'Fira Code', monospace;
            font-feature-settings: 'liga' 1, 'calt' 1;
            font-variant-ligatures: contextual;
          }

          /* Enhanced prose code block styling */
          .prose pre {
            background-color: var(--muted) !important;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            overflow-x: auto;
            position: relative;
            font-family: 'Fira Code', monospace !important;
            font-feature-settings: 'liga' 1, 'calt' 1;
            font-variant-ligatures: contextual;
          }

          .prose pre[data-language]::before {
            content: attr(data-language);
            position: absolute;
            top: 0.5rem;
            right: 0.75rem;
            font-size: 0.75rem;
            color: var(--foreground);
            opacity: 0.6;
            text-transform: uppercase;
            font-weight: 500;
          }

          .prose :not(pre) > code {
            background: color-mix(in oklch, var(--accent) 15%, transparent) !important;
            color: var(--accent) !important;
            padding: 0.125rem 0.375rem !important;
            border-radius: 0.25rem !important;
            font-size: 0.875em;
            font-family: 'Fira Code', monospace !important;
            font-feature-settings: 'liga' 1, 'calt' 1;
            font-variant-ligatures: contextual;
          }

          /* Shiki code blocks */
          .shiki,
          .shiki code,
          .shiki pre,
          [class*="shiki-"],
          pre[data-language] code {
            font-family: 'Fira Code', monospace !important;
            font-feature-settings: 'liga' 1, 'calt' 1;
            font-variant-ligatures: contextual;
          }

          /* Ensure Shiki has proper line wrapping structure */
          .shiki .line {
            display: block;
            min-height: 1.25em;
          }

          /* CodeMirror editor */
          .cm-editor,
          .cm-editor .cm-content,
          .cm-editor .cm-line {
            font-family: 'Fira Code', monospace !important;
            font-feature-settings: 'liga' 1, 'calt' 1;
            font-variant-ligatures: contextual;
          }
        `
      },
    },
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-semibold transition-colors duration-200',
    'btn-accent': 'bg-accent hover:bg-accent/90 text-background',
  },
  rules: [
    // Override gray classes with simplified tokens
    [/^bg-gray-950$/, () => ({ 'background-color': 'var(--background)' })],
    [/^bg-gray-900$/, () => ({ 'background-color': 'var(--muted)' })],
    [/^bg-gray-800$/, () => ({ 'background-color': 'var(--muted)' })],
    [/^bg-gray-700$/, () => ({ 'background-color': 'var(--muted)' })],
    [/^text-gray-100$/, () => ({ color: 'var(--foreground)' })],
    [/^text-gray-200$/, () => ({ color: 'var(--foreground)' })],
    [/^text-gray-300$/, () => ({ color: 'var(--foreground)' })],
    [/^text-gray-400$/, () => ({ color: 'var(--foreground)', opacity: '0.7' })],
    [/^text-gray-500$/, () => ({ color: 'var(--foreground)', opacity: '0.6' })],
    [/^border-gray-600$/, () => ({ 'border-color': 'var(--border)' })],
    [/^border-gray-700$/, () => ({ 'border-color': 'var(--border)' })],
    [/^border-gray-800$/, () => ({ 'border-color': 'var(--border)' })],
    [/^hover:bg-gray-700$/, () => ({ '&:hover': { 'background-color': 'var(--muted)' } })],
    [/^hover:bg-gray-800$/, () => ({ '&:hover': { 'background-color': 'var(--muted)' } })],
    [/^hover:text-gray-200$/, () => ({ '&:hover': { color: 'var(--foreground)' } })],
    [/^hover:text-gray-300$/, () => ({ '&:hover': { color: 'var(--foreground)' } })],

    // Map old theme class names to new simplified tokens
    [/^bg-background$/, () => ({ 'background-color': 'var(--background)' })],
    [/^bg-surface-primary$/, () => ({ 'background-color': 'var(--background)' })],
    [/^bg-surface-secondary$/, () => ({ 'background-color': 'var(--muted)' })],
    [/^bg-surface-hover$/, () => ({ 'background-color': 'var(--muted)' })],
    [/^text-text-primary$/, () => ({ color: 'var(--foreground)' })],
    [/^text-text-secondary$/, () => ({ color: 'var(--foreground)', opacity: '0.7' })],
    [/^text-text-tertiary$/, () => ({ color: 'var(--foreground)', opacity: '0.6' })],
    [/^text-text-bright$/, () => ({ color: 'var(--foreground)' })],
    [/^text-text-muted$/, () => ({ color: 'var(--foreground)', opacity: '0.5' })],
    [/^border-border$/, () => ({ 'border-color': 'var(--border)' })],
    [/^border-subtle$/, () => ({ 'border-color': 'var(--border)' })],
    [/^border-editor-border$/, () => ({ 'border-color': 'var(--border)' })],

    // Hover states
    [/^hover:bg-surface-hover$/, () => ({ '&:hover': { 'background-color': 'var(--muted)' } })],
    [/^hover:text-text-primary$/, () => ({ '&:hover': { color: 'var(--foreground)' } })],
    [/^hover:text-text-secondary$/, () => ({ '&:hover': { color: 'var(--foreground)', opacity: '0.8' } })],

    // New simplified token classes
    [/^text-foreground$/, () => ({ color: 'var(--foreground)' })],
    [/^text-accent$/, () => ({ color: 'var(--accent)' })],
    [/^text-muted$/, () => ({ color: 'var(--muted)' })],
    [/^bg-foreground$/, () => ({ 'background-color': 'var(--foreground)' })],
    [/^bg-accent$/, () => ({ 'background-color': 'var(--accent)' })],
    [/^bg-muted$/, () => ({ 'background-color': 'var(--muted)' })],
  ],
})
