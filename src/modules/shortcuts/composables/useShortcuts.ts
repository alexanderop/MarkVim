import { useState } from '#imports'
import { useActiveElement, useMagicKeys, useMounted, useToggle, whenever } from '@vueuse/core'
import { computed, type ComputedRef, type MaybeRefOrGetter, onMounted, readonly, ref, type Ref, toValue } from 'vue'

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

// eslint-disable-next-line ts/explicit-function-return-type
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
  function registerAppCommand(command: ShortcutAction): void {
    appCommands.value.set(command.id || command.keys, command)
  }

  function registerAppCommands(commands: ShortcutAction[]): void {
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
        // Using bracket notation to safely access dynamic keys
        const keysObj: Record<string, any> = keys
        const _ = keysObj[key]
      })
    }

    // Get the reactive key ref directly from useMagicKeys
    const keyPressed = computed(() => {
      // For single keys, use direct access
      if (!keyCombo.includes('+')) {
        const keysObj: Record<string, any> = keys
        const keyRef = keysObj[keyCombo]
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
        const keysObj: Record<string, any> = keys
        const keyRef = keysObj[variation]
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

  // Convert keyboard shortcut string to array format for Nuxt UI
  function parseKeysToArray(keys: string): string[] {
    return keys.split('+').map(k => k.trim().toLowerCase())
  }

  // Get commands in Nuxt UI CommandPalette format
  const commandPaletteItems = computed(() => {
    const items: Array<{
      id: string
      label: string
      suffix?: string
      icon?: string
      kbds?: string[]
      onSelect: (e?: Event) => void
      category: string
    }> = []

    // Add shortcuts as items
    registeredShortcuts.value.forEach((shortcut) => {
      items.push({
        id: shortcut.id || `shortcut-${shortcut.keys.replace(/\s+/g, '-')}`,
        label: shortcut.description,
        suffix: `Keyboard shortcut: ${formatKeys(shortcut.keys)}`,
        icon: shortcut.icon || getDefaultIconForCategory(shortcut.category || 'General'),
        kbds: parseKeysToArray(shortcut.keys),
        onSelect: (e?: Event) => {
          e?.preventDefault()
          shortcut.action()
        },
        category: shortcut.category || 'General',
      })
    })

    // Add app commands
    appCommands.value.forEach((command) => {
      items.push({
        id: command.id || command.keys,
        label: command.description,
        suffix: command.description,
        icon: command.icon || getDefaultIconForCategory(command.category || 'General'),
        kbds: command.keys ? parseKeysToArray(command.keys) : undefined,
        onSelect: (e?: Event) => {
          e?.preventDefault()
          command.action()
        },
        category: command.category || 'General',
      })
    })

    return items
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
    const keysRecord: Record<string, any> = keys
    const keyRef = keysRecord[normalizedKeys] || keysRecord[keyCombo]
    return Boolean(keyRef?.value)
  }

  // Settings shortcut functionality
  const showSettings = useState<boolean>('showSettings', () => false)
  const toggleSettings = useToggle(showSettings)

  // Color theme shortcut functionality
  const showColorTheme = useState<boolean>('showColorTheme', () => false)
  const toggleColorTheme = useToggle(showColorTheme)

  // Sequential key support (like Linear g+s shortcuts)
  function createSequentialShortcut(firstKey: string, secondKey: string, action: () => void, timeout = 1500): (() => void) {
    const stage = ref<'start' | 'got-first'>('start')
    let timer: ReturnType<typeof setTimeout>

    const resetStage = (): void => {
      stage.value = 'start'
      clearTimeout(timer)
    }

    // Listen for first key
    const keysObj: Record<string, any> = keys
    whenever(keysObj[firstKey], () => {
      if (!notUsingInput.value) {
        resetStage()
        return
      }

      stage.value = 'got-first'
      clearTimeout(timer)
      timer = setTimeout(resetStage, timeout)
    })

    // Listen for second key - trigger whenever the key is pressed AND we're in the right stage
    whenever(
      computed(() => keysObj[secondKey].value),
      (isPressed) => {
        if (!isPressed || stage.value !== 'got-first') {
          return
        }

        if (!notUsingInput.value) {
          resetStage()
          return
        }

        action()
        resetStage()
      },
    )

    return resetStage
  }

  // New document shortcut functionality
  const newDocumentAction = ref<(() => void) | null>(null)

  function setNewDocumentAction(action: () => void): void {
    newDocumentAction.value = action
  }

  function createNewDocument(): void {
    if (newDocumentAction.value) {
      newDocumentAction.value()
    }
  }

  // Pre-register settings shortcut (Linear style: g then s)
  onMounted(() => {
    // Create g->s sequence shortcut
    createSequentialShortcut('g', 's', () => toggleSettings(true))

    // Create g->c sequence shortcut for color theme
    createSequentialShortcut('g', 'c', () => toggleColorTheme(true))

    // Create g->n sequence shortcut for new document
    createSequentialShortcut('g', 'n', createNewDocument)

    // Also register them in the shortcuts list for help display
    registeredShortcuts.value.set('g s', {
      keys: 'g s',
      description: 'Open settings',
      action: () => toggleSettings(true),
      category: 'Navigation',
      icon: 'lucide:settings',
    })

    registeredShortcuts.value.set('g c', {
      keys: 'g c',
      description: 'Open color theme',
      action: () => toggleColorTheme(true),
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
    shortcutsByCategory,
    allCommands,
    commandPaletteItems,
    registeredShortcuts: readonly(registeredShortcuts),
    appCommands: readonly(appCommands),
    notUsingInput,
    showSettings: readonly(showSettings),
    showColorTheme: readonly(showColorTheme),

    // Utilities
    formatKeys,
    isShortcutActive,
    getDefaultIconForCategory,

    // Settings functions
    toggleSettings,

    // Color theme functions
    toggleColorTheme,

    // New document functions
    setNewDocumentAction,
    createNewDocument,

    // Sequential shortcuts
    createSequentialShortcut,

    // Direct access to magic keys for advanced usage
    keys,

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
