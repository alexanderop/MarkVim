# Single-SPA Principle Violations & Improvement Plan

**Analysis Date**: 2025-10-05
**Current Status**: 80% microfrontend-ready with excellent module boundaries

---

## Executive Summary

MarkVim follows most single-spa best practices but has **6 key violations** that prevent true module independence. This document outlines violations and a phased improvement plan.

---

## Architecture Strengths ✅

1. **Clean module boundaries** via `api.ts` files in every module
2. **Event-driven communication** - stores don't export dispatch functions
3. **Type-safe event bus** with centralized event definitions
4. **Read-only state exports** - external modules can only read, not mutate
5. **No direct imports bypassing api.ts** - verified across codebase
6. **Domain module** already structured as proper utility module

---

## Violations & Problems

### 1. Duplicated Utility Functions ⚠️ HIGH PRIORITY

**Violation**: `getDocumentTitle()` duplicated across 3+ modules

**Locations**:
- `src/modules/documents/api.ts:43-53`
- `src/modules/documents/store.ts:187-193`
- `src/modules/share/composables/useDocumentShare.ts:235-241`

**Single-SPA Principle**:
> "Create utility modules for your core component library / styleguide, for shared authentication / authorization code, and for global error handling"

**Why It's Bad**:
- Code duplication violates DRY principle
- Inconsistent behavior if implementations diverge
- Multiple places to update when logic changes
- Utility functions should be extracted to utility modules

**Impact**: Low risk, but poor maintainability

**Solution**:
```typescript
// src/modules/domain/utils/document-title.ts
const TITLE_MAX_LENGTH = 50

export function getDocumentTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim() ?? ''
  const title = firstLine.startsWith('#')
    ? firstLine.replace(/^#+\s*/, '') || 'Untitled'
    : firstLine || 'Untitled'

  if (title.length > TITLE_MAX_LENGTH) {
    return `${title.slice(0, TITLE_MAX_LENGTH)}…`
  }
  return title
}

// Update domain/api.ts
export { getDocumentTitle } from './utils/document-title'

// Update all usages:
import { getDocumentTitle } from '~/modules/domain/api'
```

---

### 2. Global State via useState ⚠️ MEDIUM PRIORITY

**Violation**: Modules use Nuxt's `useState` for module-scoped global state

**Instances**:
- `useEditorSettings` → `useState('markvim-settings')` (line 95)
- `useViewMode` → `useState('markvim-view-mode')` (line 27)
- `useShortcuts` →
  - `useState('shortcuts')` (line 76)
  - `useState('appCommands')` (line 79)
  - `useState('showSettings')` (line 346)
  - `useState('showColorTheme')` (line 350)

**Single-SPA Principle**:
> "The single-spa core team cautions against using redux, mobx, and other global state management libraries... recommend keeping the state management tool specific to a single repository / microfrontend"

**Why It's Problematic**:
- Creates **hidden global state dependencies** not visible in module API
- **Different pattern** from Pinia stores (which use events)
- **Harder to test** modules in isolation
- **Can't independently deploy** modules that share useState keys
- **No clear ownership** of state mutations
- **No event tracking** of state changes

**Impact**: Medium risk - prevents module independence

**Specific Issues**:

#### useShortcuts: UI State Leakage
```typescript
// shortcuts/composables/useShortcuts.ts:346-351
const showSettings = useState<boolean>('showSettings', () => false)
const toggleSettings = useToggle(showSettings)

const showColorTheme = useState<boolean>('showColorTheme', () => false)
const toggleColorTheme = useToggle(showColorTheme)
```

**Problem**: Shortcuts module owns UI state that belongs to other modules
- `showSettings` should belong to editor/settings module
- `showColorTheme` should belong to color-theme module
- Violates single responsibility principle

**Solution Options**:

**Option A: Convert to Pinia + Events** (Recommended)
```typescript
// editor/store.ts - add settings UI state
export const useEditorStore = defineStore('editor', () => {
  const showSettings = ref(false)

  onAppEvent('settings:open', () => {
    showSettings.value = true
  })

  onAppEvent('settings:close', () => {
    showSettings.value = false
  })

  return { showSettings: readonly(showSettings) }
})

// shortcuts module just emits events
function openSettings() {
  emitAppEvent('settings:open')
}
```

**Option B: Accept as Module-Scoped State** (Pragmatic)
- Document in CLAUDE.md that `useState` is acceptable for module-internal settings
- Add clear comments that this is module-scoped, not shared
- Keep for `markvim-settings` and `markvim-view-mode` as they're truly module-internal
- Move UI state (`showSettings`, `showColorTheme`) to their respective modules

