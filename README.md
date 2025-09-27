# MarkVim

MarkVim is a Nuxt 3 based Markdown editor that provides a full Vim editing experience. Built with CodeMirror 6 and modern web technologies, it offers live preview, document management, and enhanced Markdown features like Mermaid diagrams and GitHub style alerts.

## Features

- **Full Vim Experience**: Complete vim mode with custom keybindings support
- **Live Preview**: Real-time Markdown preview with synced scrolling
- **Document Management**: Local storage with CRUD operations for documents
- **Enhanced Markdown**: Support for Mermaid diagrams, footnotes, and GitHub alerts
- **Keyboard-First**: Extensive shortcuts and command palette
- **Theme Customization**: Dynamic color themes with OKLCH color picker
- **Modern Tech Stack**: Built with Nuxt 3, CodeMirror 6, Pinia, and UnoCSS
- **Mobile Responsive**: Adaptive layouts for all screen sizes

## Installation

Use **pnpm** to install dependencies:

```bash
pnpm install
```

## Development

Start the application at `http://localhost:3000`:

```bash
pnpm dev
```

## Production Build

Create a production build and preview it locally:

```bash
pnpm build
pnpm preview
```

## End-to-End Tests

MarkVim ships with Playwright+Cucumber tests. Start the dev server then run:

```bash
pnpm run test:e2e
```

## Architecture

MarkVim follows a modular architecture:

- `src/modules/` – Feature modules (editor, documents, themes, etc.)
- `src/shared/` – Shared components, composables, and utilities
- `src/types/` – TypeScript type definitions
- `tests/` – End-to-end tests with Playwright + Cucumber

Each module contains its own API, components, composables, and stores for clean separation of concerns.

## Contributing

Ensure code style is respected by running the linter:

```bash
pnpm run lint:fix
```

Feel free to open issues or pull requests to improve MarkVim.
