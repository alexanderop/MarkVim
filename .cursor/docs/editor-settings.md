# MarkVim Editor Settings

The editor exposes a range of options stored in localStorage under the `markvim-settings` key. Settings are defined in `useEditorSettings.ts` and can be modified through the Settings modal (`g` then `s`).

## Default Configuration

```ts
export const DEFAULT_EDITOR_CONFIG = {
  vimMode: true,
  vimKeymap: 'vim',
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'mono',
  lineNumbers: true,
  lineNumberMode: 'relative',
  lineWrapping: true,
  tabSize: 2,
  insertSpaces: true,
  autoIndent: true,
  livePreview: true,
  previewSync: true,
  markdownExtensions: {
    tables: true,
    footnotes: true,
    mathBlocks: true,
    codeBlocks: true,
  },
  autoSave: true,
  autoSaveDelay: 1000,
  bracketMatching: true,
  highlightActiveLine: true,
};
```

## Helpful Methods

`useEditorSettings` provides utility functions:

- `toggleVimMode()` – enable or disable Vim key bindings.
- `toggleLineNumbers()` – show or hide line numbers.
- `togglePreviewSync()` – sync preview scroll position with the editor.
- `updateTheme(theme)` – set `dark`, `light` or `auto` theme mode.
- `updateFontSize(size)` – change the font size (min 8, max 32).
- `resetToDefaults()` – restore the default configuration.
- `exportSettings()` – export settings as JSON.
- `importSettings(json)` – import settings from JSON.
- `clearAllLocalData()` – remove all `markvim-*` items from localStorage.

These helpers make it easy to persist user preferences and manage the editor without a centralized store.
