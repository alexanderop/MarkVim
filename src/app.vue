<script setup lang="ts">
import { UApp } from '#components'
import AppShell from './app/AppShell.vue'
import BaseLayout from './shared/components/BaseLayout.vue'
</script>

<template>
  <UApp>
    <BaseLayout>
      <AppShell />
    </BaseLayout>
  </UApp>
</template>
