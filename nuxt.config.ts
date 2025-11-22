import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-15',
  devtools: { enabled: true },
  srcDir: 'src/',
  // TypeScript path aliases - Make module facades the ergonomic default
  alias: {
    '@modules/color-theme': fileURLToPath(new URL('./src/modules/color-theme/api', import.meta.url)),
    '@modules/documents': fileURLToPath(new URL('./src/modules/documents/api', import.meta.url)),
    '@modules/editor': fileURLToPath(new URL('./src/modules/editor/api', import.meta.url)),
    '@modules/layout': fileURLToPath(new URL('./src/modules/layout/api', import.meta.url)),
    '@modules/markdown-preview': fileURLToPath(new URL('./src/modules/markdown-preview/api', import.meta.url)),
    '@modules/share': fileURLToPath(new URL('./src/modules/share/api', import.meta.url)),
    '@modules/shortcuts': fileURLToPath(new URL('./src/modules/shortcuts/api', import.meta.url)),
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
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
    '@nuxt/ui',
    'reka-ui/nuxt',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/test-utils/module',
  ],
  pinia: {
    storesDirs: ['./src/modules/**/store.ts', './src/shared/**/store.ts', './src/stores/**'],
  },
  // Disable auto-imports completely
  components: false,
  imports: {
    autoImport: false,
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
  typescript: {
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
  },
})
