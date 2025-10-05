# Import Map Simulation for Microfrontend Deployment

## What is an Import Map?

Import maps allow you to control module resolution in the browser, enabling:
- **Separate deployments** of each module
- **Independent versioning** of modules
- **CDN-based delivery** of shared dependencies
- **Runtime module loading** (no bundler needed)

This is how single-spa enables true microfrontend architecture.

---

## Current Monolith Setup

```typescript
// Current: Everything bundled together
import { useDocumentsState } from '~/modules/documents/api'
import { EditorMarkdown } from '~/modules/editor/api'
import { ColorThemeModal } from '~/modules/color-theme/api'

// Compiled into single bundle.js
```

---

## Proposed Import Map Structure

### HTML Entry Point
```html
<!DOCTYPE html>
<html>
<head>
  <title>MarkVim - Microfrontend Architecture</title>

  <!-- Import Map Definition -->
  <script type="importmap">
  {
    "imports": {
      // ============================================
      // Shared Dependencies (Singleton)
      // ============================================
      "vue": "https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.esm-browser.prod.js",
      "pinia": "https://cdn.jsdelivr.net/npm/pinia@2.1.7/dist/pinia.esm-browser.js",
      "rxjs": "https://cdn.jsdelivr.net/npm/rxjs@7.8.1/dist/bundles/rxjs.umd.min.js",
      "@vueuse/core": "https://cdn.jsdelivr.net/npm/@vueuse/core@10.7.0/index.mjs",

      // ============================================
      // Utility Modules (Deployed Separately)
      // ============================================
      "@markvim/utilities/domain": "https://cdn.markvim.app/utilities/domain@1.0.0/api.js",
      "@markvim/utilities/feature-flags": "https://cdn.markvim.app/utilities/feature-flags@2.1.0/api.js",
      "@markvim/utilities/event-bus": "https://cdn.markvim.app/utilities/event-bus@1.5.0/api.js",

      // ============================================
      // Feature Modules (Deployed Independently)
      // ============================================
      "@markvim/features/documents": "https://cdn.markvim.app/features/documents@3.2.1/api.js",
      "@markvim/features/editor": "https://cdn.markvim.app/features/editor@4.0.0/api.js",
      "@markvim/features/color-theme": "https://cdn.markvim.app/features/color-theme@2.3.0/api.js",
      "@markvim/features/share": "https://cdn.markvim.app/features/share@1.8.0/api.js",
      "@markvim/features/shortcuts": "https://cdn.markvim.app/features/shortcuts@2.0.0/api.js",

      // ============================================
      // UI Component Modules
      // ============================================
      "@markvim/ui/layout": "https://cdn.markvim.app/ui/layout@1.5.0/api.js",
      "@markvim/ui/markdown-preview": "https://cdn.markvim.app/ui/markdown-preview@2.1.0/api.js",

      // ============================================
      // App Shell (Main Application)
      // ============================================
      "@markvim/app-shell": "https://cdn.markvim.app/app-shell@5.0.0/main.js"
    }
  }
  </script>

  <!-- SystemJS for older browser support (optional) -->
  <script src="https://cdn.jsdelivr.net/npm/systemjs@6.14.2/dist/system.min.js"></script>
</head>
<body>
  <div id="app"></div>

  <!-- Load app shell (which imports modules dynamically) -->
  <script type="module">
    import { createApp } from '@markvim/app-shell'
    createApp()
  </script>
</body>
</html>
```

---

## Module Structure After Refactoring

