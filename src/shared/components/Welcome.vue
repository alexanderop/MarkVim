<script setup lang="ts">
const emit = defineEmits<{
  enter: []
}>()

function handleStartWriting() {
  emit('enter')
}
</script>

<template>
  <div class="flex-1 flex items-center justify-center p-6" data-testid="welcome-screen">
    <div class="max-w-4xl mx-auto text-center">
      <!-- Main Title -->
      <div class="mb-8">
        <h1 class="text-6xl font-bold text-foreground mb-4" data-testid="welcome-title">
          MarkVim
        </h1>
        <p class="text-xl text-muted-foreground font-medium" data-testid="welcome-tagline">
          Markdown Editing at the Speed of Thought
        </p>
      </div>

      <!-- Feature Cards -->
      <div class="grid md:grid-cols-3 gap-8 mb-12" data-testid="feature-cards">
        <!-- Vim Modal Editing -->
        <div class="bg-card border border-border rounded-lg p-6 hover:bg-accent/5 transition-colors" data-testid="feature-card-vim">
          <div class="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Icon name="lucide:keyboard" class="w-6 h-6 text-accent" />
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-2" data-testid="feature-title-vim">
            Vim Modal Editing
          </h3>
          <p class="text-muted-foreground text-sm" data-testid="feature-description-vim">
            Full Vim keybindings for peak efficiency. Navigate and edit at lightning speed with familiar modal editing.
          </p>
        </div>

        <!-- Live Preview -->
        <div class="bg-card border border-border rounded-lg p-6 hover:bg-accent/5 transition-colors" data-testid="feature-card-preview">
          <div class="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Icon name="lucide:eye" class="w-6 h-6 text-accent" />
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-2" data-testid="feature-title-preview">
            Live Preview
          </h3>
          <p class="text-muted-foreground text-sm" data-testid="feature-description-preview">
            Real-time split-screen rendering. See your markdown come to life as you type with synchronized scrolling.
          </p>
        </div>

        <!-- Customizable -->
        <div class="bg-card border border-border rounded-lg p-6 hover:bg-accent/5 transition-colors" data-testid="feature-card-customizable">
          <div class="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Icon name="lucide:palette" class="w-6 h-6 text-accent" />
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-2" data-testid="feature-title-customizable">
            Fully Customizable
          </h3>
          <p class="text-muted-foreground text-sm" data-testid="feature-description-customizable">
            Personalize your experience. Change colors, fonts, and configure shortcuts to match your workflow.
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <button
        type="button"
        class="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8 py-3 rounded-lg text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        data-testid="start-writing-button"
        @click="handleStartWriting"
      >
        Start Writing
      </button>
    </div>
  </div>
</template>
