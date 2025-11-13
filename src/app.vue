<script setup lang="ts">
import { useHead } from '#app'
import { UApp } from '#components'
import AppShell from './app/AppShell.vue'
import BaseLayout from './shared/components/BaseLayout.vue'

useHead({
  title: 'MarkVim - Markdown Editor with Vim Mode',
})
</script>

<template>
  <UApp>
    <BaseLayout>
      <AppShell />
    </BaseLayout>
  </UApp>
</template>
