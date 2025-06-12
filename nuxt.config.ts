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
            const theme = localStorage.getItem('markvim-theme') || 'dark';
            if (theme === 'auto') {
              const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.classList.add(systemTheme);
            } else {
              document.documentElement.classList.add(theme);
            }
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
