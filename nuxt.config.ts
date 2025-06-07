// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: [
    // Add your global CSS files here
    '~/assets/css/main.css',
    // You can also add CSS frameworks or libraries
    // '~/assets/css/tailwind.css',
    // You can reference node_modules directly
    // 'normalize.css'
  ],
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    'nuxt-codemirror',
    'reka-ui/nuxt'
  ]
})