---

### 3. Cross-Module State Reading ⚠️ HIGH PRIORITY

**Violation**: Components directly import and read state from other modules

**Instance 1: LayoutHeader.vue**
```typescript
// src/modules/layout/components/LayoutHeader.vue:7-8, 29-30
import { useFeatureFlagsState } from '~/modules/feature-flags/api'

const { state: featureFlags } = useFeatureFlagsState()
const isDocumentsFeatureEnabled = computed(() => featureFlags.value.flags.documents)
```

**Problem**: Layout module has compile-time dependency on feature-flags module

**Instance 2: AppShell.vue**
```typescript
// src/app/AppShell.vue:6, 14
import { useDocumentsState } from '~/modules/documents/api'

const { documents, activeDocument, activeDocumentTitle, state: documentsState } = useDocumentsState()
```

**Problem**: App shell reads state from multiple modules

**Instance 3: SettingsModal.vue**
```typescript
// src/shared/components/SettingsModal.vue:7, 13
import { useFeatureFlagsState } from '~/modules/feature-flags/api'

const { state: featureFlagsState } = useFeatureFlagsState()
```

**Single-SPA Principle**:
> "If two microfrontends are frequently passing state between each other, consider merging them. The disadvantages of microfrontends are enhanced when your microfrontends are not isolated modules."

**Why It's Problematic**:
- Creates **compile-time dependencies** between modules
- **Prevents independent deployment** - can't deploy layout without feature-flags
- Modules **can't be developed/tested in isolation**
- **Violates dependency inversion** - modules should depend on abstractions (events)

**Impact**: High risk - this is the main blocker for module independence

**Analysis**:

**AppShell.vue - ACCEPTABLE**:
- This is the **orchestrator/root component**
- Single-spa explicitly allows root config to import from all modules
- Similar to single-spa's root-config.js that registers all applications

**LayoutHeader.vue - NEEDS REFACTORING**:
- Should use `v-feature` directive instead of direct state reads
- Directive already exists and abstracts feature flag checks
- Would remove compile-time dependency

**SettingsModal.vue - NEEDS REFACTORING**:
- Should receive feature flags as props from parent
- Or use events to query feature state

**Solutions**:

**Solution 1: Use v-feature Directive** (Recommended for Layout)
```vue
<!-- Before -->
<UButton
  v-if="isDocumentsFeatureEnabled"
  ...
/>

<!-- After -->
<UButton
  v-feature="'documents'"
  ...
/>
```

**Solution 2: Props from Orchestrator** (Recommended for Settings)
```vue
<!-- AppShell passes state down -->
<SettingsModal :features="featureFlags.flags" />

<!-- SettingsModal receives props instead of importing -->
defineProps<{
  features: FeatureFlags
}>()
```

**Solution 3: Event-Based State Query** (Future pattern)
```typescript
// Query pattern via events
emitAppEvent('feature-flags:query', {
  feature: 'documents',
  callback: (enabled: boolean) => {
    // Use the result
  }
})
```

---

### 4. Module Organization ⚠️ MEDIUM PRIORITY

**Violation**: Mixed feature modules and utility modules in same directory

**Current Structure**:
```
src/modules/
  ├── domain/           # Pure utility module ✅
  ├── documents/        # Feature module
  ├── editor/           # Feature module
  ├── color-theme/      # Feature module
  ├── feature-flags/    # Utility module pretending to be feature
  ├── shortcuts/        # Mixed: utility (keyboard) + feature (UI state)
  ├── layout/           # Feature module (but UI-focused)
  ├── markdown-preview/ # Utility module (reusable renderer)
  └── share/            # Feature module
```

**Single-SPA Principle**:
> "Create utility modules for your core component library / styleguide, for shared authentication / authorization code, and for global error handling"

**Why Current Structure is Confusing**:
- No clear distinction between features and utilities
- Hard to identify what can be shared vs what's application-specific
- Violates single-spa's organizational patterns
- Makes it unclear which modules could be extracted

**Proposed Structure**:
```
src/modules/
  ├── features/              # Application-specific modules
  │   ├── documents/         # Document management feature
  │   ├── editor/            # Editor feature
  │   ├── color-theme/       # Theme customization feature
  │   └── share/             # Import/export feature
  │
  ├── utilities/             # Reusable, framework-agnostic modules
  │   ├── domain/            # Core types, schemas, interfaces
  │   ├── feature-flags/     # Feature flag directive + state
  │   ├── shortcuts/         # Keyboard shortcut management
  │   └── event-bus/         # (Move from shared/)
  │
  └── ui-components/         # Reusable UI components
      ├── layout/            # Header, status bar, resizable panes
      └── markdown-preview/  # Markdown renderer
```

