<script setup lang="ts">
interface Props {
  isVisible: boolean
}

interface Emits {
  (e: 'toggle'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <button
    class="p-2 rounded-md transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
    :title="isVisible ? 'Hide sidebar' : 'Show sidebar'"
    @click="$emit('toggle')"
  >
    <Icon
      :name="isVisible ? 'heroicons:sidebar-left' : 'heroicons:sidebar-right'"
      class="w-5 h-5 text-gray-300"
    />
  </button>
</template>
