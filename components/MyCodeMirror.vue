<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import type { EditorState } from '@codemirror/state'
import { EditorState as CMEditorState, StateEffect, Compartment, type Extension } from '@codemirror/state'
import { EditorView, keymap, placeholder as cmPlaceholder, type ViewUpdate, drawSelection, lineNumbers as cmLineNumbers } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, indentWithTab as cmIndentWithTab } from '@codemirror/commands'
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { vim } from '@replit/codemirror-vim'
import { Vim, getCM } from '@replit/codemirror-vim'

// Define Component Props & Model
// =============================================
const {
  extensions = [],
  theme = 'light',
  editable = true,
  placeholder = '',
  indentWithTab = true,
  vimMode = false,
  lineNumbers = true,
  lineNumberMode = 'absolute',
  lineWrapping = true,
  fontSize = 14,
  customVimKeybindings = true
} = defineProps<{
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
  customVimKeybindings?: boolean
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

// Create a compartment for line numbers so we can reconfigure them
const lineNumberCompartment = new Compartment()

// Extension Management
// =============================================
const getLineNumberExtension = () => {
  if (!lineNumbers) return []
  
  if (lineNumberMode === 'relative' || lineNumberMode === 'both') {
    return cmLineNumbers({
      formatNumber: (lineNo, state) => {
        if (lineNo > state.doc.lines) {
          return '0'
        }
        
        const cursorLine = state.doc.lineAt(state.selection.asSingle().ranges[0].to).number
        
        if (lineNumberMode === 'relative') {
          // Show actual line number on current line, relative distances on others
          return lineNo === cursorLine ? lineNo.toString() : Math.abs(cursorLine - lineNo).toString()
        } else { // both mode
          return lineNo === cursorLine ? lineNo.toString() : Math.abs(cursorLine - lineNo).toString()
        }
      }
    })
  } else {
    return cmLineNumbers()
  }
}

// Setup custom Vim keybindings
// =============================================
let vimKeybindingsSetup = false

const setupCustomVimKeybindings = () => {
  if (!vimMode || !customVimKeybindings || !view.value) return

  console.log('Setting up custom vim keybindings...')
  
  // Call mapping after vim extension is fully initialized
  nextTick(() => {
    setTimeout(() => {
      try {
        // Get the CM5-compatible interface for this specific editor instance
        const cm = getCM(view.value)
        
        // Clear any existing mappings to prevent duplicates
        if (vimKeybindingsSetup) {
          try {
            Vim.unmap('jj', 'insert')
            Vim.unmap('kk', 'insert')
          } catch (e) {
            // Ignore errors if mappings don't exist
          }
        }
        
        // The classic jj → Esc mapping
        Vim.map('jj', '<Esc>', 'insert')
        Vim.map('kk', '<Esc>', 'insert')
        
        // Normal mode enhancements
        Vim.map('Y', 'y$') // Yank to end of line (consistent with D and C)
        
        // Add custom ex commands
        Vim.defineEx('write', 'w', () => {
          console.log('Save command triggered!')
        })
        
        vimKeybindingsSetup = true
        console.log('✅ Custom vim keybindings setup complete!')
        
      } catch (error) {
        console.error('Error setting up vim keybindings:', error)
      }
    }, 100) // Small delay to ensure vim is ready
  })
}

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

  // Add line numbers using the compartment
  extensionsList.push(lineNumberCompartment.of(getLineNumberExtension()))

  if (lineWrapping) {
    extensionsList.push(EditorView.lineWrapping)
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
    // Handle relative line number updates on selection change
    if ((lineNumberMode === 'relative' || lineNumberMode === 'both') && viewUpdate.selectionSet) {
      viewUpdate.view.dispatch({
        effects: lineNumberCompartment.reconfigure(getLineNumberExtension())
      })
    }
    
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

  // Setup custom vim keybindings after vim extension is fully loaded
  if (vimMode) {
    // Use nextTick to ensure vim extension is fully initialized
    nextTick(() => {
      setupCustomVimKeybindings()
    })
  }
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
watch(() => [extensions, theme, editable, indentWithTab, placeholder, vimMode, lineNumbers, lineNumberMode, lineWrapping], () => {
  if (view.value) {
    view.value.dispatch({
      effects: StateEffect.reconfigure.of(getExtensions()),
    })
    
    // Setup custom vim keybindings when vim mode is enabled
    if (vimMode && customVimKeybindings) {
      nextTick(() => {
        setupCustomVimKeybindings()
      })
    }
  }
})

// Watch for custom vim keybindings changes
watch(() => customVimKeybindings, (newValue) => {
  if (vimMode && newValue) {
    nextTick(() => {
      setupCustomVimKeybindings()
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
  <div ref="editor" class="cm-theme" :style="{ fontSize: fontSize + 'px' }"></div>
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