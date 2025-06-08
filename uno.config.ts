import presetWebFonts from '@unocss/preset-web-fonts'
import presetWind4 from '@unocss/preset-wind4'
import { defineConfig, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetTypography(),
    presetWebFonts({
      provider: 'google', // default provider
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'JetBrains Mono:400,500',
      },
    }),
  ],
  theme: {
    colors: {
      // Base colors
      'background': 'hsl(224 71.4% 4.1%)', // #020817
      'foreground': 'hsl(210 20% 98%)', // #fafafa

      // Surfaces
      'surface': {
        primary: 'hsl(220 26% 8%)', // #111317
        secondary: 'hsl(220 26% 12%)', // #181a20
        hover: 'hsl(220 26% 16%)', // #21242b
      },

      // Borders
      'border': 'hsl(215 18% 20%)', // #2c303a
      'subtle': 'hsl(215 18% 15%)', // #21252e

      // Accent colors
      'accent': 'hsl(250 84% 60%)', // #5D37F0
      'accent-hover': 'hsl(250 84% 65%)',
      'accent-brighter': 'hsl(250 84% 70%)',

      // Text colors
      'text': {
        primary: 'hsl(215 15% 75%)', // #b8bcc4
        secondary: 'hsl(215 12% 55%)', // #838996
        tertiary: 'hsl(215 10% 40%)', // #606572
        bright: 'hsl(210 20% 98%)', // #fafafa
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
      getCSS: ({ theme }) => {
        // Extracting HSL variables for use in CSS
        const accentHsl = (theme.vars as any)?.['accent-hsl'] || '250 84% 60%'

        return `
          :root {
            --color-background: ${theme.colors.background};
            --color-foreground: ${theme.colors.foreground};
            --color-surface-primary: ${theme.colors.surface.primary};
            --color-surface-secondary: ${theme.colors.surface.secondary};
            --color-surface-hover: ${theme.colors.surface.hover};
            --color-border: ${theme.colors.border};
            --color-accent: ${theme.colors.accent};
            --color-text-primary: ${theme.colors.text.primary};
            --color-text-secondary: ${theme.colors.text.secondary};
            --color-text-bright: ${theme.colors.text.bright};
            --accent-hsl: ${accentHsl};
          }

          body {
            font-family: 'Inter', sans-serif;
            background-color: var(--color-background);
            color: var(--color-text-primary);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          code, pre, kbd, samp {
            font-family: 'JetBrains Mono', monospace;
          }

          /* Enhanced prose code block styling */
          .prose pre {
            background-color: ${theme.colors.surface.primary} !important;
            border: 1px solid ${theme.colors.border};
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
            color: ${theme.colors.text.secondary};
            text-transform: uppercase;
            font-weight: 500;
          }

          .prose :not(pre) > code {
            background: hsl(${accentHsl} / 0.15) !important;
            color: hsl(${accentHsl} / 0.9) !important;
            padding: 0.125rem 0.375rem !important;
            border-radius: 0.25rem !important;
            font-size: 0.875em;
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
})
