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
      'modules/documents/store.ts',
      'modules/editor/composables',
      'modules/markdown-preview/composables',
      'modules/shortcuts/composables',
      'modules/share/composables',
      'modules/layout/composables',
      'shared/composables',
      'shared/utils',
      'stores',
    ],
    presets: [
      {
        from: 'vue',
        imports: ['ref', 'computed', 'reactive', 'watch', 'onMounted', 'onUnmounted', 'nextTick'],
      },
      {
        from: '@vueuse/core',
        imports: ['useLocalStorage', 'useMediaQuery', 'watchDebounced'],
      },
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
  vite: {
    optimizeDeps: {
      include: ['vue', 'vue-router'],
      exclude: [],
    },
  },
  ssr: {
    noExternal: ['vue', 'vue-router', '@vueuse/core', '@vueuse/nuxt', '@pinia/nuxt', 'pinia', 'reka-ui'],
  },
  alias: {
    vue: 'vue/dist/vue.esm-bundler.js',
  },
  nitro: {
    experimental: {
      wasm: true,
    },
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
  },
})
