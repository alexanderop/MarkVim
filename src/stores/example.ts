import { defineStore } from 'pinia'

export const useExampleStore = defineStore('example', () => {
  const count = ref(0)
  const name = ref('Pinia Store')

  const doubleCount = computed(() => count.value * 2)

  const increment = () => {
    count.value++
  }

  const updateName = (newName: string) => {
    name.value = newName
  }

  return {
    count,
    name,
    doubleCount,
    increment,
    updateName,
  }
}) 