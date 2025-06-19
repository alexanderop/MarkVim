export default defineNuxtPlugin(() => {
  // Initialize color theme store on client side to ensure CSS variables are set
  console.log('[Color Theme Plugin] Initializing color theme store')
  
  // This will trigger the watchEffect in the store to set CSS variables
  const _colorThemeStore = useColorThemeStore()
  
  console.log('[Color Theme Plugin] Color theme store initialized - CSS variables should be set')
})