<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { EditorState } from '@codemirror/state'
import { EditorState as CMEditorState, StateEffect, type Extension } from '@codemirror/state'
import { EditorView, keymap, placeholder, type ViewUpdate, drawSelection } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, indentWithTab } from '@codemirror/commands'
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language'

// Define Component Props & Model
// =============================================
const props = withDefaults(defineProps<{
  extensions?: Extension[]
  theme?: 'light' | 'dark' | 'none'
  editable?: boolean
  placeholder?: string
  indentWithTab?: boolean
}>(), {
  extensions: () => [],
  theme: 'light',
  editable: true,
  placeholder: '',
  indentWithTab: true,
})

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
  const extensions: Extension[] = [
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

  if (props.indentWithTab) {
    extensions.push(keymap.of([indentWithTab]))
  }

  if (props.placeholder) {
    extensions.push(placeholder(props.placeholder))
  }

  if (props.theme === 'dark') {
    extensions.push(oneDark)
  }

  if (!props.editable) {
    extensions.push(EditorView.editable.of(false))
  }
  
  // Add user-provided extensions
  extensions.push(...props.extensions)

  // Add the update listener
  extensions.push(EditorView.updateListener.of((viewUpdate) => {
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

  return extensions
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
watch(() => [props.extensions, props.theme, props.editable, props.indentWithTab, props.placeholder], () => {
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
/* Set a default height for the editor */
.cm-editor {
  height: 100%;
}
.cm-theme {
  height: 400px; /* Or whatever default you prefer */
  width: 100%;
  border: 1px solid #ccc;
}
</style> 