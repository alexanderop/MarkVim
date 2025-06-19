export default defineNuxtPlugin(() => {
  // Initialize color theme store on client side to ensure CSS variables are set
  // This will trigger the watchEffect in the store to set CSS variables
  useColorThemeStore()
})
