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

## Module Independence Analysis

MarkVim includes a powerful analyzer to measure module independence and microfrontend readiness. The script uses AST parsing and event analysis to score modules based on single-spa best practices.

### How It Works

The analyzer evaluates each module across multiple dimensions:

**1. Event Coupling** (frequency-weighted)
- Tracks `emitAppEvent()` calls (module broadcasts changes)
- Tracks `onAppEvent()` calls (module depends on other events)
- Uses log-scaled penalties: high-frequency events penalized more than counts alone

**2. Import Coupling** (direct dependencies)
- Scans for imports from `~/modules/*`
- External imports create tight coupling (5pt penalty each)
- Only imports from other modules count (shared utilities excluded)

**3. Code Size** (extraction complexity)
- Counts SLOC (Source Lines of Code) excluding comments/whitespace
- Smooth size penalty after 800 lines (harder to extract)
- Uses sigmoid curve instead of hard thresholds

**4. Architecture Quality** (bonus points)
- `api.ts` file present: +5pts (good public interface)
- `events.ts` file present: +5pts (clear event contract)
- Utility modules: +10pts (should be highly independent)

**5. Circular Dependencies**
- Detects import cycles using canonical DFS
- Deduplicates cycles (A→B→A same as B→A→B)
- Critical blocker for microfrontend extraction

### Scoring System

Each module starts at 100 points. Penalties applied:
- Event emissions: 2pts per unique event + log(frequency)
- Event listeners: 3pts per unique event + log(frequency)
- External imports: 5pts each (max -30)
- Large size: log-scaled penalty after 800 SLOC (max -20)

**Score Ranges:**
- 🟢 90-100%: Microfrontend-ready
- 🔵 70-89%: Good independence, minor coupling
- 🟡 50-69%: Moderate coupling, refactoring recommended
- 🔴 0-49%: High coupling, major refactoring needed

### Usage

**Run analysis** (text output):
```bash
pnpm analyze:modules
```

**Export as JSON** (for tracking over time):
```bash
pnpm analyze:modules:json > analysis.json
```

**Generate Mermaid graph** (visual dependency map):
```bash
pnpm analyze:modules:mermaid > docs/dependencies.md
```

**CI validation** (fail if score < 70 or cycles detected):
```bash
pnpm analyze:modules:ci
```

### CLI Options

```bash
tsx scripts/analyze-module-independence.ts [options]

--format <type>        Output format: text, json, or mermaid (default: text)
--output <file>        Save to file instead of stdout
--threshold <score>    Exit code 1 if avg score below threshold
--fail-on-cycle        Exit code 1 if circular dependencies found
--no-ast               Use regex fallback (faster but less accurate)
--alias <path>         Module import alias (default: ~/modules/)
```

### Current Status

**Overall Score:** 88.2% (7/10 modules at 80%+)

**Top Performers:**
- `domain`, `feature-flags`, `font-preferences`: 100%
- `editor`: 99.6% (nearly perfect isolation)
- `markdown-preview`: 100% (self-contained)

**Needs Work:**
- `documents`: 60% (event coupling, central bottleneck)
- `layout`: 72% (imports 5 modules, orchestration hub)
- ⚠️ **Circular dependency:** `layout ↔ share`

**Next Steps to 80%+ Readiness:**
1. Break layout→share cycle (use registration pattern)
2. Reduce documents event coupling (batch related events)
3. Refactor layout to use dependency injection

## Contributing

Ensure code style is respected by running the linter:

```bash
pnpm run lint:fix
```

Feel free to open issues or pull requests to improve MarkVim.
