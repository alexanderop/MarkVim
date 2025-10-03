import { defineNuxtPlugin } from '#app'
import { vFeature } from '~/modules/feature-flags/api'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('feature', vFeature)
})
