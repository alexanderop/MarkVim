// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    'reka-ui/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt'
  ],
  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700]
    },
    display: 'swap'
  }
})