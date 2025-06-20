# MarkVim

MarkVim is a modern, browser-based Markdown editor with full Vim editing capabilities. Built with Nuxt 3 and Vue 3, it provides a powerful editing experience with live preview, document management, and advanced Markdown features.

## ✨ Features

### Core Editing
- **Full Vim Mode**: Complete Vim keybindings powered by @replit/codemirror-vim
- **Live Preview**: Real-time Markdown rendering with synchronized scrolling
- **Syntax Highlighting**: Code blocks with Shiki syntax highlighting
- **Document Management**: Local storage with auto-save functionality

### Advanced Markdown
- **Mermaid Diagrams**: Create flowcharts, sequence diagrams, and more
- **GitHub Alerts**: Support for note, tip, important, warning, and caution alerts
- **Footnotes**: Academic-style footnote references
- **Tables & Task Lists**: Extended Markdown syntax support

### User Experience
- **Command Palette**: Quick access to all commands (Cmd/Ctrl+K)
- **Keyboard Shortcuts**: Comprehensive shortcut system with sequential key support
- **OKLCH Color Themes**: Dynamic theme customization with perceptually uniform colors
- **Mobile Responsive**: Optimized for mobile and tablet devices
- **Dark Mode**: Pre-configured dark theme support

## 🚀 Installation

Use **pnpm** (recommended) to install dependencies:

```bash
pnpm install
```

## 📦 Development

Start the development server at `http://localhost:3000`:

```bash
pnpm dev
```

### Additional Commands

```bash
# Type checking
pnpm run typecheck

# Linting with auto-fix
pnpm run lint:fix

# Production build
pnpm build

# Preview production build
pnpm preview
```

## 🧪 Testing

MarkVim uses Playwright with Cucumber for BDD-style E2E testing:

```bash
# Run E2E tests (requires dev server running)
pnpm run test:e2e

# Run tests with browser UI
pnpm run test:e2e:headed

# Run tests with auto-started server (recommended)
pnpm run test:e2e:with-server
```

## 📁 Project Structure

```
MarkVim/
├── src/
│   ├── app/                    # Application root
│   │   └── AppShell.vue        # Main app shell with shortcut management
│   ├── modules/                # Feature modules
│   │   ├── color-theme/        # Theme customization system
│   │   ├── documents/          # Document CRUD operations
│   │   ├── editor/             # CodeMirror Vim editor
│   │   ├── layout/             # UI layout & resizing
│   │   ├── markdown-preview/   # Markdown rendering engine
│   │   ├── share/              # Import/export functionality
│   │   └── shortcuts/          # Keyboard shortcut system
│   └── shared/                 # Shared utilities
│       ├── components/         # Reusable UI components
│       ├── composables/        # Vue composables
│       └── utils/              # Helper functions
├── tests/                      # E2E test suite
│   ├── features/               # Gherkin scenarios
│   ├── steps/                  # Step definitions
│   └── page-objects/           # Page Object Model
└── CLAUDE.md                   # Detailed development guide
```

## ⚡ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com) + [Vue 3](https://vuejs.org)
- **Editor**: [CodeMirror 6](https://codemirror.net) with [@replit/codemirror-vim](https://github.com/replit/codemirror-vim)
- **State Management**: [Pinia](https://pinia.vuejs.org) with localStorage persistence
- **Styling**: [UnoCSS](https://unocss.dev) with Wind preset
- **Markdown**: [markdown-it](https://github.com/markdown-it/markdown-it) with plugins
- **Testing**: [Playwright](https://playwright.dev) + [Cucumber](https://cucumber.io)
- **Language**: TypeScript with strict mode

## 🎨 Key Features Explained

### Vim Mode
Full Vim experience in the browser with support for:
- Normal, Insert, Visual, and Command modes
- Custom keybindings
- Relative line numbers
- Vim-specific settings persistence

### Command Palette
Inspired by VS Code and Linear, access all features quickly:
- Fuzzy search for commands
- Recent command history
- Keyboard navigation
- Categorized actions

### Document Management
- Auto-save to localStorage
- Document list in collapsible sidebar
- Import/Export functionality
- Default template for new documents

### Markdown Extensions
- **Mermaid**: Create diagrams with text
- **Shiki**: Beautiful syntax highlighting
- **GitHub Alerts**: Styled callout boxes
- **Smart Typography**: Quotes, dashes, and more

## 🛠️ Configuration

### Editor Settings
- Font size customization
- Line number display options
- Vim mode toggle
- Theme preferences

### Keyboard Shortcuts
Default shortcuts include:
- `Cmd/Ctrl+K`: Open command palette
- `Cmd/Ctrl+S`: Save document
- `Cmd/Ctrl+N`: New document
- `Cmd/Ctrl+/`: Show all shortcuts
- `g` then `s`: Go to settings (sequential)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests first (BDD approach)
4. Implement your feature
5. Run linting: `pnpm run lint:fix`
6. Run tests: `pnpm run test:e2e:with-server`
7. Commit your changes
8. Push to the branch
9. Open a Pull Request

### Development Guidelines
- Follow the modular architecture pattern
- Use TypeScript with strict mode
- Add `data-testid` attributes for E2E testing
- Write Gherkin scenarios for new features
- Keep components focused and composables reusable

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- Inspired by modern editors like VS Code and Obsidian
- Built on the excellent CodeMirror 6 framework
- Vim bindings from the Replit team

---

For detailed development documentation, see [CLAUDE.md](./CLAUDE.md)
