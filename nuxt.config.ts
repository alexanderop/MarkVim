import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  srcDir: 'src/',
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      script: [
        {
          innerHTML: `
            document.documentElement.classList.add('dark');
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
    '@pinia/nuxt',
  ],
  pinia: {
    storesDirs: ['./src/modules/**/store.ts', './src/stores/**'],
  },
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
      'stores',
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
