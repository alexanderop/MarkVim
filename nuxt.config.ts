import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    'reka-ui/nuxt',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
  ],
  eslint: {
    checker: true,
    config: {
      standalone: false,
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
    includeAssets: ['icon.svg'],
    manifest: {
      name: 'MarkVim',
      short_name: 'MarkVim',
      description: 'A powerful markdown editor with Vim keybindings',
      theme_color: '#000000',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
        },
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'maskable',
        },
      ],
    },
  },
})
