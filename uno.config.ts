import presetWebFonts from '@unocss/preset-web-fonts'
import presetWind4 from '@unocss/preset-wind4'
import { defineConfig, presetTypography } from 'unocss'

const lightThemeColors = {
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(222.2 84% 4.9%)',
  surface: {
    primary: 'hsl(210 40% 96%)',
    secondary: 'hsl(210 40% 94%)',
    hover: 'hsl(210 40% 90%)',
  },
  border: 'hsl(214.3 31.8% 85%)',
  subtle: 'hsl(214.3 31.8% 92%)',
  text: {
    primary: 'hsl(222.2 84% 4.9%)',
    secondary: 'hsl(215.4 16.3% 25%)',
    tertiary: 'hsl(215.3 12.3% 40%)',
    bright: 'hsl(222.2 84% 4.9%)',
  },
}

const darkThemeColors = {
  background: 'hsl(224 71.4% 4.1%)',
  foreground: 'hsl(210 20% 98%)',
  surface: {
    primary: 'hsl(220 26% 8%)',
    secondary: 'hsl(220 26% 12%)',
    hover: 'hsl(220 26% 16%)',
  },
  border: 'hsl(215 18% 20%)',
  subtle: 'hsl(215 18% 15%)',
  text: {
    primary: 'hsl(215 15% 75%)',
    secondary: 'hsl(215 12% 55%)',
    tertiary: 'hsl(215 10% 40%)',
    bright: 'hsl(210 20% 98%)',
  },
}

export default defineConfig({
  presets: [
    presetWind4(),
    presetTypography(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'JetBrains Mono:400,500',
      },
      themeKey: 'font',
    }),
  ],
  theme: {
    colors: {
      'background': 'var(--color-background)',
      'foreground': 'var(--color-foreground)',
      'surface': {
        primary: 'var(--color-surface-primary)',
        secondary: 'var(--color-surface-secondary)',
        hover: 'var(--color-surface-hover)',
      },
      'border': 'var(--color-border)',
      'subtle': 'var(--color-subtle)',
      'accent': 'hsl(250 84% 60%)',
      'accent-hover': 'hsl(250 84% 65%)',
      'accent-brighter': 'hsl(250 84% 70%)',
      'text': {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
        bright: 'var(--color-text-bright)',
      },
      'window': {
        close: '#ff5f57',
        minimize: '#ffbd2e',
        maximize: '#28ca42',
      },
    },
    extend: {
      vars: {
        'accent-hsl': '250 84% 60%',
        'surface-primary-hsl': '220 26% 8%',
      },
    },
  },
  preflights: [
    {
      getCSS: ({ theme }) => {
        const accentHsl = (theme.vars as any)?.['accent-hsl'] || '250 84% 60%'

        return `
          :root {
            --color-background: ${lightThemeColors.background};
            --color-foreground: ${lightThemeColors.foreground};
            --color-surface-primary: ${lightThemeColors.surface.primary};
            --color-surface-secondary: ${lightThemeColors.surface.secondary};
            --color-surface-hover: ${lightThemeColors.surface.hover};
            --color-border: ${lightThemeColors.border};
            --color-subtle: ${lightThemeColors.subtle};
            --color-text-primary: ${lightThemeColors.text.primary};
            --color-text-secondary: ${lightThemeColors.text.secondary};
            --color-text-tertiary: ${lightThemeColors.text.tertiary};
            --color-text-bright: ${lightThemeColors.text.bright};
          }

          .dark {
            --color-background: ${darkThemeColors.background};
            --color-foreground: ${darkThemeColors.foreground};
            --color-surface-primary: ${darkThemeColors.surface.primary};
            --color-surface-secondary: ${darkThemeColors.surface.secondary};
            --color-surface-hover: ${darkThemeColors.surface.hover};
            --color-border: ${darkThemeColors.border};
            --color-subtle: ${darkThemeColors.subtle};
            --color-text-primary: ${darkThemeColors.text.primary};
            --color-text-secondary: ${darkThemeColors.text.secondary};
            --color-text-tertiary: ${darkThemeColors.text.tertiary};
            --color-text-bright: ${darkThemeColors.text.bright};
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

          .prose pre {
            background-color: var(--color-surface-primary) !important;
            border: 1px solid var(--color-border);
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
            color: var(--color-text-secondary);
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
    'btn': 'px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-200',
    'btn-accent': 'bg-accent hover:bg-accent-hover',
  },
})
