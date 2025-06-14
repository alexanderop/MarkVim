import presetWebFonts from '@unocss/preset-web-fonts'
import presetWind4 from '@unocss/preset-wind4'
import { defineConfig, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetTypography({
      cssExtend: {
        '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6': {
          color: 'var(--accent)',
        },
        '.prose .shiki, .prose .shiki code, .prose .shiki pre, .prose [class*="shiki-"], .prose pre[data-language] code': {
          border: '1px solid var(--muted)',
        },
        '.prose .mermaid': {
          'display': 'flex',
          'justify-content': 'center',
          'margin': '1rem 0',
        },
        '.prose .markdown-alert': {
          'border-left-width': '4px',
          'border-left-style': 'solid',
          'padding-left': '1rem',
          'margin': '1rem 0',
          'background-color': 'color-mix(in oklch, var(--background) 90%, transparent)',
          'border-radius': '0.375rem',
          'padding': '1rem',
        },
        '.prose .markdown-alert-note': {
          'border-left-color': 'var(--alert-note)',
          'background-color': 'color-mix(in oklch, var(--alert-note) 5%, var(--background))',
        },
        '.prose .markdown-alert-note .markdown-alert-title': {
          color: 'var(--foreground)',
        },
        '.prose .markdown-alert-note .markdown-alert-title svg': {
          fill: 'var(--foreground)',
        },
        '.prose .markdown-alert-tip': {
          'border-left-color': 'var(--alert-tip)',
          'background-color': 'color-mix(in oklch, var(--alert-tip) 5%, var(--background))',
        },
        '.prose .markdown-alert-tip .markdown-alert-title': {
          color: 'var(--foreground)',
        },
        '.prose .markdown-alert-tip .markdown-alert-title svg': {
          fill: 'var(--foreground)',
        },
        '.prose .markdown-alert-important': {
          'border-left-color': 'var(--alert-important)',
          'background-color': 'color-mix(in oklch, var(--alert-important) 5%, var(--background))',
        },
        '.prose .markdown-alert-important .markdown-alert-title': {
          color: 'var(--foreground)',
        },
        '.prose .markdown-alert-important .markdown-alert-title svg': {
          fill: 'var(--foreground)',
        },
        '.prose .markdown-alert-warning': {
          'border-left-color': 'var(--alert-warning)',
          'background-color': 'color-mix(in oklch, var(--alert-warning) 5%, var(--background))',
        },
        '.prose .markdown-alert-warning .markdown-alert-title': {
          color: 'var(--foreground)',
        },
        '.prose .markdown-alert-warning .markdown-alert-title svg': {
          fill: 'var(--foreground)',
        },
        '.prose .markdown-alert-caution': {
          'border-left-color': 'var(--alert-caution)',
          'background-color': 'color-mix(in oklch, var(--alert-caution) 5%, var(--background))',
        },
        '.prose .markdown-alert-caution .markdown-alert-title': {
          color: 'var(--foreground)',
        },
        '.prose .markdown-alert-caution .markdown-alert-title svg': {
          fill: 'var(--foreground)',
        },
      },
    }),
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
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      accent: 'var(--accent)',
      muted: 'var(--muted)',
      border: 'var(--border)',

      // Window decoration (for fake window UI)
      window: {
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

    // New simplified token classes
    [/^text-foreground$/, () => ({ color: 'var(--foreground)' })],
    [/^text-accent$/, () => ({ color: 'var(--accent)' })],
    [/^text-muted$/, () => ({ color: 'var(--muted)' })],
    [/^bg-foreground$/, () => ({ 'background-color': 'var(--foreground)' })],
    [/^bg-accent$/, () => ({ 'background-color': 'var(--accent)' })],
    [/^bg-muted$/, () => ({ 'background-color': 'var(--muted)' })],
  ],
})