### Directory Structure
```
packages/
├── utilities/
│   ├── domain/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── api.ts
│   │   │   ├── types/
│   │   │   └── schemas/
│   │   └── dist/
│   │       └── api.js (published to CDN)
│   │
│   ├── feature-flags/
│   │   ├── package.json
│   │   ├── src/api.ts
│   │   └── dist/api.js
│   │
│   └── event-bus/
│       ├── package.json
│       ├── src/
│       │   ├── api.ts
│       │   └── eventBus.ts
│       └── dist/api.js
│
├── features/
│   ├── documents/
│   │   ├── package.json  # dependencies: @markvim/utilities/domain
│   │   ├── src/
│   │   │   ├── api.ts
│   │   │   ├── store.ts
│   │   │   ├── events.ts
│   │   │   └── components/
│   │   └── dist/api.js
│   │
│   ├── editor/
│   │   ├── package.json  # dependencies: @markvim/utilities/event-bus
│   │   ├── src/api.ts
│   │   └── dist/api.js
│   │
│   └── color-theme/
│       ├── package.json
│       ├── src/api.ts
│       └── dist/api.js
│
├── ui/
│   ├── layout/
│   │   ├── package.json
│   │   ├── src/api.ts
│   │   └── dist/api.js
│   │
│   └── markdown-preview/
│       ├── package.json
│       ├── src/api.ts
│       └── dist/api.js
│
└── app-shell/
    ├── package.json  # depends on ALL modules
    ├── src/
    │   ├── main.ts
    │   ├── App.vue
    │   └── AppShell.vue
    └── dist/main.js
```

---

## Package.json Examples

### Utility Module Example
```json
{
  "name": "@markvim/utilities-domain",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/api.js",
  "exports": {
    ".": "./dist/api.js"
  },
  "peerDependencies": {
    "zod": "^3.22.0"
  },
  "scripts": {
    "build": "vite build --mode library",
    "publish:cdn": "aws s3 cp dist/ s3://cdn.markvim.app/utilities/domain@1.0.0/ --recursive"
  }
}
```

### Feature Module Example
```json
{
  "name": "@markvim/features-documents",
  "version": "3.2.1",
  "type": "module",
  "main": "dist/api.js",
  "peerDependencies": {
    "vue": "^3.4.0",
    "pinia": "^2.1.0",
    "@markvim/utilities-domain": "^1.0.0",
    "@markvim/utilities-event-bus": "^1.5.0"
  },
  "scripts": {
    "build": "vite build --mode library",
    "publish:cdn": "aws s3 cp dist/ s3://cdn.markvim.app/features/documents@3.2.1/ --recursive"
  }
}
```

---

## Vite Build Configuration

### Utility Module Build
```typescript
// packages/utilities/domain/vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/api.ts',
      name: 'MarkvimDomain',
      fileName: () => 'api.js',
      formats: ['es']
    },
    rollupOptions: {
      external: ['zod'],
      output: {
        globals: {
          zod: 'Zod'
        }
      }
    }
  }
})
```

### Feature Module Build
```typescript
// packages/features/documents/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/api.ts',
      name: 'MarkvimDocuments',
      fileName: () => 'api.js',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'vue',
        'pinia',
        '@vueuse/core',
        '@markvim/utilities-domain',
        '@markvim/utilities-event-bus'
      ],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
          '@vueuse/core': 'VueUse',
          '@markvim/utilities-domain': 'MarkvimDomain',
          '@markvim/utilities-event-bus': 'MarkvimEventBus'
        }
      }
    }
  }
})
```

---

## Module Loading Flow

```
User visits app
    ↓
1. Browser loads index.html
    ↓
2. Import map is parsed
    ↓
3. App shell is loaded: @markvim/app-shell
    ↓
4. App shell imports utilities:
   - @markvim/utilities/event-bus (loads first, no deps)
   - @markvim/utilities/domain (loads second, no deps)
   - @markvim/utilities/feature-flags
    ↓
5. App shell imports features:
   - @markvim/features/documents (depends on domain)
   - @markvim/features/editor
   - @markvim/features/color-theme
    ↓
6. App shell imports UI:
   - @markvim/ui/layout
   - @markvim/ui/markdown-preview
    ↓
7. All modules loaded, app renders
```

---

## Deployment Strategy

### Continuous Deployment Per Module