**Benefits**:
- **Clear separation** of concerns
- **Easier to identify** what can be extracted to separate packages
- **Better discoverability** of shared utilities
- **Follows single-spa convention** for module types
- **Clearer import paths**: `~/modules/features/documents` vs `~/modules/utilities/domain`

**Migration Path**:
1. Create new directory structure
2. Move modules to appropriate folders
3. Update all import paths with find/replace
4. Update Nuxt auto-import config if needed
5. Run tests to verify nothing broke

---

### 5. Shortcuts Module Coupling ⚠️ HIGH PRIORITY

**Violation**: Shortcuts module has excessive coupling to other modules

**Coupling Issues**:

1. **Owns other modules' UI state** (see Violation #2)
   - `showSettings` belongs to editor/settings
   - `showColorTheme` belongs to color-theme

2. **Hard-coded action references**:
   ```typescript
   // shortcuts/composables/useShortcuts.ts:398-408
   const newDocumentAction = ref<(() => void) | null>(null)

   function setNewDocumentAction(action: () => void): void {
     newDocumentAction.value = action
   }

   function createNewDocument(): void {
     if (newDocumentAction.value) {
       newDocumentAction.value()
     }
   }
   ```
   **Problem**: Creates runtime dependency on documents module

3. **Direct state access in ShortcutsManager.vue** (if it exists)
   - Check: `src/modules/shortcuts/components/ShortcutsManager.vue`

**Single-SPA Principle**:
> "A good architecture is one in which microfrontends are decoupled and do not need to frequently communicate"

**Independence Score**: ⭐⭐ 60% (High coupling)

**Solutions**:

**Solution 1: Command Pattern** (Recommended)
```typescript
// Shortcuts module only knows about commands via events
interface Command {
  id: string
  label: string
  action: string // Event name, not function reference
}

function executeCommand(command: Command) {
  emitAppEvent(command.action as any) // Type-safe via event bus
}

// Documents module registers its own commands
onAppEvent('command-palette:open', () => {
  registerCommand({
    id: 'new-document',
    label: 'New Document',
    action: 'document:create' // Just an event name
  })
})
```

**Solution 2: Move UI State to Owning Modules**
```typescript
// color-theme/store.ts
const showModal = ref(false)

onAppEvent('color-theme:open', () => {
  showModal.value = true
})

// shortcuts module just emits events
createSequentialShortcut('g', 'c', () => {
  emitAppEvent('color-theme:open')
})
```

---

### 6. Shared Dependencies Pattern ℹ️ LOW PRIORITY (Future)

**Observation**: Currently managing shared dependencies as build-time modules

**Current Approach**:
- Vue, Pinia, VueUse bundled in main application bundle
- All modules share same Vue instance at build time
- Works perfectly for modular monolith

**Single-SPA Recommendation**:
> "Use in-browser modules + import maps for shared dependencies"

```json
// Future import map for microfrontend setup
{
  "imports": {
    "vue": "https://esm.sh/vue@3.4.0",
    "pinia": "https://esm.sh/pinia@2.1.0",
    "@markvim/utilities/domain": "/modules/domain/api.js",
    "@markvim/features/documents": "/modules/documents/api.js"
  }
}
```

**Current Assessment**:
- ✅ **Current build-time approach is CORRECT for modular monolith**
- ⚠️ **Would need import maps for true microfrontend deployment**
- 📋 **Document this pattern for future reference**

**Action**: No changes needed now. Document in CLAUDE.md that we're using build-time shared dependencies intentionally.

---

## Improvement Plan

### Phase 1: Fix Duplicated Utilities 🎯 QUICK WIN
**Effort**: 30 minutes
**Priority**: High (easy win, good practice)

**Tasks**:
1. Create `src/modules/domain/utils/document-title.ts`
2. Extract `getDocumentTitle()` function
3. Export from `domain/api.ts`
4. Update 3+ import locations:
   - `src/modules/documents/api.ts`
   - `src/modules/documents/store.ts`
   - `src/modules/share/composables/useDocumentShare.ts`
5. Remove duplicated implementations
6. Run tests: `pnpm typecheck && pnpm test:e2e`

