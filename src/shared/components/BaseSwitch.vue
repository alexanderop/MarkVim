<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'

const props = defineProps<{
  label?: string
  description?: string
  id?: string
}>()

const model = defineModel<boolean>()

const switchId = props.id || useId()
</script>

<template>
  <div
    v-if="props.label"
    class="p-3 border border-border rounded-md bg-surface-primary flex items-start justify-between gap-4"
  >
    <label :for="switchId" class="flex-1 cursor-pointer min-w-0">
      <div class="text-sm text-text-primary font-medium">
        {{ props.label }}
      </div>
      <p v-if="props.description" class="text-xs text-text-secondary mt-1">
        {{ props.description }}
      </p>
    </label>

    <div class="flex-shrink-0 pt-0.5">
      <SwitchRoot
        :id="switchId"
        v-model="model"
        class="rounded-full inline-flex h-5 w-9 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface-primary"
        :class="[model ? 'bg-accent' : 'bg-surface-hover']"
      >
        <SwitchThumb
          class="rounded-full bg-background h-3 w-3 inline-block transform transition-transform"
          :class="[model ? 'translate-x-5' : 'translate-x-1']"
        />
      </SwitchRoot>
    </div>
  </div>

  <SwitchRoot
    v-else
    :id="switchId"
    v-model="model"
    class="rounded-full inline-flex h-5 w-9 transition-colors items-center relative focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface-primary"
    :class="[model ? 'bg-accent' : 'bg-surface-hover']"
  >
    <SwitchThumb
      class="rounded-full bg-background h-3 w-3 inline-block transform transition-transform"
      :class="[model ? 'translate-x-5' : 'translate-x-1']"
    />
  </SwitchRoot>
</template>