```yaml
# .github/workflows/deploy-documents.yml
name: Deploy Documents Module

on:
  push:
    paths:
      - 'packages/features/documents/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Build module
        run: |
          cd packages/features/documents
          pnpm install
          pnpm build

      - name: Get version
        id: version
        run: echo "VERSION=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

      - name: Deploy to CDN
        run: |
          aws s3 cp dist/ \
            s3://cdn.markvim.app/features/documents@${{ steps.version.outputs.VERSION }}/ \
            --recursive \
            --cache-control "public, max-age=31536000, immutable"

      - name: Update import map
        run: |
          # Update production import map with new version
          ./scripts/update-import-map.sh documents ${{ steps.version.outputs.VERSION }}
```

---

## Benefits of This Approach

### 1. **Independent Deployments**
```
Deploy documents module: v3.2.0 → v3.2.1
  ✓ No need to redeploy editor
  ✓ No need to redeploy color-theme
  ✓ Just update import map
```

### 2. **Faster Builds**
```
Before: Build entire app (5 minutes)
After:  Build only changed module (30 seconds)
```

### 3. **Team Ownership**
```
Team A owns documents module
Team B owns editor module
Team C owns color-theme module

Each team deploys independently!
```

### 4. **Versioning & Rollback**
```
# Current production
@markvim/features/documents@3.2.1

# Rollback to previous version (instant!)
@markvim/features/documents@3.2.0

# Just update import map - no rebuild needed
```

### 5. **A/B Testing**
```html
<!-- 50% of users get new version -->
<script type="importmap">
{
  "imports": {
    "@markvim/features/documents": "https://cdn.markvim.app/features/documents@3.3.0-beta/api.js"
  }
}
</script>

<!-- 50% get stable version -->
<script type="importmap">
{
  "imports": {
    "@markvim/features/documents": "https://cdn.markvim.app/features/documents@3.2.1/api.js"
  }
}
</script>
```

---

## Migration Path

### Phase 1: Monorepo Setup (1 week)
```bash
# Convert to pnpm workspace
packages/
├── utilities/
├── features/
├── ui/
└── app-shell/
```

### Phase 2: Extract One Module (1 week)
```bash
# Start with simplest: domain utility
packages/utilities/domain/
  ├── package.json
  ├── src/api.ts
  └── dist/api.js

# Test with import map locally
```

### Phase 3: Build Pipeline (1 week)
```bash
# Set up CDN deployment
# Create CI/CD workflows
# Add versioning
```

### Phase 4: Migrate All Modules (4-6 weeks)
```bash
# Gradual migration
# One module per week
# Full e2e testing after each
```

### Phase 5: Production Deployment (1 week)
```bash
# Update DNS
# Deploy import map
# Monitor performance
# Rollback plan ready
```

---

## Local Development with Import Maps

```html
<!-- dev.html -->
<script type="importmap">
{
  "imports": {
    "@markvim/utilities/domain": "http://localhost:5173/utilities/domain/api.js",
    "@markvim/features/documents": "http://localhost:5174/features/documents/api.js",
    "@markvim/features/editor": "http://localhost:5175/features/editor/api.js"
  }
}
</script>

<!-- Run all modules in dev mode -->
<script type="module">
  import { createApp } from '@markvim/app-shell'
  createApp()
</script>
```

```bash
# Terminal 1: domain utility
cd packages/utilities/domain && pnpm dev --port 5173

# Terminal 2: documents feature
cd packages/features/documents && pnpm dev --port 5174

# Terminal 3: editor feature
cd packages/features/editor && pnpm dev --port 5175

# Terminal 4: app shell
cd packages/app-shell && pnpm dev --port 5176
```

---

## Conclusion

MarkVim is **87.9% ready** for microfrontend architecture based on our analysis!

**Key Blockers to Fix:**
1. Circular dependency: layout ↔ share
2. High coupling in layout module (depends on 5 modules)
3. Documents module event coupling

**Once Fixed:**
- Each module can deploy independently
- Teams can work in parallel
- Faster deployments (30s vs 5min)
- Better scalability
- Framework flexibility (could migrate editor to React, etc.)

The import map structure above shows exactly how MarkVim would work as true microfrontends using single-spa patterns!
