import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  srcDir: 'src/',
  app: {
    head: {
      script: [
        {
          innerHTML: `
            document.documentElement.classList.add('dark');
            
            // Inject color theme from localStorage before rendering to prevent SSR hydration mismatches
            (function() {
              try {
                const storedTheme = localStorage.getItem('markvim-color-theme');
                if (storedTheme) {
                  const theme = JSON.parse(storedTheme);
                  
                  function oklchToString(color) {
                    const alpha = color.a !== undefined ? ' / ' + color.a.toFixed(3) : '';
                    return 'oklch(' + (color.l * 100).toFixed(1) + '% ' + color.c.toFixed(3) + ' ' + color.h.toFixed(0) + alpha + ')';
                  }
                  
                  const styleEl = document.createElement('style');
                  styleEl.id = 'markvim-theme-preload';
                  styleEl.textContent = \`
                    :root {
                      --background: \${oklchToString(theme.background)};
                      --foreground: \${oklchToString(theme.foreground)};
                      --accent: \${oklchToString(theme.accent)};
                      --muted: \${oklchToString(theme.muted)};
                      --border: \${oklchToString(theme.border)};
                      --alert-note: \${oklchToString(theme.alertNote)};
                      --alert-tip: \${oklchToString(theme.alertTip)};
                      --alert-important: \${oklchToString(theme.alertImportant)};
                      --alert-warning: \${oklchToString(theme.alertWarning)};
                      --alert-caution: \${oklchToString(theme.alertCaution)};
                    }
                  \`;
                  
                  document.head.appendChild(styleEl);
                }
              } catch (e) {
                console.warn('Failed to preload color theme:', e);
              }
            })();
          `,
          type: 'text/javascript',
        },
      ],
    },
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    'reka-ui/nuxt',
    '@unocss/nuxt',
    '@vueuse/nuxt',
  ],
  // Configure auto-imports for our custom structure
  components: [
    {
      path: './app',
      pathPrefix: false,
    },
    {
      path: './modules/color-theme/components',
      pathPrefix: false,
    },
    {
      path: './modules/documents/components',
      pathPrefix: false,
    },
    {
      path: './modules/editor/components',
      pathPrefix: false,
    },
    {
      path: './modules/layout/components',
      pathPrefix: false,
    },
    {
      path: './modules/markdown-preview/components',
      pathPrefix: false,
    },
    {
      path: './modules/shortcuts/components',
      pathPrefix: false,
    },
    {
      path: './modules/share/components',
      pathPrefix: false,
    },
    {
      path: './shared/components',
      pathPrefix: false,
    },
  ],
  imports: {
    dirs: [
      'modules/color-theme/composables',
      'modules/documents/composables',
      'modules/editor/composables',
      'modules/markdown-preview/composables',
      'modules/shortcuts/composables',
      'modules/share/composables',
      'modules/layout/composables',
      'shared/composables',
      'shared/utils',
    ],
  },
  css: [
    '~/shared/ui/tokens.css',
  ],
  eslint: {
    checker: true,
    config: {
      standalone: false,
    },
  },
})
