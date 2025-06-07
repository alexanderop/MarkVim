import presetWind4 from '@unocss/preset-wind4'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'avenir next', 'avenir', 'segoe ui', 'helvetica neue', 'helvetica', 'Ubuntu', 'roboto', 'noto', 'arial', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', 'DejaVu Sans Mono', 'monospace'],
    }
  } as any,
  preflights: [
    {
      getCSS() {
        return `
          /* Default font family for the entire app */
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'avenir next', avenir, 'segoe ui', 'helvetica neue', helvetica, Ubuntu, roboto, noto, arial, sans-serif;
          }
          
          /* Ensure code elements use monospace */
          code, pre, kbd, samp {
            font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
          }
        `
      }
    }
  ]
})