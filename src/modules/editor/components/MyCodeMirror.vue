<script setup lang="ts">
import type { Extension } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { indentWithTab as cmIndentWithTab, defaultKeymap, history } from '@codemirror/commands'
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { EditorState as CMEditorState, Compartment, StateEffect } from '@codemirror/state'
import { lineNumbers as cmLineNumbers, placeholder as cmPlaceholder, drawSelection, EditorView, keymap } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { getCM, vim, Vim } from '@replit/codemirror-vim'
import { onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'

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
  lineWrapping: false,
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

// Dynamic highlight style using CSS custom properties
// Define explicit tag mappings with proper styling preserved
const customHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: 'var(--cm-comment, var(--muted-foreground))', fontStyle: 'italic' },
  { tag: tags.lineComment, color: 'var(--cm-lineComment, var(--muted-foreground))', fontStyle: 'italic' },
  { tag: tags.blockComment, color: 'var(--cm-blockComment, var(--muted-foreground))', fontStyle: 'italic' },
  { tag: tags.docComment, color: 'var(--cm-docComment, var(--muted-foreground))', fontStyle: 'italic' },
  { tag: tags.string, color: 'var(--cm-string, var(--foreground))' },
  { tag: tags.character, color: 'var(--cm-character, var(--foreground))' },
  { tag: tags.number, color: 'var(--cm-number, var(--foreground))' },
  { tag: tags.bool, color: 'var(--cm-bool, var(--foreground))' },
  { tag: tags.variableName, color: 'var(--cm-variableName, var(--foreground))' },
  { tag: tags.definition(tags.variableName), color: 'var(--cm-definition, var(--foreground))' },
  { tag: tags.function(tags.variableName), color: 'var(--cm-function, var(--foreground))' },
  { tag: tags.function(tags.definition(tags.variableName)), color: 'var(--cm-functionDef, var(--foreground))', fontWeight: 'bold' },
  { tag: tags.typeName, color: 'var(--cm-typeName, var(--foreground))' },
  { tag: tags.className, color: 'var(--cm-className, var(--foreground))' },
  { tag: tags.propertyName, color: 'var(--cm-propertyName, var(--foreground))' },
  { tag: tags.operator, color: 'var(--cm-operator, var(--foreground))' },
  { tag: tags.keyword, color: 'var(--cm-keyword, var(--foreground))', fontWeight: 'bold' },
  { tag: tags.modifier, color: 'var(--cm-modifier, var(--foreground))' },
  { tag: tags.controlKeyword, color: 'var(--cm-controlKeyword, var(--foreground))', fontWeight: 'bold' },
  { tag: tags.operatorKeyword, color: 'var(--cm-operatorKeyword, var(--foreground))' },
  { tag: tags.moduleKeyword, color: 'var(--cm-moduleKeyword, var(--foreground))' },
  { tag: tags.definitionKeyword, color: 'var(--cm-definitionKeyword, var(--foreground))' },
  { tag: tags.heading, color: 'var(--cm-heading, var(--foreground))', fontWeight: 'bold' },
  { tag: tags.heading1, color: 'var(--cm-heading1, var(--foreground))', fontWeight: 'bold', fontSize: '1.2em' },
  { tag: tags.heading2, color: 'var(--cm-heading2, var(--foreground))', fontWeight: 'bold', fontSize: '1.1em' },
  { tag: tags.heading3, color: 'var(--cm-heading3, var(--foreground))', fontWeight: 'bold' },
  { tag: tags.heading4, color: 'var(--cm-heading4, var(--foreground))', fontWeight: 'bold' },
  { tag: tags.heading5, color: 'var(--cm-heading5, var(--foreground))', fontWeight: 'bold' },
  { tag: tags.heading6, color: 'var(--cm-heading6, var(--foreground))', fontWeight: 'bold' },
  { tag: tags.link, color: 'var(--cm-link, var(--foreground))', textDecoration: 'underline' },
  { tag: tags.url, color: 'var(--cm-url, var(--foreground))' },
  { tag: tags.emphasis, color: 'var(--cm-emphasis, var(--foreground))', fontStyle: 'italic' },
  { tag: tags.strong, color: 'var(--cm-strong, var(--foreground))', fontWeight: 'bold' },
  { tag: tags.strikethrough, color: 'var(--cm-strikethrough, var(--foreground))', textDecoration: 'line-through' },
  { tag: tags.inserted, color: 'var(--cm-inserted, var(--foreground))' },
  { tag: tags.deleted, color: 'var(--cm-deleted, var(--foreground))' },
  { tag: tags.changed, color: 'var(--cm-changed, var(--foreground))' },
  { tag: tags.invalid, color: 'var(--cm-invalid, var(--destructive))' },
  { tag: tags.meta, color: 'var(--cm-meta, var(--muted-foreground))' },
  { tag: tags.punctuation, color: 'var(--cm-punctuation, var(--foreground))' },
  { tag: tags.bracket, color: 'var(--cm-bracket, var(--foreground))' },
  { tag: tags.squareBracket, color: 'var(--cm-squareBracket, var(--foreground))' },
  { tag: tags.paren, color: 'var(--cm-paren, var(--foreground))' },
  { tag: tags.brace, color: 'var(--cm-brace, var(--foreground))' },
  { tag: tags.content, color: 'var(--cm-content, var(--foreground))' },
  { tag: tags.tagName, color: 'var(--cm-tagName, var(--foreground))' },
  { tag: tags.attributeName, color: 'var(--cm-attributeName, var(--foreground))' },
  { tag: tags.attributeValue, color: 'var(--cm-attributeValue, var(--foreground))' },
])

function getCustomHighlightStyle() {
  return customHighlightStyle
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
      // Only use our custom highlight style - remove defaultHighlightStyle to avoid conflicts
      syntaxHighlighting(getCustomHighlightStyle()),
      keymap.of([...defaultKeymap]),
      // Custom theme for selection background using CSS custom properties
      EditorView.theme({
        '&.cm-focused .cm-selectionBackground': {
          backgroundColor: 'var(--cm-selection-background)',
        },
      }),
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

    // Remove oneDark theme to avoid color conflicts with CSS custom properties
    // Our CSS custom properties will handle all theming

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

    // Expose editor view globally for testing
    if (import.meta.env.NODE_ENV === 'test' || import.meta.env.DEV) {
      ;(window as any).__codemirror_view = view.value
    }

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

watch(() => [extensions, theme, editable, indentWithTab, placeholder, lineNumbers, lineNumberMode, lineWrapping, fontSize], () => {
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
  <div ref="editor" class="cm-theme" />
</template>

<style>
.cm-editor {
  height: 100%;
  border: none !important;
  font-size: var(--font-size-base) !important;
}

.cm-theme {
  height: 100%;
  width: 100%;
  border: none;
  background: transparent;
  font-size: var(--font-size-base);
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
  font-size: var(--font-size-base) !important;
}

.cm-editor .cm-line {
  color: var(--foreground) !important;
  font-size: var(--font-size-base) !important;
}

.cm-editor .cm-gutterElement {
  color: var(--foreground) !important;
  opacity: 0.5;
  font-size: var(--font-size-sm) !important;
}

.cm-editor .cm-activeLineGutter {
  color: var(--muted) !important;
  opacity: 1;
}

.cm-editor .cm-cursor {
  border-left-color: var(--foreground) !important;
}

.cm-editor .cm-activeLine {
  background-color: var(--muted) !important;
}

.cm-editor .cm-selectionBackground {
  background-color: var(--cm-selection-background) !important;
}
</style>
