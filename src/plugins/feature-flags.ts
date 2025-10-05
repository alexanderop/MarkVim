import { defineNuxtPlugin } from '#app'
import { vFeature } from '~/shared/api/feature-flags'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('feature', vFeature)
})
