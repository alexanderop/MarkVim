<script setup lang="ts">
import { Icon, UButton } from '#components'
import { onMounted, ref } from 'vue'

const emit = defineEmits<{
  enter: []
}>()

const isLoaded = ref(false)
const currentFeatureIndex = ref(0)
const features = [
  'Vim Modal Editing',
  'Live Preview',
  'Mermaid Diagrams',
  'GitHub Alerts',
]

function handleStartWriting(): void {
  emit('enter')
}

function scrollToFeatures(): void {
  const featuresElement = document.getElementById('features-section')
  featuresElement?.scrollIntoView({ behavior: 'smooth' })
}

// Feature rotation interval in milliseconds
const FEATURE_ROTATION_INTERVAL_MS = 3000

onMounted(() => {
  isLoaded.value = true

  // Rotate feature highlights
  setInterval(() => {
    currentFeatureIndex.value = (currentFeatureIndex.value + 1) % features.length
  }, FEATURE_ROTATION_INTERVAL_MS)
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-y-auto"
    data-testid="welcome-screen"
  >
    <!-- Hero Section -->
    <div class="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
      <div class="text-center max-w-5xl mx-auto">
        <!-- Trust Signals -->
        <div class="mb-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div class="flex items-center gap-1">
            <Icon
              name="lucide:shield-check"
              class="w-3 h-3 text-accent"
            />
            <span>Open Source</span>
          </div>
          <div class="flex items-center gap-1">
            <Icon
              name="lucide:zap"
              class="w-3 h-3 text-accent"
            />
            <span>Works Offline</span>
          </div>
          <div class="flex items-center gap-1">
            <Icon
              name="lucide:lock"
              class="w-3 h-3 text-accent"
            />
            <span>Private & Secure</span>
          </div>
        </div>

        <!-- Logo/Icon with Animation -->
        <div
          class="mb-8"
          :class="{ 'animate-fade-in-up': isLoaded }"
        >
          <div class="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-6 bg-gradient-to-br from-accent via-accent to-accent/80 rounded-3xl flex items-center justify-center shadow-2xl shadow-accent/25 transition-transform hover:scale-105 duration-300">
            <Icon
              name="lucide:hash"
              class="w-10 h-10 sm:w-14 sm:h-14 text-accent-foreground"
            />
          </div>
        </div>

        <!-- Main Value Proposition -->
        <div
          class="space-y-6 mb-12"
          :class="{ 'animate-fade-in-up delay-200': isLoaded }"
        >
          <h1
            class="text-5xl sm:text-7xl lg:text-8xl font-bold text-foreground mb-4 tracking-tight leading-none"
            data-testid="welcome-title"
          >
            MarkVim
          </h1>

          <p
            class="text-xl sm:text-2xl lg:text-3xl text-muted-foreground font-medium mb-6 max-w-4xl mx-auto leading-relaxed"
            data-testid="welcome-tagline"
          >
            Write Markdown at the Speed of Thought
          </p>

          <!-- Dynamic Feature Highlight -->
          <div class="bg-accent/5 border border-accent/20 rounded-2xl p-4 max-w-2xl mx-auto">
            <p class="text-accent font-medium text-lg">
              ✨ Now featuring:
              <span class="transition-all duration-500">{{ features[currentFeatureIndex] }}</span>
            </p>
          </div>
        </div>

        <!-- Social Proof Stats -->
        <div
          class="grid grid-cols-3 gap-4 sm:gap-8 mb-12 max-w-2xl mx-auto"
          :class="{ 'animate-fade-in-up delay-300': isLoaded }"
        >
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-foreground">
              3⭐
            </div>
            <div class="text-sm text-muted-foreground">
              GitHub Stars
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-foreground">
              187+
            </div>
            <div class="text-sm text-muted-foreground">
              Commits
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-foreground">
              100%
            </div>
            <div class="text-sm text-muted-foreground">
              Free & Open
            </div>
          </div>
        </div>

        <!-- Social Links -->
        <div
          class="flex items-center justify-center gap-3 sm:gap-4 mb-12"
          :class="{ 'animate-fade-in-up delay-400': isLoaded }"
        >
          <a
            href="https://github.com/alexanderop/MarkVim"
            target="_blank"
            rel="noopener noreferrer"
            class="p-3 sm:p-4 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-full hover:bg-muted/50 hover:scale-110"
            title="MarkVim on GitHub"
            aria-label="MarkVim on GitHub"
          >
            <Icon
              name="lucide:github"
              class="w-5 h-5"
            />
          </a>
          <a
            href="https://linkedin.com/in/alexanderopalic"
            target="_blank"
            rel="noopener noreferrer"
            class="p-3 sm:p-4 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-full hover:bg-muted/50 hover:scale-110"
            title="LinkedIn"
            aria-label="LinkedIn"
          >
            <Icon
              name="lucide:linkedin"
              class="w-5 h-5"
            />
          </a>
          <a
            href="https://x.com/alexanderopalic"
            target="_blank"
            rel="noopener noreferrer"
            class="p-3 sm:p-4 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-full hover:bg-muted/50 hover:scale-110"
            title="X (Twitter)"
            aria-label="X (Twitter)"
          >
            <Icon
              name="lucide:twitter"
              class="w-5 h-5"
            />
          </a>
          <a
            href="https://bsky.app/profile/alexanderopalic"
            target="_blank"
            rel="noopener noreferrer"
            class="p-3 sm:p-4 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-full hover:bg-muted/50 hover:scale-110"
            title="BlueSky"
            aria-label="BlueSky"
          >
            <Icon
              name="lucide:cloud"
              class="w-5 h-5"
            />
          </a>
          <a
            href="mailto:alex@alexop.dev"
            class="p-3 sm:p-4 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-full hover:bg-muted/50 hover:scale-110"
            title="Email"
            aria-label="Email"
          >
            <Icon
              name="lucide:mail"
              class="w-5 h-5"
            />
          </a>
        </div>

        <!-- Primary CTAs -->
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          :class="{ 'animate-fade-in-up delay-500': isLoaded }"
        >
          <UButton
            color="primary"
            variant="solid"
            size="xl"
            icon="lucide:edit-3"
            class="font-semibold px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl shadow-lg min-w-64"
            data-testid="start-writing-button"
            @click="handleStartWriting"
          >
            Start Writing Now
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="xl"
            icon="lucide:arrow-down"
            class="font-medium px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl min-w-64"
            @click="scrollToFeatures"
          >
            Explore Features
          </UButton>
        </div>

        <!-- Quick Benefits -->
        <div
          class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto"
          :class="{ 'animate-fade-in-up delay-600': isLoaded }"
        >
          <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Icon
              name="lucide:download"
              class="w-4 h-4 text-accent"
            />
            <span>No installation required</span>
          </div>
          <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Icon
              name="lucide:wifi-off"
              class="w-4 h-4 text-accent"
            />
            <span>Works completely offline</span>
          </div>
          <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Icon
              name="lucide:heart"
              class="w-4 h-4 text-accent"
            />
            <span>Made by developers, for developers</span>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div
        class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
        :class="{ 'animate-fade-in delay-700': isLoaded }"
      >
        <Icon
          name="lucide:chevron-down"
          class="w-6 h-6 text-muted-foreground"
        />
      </div>
    </div>

    <!-- Features Section -->
    <div
      id="features-section"
      class="py-16 sm:py-24 px-4 sm:px-6"
    >
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16 sm:mb-20">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Why Developers Choose MarkVim
          </h2>
          <p class="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Built by a developer who loves Vim and beautiful markdown. Every feature is designed
            to make your writing experience faster, more enjoyable, and incredibly powerful.
          </p>
        </div>

        <!-- Problem/Solution -->
        <div class="bg-muted/30 border border-border rounded-3xl p-8 sm:p-12 mb-16 sm:mb-20">
          <div class="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h3 class="text-2xl sm:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Icon
                  name="lucide:x-circle"
                  class="w-8 h-8 text-muted-foreground"
                />
                The Problem
              </h3>
              <ul class="space-y-3 text-muted-foreground">
                <li class="flex items-start gap-2">
                  <Icon
                    name="lucide:minus"
                    class="w-4 h-4 mt-1 text-muted-foreground"
                  />
                  <span>Markdown editors are slow and clunky</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon
                    name="lucide:minus"
                    class="w-4 h-4 mt-1 text-muted-foreground"
                  />
                  <span>No proper Vim keybindings support</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon
                    name="lucide:minus"
                    class="w-4 h-4 mt-1 text-muted-foreground"
                  />
                  <span>Limited customization options</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon
                    name="lucide:minus"
                    class="w-4 h-4 mt-1 text-muted-foreground"
                  />
                  <span>Cloud dependency and privacy concerns</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-2xl sm:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Icon
                  name="lucide:check-circle"
                  class="w-8 h-8 text-accent"
                />
                The Solution
              </h3>
              <ul class="space-y-3 text-muted-foreground">
                <li class="flex items-start gap-2">
                  <Icon
                    name="lucide:plus"
                    class="w-4 h-4 mt-1 text-accent"
                  />
                  <span>Lightning-fast editing with instant preview</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon
                    name="lucide:plus"
                    class="w-4 h-4 mt-1 text-accent"
                  />
                  <span>Full Vim modal editing with custom shortcuts</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon
                    name="lucide:plus"
                    class="w-4 h-4 mt-1 text-accent"
                  />
                  <span>Complete color theme customization</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon
                    name="lucide:plus"
                    class="w-4 h-4 mt-1 text-accent"
                  />
                  <span>100% local, private, and secure</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Feature Grid -->
        <div class="grid lg:grid-cols-2 gap-8 sm:gap-12 mb-16 sm:mb-20">
          <!-- Vim Modal Editing -->
          <div class="group bg-muted/20 backdrop-blur-sm border border-border rounded-3xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:border-accent/30">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Icon
                  name="lucide:keyboard"
                  class="w-8 h-8 text-accent"
                />
              </div>
              <div class="flex-1">
                <h3 class="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                  True Vim Modal Editing
                </h3>
                <p class="text-muted-foreground mb-4 leading-relaxed">
                  Not just basic shortcuts—experience complete Vim modal editing with custom keybindings like
                  <code class="bg-muted px-2 py-1 rounded text-sm font-mono">jj</code> for escape,
                  <code class="bg-muted px-2 py-1 rounded text-sm font-mono">:w</code> to save, and all your favorite motions.
                </p>
                <div class="flex flex-wrap gap-2">
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">hjkl navigation</span>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Visual mode</span>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Ex commands</span>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Custom shortcuts</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Preview -->
          <div class="group bg-muted/20 backdrop-blur-sm border border-border rounded-3xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:border-accent/30">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Icon
                  name="lucide:eye"
                  class="w-8 h-8 text-accent"
                />
              </div>
              <div class="flex-1">
                <h3 class="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                  Instant Live Preview
                </h3>
                <p class="text-muted-foreground mb-4 leading-relaxed">
                  See your markdown rendered in real-time with synchronized scrolling. Beautiful typography,
                  syntax highlighting, and responsive design that adapts to your color theme.
                </p>
                <div class="flex flex-wrap gap-2">
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Split view</span>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Sync scroll</span>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Syntax highlighting</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mermaid Diagrams -->
          <div class="group bg-muted/20 backdrop-blur-sm border border-border rounded-3xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:border-accent/30">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Icon
                  name="lucide:git-branch"
                  class="w-8 h-8 text-accent"
                />
              </div>
              <div class="flex-1">
                <h3 class="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                  Mermaid Diagrams
                </h3>
                <p class="text-muted-foreground mb-4 leading-relaxed">
                  Create stunning flowcharts, sequence diagrams, and more with simple text syntax.
                  Perfect for technical documentation and visual communication.
                </p>
                <div class="bg-muted/30 rounded-lg p-3 text-sm font-mono text-muted-foreground mb-4">
                  ```mermaid<br>
                  graph TD<br>
                  &nbsp;&nbsp;A[Start] --> B[Write Code]<br>
                  &nbsp;&nbsp;B --> C[Ship It!]<br>
                  ```
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Flowcharts</span>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Sequence diagrams</span>
                </div>
              </div>
            </div>
          </div>

          <!-- GitHub Alerts -->
          <div class="group bg-muted/20 backdrop-blur-sm border border-border rounded-3xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:border-accent/30">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Icon
                  name="lucide:alert-triangle"
                  class="w-8 h-8 text-accent"
                />
              </div>
              <div class="flex-1">
                <h3 class="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                  GitHub Alerts & Callouts
                </h3>
                <p class="text-muted-foreground mb-4 leading-relaxed">
                  Use GitHub-style alert callouts to highlight important information in your documentation.
                  Professional styling that matches modern documentation standards.
                </p>
                <div class="space-y-2 mb-4">
                  <div class="bg-accent/10 border-l-4 border-accent pl-3 py-1 text-sm rounded-r">
                    <span class="text-accent font-medium">[!NOTE]</span> Important information
                  </div>
                  <div
                    class="border-l-4 pl-3 py-1 text-sm rounded-r"
                    style="background: oklch(from var(--accent) l c 140 / 0.1); border-color: oklch(from var(--accent) l c 140);"
                  >
                    <span
                      class="font-medium"
                      style="color: oklch(from var(--accent) l c 140);"
                    >[!TIP]</span> Helpful suggestion
                  </div>
                  <div
                    class="border-l-4 pl-3 py-1 text-sm rounded-r"
                    style="background: oklch(from var(--accent) l c 80 / 0.1); border-color: oklch(from var(--accent) l c 80);"
                  >
                    <span
                      class="font-medium"
                      style="color: oklch(from var(--accent) l c 80);"
                    >[!WARNING]</span> Critical warning
                  </div>
                  <div
                    class="border-l-4 pl-3 py-1 text-sm rounded-r"
                    style="background: oklch(from var(--accent) l c 280 / 0.1); border-color: oklch(from var(--accent) l c 280);"
                  >
                    <span
                      class="font-medium"
                      style="color: oklch(from var(--accent) l c 280);"
                    >[!IMPORTANT]</span> Key information
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Notes</span>
                  <span
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    style="background: oklch(from var(--accent) l c 140 / 0.1); color: oklch(from var(--accent) l c 140);"
                  >Tips</span>
                  <span
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    style="background: oklch(from var(--accent) l c 80 / 0.1); color: oklch(from var(--accent) l c 80);"
                  >Warnings</span>
                  <span
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    style="background: oklch(from var(--accent) l c 280 / 0.1); color: oklch(from var(--accent) l c 280);"
                  >Important</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Features -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          <!-- Keyboard Shortcuts -->
          <div class="text-center group">
            <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon
                name="lucide:command"
                class="w-8 h-8 text-accent"
              />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">
              Powerful Shortcuts
            </h3>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Comprehensive keyboard shortcuts for every action.
              Press <kbd class="bg-muted px-2 py-1 rounded text-sm font-mono">Ctrl+K</kbd> to see them all.
            </p>
            <div class="flex flex-wrap justify-center gap-1">
              <kbd class="bg-muted px-2 py-1 rounded text-xs font-mono">Ctrl+S</kbd>
              <kbd class="bg-muted px-2 py-1 rounded text-xs font-mono">Ctrl+K</kbd>
              <kbd class="bg-muted px-2 py-1 rounded text-xs font-mono">Ctrl+P</kbd>
            </div>
          </div>

          <!-- Local Storage -->
          <div class="text-center group">
            <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon
                name="lucide:hard-drive"
                class="w-8 h-8 text-accent"
              />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">
              Local & Private
            </h3>
            <p class="text-muted-foreground leading-relaxed">
              Your documents are saved locally in your browser.
              No servers, no accounts, no tracking. Just pure privacy and speed.
            </p>
          </div>

          <!-- Theme Customization -->
          <div class="text-center group sm:col-span-2 lg:col-span-1">
            <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon
                name="lucide:palette"
                class="w-8 h-8 text-accent"
              />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">
              Custom Color Themes
            </h3>
            <p class="text-muted-foreground leading-relaxed">
              Personalize your editor with the advanced OKLCH color picker.
              Create the perfect theme for your eyes and workflow.
            </p>
          </div>
        </div>

        <!-- Testimonial/Creator Note -->
        <div class="bg-accent/5 border border-accent/20 rounded-3xl p-8 sm:p-12 mb-16 sm:mb-20">
          <div class="max-w-4xl mx-auto text-center">
            <blockquote class="text-lg sm:text-xl text-foreground mb-6 italic leading-relaxed">
              "I built MarkVim because I was frustrated with existing markdown editors. As a developer who lives in Vim,
              I wanted something that felt natural and powerful. Every feature in MarkVim solves a real problem I had."
            </blockquote>
            <div class="flex items-center justify-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center">
                <span class="text-accent-foreground font-bold text-lg">A</span>
              </div>
              <div class="text-left">
                <div class="font-semibold text-foreground">
                  Alexander Opalic
                </div>
                <div class="text-sm text-muted-foreground">
                  Creator of MarkVim
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Final CTA -->
        <div class="text-center">
          <h3 class="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Writing?
          </h3>
          <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join developers who've already discovered the joy of writing markdown with Vim power.
          </p>
          <UButton
            color="primary"
            variant="solid"
            size="xl"
            icon="lucide:rocket"
            class="font-semibold px-12 py-5 rounded-2xl text-xl shadow-lg"
            data-testid="start-writing-bottom-button"
            @click="handleStartWriting"
          >
            Start Your Writing Journey
          </UButton>
          <div class="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <span class="flex items-center gap-1">
              <Icon
                name="lucide:download"
                class="w-4 h-4 text-accent"
              />
              No installation required
            </span>
            <span class="flex items-center gap-1">
              <Icon
                name="lucide:wifi-off"
                class="w-4 h-4 text-accent"
              />
              Works offline
            </span>
            <span class="flex items-center gap-1">
              <Icon
                name="lucide:github"
                class="w-4 h-4 text-accent"
              />
              Open source
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in-up 1s ease-out forwards;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-400 {
  animation-delay: 0.4s;
}

.delay-500 {
  animation-delay: 0.5s;
}

.delay-600 {
  animation-delay: 0.6s;
}

.delay-700 {
  animation-delay: 0.7s;
}
</style>
