# MarkVim

MarkVim is a Nuxt 3 based Markdown editor that provides a full Vim editing experience. It includes live preview, document management and enhanced Markdown features like Mermaid diagrams and GitHub style alerts.

## Features

  - Vim mode with optional custom keybindings
  - Live preview with synced scrolling
  - Local document storage and management
  - Support for Mermaid diagrams and footnotes
  - Keyboard shortcuts and command palette

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

## Directory Structure

  - `components/` – Vue components
  - `composables/` – reusable logic functions
  - `tests/` – end‑to‑end tests

## Contributing

Ensure code style is respected by running the linter:

```bash
pnpm run lint:fix
```

Feel free to open issues or pull requests to improve MarkVim.
