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
      // Theme-aware colors using CSS variables (these will change with light/dark mode)
      'background': 'var(--color-background)',
      'foreground': 'var(--color-foreground)',

      // Surfaces
      'surface': {
        primary: 'var(--color-surface-primary)',
        hover: 'var(--color-surface-hover)',
      },

      // Borders
      'border': 'var(--color-border)',
      'subtle': 'var(--color-border)', // Use same as border for now

      // Accent colors
      'accent': 'var(--color-accent)',
      'accent-foreground': 'var(--color-accent-foreground)',
      'accent-hover': 'var(--color-accent-hover)',
      'accent-brighter': 'hsl(250 84% 70%)',

      // Status colors
      'success': 'var(--color-success)',
      'success-hover': 'var(--color-success-hover)',
      'warning': 'var(--color-warning)',
      'warning-hover': 'var(--color-warning-hover)',
      'error': 'var(--color-error)',
      'error-hover': 'var(--color-error-hover)',

      // Text colors
      'text': {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-secondary)', // Use same as secondary for now
        bright: 'var(--color-text-bright)',
      },

      // Window decoration (for fake window UI)
      'window': {
        close: '#ff5f57',
        minimize: '#ffbd2e',
        maximize: '#28ca42',
      },
    },
    extend: {
      // Add HSL variables for opacity modifiers
      vars: {
        'accent-hsl': '250 84% 60%',
        'surface-primary-hsl': '220 26% 8%',
      },
    },
  },
  preflights: [
    {
      getCSS: () => {
        return `
          body {
            font-family: 'Geist', sans-serif;
            background-color: var(--color-background);
            color: var(--color-text-primary);
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
            background-color: var(--color-surface-primary) !important;
            border: 1px solid var(--color-border);
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
            color: var(--color-text-secondary);
            text-transform: uppercase;
            font-weight: 500;
          }

          .prose :not(pre) > code {
            background: hsl(var(--accent-hsl) / 0.15) !important;
            color: hsl(var(--accent-hsl) / 0.9) !important;
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
    // Example shortcut
    'btn': 'px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-200',
    'btn-accent': 'bg-accent hover:bg-accent-hover',
  },
  rules: [
    // Override gray classes with theme-aware versions
    [/^bg-gray-950$/, () => ({ 'background-color': 'var(--color-background)' })],
    [/^bg-gray-900$/, () => ({ 'background-color': 'var(--color-surface-primary)' })],
    [/^bg-gray-800$/, () => ({ 'background-color': 'var(--color-surface-primary)' })],
    [/^bg-gray-700$/, () => ({ 'background-color': 'var(--color-surface-hover)' })],
    [/^text-gray-100$/, () => ({ color: 'var(--color-text-bright)' })],
    [/^text-gray-200$/, () => ({ color: 'var(--color-text-primary)' })],
    [/^text-gray-300$/, () => ({ color: 'var(--color-text-primary)' })],
    [/^text-gray-400$/, () => ({ color: 'var(--color-text-secondary)' })],
    [/^text-gray-500$/, () => ({ color: 'var(--color-text-secondary)' })],
    [/^border-gray-600$/, () => ({ 'border-color': 'var(--color-border)' })],
    [/^border-gray-700$/, () => ({ 'border-color': 'var(--color-border)' })],
    [/^border-gray-800$/, () => ({ 'border-color': 'var(--color-border)' })],
    [/^hover:bg-gray-700$/, () => ({ '&:hover': { 'background-color': 'var(--color-surface-hover)' } })],
    [/^hover:bg-gray-800$/, () => ({ '&:hover': { 'background-color': 'var(--color-surface-hover)' } })],
    [/^hover:text-gray-200$/, () => ({ '&:hover': { color: 'var(--color-text-bright)' } })],
    [/^hover:text-gray-300$/, () => ({ '&:hover': { color: 'var(--color-text-bright)' } })],
  ],
})
