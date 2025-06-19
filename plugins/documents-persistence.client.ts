export default defineNuxtPlugin(() => {
  // This plugin runs only on the client side after hydration
  console.log('[Documents Persistence Plugin] Initializing client-side persistence')

  // Initialize document store persistence after hydration
  const _store = useDocumentsStore()

  // The store will already be initialized with localStorage data at this point
  // due to the .client.vue components being hydrated
  console.log('[Documents Persistence Plugin] Document store initialized with client data')

  // Optional: Add any additional persistence logic here
  // For example, periodic auto-save, backup to cloud storage, etc.
})
