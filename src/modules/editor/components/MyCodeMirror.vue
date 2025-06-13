<script setup lang="ts">
import type { Extension } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { indentWithTab as cmIndentWithTab, defaultKeymap, history } from '@codemirror/commands'
import { bracketMatching, defaultHighlightStyle, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { EditorState as CMEditorState, Compartment, StateEffect } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { lineNumbers as cmLineNumbers, placeholder as cmPlaceholder, drawSelection, EditorView, keymap } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { getCM, vim, Vim } from '@replit/codemirror-vim'

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

// Theme-aware highlight styles
const darkHighlightStyle = HighlightStyle.define([
  // Headers - Pure white for maximum contrast and prominence
  { tag: tags.heading1, color: '#ffffff', fontWeight: 'bold', fontSize: '1.2em' },
  { tag: tags.heading2, color: '#ffffff', fontWeight: 'bold', fontSize: '1.1em' },
  { tag: tags.heading3, color: '#ffffff', fontWeight: 'bold' },
  { tag: tags.heading4, color: '#ffffff', fontWeight: 'bold' },
  { tag: tags.heading5, color: '#ffffff', fontWeight: 'bold' },
  { tag: tags.heading6, color: '#ffffff', fontWeight: 'bold' },

  // Main text - Light gray for comfortable reading
  { tag: tags.content, color: '#d1d5db' },

  // Code elements - Different shades of gray for hierarchy
  { tag: tags.keyword, color: '#f3f4f6', fontWeight: 'bold' },
  { tag: tags.string, color: '#e5e7eb' },
  { tag: tags.comment, color: '#9ca3af', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#d1d5db' },
  { tag: tags.function(tags.variableName), color: '#f9fafb' },

  // Numbers and constants
  { tag: tags.number, color: '#e5e7eb' },
  { tag: tags.bool, color: '#f3f4f6' },
  { tag: tags.null, color: '#f3f4f6' },

  // Punctuation and operators
  { tag: tags.operator, color: '#d1d5db' },
  { tag: tags.punctuation, color: '#d1d5db' },
  { tag: tags.bracket, color: '#f3f4f6' },

  // Special markdown elements
  { tag: tags.link, color: '#ffffff', textDecoration: 'underline' },
  { tag: tags.emphasis, color: '#d1d5db', fontStyle: 'italic' },
  { tag: tags.strong, color: '#ffffff', fontWeight: 'bold' },
  { tag: tags.strikethrough, color: '#9ca3af', textDecoration: 'line-through' },

  // Markdown specific elements
  { tag: tags.quote, color: '#9ca3af', fontStyle: 'italic' },
  { tag: tags.list, color: '#e5e7eb' },
  { tag: tags.monospace, color: '#f3f4f6', backgroundColor: '#374151', padding: '2px 4px', borderRadius: '3px' },

  // Vim keys and commands - pure white for prominence
  { tag: tags.labelName, color: '#ffffff' },
  { tag: tags.special(tags.string), color: '#ffffff' },
])

const lightHighlightStyle = HighlightStyle.define([
  // Headers - Very dark text for maximum contrast and prominence
  { tag: tags.heading1, color: '#000000', fontWeight: 'bold', fontSize: '1.2em' },
  { tag: tags.heading2, color: '#000000', fontWeight: 'bold', fontSize: '1.1em' },
  { tag: tags.heading3, color: '#000000', fontWeight: 'bold' },
  { tag: tags.heading4, color: '#000000', fontWeight: 'bold' },
  { tag: tags.heading5, color: '#000000', fontWeight: 'bold' },
  { tag: tags.heading6, color: '#000000', fontWeight: 'bold' },

  // Main text - Very dark for readable contrast
  { tag: tags.content, color: '#111827' },

  // Code elements - Dark colors for hierarchy
  { tag: tags.keyword, color: '#000000', fontWeight: 'bold' },
  { tag: tags.string, color: '#1f2937' },
  { tag: tags.comment, color: '#4b5563', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#111827' },
  { tag: tags.function(tags.variableName), color: '#000000' },

  // Numbers and constants
  { tag: tags.number, color: '#1f2937' },
  { tag: tags.bool, color: '#000000' },
  { tag: tags.null, color: '#000000' },

  // Punctuation and operators
  { tag: tags.operator, color: '#111827' },
  { tag: tags.punctuation, color: '#111827' },
  { tag: tags.bracket, color: '#000000' },

  // Special markdown elements
  { tag: tags.link, color: '#000000', textDecoration: 'underline' },
  { tag: tags.emphasis, color: '#111827', fontStyle: 'italic' },
  { tag: tags.strong, color: '#000000', fontWeight: 'bold' },
  { tag: tags.strikethrough, color: '#4b5563', textDecoration: 'line-through' },

  // Markdown specific elements
  { tag: tags.quote, color: '#4b5563', fontStyle: 'italic' },
  { tag: tags.list, color: '#1f2937' },
  { tag: tags.monospace, color: '#000000', backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px' },

  // Vim keys and commands - black for prominence
  { tag: tags.labelName, color: '#000000' },
  { tag: tags.special(tags.string), color: '#000000' },
])

function getCustomHighlightStyle() {
  return theme.value === 'dark' ? darkHighlightStyle : lightHighlightStyle
}

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

  function getExtensions() {
    const extensionsList: Extension[] = [
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(getCustomHighlightStyle()),
      syntaxHighlighting(defaultHighlightStyle),
      keymap.of([...defaultKeymap]),
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

    if (theme.value === 'dark') {
      extensionsList.push(oneDark)
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

  return {
    getExtensions,
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

watch(() => [extensions, theme, editable, indentWithTab, placeholder, lineNumbers, lineNumberMode, lineWrapping], () => {
  reconfigureExtensions()
})

// Watch theme separately for immediate reconfiguration
watch(theme, () => {
  if (view.value) {
    // Force complete reconfiguration on theme change
    view.value.dispatch({
      effects: StateEffect.reconfigure.of(getExtensions()),
    })
  }
}, { immediate: false })

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

/* CodeMirror simplified color system */
.cm-editor .cm-content {
  color: var(--foreground) !important;
}

.cm-editor .cm-line {
  color: var(--foreground) !important;
}

.cm-editor .cm-gutterElement {
  color: var(--foreground) !important;
  opacity: 0.5;
}

.cm-editor .cm-cursor {
  border-left-color: var(--foreground) !important;
}

.cm-editor .cm-activeLine {
  background-color: var(--muted) !important;
}

.cm-editor .cm-selectionBackground {
  background-color: var(--accent) !important;
  opacity: 0.3;
}
</style>
