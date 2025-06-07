import presetWind4 from '@unocss/preset-wind4'
import { presetTypography } from '@unocss/preset-typography'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetTypography()
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'avenir next', 'avenir', 'segoe ui', 'helvetica neue', 'helvetica', 'Ubuntu', 'roboto', 'noto', 'arial', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', 'DejaVu Sans Mono', 'monospace'],
    },
    colors: {
      // Editor theme colors
      editor: {
        bg: '#0c0d11',        // Main background
        border: '#1d1f23',    // Border color
        divider: '#1d1f23',   // Divider lines
        hover: '#2a2d3a',     // Hover states
        active: '#5e6ad2',    // Active/selected states
      },
      // Text colors
      text: {
        primary: '#9ca3af',   // Primary text color
        secondary: '#6c7383', // Secondary text color
      },
      // macOS window controls (traffic lights)
      window: {
        close: '#ff5f57',     // Red dot
        minimize: '#ffbd2e',  // Yellow dot  
        maximize: '#28ca42',  // Green dot
      },
      // Surface colors for different backgrounds
      surface: {
        primary: '#0c0d11',   // Main surface
        secondary: '#1d1f23', // Secondary surface
      }
    }
  } as any,
  preflights: [
    {
      getCSS({ theme }) {
        return `
          /* Default font family for the entire app */
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'avenir next', avenir, 'segoe ui', 'helvetica neue', helvetica, Ubuntu, roboto, noto, arial, sans-serif;
          }
          
          /* Ensure code elements use monospace */
          code, pre, kbd, samp {
            font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
          }

          /* Enhanced prose code block styling for Shiki integration */
          .prose pre {
            background-color: #1e1f22 !important;
            border: 1px solid ${theme.colors.editor.border};
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
            background: ${theme.colors.editor.bg};
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
      }
    }
  ]
})