<script setup lang="ts">
import type { Document as DocType } from '~/modules/documents/api'
import type { ViewMode } from '~/modules/layout/api'
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
} from 'reka-ui'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getDocumentTitle } from '~/modules/documents/api'
import { type Command, useCommandHistory, useShortcuts } from '~/modules/shortcuts/api'

const props = withDefaults(defineProps<{
  position?: { x: number, y: number }
  viewMode?: ViewMode
  markdown?: string
  documents?: DocType[]
}>(), {
  position: () => ({ x: 0, y: 0 }),
  viewMode: 'split',
  markdown: '',
  documents: () => [],
})

const emit = defineEmits<{
  commandSelected: [command: Command]
  selectDocument: [id: string]
}>()

const open = defineModel<boolean>('open')

const searchTerm = ref('')
const selectedIndex = ref(0)
const scrollContainer = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()

// Get all commands from the useShortcuts composable
const { allCommands } = useShortcuts()
// getDocumentTitle is imported from api above
const { trackCommandUsage, sortCommandsByHistory } = useCommandHistory()

// Create a computed property to transform documents into commands
const documentCommands = computed((): Command[] => {
  return (props.documents || []).map(doc => ({
    id: `doc-${doc.id}`,
    label: getDocumentTitle(doc.content),
    description: `Last updated: ${new Date(doc.updatedAt).toLocaleDateString()}`,
    action: () => emit('selectDocument', doc.id),
    group: 'Files',
    icon: 'lucide:file-text',
  }))
})

// Combine app commands with document commands
const combinedCommands = computed(() => {
  return [...documentCommands.value, ...allCommands.value]
})

// Filter commands based on search term
const filteredCommands = computed(() => {
  if (!searchTerm.value) {
    // When no search term, show commands sorted by usage history
    return sortCommandsByHistory(combinedCommands.value)
  }

  const term = searchTerm.value.toLowerCase()
  const filtered = combinedCommands.value.filter(command =>
    command.label.toLowerCase().includes(term)
    || (command.description && command.description.toLowerCase().includes(term))
    || (command.group && command.group.toLowerCase().includes(term))
    || (command.shortcut && command.shortcut.toLowerCase().includes(term)),
  )

  // Also sort filtered results by history for better UX
  return sortCommandsByHistory(filtered)
})

// Group filtered commands
const groupedCommands = computed(() => {
  const commands = filteredCommands.value
  const { commandHistory } = useCommandHistory()

  // If no search term and we have history, create a "Recently Used" section
  if (!searchTerm.value && commandHistory.value.length > 0) {
    const recentCommands: Command[] = []
    const otherCommands: Command[] = []
    const recentIds = new Set(commandHistory.value.slice(0, 8)) // Show top 8 recent

    commands.forEach((command) => {
      if (recentIds.has(command.id)) {
        recentCommands.push(command)
      }
      else {
        otherCommands.push(command)
      }
    })

    const groups: { name: string, commands: Command[] }[] = []

    // Add recently used section if we have recent commands
    if (recentCommands.length > 0) {
      groups.push({ name: 'Recently Used', commands: recentCommands })
    }

    // Group other commands normally
    const otherGroups = otherCommands.reduce((acc, command) => {
      const group = command.group || 'Other'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(command)
      return acc
    // eslint-disable-next-line ts/consistent-type-assertions
    }, {} as Record<string, Command[]>)

    const groupOrder = ['Files', 'File', 'View', 'Insert', 'Format', 'Navigation', 'Settings', 'Help', 'General', 'Other']

    groupOrder
      .filter(groupName => otherGroups[groupName]?.length > 0)
      .forEach((groupName) => {
        groups.push({
          name: groupName,
          commands: otherGroups[groupName],
        })
      })

    return groups
  }

  // Regular grouping for search results or when no history
  const groups = commands.reduce((acc, command) => {
    const group = command.group || 'Other'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(command)
    return acc
  // eslint-disable-next-line ts/consistent-type-assertions
  }, {} as Record<string, Command[]>)

  // Define group order - prioritize Files group
  const groupOrder = ['Files', 'File', 'View', 'Insert', 'Format', 'Navigation', 'Settings', 'Help', 'General', 'Other']

  return groupOrder
    .filter(groupName => groups[groupName]?.length > 0)
    .map(groupName => ({
      name: groupName,
      commands: groups[groupName],
    }))
})

