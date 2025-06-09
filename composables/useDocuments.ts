export interface Document {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}

export function useDocuments() {
  const defaultDocument: Document = {
    id: crypto.randomUUID(),
    content: `# Welcome to MarkVim

MarkVim is a markdown editor with full Vim modal editing support and custom keybindings.

## 🚀 Custom Vim Keybindings

When **Custom Vim Keybindings** is enabled in settings, you get these additional shortcuts:

### Insert Mode Shortcuts
- \`jj\` → **Escape** (quickly return to normal mode)
- \`kk\` → **Escape** (alternative escape shortcut)

### Normal Mode Enhancements  
- \`Y\` → **y$** (yank to end of line, consistent with D and C)

### Ex Commands
- \`:w\` or \`:write\` → **Save** (shows console message)

## How to Use

1. **Open Settings** (⚙️ button in top-right)
2. **Enable Vim Mode** if not already enabled  
3. **Enable "Custom Vim Keybindings"**
4. **Click in this editor** to focus it
5. **Press \`i\`** to enter insert mode
6. **Type some text** then quickly press \`jj\`
7. **You should return to normal mode** instantly!

## Standard Vim Features

All standard Vim motions and operators work:

### Navigation
- \`h j k l\` → Move cursor
- \`w b e\` → Word motions  
- \`0 $\` → Line start/end
- \`gg G\` → File start/end

### Editing
- \`i a o O\` → Insert modes
- \`d y c\` → Delete, yank, change
- \`u Ctrl-r\` → Undo/redo
- \`.\` → Repeat last command

### Visual Mode
- \`v V Ctrl-v\` → Character/line/block selection

## 📝 **Test Area**

Click here and test your \`jj\` mapping:

\`\`\`javascript
// Test your jj mapping here!
// 1. Press 'i' to enter insert mode
// 2. Type some code like this comment
// 3. Press 'jj' quickly to escape to normal mode
console.log("Testing jj -> Escape mapping");

function testVimMapping() {
  // Try editing this function and using jj to escape
  return "jj should work perfectly!";
}
\`\`\`

*Tip: The \`jj\` mapping works just like in your .vimrc - press both j's quickly together.*`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  // Use lazy initialization for SSR safety
  const documentsStorage = useLocalStorage<Document[]>('markvim-documents', [])
  const activeDocumentId = useLocalStorage<string>('markvim-active-document-id', '')

  // SSR-safe initialization flag
  const isInitialized = ref(false)

  // Initialize documents safely on client-side
  function initializeDocuments() {
    if (isInitialized.value)
      return

    // Ensure we have at least one document
    if (documentsStorage.value.length === 0) {
      documentsStorage.value = [defaultDocument]
      activeDocumentId.value = defaultDocument.id
    }

    // Ensure active document exists and is valid
    const activeDoc = documentsStorage.value.find(doc => doc.id === activeDocumentId.value)
    if (!activeDoc) {
      // Auto-select the most recently updated document
      const sortedDocs = [...documentsStorage.value].sort((a, b) => b.updatedAt - a.updatedAt)
      activeDocumentId.value = sortedDocs[0]?.id || defaultDocument.id
    }

    isInitialized.value = true
  }

  // Initialize on client-side only
  if (import.meta.client) {
    onMounted(() => {
      initializeDocuments()
    })
  }

  const documents = computed(() => {
    if (!isInitialized.value && import.meta.client) {
      initializeDocuments()
    }
    return [...documentsStorage.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const activeDocument = computed(() => {
    if (!isInitialized.value && import.meta.client) {
      initializeDocuments()
    }
    return documents.value.find(doc => doc.id === activeDocumentId.value) || documents.value[0]
  })

  function createDocument(): string {
    // Ensure we're initialized
    if (import.meta.client && !isInitialized.value) {
      initializeDocuments()
    }

    const newDoc: Document = {
      id: crypto.randomUUID(),
      content: '# New Note\n\nStart writing...',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    documentsStorage.value.unshift(newDoc)
    activeDocumentId.value = newDoc.id
    return newDoc.id
  }

  function setActiveDocument(id: string): void {
    // Ensure we're initialized
    if (import.meta.client && !isInitialized.value) {
      initializeDocuments()
    }

    const doc = documentsStorage.value.find(d => d.id === id)
    if (doc) {
      activeDocumentId.value = id
    }
  }

  function updateDocument(id: string, content: string): void {
    // Ensure we're initialized
    if (import.meta.client && !isInitialized.value) {
      initializeDocuments()
    }

    const docIndex = documentsStorage.value.findIndex(d => d.id === id)
    if (docIndex !== -1) {
      documentsStorage.value[docIndex] = {
        ...documentsStorage.value[docIndex],
        content,
        updatedAt: Date.now(),
      }
    }
  }

  function deleteDocument(id: string): void {
    // Ensure we're initialized
    if (import.meta.client && !isInitialized.value) {
      initializeDocuments()
    }

    const docIndex = documentsStorage.value.findIndex(d => d.id === id)
    if (docIndex === -1)
      return

    documentsStorage.value.splice(docIndex, 1)

    // If we deleted the active document, auto-select the most recently updated one
    if (activeDocumentId.value === id) {
      if (documentsStorage.value.length === 0) {
        // Create a new document if none exist
        createDocument()
      }
      else {
        // Select the most recently updated document (already sorted)
        const sortedDocs = [...documentsStorage.value].sort((a, b) => b.updatedAt - a.updatedAt)
        activeDocumentId.value = sortedDocs[0].id
      }
    }
  }

  function getDocumentTitle(content: string): string {
    const firstLine = content.split('\n')[0].trim()
    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '') || 'Untitled'
    }
    return firstLine || 'Untitled'
  }

  return {
    documents,
    activeDocument,
    activeDocumentId: readonly(activeDocumentId),
    createDocument,
    setActiveDocument,
    updateDocument,
    deleteDocument,
    getDocumentTitle,
  }
}
