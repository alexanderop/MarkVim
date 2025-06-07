<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { EditorState } from '@codemirror/state'
import { EditorState as CMEditorState, StateEffect, type Extension } from '@codemirror/state'
import { EditorView, keymap, placeholder as cmPlaceholder, type ViewUpdate, drawSelection } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, indentWithTab as cmIndentWithTab } from '@codemirror/commands'
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { vim } from '@replit/codemirror-vim'

// Define Component Props & Model
// =============================================
const {
  extensions = [],
  theme = 'light',
  editable = true,
  placeholder = '',
  indentWithTab = true,
  vimMode = false
} = defineProps<{
  extensions?: Extension[]
  theme?: 'light' | 'dark' | 'none'
  editable?: boolean
  placeholder?: string
  indentWithTab?: boolean
  vimMode?: boolean
}>()

const modelValue = defineModel<string>({ default: '' })

const emit = defineEmits<{
  (event: 'update', viewUpdate: ViewUpdate): void
}>()

// Refs and State Management
// =============================================
const editor = ref<HTMLDivElement | null>(null) // The <div> element
const view = ref<EditorView>() // The CodeMirror EditorView instance
const state = ref<EditorState>() // The CodeMirror EditorState instance

// Extension Management
// =============================================
const getExtensions = () => {
  const extensionsList: Extension[] = [
    // Basic functionality
    history(),
    drawSelection(),
    indentOnInput(),
    bracketMatching(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([
      ...defaultKeymap,
    ]),
  ]

  // Add vim keybindings first if enabled (must come before other keymaps)
  if (vimMode) {
    extensionsList.unshift(vim())
  }

  if (indentWithTab) {
    extensionsList.push(keymap.of([cmIndentWithTab]))
  }

  if (placeholder) {
    extensionsList.push(cmPlaceholder(placeholder))
  }

  if (theme === 'dark') {
    extensionsList.push(oneDark)
  }

  if (!editable) {
    extensionsList.push(EditorView.editable.of(false))
  }
  
  // Add user-provided extensions
  extensionsList.push(...extensions)

  // Add the update listener
  extensionsList.push(EditorView.updateListener.of((viewUpdate) => {
    // Propagate the update event
    emit('update', viewUpdate)
    
    // Handle v-model updates
    if (viewUpdate.docChanged) {
      const newCode = viewUpdate.state.doc.toString()
      if (newCode !== modelValue.value) {
        modelValue.value = newCode
      }
    }
  }))

  return extensionsList
}

// Initialization
// =============================================
onMounted(() => {
  if (!editor.value) {
    throw new Error('Editor container element not found.')
  }

  state.value = CMEditorState.create({
    doc: modelValue.value,
    extensions: getExtensions(),
  })

  view.value = new EditorView({
    state: state.value,
    parent: editor.value,
  })
})

// Prop and v-model watchers
// =============================================

// Watch for external changes to v-model
watch(modelValue, (newValue) => {
  if (view.value && newValue !== view.value.state.doc.toString()) {
    view.value.dispatch({
      changes: { from: 0, to: view.value.state.doc.length, insert: newValue },
    })
  }
})

// Watch for extension changes to reconfigure the editor
watch(() => [extensions, theme, editable, indentWithTab, placeholder, vimMode], () => {
  if (view.value) {
    view.value.dispatch({
      effects: StateEffect.reconfigure.of(getExtensions()),
    })
  }
})

// Cleanup
// =============================================
onBeforeUnmount(() => {
  view.value?.destroy()
})
</script>

<template>
  <div ref="editor" class="cm-theme"></div>
</template>

<style>
/* Remove default styling to match Linear's clean design */
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

/* Better focus handling */
.cm-editor.cm-focused {
  outline: none;
}

/* Improved gutter styling */
.cm-gutters {
  background: transparent !important;
  border: none !important;
}

/* Line number improvements */
.cm-lineNumbers {
  min-width: 3rem;
}

.cm-lineNumbers .cm-gutterElement {
  text-align: right;
  padding-right: 1rem;
}
</style> 