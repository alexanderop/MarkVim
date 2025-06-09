<script setup lang="ts">
import type { Extension } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { indentWithTab as cmIndentWithTab, defaultKeymap, history } from '@codemirror/commands'
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { EditorState as CMEditorState, Compartment, StateEffect } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, keymap } from '@codemirror/view'
import { lineNumbers as cmLineNumbers, placeholder as cmPlaceholder, drawSelection } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { getCM, vim, Vim } from '@replit/codemirror-vim'
import { useTheme } from '~/composables/useTheme'

const props = withDefaults(defineProps<{
  extensions?: Extension[]
  theme?: 'light' | 'dark' | 'none'
  editable?: boolean
  placeholder?: string
  indentWithTab?: boolean
  vimMode?: boolean
  lineNumbers?: boolean
  lineNumberMode?: 'absolute' | 'relative' | 'both'
  lineWrapping?: boolean
  fontSize?: number
}>(), {
  extensions: () => [],
  theme: 'dark',
  editable: true,
  placeholder: '',
  indentWithTab: true,
  vimMode: false,
  lineNumbers: true,
  lineNumberMode: 'absolute',
  lineWrapping: true,
  fontSize: 14,
})

const emit = defineEmits<{
  (event: 'update', viewUpdate: ViewUpdate): void
  (event: 'vimModeChange', mode: string, subMode?: string): void
}>()

const {
  extensions,
  theme,
  editable,
  placeholder,
  indentWithTab,
  vimMode,
  lineNumbers,
  lineNumberMode,
  lineWrapping,
  fontSize,
} = toRefs(props)

const modelValue = defineModel<string>({ default: '' })

const { theme: globalTheme } = useTheme()

// Light theme extension for CodeMirror
const lightTheme = EditorView.theme({
  '&': {
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-surface-primary)',
  },
  '.cm-content': {
    padding: '0',
    caretColor: 'var(--color-text-primary)',
    color: 'var(--color-text-primary)',
  },
  '.cm-focused': {
    outline: 'none',
  },
  '.cm-editor': {
    fontSize: 'inherit',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-surface-primary)',
  },
  '.cm-scroller': {
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-surface-primary)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--color-text-primary)',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--color-border)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface-primary)',
    color: 'var(--color-text-secondary)',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--color-surface-hover)',
  },
}, { dark: false })

// Light syntax highlighting theme
const lightHighlightStyle = HighlightStyle.define([
  // Headers - Dark text for contrast on light background
  { tag: tags.heading1, color: 'var(--color-text-primary)', fontWeight: 'bold', fontSize: '1.2em' },
  { tag: tags.heading2, color: 'var(--color-text-primary)', fontWeight: 'bold', fontSize: '1.1em' },
  { tag: tags.heading3, color: 'var(--color-text-primary)', fontWeight: 'bold' },
  { tag: tags.heading4, color: 'var(--color-text-primary)', fontWeight: 'bold' },
  { tag: tags.heading5, color: 'var(--color-text-primary)', fontWeight: 'bold' },
  { tag: tags.heading6, color: 'var(--color-text-primary)', fontWeight: 'bold' },

  // Main text - Using CSS variables for proper theme support
  { tag: tags.content, color: 'var(--color-text-primary)' },

  // Code elements
  { tag: tags.keyword, color: 'var(--color-text-primary)', fontWeight: 'bold' },
  { tag: tags.string, color: 'var(--color-text-secondary)' },
  { tag: tags.comment, color: 'var(--color-text-secondary)', fontStyle: 'italic' },
  { tag: tags.variableName, color: 'var(--color-text-primary)' },
  { tag: tags.function(tags.variableName), color: 'var(--color-text-primary)' },

  // Numbers and constants
  { tag: tags.number, color: 'var(--color-text-secondary)' },
  { tag: tags.bool, color: 'var(--color-text-primary)' },
  { tag: tags.null, color: 'var(--color-text-primary)' },

  // Punctuation and operators
  { tag: tags.operator, color: 'var(--color-text-primary)' },
  { tag: tags.punctuation, color: 'var(--color-text-primary)' },
  { tag: tags.bracket, color: 'var(--color-text-primary)' },

  // Special markdown elements
  { tag: tags.link, color: 'var(--color-text-primary)', textDecoration: 'underline' },
  { tag: tags.emphasis, color: 'var(--color-text-primary)', fontStyle: 'italic' },
  { tag: tags.strong, color: 'var(--color-text-primary)', fontWeight: 'bold' },
  { tag: tags.strikethrough, color: 'var(--color-text-secondary)', textDecoration: 'line-through' },

  // Markdown specific elements
  { tag: tags.quote, color: 'var(--color-text-secondary)', fontStyle: 'italic' },
  { tag: tags.list, color: 'var(--color-text-secondary)' },
  { tag: tags.monospace, color: 'var(--color-text-primary)', backgroundColor: 'var(--color-surface-secondary)', padding: '2px 4px', borderRadius: '3px' },

  // Vim keys and commands
  { tag: tags.labelName, color: 'var(--color-text-primary)' },
  { tag: tags.special(tags.string), color: 'var(--color-text-primary)' },
])

