import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  // The store initialization will happen when AppShell mounts
  // and calls useDocumentsStore() internally

  // Optional: Add any additional persistence logic here
  // For example, periodic auto-save, backup to cloud storage, etc.
})
