<script setup lang="ts">
const { hasSeenWelcome, markWelcomeAsSeen } = useWelcome()

function handleWelcomeEnter() {
  markWelcomeAsSeen()
}
</script>

<template>
  <BaseLayout>
    <Transition name="fade" mode="out-in">
      <Welcome v-if="!hasSeenWelcome" key="welcome" @enter="handleWelcomeEnter" />
      <AppShell v-else key="app" />
    </Transition>
  </BaseLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
