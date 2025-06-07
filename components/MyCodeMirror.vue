<script setup lang="ts">
import { EditorState as CMEditorState, StateEffect, Compartment } from '@codemirror/state'
import type { Extension } from '@codemirror/state'
import { EditorView, keymap, placeholder as cmPlaceholder, drawSelection, lineNumbers as cmLineNumbers } from '@codemirror/view'
import type { ViewUpdate } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, indentWithTab as cmIndentWithTab } from '@codemirror/commands'
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { vim, Vim } from '@replit/codemirror-vim'

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
  fontSize: 14
})

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
  fontSize
} = toRefs(props)

const modelValue = defineModel<string>({ default: '' })

const emit = defineEmits<{
  (event: 'update', viewUpdate: ViewUpdate): void
}>()

// Clean monochromatic theme using CSS variables for easy customization
const customHighlightStyle = HighlightStyle.define([
  // Headers
  { tag: tags.heading1, color: 'var(--cm-heading-1)', fontWeight: 'bold', fontSize: '1.2em' },
  { tag: tags.heading2, color: 'var(--cm-heading-2)', fontWeight: 'bold', fontSize: '1.1em' },
  { tag: tags.heading3, color: 'var(--cm-heading-3)', fontWeight: 'bold' },
  { tag: tags.heading4, color: 'var(--cm-heading-other)', fontWeight: 'bold' },
  { tag: tags.heading5, color: 'var(--cm-heading-other)', fontWeight: 'bold' },
  { tag: tags.heading6, color: 'var(--cm-heading-other)', fontWeight: 'bold' },
  
  // Main text
  { tag: tags.content, color: 'var(--color-text-primary)' },
  
  // Code elements
  { tag: tags.keyword, color: 'var(--cm-code)', fontWeight: 'bold' },
  { tag: tags.string, color: 'var(--cm-code)' },
  { tag: tags.comment, color: 'var(--cm-strikethrough)', fontStyle: 'italic' },
  { tag: tags.variableName, color: 'var(--color-text-primary)' },
  { tag: tags.function(tags.variableName), color: 'var(--color-text-primary)' },
  
  // Numbers and constants
  { tag: tags.number, color: 'var(--cm-code)' },
  { tag: tags.bool, color: 'var(--cm-code)' },
  { tag: tags.null, color: 'var(--cm-code)' },
  
  // Punctuation and operators
  { tag: tags.operator, color: 'var(--color-text-primary)' },
  { tag: tags.punctuation, color: 'var(--color-text-primary)' },
  { tag: tags.bracket, color: 'var(--color-text-primary)' },
  
  // Special markdown elements
  { tag: tags.link, color: 'var(--cm-link)', textDecoration: 'underline' },
  { tag: tags.emphasis, color: 'var(--cm-emphasis)', fontStyle: 'italic' },
  { tag: tags.strong, color: 'var(--cm-strong)', fontWeight: 'bold' },
  { tag: tags.strikethrough, color: 'var(--cm-strikethrough)', textDecoration: 'line-through' },
  
  // Markdown specific elements
  { tag: tags.quote, color: 'var(--cm-quote)', fontStyle: 'italic' },
  { tag: tags.list, color: 'var(--cm-link)' },
  { tag: tags.monospace, color: 'var(--cm-code)', backgroundColor: 'var(--cm-monospace-bg)', padding: '2px 4px', borderRadius: '3px' },
  
  // Vim keys and commands - pure white for prominence
  { tag: tags.labelName, color: 'var(--cm-strong)' },
  { tag: tags.special(tags.string), color: 'var(--cm-strong)' }
])

const { lineNumberCompartment, getLineNumberExtension, handleLineNumberUpdate } = useLineNumbers()
const { setupCustomVimKeybindings } = useVimMode()
const { getExtensions } = useEditorExtensions()
const { editor, view, initializeEditor, destroyEditor } = useEditorLifecycle()
const { syncModelValue, reconfigureExtensions } = useModelSync()

function useLineNumbers() {
  const lineNumberCompartment = new Compartment()

  function getLineNumberExtension() {
    if (!lineNumbers.value) return []
    
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
        }
      })
    }
    
    return cmLineNumbers()
  }

  function handleLineNumberUpdate(viewUpdate: ViewUpdate) {
    if ((lineNumberMode.value === 'relative' || lineNumberMode.value === 'both') && viewUpdate.selectionSet) {
      viewUpdate.view.dispatch({
        effects: lineNumberCompartment.reconfigure(getLineNumberExtension())
      })
    }
  }

  return {
    lineNumberCompartment,
    getLineNumberExtension,
    handleLineNumberUpdate
  }
}

function useVimMode() {
  function setupCustomVimKeybindings() {
    if (!vimMode.value) return

    Vim.map('jj', '<Esc>', 'insert')
    Vim.map('kk', '<Esc>', 'insert')
    Vim.map('Y', 'y$', 'normal')
    
    Vim.defineEx('write', 'w', () => {
      console.log('Save command triggered!')
    })
  }

  return {
    setupCustomVimKeybindings
  }
}

function useEditorExtensions() {
  function getExtensions() {
    const extensionsList: Extension[] = [
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(customHighlightStyle),
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
    }))

    return extensionsList
  }

  return {
    getExtensions
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
      state: state,
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
    destroyEditor
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
    reconfigureExtensions
  }
}

onMounted(() => {
  initializeEditor()
})

watch(modelValue, (newValue) => {
  syncModelValue(newValue)
})

watch(() => [extensions, theme, editable, indentWithTab, placeholder, vimMode, lineNumbers, lineNumberMode, lineWrapping], () => {
  reconfigureExtensions()
})



onBeforeUnmount(() => {
  destroyEditor()
})
</script>

<template>
  <div ref="editor" class="cm-theme" :style="{ fontSize: fontSize + 'px' }"></div>
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
