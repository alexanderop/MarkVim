<script setup lang="ts">
const { hasSeenWelcome, markWelcomeAsSeen } = useWelcome()

function handleWelcomeEnter() {
  markWelcomeAsSeen()
}
</script>

<template>
  <Welcome v-if="!hasSeenWelcome" @enter="handleWelcomeEnter" />
  <AppShell v-else />
</template>