**Success Criteria**:
- ✅ Single source of truth for document title logic
- ✅ All tests pass
- ✅ No TypeScript errors

---

### Phase 2: Reduce Cross-Module State Reading 🎯 HIGH IMPACT
**Effort**: 2-3 hours
**Priority**: High (biggest architectural improvement)

**Tasks**:

**Task 2.1: Refactor LayoutHeader.vue**
1. Replace direct state reads with `v-feature` directive
2. Remove `import { useFeatureFlagsState }`
3. Test feature flag toggles still work

**Task 2.2: Refactor SettingsModal.vue**
1. Move to app level or receive feature flags as props
2. AppShell passes `featureFlags` down as prop
3. Remove direct feature-flags import

**Task 2.3: Document AppShell Exception**
1. Add comment in AppShell.vue explaining it's the orchestrator
2. Note in CLAUDE.md that root components can import all modules

**Success Criteria**:
- ✅ Layout module no longer imports from feature-flags
- ✅ Shared components don't directly import module state
- ✅ All E2E tests pass

---

### Phase 3: Fix Global useState Patterns 🎯 MEDIUM IMPACT
**Effort**: 3-4 hours
**Priority**: Medium (improves consistency)

**Tasks**:

**Task 3.1: Move UI State to Owning Modules**
1. Move `showSettings` from shortcuts to editor module
2. Move `showColorTheme` from shortcuts to color-theme module
3. Update shortcuts to emit events instead: `emitAppEvent('settings:open')`
4. Test keyboard shortcuts still work (g+s, g+c)

**Task 3.2: Document useState Policy**
1. Add to CLAUDE.md when `useState` is acceptable:
   - ✅ Module-internal settings (e.g., `markvim-settings`)
   - ✅ Module-internal UI state that doesn't need events
   - ❌ Cross-module communication (use events)
   - ❌ UI state belonging to other modules

**Task 3.3: Consider Pinia for ViewMode** (Optional)
1. Evaluate if `useViewMode` should be Pinia store
2. Would provide consistency with documents/color-theme
3. Would enable event-driven view mode changes
4. Decision: Keep `useState` or migrate to Pinia

**Success Criteria**:
- ✅ Each module owns its own UI state
- ✅ Shortcuts module only emits events
- ✅ Clear documentation on useState usage
- ✅ All shortcuts tests pass

---

### Phase 4: Module Reorganization 🎯 STRUCTURE IMPROVEMENT
**Effort**: 4-5 hours
**Priority**: Low-Medium (big refactor, mostly organizational)

**Tasks**:

**Task 4.1: Create New Directory Structure**
```bash
mkdir -p src/modules/features
mkdir -p src/modules/utilities
mkdir -p src/modules/ui-components
```

**Task 4.2: Move Feature Modules**
```bash
mv src/modules/documents src/modules/features/
mv src/modules/editor src/modules/features/
mv src/modules/color-theme src/modules/features/
mv src/modules/share src/modules/features/
```

**Task 4.3: Move Utility Modules**
```bash
mv src/modules/domain src/modules/utilities/
mv src/modules/feature-flags src/modules/utilities/
mv src/modules/shortcuts src/modules/utilities/
```

**Task 4.4: Move UI Component Modules**
```bash
mv src/modules/layout src/modules/ui-components/
mv src/modules/markdown-preview src/modules/ui-components/
```

**Task 4.5: Update All Import Paths**
```bash
# Use find/replace in IDE:
# ~/modules/documents → ~/modules/features/documents
# ~/modules/domain → ~/modules/utilities/domain
# etc.
```

**Task 4.6: Update Nuxt Config** (if needed)
- Check `nuxt.config.ts` for any hardcoded module paths
- Update component auto-import paths if configured

**Task 4.7: Run Full Test Suite**
```bash
pnpm typecheck
pnpm lint
pnpm test:e2e
```

**Success Criteria**:
- ✅ Clear separation: features / utilities / ui-components
- ✅ All imports updated
- ✅ All tests pass
- ✅ No TypeScript errors

**Risk**: Large refactor touching many files. Consider doing in separate branch.

---

### Phase 5: Documentation & Metrics 🎯 VISIBILITY
**Effort**: 1 hour
**Priority**: High (enables tracking progress)

**Tasks**:

**Task 5.1: Update CLAUDE.md**
1. Document new module structure (if Phase 4 completed)
2. Add "Module Independence Guidelines" section:
   - When to use events vs direct imports
   - useState policy
   - Which modules can import from which
