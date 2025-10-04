<script setup lang="ts">
import { USwitch } from '#components'

const { label, description, id } = defineProps<{
  label?: string
  description?: string
  id?: string
}>()

const model = defineModel<boolean>()
</script>

<template>
  <USwitch
    :id="id"
    v-model="model"
    :label="label"
    :description="description"
    color="primary"
    size="sm"
  />
</template>
