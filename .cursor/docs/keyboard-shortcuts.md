# MarkVim Keyboard Shortcuts

MarkVim provides several built in shortcuts to speed up common tasks. This list covers the default bindings available in `app.vue` and `useShortcuts.ts`.

## General

| Keys | Action |
| ---- | ------ |
| `?` (Shift + `/`) | Show keyboard shortcuts modal |
| `Cmd+K` | Open command palette |
| `g` then `s` | Open settings modal |
| `Cmd+S` | Save current document |
| `Cmd+Shift+S` | Download document as Markdown |
| `Cmd+N` | Create a new document |

## View Controls

| Keys | Action |
| ---- | ------ |
| `1` | Switch to editor only view |
| `2` | Switch to split view |
| `3` | Switch to preview only view |
| `Cmd+Shift+\` | Toggle document sidebar |

## Editor Settings

| Keys | Action |
| ---- | ------ |
| `v` | Toggle Vim mode |
| `l` | Toggle line numbers |
| `p` | Toggle preview sync |

These shortcuts are registered on mount and work anywhere in the application unless you are actively typing in an input field or the editor. The settings shortcuts use single keys for a Linear style experience.