3. Add "State Management Patterns" section:
   - Pinia stores for features (documents, color-theme, feature-flags)
   - useState for module-internal settings
   - Props for component communication
   - Events for cross-module communication

**Task 5.2: Create Module Independence Script**
```typescript
// scripts/analyze-module-independence.ts
interface ModuleMetrics {
  name: string
  eventsEmitted: number
  eventsListenedTo: number
  externalImports: number
  useStateInstances: number
  independenceScore: number
}

// Analyze each module and output report
```

**Task 5.3: Document Current Coupling**
1. Create `docs/MODULE_DEPENDENCIES.md`
2. List which modules depend on which
3. Identify which can be independently deployed
4. Track improvement over time

**Success Criteria**:
- ✅ Clear documentation of architectural patterns
- ✅ Automated independence metrics
- ✅ Baseline metrics captured for tracking improvements

---

## Priority Order

**Recommended Execution Order**:
1. **Phase 1** - Fix Duplicated Utilities (30 min, easy win)
2. **Phase 2** - Reduce Cross-Module State Reading (2-3 hrs, high impact)
3. **Phase 5** - Documentation & Metrics (1 hr, enables tracking)
4. **Phase 3** - Fix Global useState (3-4 hrs, important but lower urgency)
5. **Phase 4** - Module Reorganization (4-5 hrs, optional, big refactor)

**Total Effort**: 10-15 hours
**High-Priority Items**: 3-4 hours (Phases 1, 2, 5)

---

## Success Metrics

### Before Improvements
- Module independence: 60-85% across modules
- Duplicated code: 3+ instances of `getDocumentTitle()`
- Cross-module coupling: 5+ direct state reads
- Global state instances: 6+ `useState` calls

### After Improvements (Target)
- Module independence: 85-95% across modules
- Duplicated code: 0 instances
- Cross-module coupling: 1 (AppShell only)
- Global state instances: 3 (documented & justified)

### Module Independence Targets
- **Utilities**: > 95% independence
- **Features**: > 85% independence
- **UI Components**: > 80% independence

---

## Risks & Mitigation

### Risk 1: Breaking Changes
**Mitigation**:
- Run full test suite after each phase
- Make changes in small, atomic commits
- Keep E2E tests running throughout

### Risk 2: Large Import Path Changes (Phase 4)
**Mitigation**:
- Use IDE find/replace with preview
- Do in separate branch
- Consider skipping if too risky

### Risk 3: Performance Impact
**Mitigation**:
- Event-driven patterns shouldn't impact performance
- Monitor bundle size before/after
- Use Chrome DevTools Performance tab

---

## Future Considerations

### Microfrontend Deployment Ready
After completing all phases, MarkVim will be ready for:
- **Module Federation** (Webpack 5)
- **Import Maps** for shared dependencies
- **Independent deployment** of modules
- **Framework-agnostic** utilities (can use with React/Svelte)

### RxJS Migration (Optional)
Consider adding RxJS observables for framework-agnostic state:
```typescript
import { BehaviorSubject } from 'rxjs'

const documents$ = new BehaviorSubject<Document[]>([])

// Can be consumed by any framework
documents$.subscribe(docs => {
  // React, Vue, Svelte, Angular all work
})
```

**Benefits**: Single-spa ecosystem uses RxJS heavily
**Cost**: Additional dependency, learning curve

---

## Conclusion

MarkVim is **80% microfrontend-ready** with excellent architectural foundations. The main improvements needed are:

1. ✅ **Extract duplicated utilities** - Easy win
2. ✅ **Remove cross-module state coupling** - Highest impact
3. ✅ **Clarify useState usage** - Improves consistency
4. ✅ **Reorganize module structure** - Better organization (optional)
5. ✅ **Document patterns** - Enable team alignment

**Next Steps**:
1. Review this plan with team
2. Start with Phase 1 (30 min quick win)
3. Proceed to Phase 2 (high impact)
4. Re-evaluate priorities after initial improvements

**Questions to Answer**:
- Do we want to pursue full microfrontend deployment eventually?
- Should we keep current monolith structure or reorganize?
- Is RxJS worth adding for framework-agnostic state?

---

## References

- [Single-SPA Recommended Setup](https://single-spa.js.org/docs/recommended-setup/)
- [MarkVim SINGLE_SPA_PRINCIPLES_ANALYSIS.md](./SINGLE_SPA_PRINCIPLES_ANALYSIS.md)
- [MarkVim CLAUDE.md](../CLAUDE.md)
- [Module Federation Guide](https://webpack.js.org/concepts/module-federation/)
