<script setup lang="ts">
interface Props {
  icon: string
  text: string
  title?: string
  active?: boolean
  variant?: 'default' | 'toggle'
}

interface Emits {
  (e: 'click'): void
}

withDefaults(defineProps<Props>(), {
  active: false,
  variant: 'default',
})

defineEmits<Emits>()
</script>

<template>
  <button
    v-if="variant === 'toggle'"
    class="text-xs font-medium px-2 py-1 rounded-md flex transition-all duration-200 items-center justify-center md:text-sm md:px-3 md:py-1.5"
    :class="[
      active
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
    ]"
    :title="title"
    @click="$emit('click')"
  >
    <Icon :name="icon" class="h-3 w-3 md:mr-1.5 md:h-4 md:w-4" />
    <span class="hidden md:inline">{{ text }}</span>
  </button>

  <button
    v-else
    class="bg-background ring-offset-background border-input focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground text-sm font-medium px-4 py-2 border rounded-md inline-flex h-10 transition-colors items-center justify-center focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-offset-2"
    :title="title"
    @click="$emit('click')"
  >
    <Icon :name="icon" class="mr-2 h-4 w-4" />
    {{ text }}
  </button>
</template>
