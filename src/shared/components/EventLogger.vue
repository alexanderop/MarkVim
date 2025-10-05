<script setup lang="ts">
/* eslint-disable no-console */
import { onAnyAppEvent } from '@/shared/utils/eventBus'

// Log all events in development
if (import.meta.env.DEV) {
  onAnyAppEvent((key, payload) => {
    console.group(`🔔 [EVENT] ${key}`)
    console.log('Payload:', payload)
    console.log('Time:', new Date().toLocaleTimeString())
    console.groupEnd()
  })
}
</script>

<template>
  <div />
</template>
