export interface Document {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}

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

**Perfect test sequence:**
1. **i** → enter insert mode
2. **Hello World** → type some text
3. **jj** → should escape to normal mode instantly
4. **$** → move to end of line (confirms you're in normal mode)
5. **a** → enter insert mode at end
6. **!** → add exclamation
7. **jj** → escape again

Happy writing with Vim! ✨

## 🎨 Mermaid Diagrams

MarkVim now supports beautiful Mermaid diagrams! Here are some examples:

### Flowchart Example
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant E as Editor
    participant P as Preview
    participant M as Mermaid
    
    E->>P: Save markdown
    P->>M: Process diagram
    M-->>P: Render SVG
    P->>P: Display result
\`\`\`

### Git Flow
\`\`\`mermaid
gitgraph
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature
    commit
\`\`\`

## 📢 GitHub-style Alerts

MarkVim now supports GitHub-style alerts! These are rendered as beautiful, colored callout boxes:

> [!NOTE]
> This is a note alert. Use it to highlight important information that users should pay attention to.

> [!TIP]
> This is a tip alert. Perfect for sharing helpful hints and best practices with your readers.

> [!IMPORTANT]
> This is an important alert. Use it for critical information that users must not miss.

> [!WARNING]
> This is a warning alert. Use it to caution users about potential issues or risks.

> [!CAUTION]
> This is a caution alert. Use it for serious warnings about dangerous actions or consequences.

These alerts follow GitHub's styling and are perfect for documentation, guides, and README files!

### 🎯 Enhanced Alert Features

The alerts have been enhanced with:
- **Hover effects** for better interactivity
- **Subtle animations** that provide visual feedback
- **Tooltip-ready styling** for future enhancements
- **Preparation for collapsible content** using Reka UI components

> [!TIP]
> **Pro tip**: Hover over any alert to see the enhanced visual effects! The alerts now have smooth transitions and hover states that make them feel more interactive and modern.

## 📚 Footnotes

MarkVim now supports footnotes! Perfect for academic writing, blog posts, and documentation that needs citations and references.

Here is a simple footnote[^1].

A footnote can also have multiple lines[^2].

You can also reference the same footnote multiple times[^1].

### How to Use Footnotes

- Use \`[^1]\` in your text to create a footnote reference
- Define the footnote content with \`[^1]: Your footnote text\`  
- Footnotes are automatically numbered and linked
- Click footnote numbers to jump between references and definitions

[^1]: My reference.
[^2]: To add line breaks within a footnote, prefix new lines with 2 spaces.
  This is a second line.

---

*Tip: The \`jj\` mapping works just like in your .vimrc - press both j's quickly together.*`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

// Private internal store (not exported)
const _useDocumentsInternalStore = defineStore('documents-internal', () => {
  const _documents = useLocalStorage<Document[]>('markvim-documents', [defaultDocument])
  const _activeDocumentId = useLocalStorage('markvim-active-document-id', defaultDocument.id)

  // Ensure we have at least one document
  if (_documents.value.length === 0) {
    _documents.value = [defaultDocument]
    _activeDocumentId.value = defaultDocument.id
  }

  // Ensure active document exists
  if (!_documents.value.find(doc => doc.id === _activeDocumentId.value)) {
    _activeDocumentId.value = _documents.value[0]?.id || defaultDocument.id
  }

  return {
    documents: _documents,
    activeDocumentId: _activeDocumentId,
  }
})

// Public store (exported)
export const useDocumentsStore = defineStore('documents', () => {
  const internalStore = _useDocumentsInternalStore()
  const { onDataReset } = useDataReset()

  // Data reset handling
  onDataReset(() => {
    internalStore.documents = [defaultDocument]
    internalStore.activeDocumentId = defaultDocument.id
  })

  // Computed properties
  const documents = computed(() => {
    return [...internalStore.documents].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const activeDocument = computed(() => {
    return documents.value.find(doc => doc.id === internalStore.activeDocumentId) || documents.value[0]
  })

  const activeDocumentId = computed(() => internalStore.activeDocumentId)

  // Actions
  function createDocument(): string {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      content: '# New Note\n\nStart writing...',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    internalStore.documents.unshift(newDoc)
    internalStore.activeDocumentId = newDoc.id
    return newDoc.id
  }

  function setActiveDocument(id: string): void {
    const doc = internalStore.documents.find(d => d.id === id)
    if (doc) {
      internalStore.activeDocumentId = id
    }
  }

  function updateDocument(id: string, content: string): void {
    const docIndex = internalStore.documents.findIndex(d => d.id === id)
    if (docIndex !== -1) {
      internalStore.documents[docIndex] = {
        ...internalStore.documents[docIndex],
        content,
        updatedAt: Date.now(),
      }
    }
  }

  function deleteDocument(id: string): void {
    const docIndex = internalStore.documents.findIndex(d => d.id === id)
    if (docIndex === -1)
      return

    internalStore.documents.splice(docIndex, 1)

    // If we deleted the active document, select another one
    if (internalStore.activeDocumentId === id) {
      if (internalStore.documents.length === 0) {
        // Create a new document if none exist
        createDocument()
      }
      else {
        // Select the first available document
        internalStore.activeDocumentId = internalStore.documents[0].id
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
    activeDocumentId,
    createDocument,
    setActiveDocument,
    updateDocument,
    deleteDocument,
    getDocumentTitle,
  }
})
