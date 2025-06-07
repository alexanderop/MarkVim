<script setup lang="ts">
export interface Command {
  id: string
  label: string
  description?: string
  shortcut?: string
  action: () => void
  group?: string
  icon?: string
}

const props = withDefaults(defineProps<{
  open?: boolean
  position?: { x: number; y: number }
  viewMode?: 'split' | 'editor' | 'preview'
  markdown?: string
}>(), {
  open: false,
  position: () => ({ x: 0, y: 0 }),
  viewMode: 'split',
  markdown: ''
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'command-selected': [command: Command]
  'change-view-mode': [mode: 'split' | 'editor' | 'preview']
  'save-document': []
  'insert-text': [text: string]
  'toggle-vim-mode': []
  'toggle-line-numbers': []
  'toggle-settings': []
}>()

const searchTerm = ref('')
const selectedIndex = ref(0)
const scrollContainer = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()

// Get shortcuts from the useShortcuts composable
const { shortcutsByCategory, formatKeys, toggleSettings } = useShortcuts()

// Define app-specific commands with shortcuts and icons
const appCommands: Command[] = [
  // File Commands
  {
    id: 'save',
    label: 'Save Document',
    description: 'Save the current markdown document',
    shortcut: '⌘S',
    icon: '💾',
    action: () => emit('save-document'),
    group: 'File'
  },
  {
    id: 'download',
    label: 'Download as Markdown',
    description: 'Download the document as .md file',
    icon: '⬇️',
    action: () => {
      const blob = new Blob([props.markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `markvim-${new Date().toISOString().split('T')[0]}.md`
      a.click()
      URL.revokeObjectURL(url)
    },
    group: 'File'
  },
  {
    id: 'new-document',
    label: 'New Document',
    description: 'Create a new markdown document',
    shortcut: '⌘N',
    icon: '📄',
    action: () => {
      // This would clear the current document
      emit('insert-text', '# New Document\n\nStart writing here...\n')
    },
    group: 'File'
  },

  // View Commands
  {
    id: 'view-editor',
    label: 'Editor Only',
    description: 'Show only the markdown editor',
    shortcut: '1',
    icon: '📝',
    action: () => emit('change-view-mode', 'editor'),
    group: 'View'
  },
  {
    id: 'view-split',
    label: 'Split View',
    description: 'Show editor and preview side-by-side',
    shortcut: '2',
    icon: '⚡',
    action: () => emit('change-view-mode', 'split'),
    group: 'View'
  },
  {
    id: 'view-preview',
    label: 'Preview Only',
    description: 'Show only the markdown preview',
    shortcut: '3',
    icon: '👀',
    action: () => emit('change-view-mode', 'preview'),
    group: 'View'
  },
  {
    id: 'toggle-vim',
    label: 'Toggle Vim Mode',
    description: 'Enable or disable Vim modal editing',
    shortcut: '⌘⇧V',
    icon: '⚡',
    action: () => emit('toggle-vim-mode'),
    group: 'View'
  },
  {
    id: 'toggle-line-numbers',
    label: 'Toggle Line Numbers',
    description: 'Show or hide line numbers in editor',
    icon: '🔢',
    action: () => emit('toggle-line-numbers'),
    group: 'View'
  },

  // Insert Commands
  {
    id: 'insert-heading-1',
    label: 'Insert H1 Heading',
    description: 'Insert level 1 heading',
    icon: '📋',
    action: () => emit('insert-text', '\n# Heading 1\n'),
    group: 'Insert'
  },
  {
    id: 'insert-heading-2',
    label: 'Insert H2 Heading',
    description: 'Insert level 2 heading',
    icon: '📋',
    action: () => emit('insert-text', '\n## Heading 2\n'),
    group: 'Insert'
  },
  {
    id: 'insert-heading-3',
    label: 'Insert H3 Heading',
    description: 'Insert level 3 heading',
    icon: '📋',
    action: () => emit('insert-text', '\n### Heading 3\n'),
    group: 'Insert'
  },
  {
    id: 'insert-code-block',
    label: 'Insert Code Block',
    description: 'Insert markdown code block',
    shortcut: '⌘⇧C',
    icon: '💻',
    action: () => emit('insert-text', '\n```javascript\n// Your code here\n```\n'),
    group: 'Insert'
  },
  {
    id: 'insert-table',
    label: 'Insert Table',
    description: 'Insert markdown table',
    icon: '📊',
    action: () => {
      const table = '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Row 1    | Data     | Data     |\n| Row 2    | Data     | Data     |\n'
      emit('insert-text', table)
    },
    group: 'Insert'
  },
  {
    id: 'insert-link',
    label: 'Insert Link',
    description: 'Insert markdown link',
    shortcut: '⌘L',
    icon: '🔗',
    action: () => emit('insert-text', '[Link text](https://example.com)'),
    group: 'Insert'
  },
  {
    id: 'insert-image',
    label: 'Insert Image',
    description: 'Insert markdown image',
    icon: '🖼️',
    action: () => emit('insert-text', '![Alt text](image-url.jpg)'),
    group: 'Insert'
  },
  {
    id: 'insert-date',
    label: 'Insert Current Date',
    description: 'Insert current date at cursor position',
    icon: '📅',
    action: () => {
      const date = new Date().toLocaleDateString()
      emit('insert-text', date)
    },
    group: 'Insert'
  },
  {
    id: 'insert-datetime',
    label: 'Insert Date & Time',
    description: 'Insert current date and time',
    icon: '🕐',
    action: () => {
      const datetime = new Date().toLocaleString()
      emit('insert-text', datetime)
    },
    group: 'Insert'
  },

  // Format Commands
  {
    id: 'format-bold',
    label: 'Bold Text',
    description: 'Make selected text bold',
    shortcut: '⌘B',
    icon: '**',
    action: () => emit('insert-text', '**bold text**'),
    group: 'Format'
  },
  {
    id: 'format-italic',
    label: 'Italic Text',
    description: 'Make selected text italic',
    shortcut: '⌘I',
    icon: '*',
    action: () => emit('insert-text', '*italic text*'),
    group: 'Format'
  },
  {
    id: 'format-code',
    label: 'Inline Code',
    description: 'Format as inline code',
    icon: '`',
    action: () => emit('insert-text', '`code`'),
    group: 'Format'
  },
  {
    id: 'format-quote',
    label: 'Block Quote',
    description: 'Insert block quote',
    icon: '💬',
    action: () => emit('insert-text', '\n> Quote text\n'),
    group: 'Format'
  },
  {
    id: 'format-list',
    label: 'Bullet List',
    description: 'Insert bullet list',
    icon: '•',
    action: () => emit('insert-text', '\n- List item 1\n- List item 2\n- List item 3\n'),
    group: 'Format'
  },
  {
    id: 'format-numbered-list',
    label: 'Numbered List',
    description: 'Insert numbered list',
    icon: '1.',
    action: () => emit('insert-text', '\n1. First item\n2. Second item\n3. Third item\n'),
    group: 'Format'
  }
]

// Convert shortcuts from useShortcuts to Command format
const shortcutCommands = computed((): Command[] => {
  const commands: Command[] = []
  
  shortcutsByCategory.value.forEach(category => {
    category.shortcuts.forEach(shortcut => {
      // Skip shortcuts that are already covered by app commands
      const isDuplicate = appCommands.some(cmd => 
        cmd.shortcut === shortcut.keys || 
        cmd.shortcut === formatKeys(shortcut.keys) ||
        cmd.id === shortcut.keys.replace(/\s+/g, '-')
      )
      
      if (!isDuplicate) {
        // Map category names to icons
        const categoryIcons: Record<string, string> = {
          'Navigation': '🧭',
          'View': '👁️',
          'File': '📁',
          'General': '⚙️',
          'Help': '❓'
        }
        
        commands.push({
          id: `shortcut-${shortcut.keys.replace(/\s+/g, '-')}`,
          label: shortcut.description,
          description: `Keyboard shortcut: ${formatKeys(shortcut.keys)}`,
          shortcut: formatKeys(shortcut.keys),
          icon: categoryIcons[shortcut.category || 'General'] || '⌨️',
          action: shortcut.action,
          group: shortcut.category || 'General'
        })
      }
    })
  })
  
  return commands
})

// Combine app commands with shortcut commands
const commands = computed(() => {
  return [...appCommands, ...shortcutCommands.value]
})

// Filter commands based on search term
const filteredCommands = computed(() => {
  if (!searchTerm.value) return commands.value
  
  const term = searchTerm.value.toLowerCase()
  return commands.value.filter(command => 
    command.label.toLowerCase().includes(term) ||
    (command.description && command.description.toLowerCase().includes(term)) ||
    (command.group && command.group.toLowerCase().includes(term)) ||
    (command.shortcut && command.shortcut.toLowerCase().includes(term))
  )
})

// Group filtered commands
const groupedCommands = computed(() => {
  const groups = filteredCommands.value.reduce((acc, command) => {
    const group = command.group || 'Other'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(command)
    return acc
  }, {} as Record<string, Command[]>)
  
  // Define group order
  const groupOrder = ['File', 'View', 'Insert', 'Format', 'Navigation', 'Help', 'General', 'Settings', 'Other']
  
  return groupOrder
    .filter(groupName => groups[groupName]?.length > 0)
    .map(groupName => ({
      name: groupName,
      commands: groups[groupName]
    }))
})

// Handle command selection
function selectCommand(command: Command) {
  emit('command-selected', command)
  emit('update:open', false)
  command.action()
  selectedIndex.value = 0
  searchTerm.value = ''
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  const totalCommands = filteredCommands.value.length
  
  switch (event.key) {
    case 'Escape':
      emit('update:open', false)
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
    if (!scrollContainer.value) return
    
    const selectedElement = scrollContainer.value.querySelector(`[data-command-index="${selectedIndex.value}"]`) as HTMLElement
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
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
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      searchTerm.value = ''
      selectedIndex.value = 0
      // Focus the input when opening
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
  // Add global keydown listener when component is mounted
  document.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

function handleGlobalKeydown(event: KeyboardEvent) {
  // Only handle keyboard navigation when command palette is open
  if (!props.open) return
  
  // Don't handle if focus is on input and user is typing normally
  if (event.target === inputRef.value && !['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
    return
  }
  
  handleKeydown(event)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent 
        class="fixed left-1/2 top-1/3 z-50 w-[500px] -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden"
      >
        <!-- Search Input -->
        <div class="px-4 py-3 border-b border-zinc-700">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Type a command or search..."
            class="w-full bg-transparent text-zinc-100 placeholder-zinc-400 text-base outline-none"
            autofocus
            ref="inputRef"
          />
        </div>

        <!-- Commands List -->
        <div class="max-h-80 overflow-y-auto" ref="scrollContainer">
          <template v-if="filteredCommands.length === 0">
            <div class="px-4 py-8 text-center text-zinc-500 text-sm">
              No commands found
            </div>
          </template>
          
          <template v-else>
            <div v-for="group in groupedCommands" :key="group.name" class="py-2">
              <!-- Group Label -->
              <div class="px-4 py-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {{ group.name }}
              </div>
              
              <!-- Commands in Group -->
                              <div
                  v-for="command in group.commands"
                  :key="command.id"
                  :class="[
                    'px-4 py-3 flex items-center justify-between cursor-pointer transition-colors',
                    isSelected(command) 
                      ? 'bg-zinc-700/50' 
                      : 'hover:bg-zinc-800/50'
                  ]"
                  :data-command-index="getCommandIndex(command)"
                  @click="selectCommand(command)"
                >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <!-- Icon -->
                  <span 
                    v-if="command.icon" 
                    class="text-zinc-300 flex-shrink-0 w-5 text-center"
                  >
                    {{ command.icon }}
                  </span>
                  
                  <!-- Content -->
                  <div class="flex flex-col min-w-0 flex-1">
                    <div class="text-zinc-100 font-medium text-sm">
                      {{ command.label }}
                    </div>
                    <div 
                      v-if="command.description" 
                      class="text-zinc-400 text-xs truncate"
                    >
                      {{ command.description }}
                    </div>
                  </div>
                </div>
                
                <!-- Keyboard Shortcut -->
                <div 
                  v-if="command.shortcut" 
                  class="text-zinc-400 text-xs font-mono bg-zinc-800 px-2 py-1 rounded border border-zinc-600 flex-shrink-0"
                >
                  {{ command.shortcut }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer hint -->
        <div class="px-4 py-2 border-t border-zinc-700 text-xs text-zinc-500 flex justify-between">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>esc to close</span>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template> 