// Dark syntax highlighting theme (cleaner monochromatic)
const darkHighlightStyle = HighlightStyle.define([
  // Headers - Subtle light gray instead of pure white, less aggressive
  { tag: tags.heading1, color: '#e5e7eb', fontWeight: 'bold', fontSize: '1.2em' },
  { tag: tags.heading2, color: '#e5e7eb', fontWeight: 'bold', fontSize: '1.1em' },
  { tag: tags.heading3, color: '#e5e7eb', fontWeight: 'bold' },
  { tag: tags.heading4, color: '#e5e7eb', fontWeight: 'bold' },
  { tag: tags.heading5, color: '#e5e7eb', fontWeight: 'bold' },
  { tag: tags.heading6, color: '#e5e7eb', fontWeight: 'bold' },

  // Main text - Slightly lighter for good readability
  { tag: tags.content, color: '#d1d5db' },

  // Code elements - Very subtle differences, mostly monochromatic
  { tag: tags.keyword, color: '#d1d5db', fontWeight: 'bold' },
  { tag: tags.string, color: '#d1d5db' },
  { tag: tags.comment, color: '#9ca3af', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#d1d5db' },
  { tag: tags.function(tags.variableName), color: '#d1d5db' },

  // Numbers and constants - same as main text for simplicity
  { tag: tags.number, color: '#d1d5db' },
  { tag: tags.bool, color: '#d1d5db' },
  { tag: tags.null, color: '#d1d5db' },

  // Punctuation and operators - subtle gray
  { tag: tags.operator, color: '#d1d5db' },
  { tag: tags.punctuation, color: '#d1d5db' },
  { tag: tags.bracket, color: '#d1d5db' },

  // Special markdown elements - minimal color variation
  { tag: tags.link, color: '#e5e7eb', textDecoration: 'underline' },
  { tag: tags.emphasis, color: '#d1d5db', fontStyle: 'italic' },
  { tag: tags.strong, color: '#e5e7eb', fontWeight: 'bold' },
  { tag: tags.strikethrough, color: '#9ca3af', textDecoration: 'line-through' },

  // Markdown specific elements - muted
  { tag: tags.quote, color: '#9ca3af', fontStyle: 'italic' },
  { tag: tags.list, color: '#d1d5db' },
  { tag: tags.monospace, color: '#d1d5db', backgroundColor: '#374151', padding: '2px 4px', borderRadius: '3px' },

  // Vim keys and commands - slightly brighter for visibility
  { tag: tags.labelName, color: '#e5e7eb' },
  { tag: tags.special(tags.string), color: '#e5e7eb' },
])

// Theme compartment for dynamic switching
const themeCompartment = new Compartment()

const { lineNumberCompartment, getLineNumberExtension, handleLineNumberUpdate } = useLineNumbers()
const { setupCustomVimKeybindings } = useVimMode()
const { getExtensions } = useEditorExtensions()
const { editor, view, initializeEditor, destroyEditor } = useEditorLifecycle()
const { syncModelValue, reconfigureExtensions } = useModelSync()

function useLineNumbers() {
  const lineNumberCompartment = new Compartment()

  function getLineNumberExtension() {
    if (!lineNumbers.value)
      return []

    if (lineNumberMode.value === 'relative' || lineNumberMode.value === 'both') {
      return cmLineNumbers({
        formatNumber: (lineNo, state) => {
          if (lineNo > state.doc.lines) {
            return '0'
          }

          const cursorLine = state.doc.lineAt(state.selection.asSingle().ranges[0].to).number

          if (lineNumberMode.value === 'relative') {
            return lineNo === cursorLine ? lineNo.toString() : Math.abs(cursorLine - lineNo).toString()
          }

          return lineNo === cursorLine ? lineNo.toString() : Math.abs(cursorLine - lineNo).toString()
        },
      })
    }

    return cmLineNumbers()
  }

  function handleLineNumberUpdate(viewUpdate: ViewUpdate) {
    if ((lineNumberMode.value === 'relative' || lineNumberMode.value === 'both') && viewUpdate.selectionSet) {
      viewUpdate.view.dispatch({
        effects: lineNumberCompartment.reconfigure(getLineNumberExtension()),
      })
    }
  }

  return {
    lineNumberCompartment,
    getLineNumberExtension,
    handleLineNumberUpdate,
  }
}

function useVimMode() {
  function setupCustomVimKeybindings() {
    if (!vimMode.value)
      return

    Vim.map('jj', '<Esc>', 'insert')
    Vim.map('kk', '<Esc>', 'insert')
    Vim.map('Y', 'y$', 'normal')

    Vim.defineEx('write', 'w', () => {
    })
  }

  return {
    setupCustomVimKeybindings,
  }
}

function useEditorExtensions() {
  let previousVimMode = 'NORMAL'

  function getThemeExtensions() {
    const actualTheme = theme.value === 'auto' ? globalTheme.value : theme.value

    if (actualTheme === 'dark') {
      return [
        oneDark,
        syntaxHighlighting(darkHighlightStyle),
      ]
    }
    else {
      return [
        lightTheme,
        syntaxHighlighting(lightHighlightStyle),
      ]
    }
  }

  function getExtensions() {
    const extensionsList: Extension[] = [
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      keymap.of([...defaultKeymap]),
      themeCompartment.of(getThemeExtensions()),
    ]

    if (vimMode.value) {
      extensionsList.unshift(vim())
    }

    if (indentWithTab.value) {
      extensionsList.push(keymap.of([cmIndentWithTab]))
    }

    if (placeholder.value) {
      extensionsList.push(cmPlaceholder(placeholder.value))
    }

    extensionsList.push(lineNumberCompartment.of(getLineNumberExtension()))

    if (lineWrapping.value) {
      extensionsList.push(EditorView.lineWrapping)
    }

    if (!editable.value) {
      extensionsList.push(EditorView.editable.of(false))
    }

    extensionsList.push(...extensions.value)

    extensionsList.push(EditorView.updateListener.of((viewUpdate) => {
      handleLineNumberUpdate(viewUpdate)
      emit('update', viewUpdate)

      if (viewUpdate.docChanged) {
        const newCode = viewUpdate.state.doc.toString()
        if (newCode !== modelValue.value) {
          modelValue.value = newCode
        }
      }

      // Track vim mode changes
      if (vimMode.value) {
        const cm = getCM(viewUpdate.view)
        if (cm) {
          const currentKeyMap = cm.state.keyMap || ''

          // Map keyMap values to readable mode names
          let modeName = 'NORMAL'
          if (currentKeyMap === 'vim-insert') {
            modeName = 'INSERT'
          }
          else if (currentKeyMap === 'vim-replace') {
            modeName = 'REPLACE'
          }
          else if (currentKeyMap.startsWith('vim-visual')) {
            modeName = 'VISUAL'
          }

          // Only emit if the mode has actually changed
          if (modeName !== previousVimMode) {
            previousVimMode = modeName
            emit('vimModeChange', modeName)
          }
        }
      }
    }))

    return extensionsList
  }

  // Watch for theme changes and reconfigure the editor
  watch(globalTheme, () => {
    reconfigureTheme()
  })

  function reconfigureTheme() {
    if (view.value) {
      view.value.dispatch({
        effects: themeCompartment.reconfigure(getThemeExtensions()),
      })
    }
  }

  return {
    getExtensions,
    reconfigureTheme,
  }
}

function useEditorLifecycle() {
  const editor = ref<HTMLDivElement | null>(null)
  const view = ref<EditorView>()

  function initializeEditor() {
    if (!editor.value) {
      throw new Error('Editor container element not found.')
    }

    const state = CMEditorState.create({
      doc: modelValue.value,
      extensions: getExtensions(),
    })

    view.value = new EditorView({
      state,
      parent: editor.value,
    })

    if (vimMode.value) {
      setupCustomVimKeybindings()
    }
  }

  function destroyEditor() {
    view.value?.destroy()
  }

  return {
    editor,
    view,
    initializeEditor,
    destroyEditor,
  }
}

function useModelSync() {
  function syncModelValue(newValue: string) {
    if (view.value && newValue !== view.value.state.doc.toString()) {
      view.value.dispatch({
        changes: { from: 0, to: view.value.state.doc.length, insert: newValue },
      })
    }
  }

  function reconfigureExtensions() {
    if (view.value) {
      view.value.dispatch({
        effects: StateEffect.reconfigure.of(getExtensions()),
      })

      if (vimMode.value) {
        setupCustomVimKeybindings()
      }
    }
  }

  return {
    syncModelValue,
    reconfigureExtensions,
  }
}

onMounted(() => {
  initializeEditor()
})

watch(modelValue, (newValue) => {
  syncModelValue(newValue)
})

// Watch vim mode separately for more aggressive reconfiguration
watch(vimMode, (newVimMode) => {
  if (view.value) {
    // Force a complete reconfiguration when vim mode changes
    view.value.dispatch({
      effects: StateEffect.reconfigure.of(getExtensions()),
    })

    if (newVimMode) {
      setupCustomVimKeybindings()
    }
  }
}, { immediate: false })

// Watch for theme prop changes
watch(theme, () => {
  reconfigureTheme()
})

watch(() => [extensions, editable, indentWithTab, placeholder, lineNumbers, lineNumberMode, lineWrapping], () => {
  reconfigureExtensions()
})

onBeforeUnmount(() => {
  destroyEditor()
})
</script>

<template>
  <div ref="editor" class="cm-theme" :style="{ fontSize: `${fontSize}px` }" />
</template>

<style>
.cm-editor {
  height: 100%;
  border: none !important;
}

.cm-theme {
  height: 100%;
  width: 100%;
  border: none;
  background: transparent;
}

.cm-editor.cm-focused {
  outline: none;
}

.cm-gutters {
  background: transparent !important;
  border: none !important;
}

.cm-lineNumbers {
  min-width: 3rem;
}

.cm-lineNumbers .cm-gutterElement {
  text-align: right;
  padding-right: 1rem;
}
</style>
