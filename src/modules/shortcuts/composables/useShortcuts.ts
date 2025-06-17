/**
 * `AND` conditions for refs.
 *
 * @see https://vueuse.org/logicAnd
 */
function logicAnd(...args: MaybeRefOrGetter<any>[]): ComputedRef<boolean> {
  return computed(() => args.every(i => toValue(i)))
}

export interface Command {
  id: string
  label: string
  description?: string
  shortcut?: string
  action: () => void
  group?: string
  icon?: string
}

export interface ShortcutAction {
  keys: string
  description: string
  action: () => void
  category?: string
  disabled?: ComputedRef<boolean> | Ref<boolean>
  allowInEditor?: boolean // Allow shortcut to work even when editor is focused
  icon?: string
  id?: string
}

export interface ShortcutCategory {
  name: string
  shortcuts: ShortcutAction[]
}

export function useShortcuts() {
  // Track active element to prevent shortcuts when typing in inputs
  const activeElement = useActiveElement()
  const notUsingInput = computed(() => {
    const el = activeElement.value
    if (!el)
      return true

    // Check for standard input elements
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      return false
    }

    // Check for contenteditable elements
    if (el.isContentEditable || el.closest('[contenteditable="true"]')) {
      return false
    }

    // Check for CodeMirror editor (has cm-content class or is inside .cm-editor)
    if (el.classList?.contains('cm-content') || el.closest('.cm-editor')) {
      return false
    }

    // Check for any element with role="textbox"
    if (el.getAttribute('role') === 'textbox') {
      return false
    }

    return true
  })

  // Initialize magic keys for global shortcuts
  const keys = useMagicKeys()

  // Use Nuxt's useState for global shortcuts storage
  const registeredShortcuts = useState<Map<string, ShortcutAction>>('shortcuts', () => new Map())

  // App-specific commands that don't need keyboard shortcuts but should appear in command palette
  const appCommands = useState<Map<string, ShortcutAction>>('appCommands', () => new Map())

  // Function to register app commands (for command palette without keyboard shortcuts)
  function registerAppCommand(command: ShortcutAction) {
    appCommands.value.set(command.id || command.keys, command)
  }

  function registerAppCommands(commands: ShortcutAction[]) {
    commands.forEach(registerAppCommand)
  }

  // Register a single shortcut
  function registerShortcut(shortcut: ShortcutAction) {
    const { keys: keyCombo, action, disabled } = shortcut

    // Store the shortcut for help display
    registeredShortcuts.value.set(keyCombo, shortcut)

    // For key combinations, ensure individual keys are accessible
    // This is a workaround for useMagicKeys key order issues
    if (keyCombo.includes('+')) {
      const keyParts = keyCombo.split('+').map(k => k.trim().toLowerCase())
      keyParts.forEach((key) => {
        // Access the key to ensure it's created in the useMagicKeys proxy
        const _ = keys[key as keyof typeof keys]
      })
    }

    // Get the reactive key ref directly from useMagicKeys
    const keyPressed = computed(() => {
      // For single keys, use direct access
      if (!keyCombo.includes('+')) {
        const keyRef = keys[keyCombo as keyof typeof keys]
        return Boolean(keyRef?.value)
      }

      // For key combinations, try different formats
      const variations = [
        keyCombo, // original format
        keyCombo.split('+').map(k => k.charAt(0).toUpperCase() + k.slice(1)).join('+'), // Title case
        keyCombo.replace('+', '_'), // underscore format
        keyCombo.split('+').map(k => k.charAt(0).toUpperCase() + k.slice(1)).join('_'), // Title case underscore
      ]

      for (const variation of variations) {
        const keyRef = keys[variation as keyof typeof keys]
        if (keyRef?.value) {
          return true
        }
      }

      return false
    })

    // Set up the shortcut listener with conditions
    whenever(
      logicAnd(
        keyPressed,
        notUsingInput,
        disabled ? computed(() => !disabled.value) : ref(true),
      ),
      () => {
        action()
      },
    )

    return () => {
      registeredShortcuts.value.delete(keyCombo)
    }
  }

  // Register multiple shortcuts at once
  function registerShortcuts(shortcuts: ShortcutAction[]) {
    // Clear only the shortcuts that are about to be re-registered to prevent duplicates
    shortcuts.forEach((shortcut) => {
      registeredShortcuts.value.delete(shortcut.keys)
    })

    const cleanupFunctions = shortcuts.map(registerShortcut)

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }

  // Get all registered shortcuts grouped by category
  const shortcutsByCategory = computed((): ShortcutCategory[] => {
    const categories = new Map<string, ShortcutAction[]>()
    const processedShortcuts = new Set<string>()

    // First, add keyboard shortcuts (these take priority)
    registeredShortcuts.value.forEach((shortcut) => {
      const category = shortcut.category || 'General'
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(shortcut)
      processedShortcuts.add(shortcut.description)
    })

    // Then add app commands, but only if they don't duplicate existing shortcuts
    appCommands.value.forEach((command) => {
      // Skip if we already have this shortcut description
      if (processedShortcuts.has(command.description)) {
        return
      }

      const category = command.category || 'General'
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(command)
      processedShortcuts.add(command.description)
    })

    return Array.from(categories.entries()).map(([name, shortcuts]) => ({
      name,
      shortcuts: shortcuts.sort((a, b) => a.keys.localeCompare(b.keys)),
    }))
  })

  // Get all commands in Command interface format for command palette
  const allCommands = computed((): Command[] => {
    const commands: Command[] = []

    // Add shortcuts as commands
    registeredShortcuts.value.forEach((shortcut) => {
      commands.push({
        id: shortcut.id || `shortcut-${shortcut.keys.replace(/\s+/g, '-')}`,
        label: shortcut.description,
        description: `Keyboard shortcut: ${formatKeys(shortcut.keys)}`,
        shortcut: formatKeys(shortcut.keys),
        icon: shortcut.icon || getDefaultIconForCategory(shortcut.category || 'General'),
        action: shortcut.action,
        group: shortcut.category || 'General',
      })
    })

    // Add app commands
    appCommands.value.forEach((command) => {
      commands.push({
        id: command.id || command.keys,
        label: command.description,
        description: command.description,
        shortcut: command.keys ? formatKeys(command.keys) : undefined,
        icon: command.icon || getDefaultIconForCategory(command.category || 'General'),
        action: command.action,
        group: command.category || 'General',
      })
    })

    return commands
  })

  // Helper function to get default icons for categories
  function getDefaultIconForCategory(category: string): string {
    const categoryIcons: Record<string, string> = {
      Navigation: 'lucide:compass',
      View: 'lucide:eye',
      File: 'lucide:folder',
      General: 'lucide:settings',
      Help: 'lucide:help-circle',
      Insert: 'lucide:plus',
      Format: 'lucide:type',
      Settings: 'lucide:settings',
    }
    return categoryIcons[category] || 'lucide:keyboard'
  }

  // Utility to format key combination for display
  function formatKeys(keys: string): string {
    const isMounted = useMounted()
    // Check if we're on client-side and navigator is available
    const isMac = isMounted.value && typeof navigator !== 'undefined' && navigator?.platform?.includes('Mac')

    return keys
      .split('+')
      .map((key) => {
        const keyMap: Record<string, string> = {
          meta: isMac ? '⌘' : 'Ctrl',
          cmd: '⌘',
          ctrl: isMac ? '⌃' : 'Ctrl',
          alt: isMac ? '⌥' : 'Alt',
          shift: isMac ? '⇧' : 'Shift',
          enter: '↵',
          space: '␣',
          tab: '⇥',
          escape: '⎋',
          backspace: '⌫',
          delete: '⌦',
          arrowup: '↑',
          arrowdown: '↓',
          arrowleft: '←',
          arrowright: '→',
        }

        const normalized = key.trim().toLowerCase()
        return keyMap[normalized] || key.trim().toUpperCase()
      })
      .join(isMac ? '' : '+')
  }

  // Check if a shortcut is currently active
  function isShortcutActive(keyCombo: string): boolean {
    const normalizedKeys = keyCombo.toLowerCase().replace(/\s/g, '')
    const keyRef = keys[normalizedKeys as keyof typeof keys] || keys[keyCombo as keyof typeof keys]
    return Boolean(keyRef?.value)
  }

  // Settings shortcut functionality
  const showSettings = useState<boolean>('showSettings', () => false)

  function openSettings() {
    showSettings.value = true
  }

  function closeSettings() {
    showSettings.value = false
  }

  function toggleSettings() {
    showSettings.value = !showSettings.value
  }

  // Color theme shortcut functionality
  const showColorTheme = useState<boolean>('showColorTheme', () => false)

  function openColorTheme() {
    showColorTheme.value = true
  }

  function closeColorTheme() {
    showColorTheme.value = false
  }

  function toggleColorTheme() {
    showColorTheme.value = !showColorTheme.value
  }

  // Sequential key support (like Linear g+s shortcuts)
  function createSequentialShortcut(firstKey: string, secondKey: string, action: () => void, timeout = 1500) {
    const stage = ref<'start' | 'got-first'>('start')
    let timer: ReturnType<typeof setTimeout>

    const resetStage = () => {
      stage.value = 'start'
      clearTimeout(timer)
    }

    // Listen for first key
    whenever(keys[firstKey as keyof typeof keys], () => {
      if (!notUsingInput.value) {
        resetStage()
        return
      }

      stage.value = 'got-first'
      clearTimeout(timer)
      timer = setTimeout(resetStage, timeout)
    })

    // Listen for second key when we're in the right stage
    whenever(() => stage.value === 'got-first' && keys[secondKey as keyof typeof keys].value, () => {
      if (!notUsingInput.value) {
        resetStage()
        return
      }

      action()
      resetStage()
    })

    return resetStage
  }

  // New document shortcut functionality
  const newDocumentAction = ref<(() => void) | null>(null)

  function setNewDocumentAction(action: () => void) {
    newDocumentAction.value = action
  }

  function createNewDocument() {
    if (newDocumentAction.value) {
      newDocumentAction.value()
    }
  }

  // Pre-register settings shortcut (Linear style: g then s)
  onMounted(() => {
    // Create g->s sequence shortcut
    createSequentialShortcut('g', 's', openSettings)

    // Create g->c sequence shortcut for color theme
    createSequentialShortcut('g', 'c', openColorTheme)

    // Create g->n sequence shortcut for new document
    createSequentialShortcut('g', 'n', createNewDocument)

    // Also register them in the shortcuts list for help display
    registeredShortcuts.value.set('g s', {
      keys: 'g s',
      description: 'Open settings',
      action: openSettings,
      category: 'Navigation',
      icon: 'lucide:settings',
    })

    registeredShortcuts.value.set('g c', {
      keys: 'g c',
      description: 'Open color theme',
      action: openColorTheme,
      category: 'Navigation',
      icon: 'lucide:palette',
    })

    registeredShortcuts.value.set('g n', {
      keys: 'g n',
      description: 'New document',
      action: createNewDocument,
      category: 'File',
      icon: 'lucide:file-plus',
    })

    registeredShortcuts.value.set('g t', {
      keys: 'g t',
      description: 'Toggle sidebar',
      action: () => {}, // This will be overridden by the actual handler in AppShell
      category: 'View',
      icon: 'lucide:panel-left',
    })
  })

  return {
    // Core functions
    registerShortcut,
    registerShortcuts,
    registerAppCommand,
    registerAppCommands,

    // State
    shortcutsByCategory: readonly(shortcutsByCategory),
    allCommands: readonly(allCommands),
    registeredShortcuts: readonly(registeredShortcuts),
    appCommands: readonly(appCommands),
    notUsingInput: readonly(notUsingInput),
    showSettings: readonly(showSettings),
    showColorTheme: readonly(showColorTheme),

    // Utilities
    formatKeys,
    isShortcutActive,
    getDefaultIconForCategory,

    // Settings functions
    openSettings,
    closeSettings,
    toggleSettings,

    // Color theme functions
    openColorTheme,
    closeColorTheme,
    toggleColorTheme,

    // New document functions
    setNewDocumentAction,
    createNewDocument,

    // Sequential shortcuts
    createSequentialShortcut,

    // Direct access to magic keys for advanced usage
    keys: readonly(keys),

    // Helper for conditional shortcuts
    createConditionalShortcut: (
      keyCombo: string,
      action: () => void,
      condition: ComputedRef<boolean> | Ref<boolean>,
      description: string,
      category?: string,
    ) => ({
      keys: keyCombo,
      action,
      disabled: computed(() => !condition.value),
      description,
      category,
    }),
  }
}
