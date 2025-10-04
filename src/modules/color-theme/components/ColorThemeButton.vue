<script setup lang="ts">
import type { ColorDefinition } from '../internal/color-definitions'
import { UButton } from '#components'

const { colorDef, colorString } = defineProps<{
  colorDef: ColorDefinition
  colorString: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <UButton
    variant="ghost"
    class="flex items-center justify-between p-4 bg-surface-primary border border-border rounded-md hover:bg-surface-secondary transition-colors cursor-pointer group h-auto"
    :data-testid="`color-button-${colorDef.key}`"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-3">
      <div class="text-left">
        <div class="font-medium text-sm text-text-primary">
          {{ colorDef.label }}
        </div>
        <div class="text-xs text-text-secondary">
          {{ colorDef.description }}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 rounded border border-border"
          :style="{ backgroundColor: colorString }"
        />
        <code class="text-xs text-text-secondary font-mono">
          {{ colorString }}
        </code>
      </div>
      <span class="text-text-secondary group-hover:text-text-primary transition-colors">→</span>
    </div>
  </UButton>
</template>