// Handle command selection
function selectCommand(command: Command) {
  // Track command usage for history
  trackCommandUsage(command.id)

  emit('commandSelected', command)
  open.value = false
  command.action()
  selectedIndex.value = 0
  searchTerm.value = ''
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  const totalCommands = filteredCommands.value.length

  switch (event.key) {
    case 'Escape':
      open.value = false
      break
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % totalCommands
      scrollToSelected()
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = selectedIndex.value === 0 ? totalCommands - 1 : selectedIndex.value - 1
      scrollToSelected()
      break
    case 'Enter':
      event.preventDefault()
      if (filteredCommands.value[selectedIndex.value]) {
        selectCommand(filteredCommands.value[selectedIndex.value])
      }
      break
  }
}

// Scroll selected item into view
function scrollToSelected() {
  nextTick(() => {
    if (!scrollContainer.value)
      return

    const selectedElement = scrollContainer.value.querySelector(`[data-command-index="${selectedIndex.value}"]`)
    if (selectedElement instanceof HTMLElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  })
}

// Get command at current index for styling
function isSelected(command: Command): boolean {
  return filteredCommands.value[selectedIndex.value]?.id === command.id
}

// Get index of command in filtered list
function getCommandIndex(command: Command): number {
  return filteredCommands.value.findIndex(cmd => cmd.id === command.id)
}

// Watch for open state changes to reset state
watch(() => open.value, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      searchTerm.value = ''
      selectedIndex.value = 0
      inputRef.value?.focus()
    })
  }
})

// Reset selection when search changes
watch(searchTerm, () => {
  selectedIndex.value = 0
})

// Auto-focus management
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

function handleGlobalKeydown(event: KeyboardEvent) {
  if (!open.value)
    return

  if (event.target === inputRef.value && !['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
    return
  }

  handleKeydown(event)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="(newOpen) => open = newOpen">
    <DialogPortal>
      <DialogOverlay class="bg-black/70 inset-0 fixed z-50" />
      <DialogContent
        data-testid="command-palette"
        class="border border-subtle rounded-lg bg-surface-primary w-[550px] shadow-2xl shadow-black/40 ring-1 ring-white/10 left-1/2 top-1/3 fixed z-50 overflow-hidden -translate-x-1/2 -translate-y-1/2"
      >
        <!-- Search Input -->
        <div class="px-4 py-3 border-b border-gray-700">
          <input
            id="command-search"
            ref="inputRef"
            v-model="searchTerm"
            type="text"
            placeholder="Type a command or search..."
            aria-label="Search commands"
            data-testid="command-palette-search"
            class="text-base text-gray-100 outline-none bg-transparent w-full placeholder-gray-400"
          >
        </div>

        <!-- Commands List -->
        <div ref="scrollContainer" class="max-h-80 overflow-y-auto">
          <template v-if="filteredCommands.length === 0">
            <div class="text-sm text-gray-500 px-4 py-8 text-center">
              No commands found
            </div>
          </template>

          <template v-else>
            <div v-for="group in groupedCommands" :key="group.name" class="py-2">
              <!-- Group Label -->
              <div class="text-xs text-gray-400 tracking-wider font-medium px-4 py-2 uppercase">
                {{ group.name }}
              </div>

              <!-- Commands in Group -->
              <button
                v-for="command in group.commands"
                :key="command.id"
                type="button"
                class="px-4 py-3 flex cursor-pointer transition-colors items-center justify-between w-full text-left focus:outline-none focus:ring-0" :class="[
                  isSelected(command)
                    ? 'bg-gray-700/50'
                    : 'hover:bg-gray-800/50',
                ]"
                :aria-label="`Execute ${command.label} command`"
                :data-command-index="getCommandIndex(command)"
                @click="selectCommand(command)"
              >
                <div class="flex flex-1 gap-3 min-w-0 items-center">
                  <!-- Icon -->
                  <div
                    v-if="command.icon"
                    class="text-gray-300 text-center flex-shrink-0 w-5 h-5 flex items-center justify-center"
                  >
                    <Icon :name="command.icon" class="h-4 w-4" />
                  </div>

                  <!-- Content -->
                  <div class="flex flex-1 flex-col min-w-0">
                    <div class="text-sm text-gray-100 font-medium">
                      {{ command.label }}
                    </div>
                    <div
                      v-if="command.description"
                      class="text-xs text-gray-400 truncate"
                    >
                      {{ command.description }}
                    </div>
                  </div>
                </div>

                <!-- Keyboard Shortcut -->
                <div
                  v-if="command.shortcut"
                  class="text-xs text-gray-400 font-mono px-2 py-1 border border-gray-600 rounded bg-gray-800 flex-shrink-0"
                >
                  {{ command.shortcut }}
                </div>
              </button>
            </div>
          </template>
        </div>

        <!-- Footer hint -->
        <div class="text-xs text-gray-500 px-4 py-2 border-t border-gray-700 flex justify-between">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>esc to close</span>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
