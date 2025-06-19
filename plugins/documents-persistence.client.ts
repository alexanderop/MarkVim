export default defineNuxtPlugin(() => {
  // This plugin runs only on the client side after hydration
  // Initialize document store persistence after hydration
  useDocumentsStore()

  // The store will already be initialized with localStorage data at this point
  // due to the .client.vue components being hydrated

  // Optional: Add any additional persistence logic here
  // For example, periodic auto-save, backup to cloud storage, etc.
})
