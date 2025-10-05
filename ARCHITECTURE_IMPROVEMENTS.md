# MarkVim Architecture Improvement Plan

**Status**: Draft
**Date**: 2025-10-05
**Current Independence Score**: 92.7% (Excellent)
**Microfrontend Readiness**: 100%

---

## Executive Summary

MarkVim has achieved **92.7% average module independence**, indicating strong architectural foundations. However, analysis reveals critical inefficiencies:

- **95% of public API exports are unused** (29/32 exports across all modules)
- **26.7% shared code bloat** (1202 LOC in `~/shared`)
- **Facade pattern inconsistently applied** (direct store access still exists)
- **Event system still in use** despite facade-first architecture
- **Cross-module type coupling** reduces true independence

This document outlines a **phased improvement strategy** to achieve:
1. **98%+ module independence** (microfrontend-grade isolation)
2. **<15% shared surface area** (reduced coupling)
3. **100% facade-based communication** (no direct store access, minimal events)
4. **Zero unused exports** (clean API boundaries)

---

## Phase 1: API Surface Cleanup (Impact: High, Effort: Low)

### Problem: Dead Code in Public APIs

**Current State:**
```
Module              Total Exports    Used Externally    Waste
shortcuts           7                1 (14%)            86%
share               6                0 (0%)             100%
documents           9                2 (22%)            78%
markdown-preview    3                0 (0%)             100%
color-theme         7                0 (0%)             100%
editor              5                1 (20%)            80%
────────────────────────────────────────────────────────────
TOTAL               32               4 (12.5%)          87.5%
```

**Root Cause Analysis:**

1. **Components exported in `api.ts` but only used within module**
   - `ColorThemeModal`, `ShareDialog`, `DocumentList` are module-internal UI
   - Should NOT be in public API (violates encapsulation)

2. **Composables exported but wrapped by facade functions**
   - `useMarkdown`, `useMermaid`, `useVimMode` exposed unnecessarily
   - Consumers should use facade, not internal composables

3. **Type definitions exported but unused**
   - `ColorThemeEvents`, `DocumentsEvents`, `ShareButton` types have no external consumers

4. **Store internals leaking**
   - Some modules export store actions directly instead of through facade

**Action Plan:**

### 1.1 Audit Public APIs (1-2 hours)

Run comprehensive unused export detection:

```bash
# Step 1: Generate full unused exports report
pnpm knip:exports > reports/unused-exports-$(date +%Y%m%d).txt

# Step 2: Categorize by severity
# - Components: Should almost NEVER be in api.ts
# - Composables: Only if genuinely reusable across modules
# - Types: Only if used in public API signatures
# - Store/events: NEVER expose stores, minimal event types
```

### 1.2 Define Public API Criteria

**What SHOULD be in `api.ts`:**

✅ **Facade Functions** - Primary entry points for module functionality
```typescript
// ✅ Good: Main facade composable
export function useDocuments() { ... }
export function useColorTheme() { ... }
```

✅ **Types Used in Public Signatures** - Only types needed by consumers
```typescript
// ✅ Good: Return types for public APIs
export type { Document, DocumentMetadata }
export type { ColorTheme, OklchColor }
```

✅ **Shared Utilities** - Pure functions genuinely reused across modules
```typescript
// ✅ Good: Reusable helpers
export { formatDocumentDate } from './utils/formatting'
export { validateColorValue } from './utils/validation'
```

**What should NOT be in `api.ts`:**

❌ **Components** - Internal UI implementation details
```typescript
// ❌ Bad: Components are module-internal
export { DocumentList } from './components/DocumentList.vue'
export { ColorThemeModal } from './components/ColorThemeModal.vue'
```

❌ **Internal Composables** - Implementation details wrapped by facade
```typescript
// ❌ Bad: Internal composables exposed
export { useMarkdownParser } from './composables/useMarkdownParser'
export { useVimMode } from './composables/useVimMode'
```

❌ **Stores** - Should NEVER be public
```typescript
// ❌ Bad: Store should be facade-internal only
export { useDocumentsStore } from './store'
```

❌ **Event Types** - Events should be replaced by facade calls
```typescript
// ❌ Bad: Events indicate architectural smell
export type { DocumentsEvents, ColorThemeEvents }
```

### 1.3 Refactor Each Module API (4-6 hours)

**Template for minimal module API:**

```typescript
// modules/[module]/api.ts

// ═══════════════════════════════════════════════════════════
// PUBLIC TYPES (only types used in public signatures below)
// ═══════════════════════════════════════════════════════════

export type { Document, DocumentMetadata } from './types'

// ═══════════════════════════════════════════════════════════
// PUBLIC FACADE (single entry point for all functionality)
// ═══════════════════════════════════════════════════════════

export function useDocuments() {
  const store = useDocumentsStore() // Internal only
  const { documents, activeDocument } = storeToRefs(store)

  return {
    // Readonly state
    documents: readonly(documents),
    activeDocument: readonly(activeDocument),

    // Actions (only essential operations)
    create: (content?: string) => store.dispatch({ type: 'CREATE', payload: { content } }),
    select: (id: string) => store.dispatch({ type: 'SELECT', payload: { id } }),
    update: (id: string, content: string) => store.dispatch({ type: 'UPDATE', payload: { id, content } }),
    delete: (id: string) => store.dispatch({ type: 'DELETE', payload: { id } }),

    // Helper methods (if genuinely needed externally)
    getTitle: store.getDocumentTitle,
  }
}

// ═══════════════════════════════════════════════════════════
// PUBLIC UTILITIES (only if genuinely reused across modules)
// ═══════════════════════════════════════════════════════════

// Usually NONE - most utils should be module-internal
```

**Expected Outcome:**
- **shortcuts**: 7 exports → 1-2 exports (facade + types)
- **share**: 6 exports → 1 export (facade only)
- **documents**: 9 exports → 2-3 exports (facade + types)
- **markdown-preview**: 3 exports → 1-2 exports (facade + types)
- **color-theme**: 7 exports → 1-2 exports (facade + types)
- **editor**: 5 exports → 1-2 exports (facade + types)

**Result**: ~90% reduction in API surface (32 → 6-12 exports)

---

## Phase 2: Eliminate Cross-Module Type Coupling (Impact: High, Effort: Medium)

### Problem: Tight Coupling Through Type Imports

**Current State:**
```
shortcuts → documents.getDocumentTitle, documents.useDocuments, editor.useEditorSettings
share     → documents.useDocuments, documents.getDocumentTitle
color-theme → shortcuts.useShortcuts
```

**Why This Matters:**

1. **Prevents true module independence** - Can't deploy/update modules separately
2. **Creates circular dependency risk** - Type imports can become circular
3. **Reduces testability** - Harder to mock/stub dependencies
4. **Complicates microfrontend migration** - Runtime coupling through types

**Root Cause:**

Modules import **concrete types from other modules** instead of using **dependency inversion** (interfaces/contracts).

### Solution: Contract-Based Communication

**Pattern 1: Define Contracts in Shared**

```typescript
// ~/shared/contracts/document.ts
export interface DocumentProvider {
  getDocumentTitle(id: string): string
  getCurrentDocument(): Document | null
  listDocuments(): Document[]
}

export interface Document {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}
```

**Pattern 2: Modules Implement Contracts**

```typescript
// modules/documents/api.ts
import type { DocumentProvider, Document } from '~/shared/contracts/document'

export function useDocuments(): DocumentProvider {
  const store = useDocumentsStore()

  return {
    getDocumentTitle: (id: string) => store.getDocumentTitle(id),
    getCurrentDocument: () => store.activeDocument,
    listDocuments: () => store.documents,

    // Module-specific methods NOT in contract
    create: (content?: string) => store.dispatch({ type: 'CREATE', payload: { content } }),
    delete: (id: string) => store.dispatch({ type: 'DELETE', payload: { id } }),
  }
}
```

**Pattern 3: Consumers Use Contracts**

```typescript
// modules/shortcuts/composables/useDocumentShortcuts.ts
import type { DocumentProvider } from '~/shared/contracts/document'
import { useDocuments } from '~/modules/documents/api'

export function useDocumentShortcuts() {
  // ✅ Type as interface, implement as concrete
  const docs: DocumentProvider = useDocuments()

  return {
    newDocument: () => {
      // Can only use contract methods
      const title = docs.getDocumentTitle(docs.getCurrentDocument()?.id ?? '')
    }
  }
}
```

**Benefits:**

1. **Compile-time decoupling** - Shortcuts module doesn't know about documents internals
2. **Testability** - Easy to mock `DocumentProvider` interface
3. **Refactorability** - Documents module can change internals freely
4. **Microfrontend-ready** - Contracts can be shared across microfrontends

**Action Plan:**

### 2.1 Extract Current Cross-Module Contracts (2-3 hours)

Analyze current type usage and create contracts:

```bash
# Identify cross-module type imports
rg "import.*from '~/modules/" src/modules --type ts -A 2 -B 2
```

Create contracts for:
- **DocumentProvider** (used by shortcuts, share)
- **EditorProvider** (used by shortcuts)
- **ShortcutsProvider** (used by color-theme)

### 2.2 Implement Contract-Based Architecture (4-6 hours)

1. Create `~/shared/contracts/` directory
2. Define minimal contracts for cross-module communication
3. Update module facades to implement contracts
4. Update consumers to type dependencies as contracts
5. Verify with `pnpm depcruise` that coupling is reduced

### 2.3 Update Architecture Fitness Function (1 hour)

Add dependency-cruiser rules to enforce contract usage:

```javascript
// .dependency-cruiser.cjs
{
  name: 'no-cross-module-types',
  severity: 'error',
  from: { path: '^src/modules/([^/]+)' },
  to: {
    path: '^src/modules/([^/]+)',
    pathNot: '^src/modules/$1' // Not same module
  },
  comment: 'Use ~/shared/contracts instead of importing types from other modules'
}
```

**Expected Outcome:**
- Cross-module type dependencies: **6 → 0**
- New shared contracts: **~3 files, ~100 LOC**
- Independence scores: **92.7% → 96%+**

---

## Phase 3: Shared Surface Area Reduction (Impact: Medium, Effort: High)

### Problem: 26.7% Shared Code Bloat

**Current State:**
```
Shared Area         Files    LOC     Bloat Analysis
composables         5        598     49.8% of shared (!)
utils               4        179     14.9%
components          9        157     13.1%
store               1        89      7.4%
services            1        49      4.1%
directives          1        45      3.7%
───────────────────────────────────────────────────
TOTAL               30       1202    26.7% of codebase
```

**Analysis:**

### 3.1 Composables (598 LOC) - Largest Bloat Source

**Hypothesis**: Some composables are only used by 1-2 modules and should be moved.

**Action**:
```bash
# Find usage of each shared composable
for file in src/shared/composables/*.ts; do
  name=$(basename "$file" .ts)
  echo "=== $name ==="
  rg "import.*$name" src/modules --type ts
done
```

**Decision Tree**:
- **Used by 3+ modules** → Keep in shared
- **Used by 1-2 modules** → Move to larger module or create utility module
- **Used by 0 modules** → Delete (dead code)

**Expected**:
- 598 LOC → ~300 LOC (50% reduction)
- Move module-specific composables to their modules

### 3.2 Components (157 LOC, 9 files) - UI Reuse

**Analysis**:
- Should be **truly generic** components (Button, Modal, Input wrappers)
- If component has business logic → move to feature module

**Action**:
```bash
# Check component usage
rg "import.*from '~/shared/components" src/modules --type vue -type ts
```

**Criteria for shared components**:
1. Used by 3+ modules
2. Zero business logic (presentation only)
3. Generic/reusable across domains

**Expected**:
- 9 components → ~4-5 components (keep only truly generic)

### 3.3 Utils (179 LOC) - Pure Functions

**Most likely candidates to stay in shared** (utils should be pure, reusable).

**Action**:
- Audit for single-use utils
- Consider grouping by domain (color utils, document utils, etc.)
- Move domain-specific utils to modules

### 3.4 Store/Services/Directives (183 LOC)

**Questions**:
1. **Store (89 LOC)** - What shared store exists? Should it be in a module?
2. **Services (49 LOC)** - What services? Could they be module-specific?
3. **Directives (45 LOC)** - Used by how many modules?

**Action Plan:**

### 3.5 Create Shared Audit Report (2-3 hours)

```bash
# Generate usage matrix for all shared code
pnpm analyze:modules:json > reports/module-analysis.json

# Manual audit: For each shared file, document:
# - Which modules use it (0, 1, 2, 3+)
# - Is it truly generic or domain-specific?
# - Decision: Keep, Move, Delete
```

### 3.6 Refactor Shared → Modules (6-10 hours)

**Phase 3a**: Move module-specific code
- Composables used by 1 module → move to that module
- Components with business logic → move to owning module

**Phase 3b**: Delete dead code
- Unused exports (from Phase 1)
- Unused shared utilities

**Phase 3c**: Consolidate remaining shared
- Group by category (UI, utils, contracts)
- Clear naming conventions

**Expected Outcome:**
- Shared LOC: **1202 → ~600** (50% reduction)
- Bloat ratio: **26.7% → ~13%**
- Independence scores: **96% → 98%+**

---

## Phase 4: Event System Elimination (Impact: Medium, Effort: Medium)

### Problem: Events Used Despite Facade Architecture

**Current State:**
```
Module       Events Emitted    Events Listened
shortcuts    2                 2
documents    1                 1
```

**Why Events Are Anti-Pattern Here:**

1. **Indirection** - Harder to trace than direct calls
2. **Type safety** - Events lose TypeScript guarantees
3. **Tight coupling** - Implicit dependencies hidden from type system
4. **Testing complexity** - Requires event bus mocking

**When Events Are OK:**

✅ **UI coordination** - Modal open/close, notifications
✅ **Logging/analytics** - Non-critical side effects
✅ **Pub-sub patterns** - Truly decoupled domains

**When Events Are Wrong:**

❌ **State mutations** - Use facade actions
❌ **Data flow** - Use facade getters
❌ **Module-to-module calls** - Use facade methods

### Action Plan:

### 4.1 Audit Current Event Usage (1 hour)

```bash
# Find all event emissions
rg "emitAppEvent|emit\(" src/modules --type ts --type vue

# Find all event listeners
rg "onAppEvent|on\(" src/modules --type ts --type vue
```

For each event:
1. What triggers it?
2. Who listens?
3. What action does listener take?
4. **Can this be a direct facade call?**

### 4.2 Replace State Mutation Events (3-4 hours)

**Before (event-based)**:
```typescript
// modules/shortcuts/components/CommandPalette.vue
import { emitAppEvent } from '~/shared/utils/eventBus'

function createNewDocument() {
  emitAppEvent('document:create')
}
```

**After (facade-based)**:
```typescript
// modules/shortcuts/components/CommandPalette.vue
import { useDocuments } from '~/modules/documents/api'

const { create } = useDocuments()

function createNewDocument() {
  create() // Direct, type-safe, traceable
}
```

### 4.3 Retain Only UI Coordination Events (1-2 hours)

**Acceptable event usage**:
```typescript
// OK: Modal coordination (UI-only)
emitAppEvent('modal:open', { type: 'delete-confirmation', documentId })

// OK: Notifications (non-critical side effect)
emitAppEvent('notification:show', { message: 'Document saved', type: 'success' })

// OK: Analytics (logging)
emitAppEvent('analytics:track', { event: 'document_created' })
```

**Expected Outcome:**
- State mutation events: **6 → 0**
- UI coordination events: **0 → ~2-3** (intentional, documented)
- Event types exported from `api.ts`: **All removed**

---

## Phase 5: Architecture Fitness Function Enhancement (Impact: Low, Effort: Low)

### Current State

Dependency Cruiser enforces:
1. Module boundaries (api.ts facade)
2. No cross-module imports
3. Shared code boundaries
4. No circular dependencies
5. Layer architecture

### Enhancements

### 5.1 Add Contract Enforcement (30 min)

```javascript
// .dependency-cruiser.cjs
{
  name: 'use-contracts-not-modules',
  severity: 'error',
  from: { path: '^src/modules/([^/]+)' },
  to: {
    path: '^src/modules/(?!$1)',
    pathNot: '^src/shared/contracts'
  },
  comment: 'Cross-module dependencies must use ~/shared/contracts'
}
```

### 5.2 Add Shared Bloat Detection (30 min)

```javascript
// scripts/check-shared-bloat.ts
const MAX_SHARED_PERCENTAGE = 15
const MAX_SHARED_LOC = 700

// Fail CI if shared code exceeds thresholds
```

### 5.3 Add API Export Validation (30 min)

```javascript
// scripts/check-api-exports.ts
// Fail if any module has >5 exports in api.ts
// Exceptions documented in config
```

### 5.4 Update CI Pipeline (15 min)

```yaml
# .github/workflows/ci.yml
- name: Architecture Fitness Functions
  run: |
    pnpm depcruise:ci          # Module boundaries
    pnpm knip:exports          # Unused exports (fail on any)
    pnpm analyze:modules:ci    # Independence score (fail <95%)
```

**Expected Outcome:**
- Automated enforcement of all architectural principles
- Prevent regression during future development

---

## Phase 6: Module Structure Optimization (Impact: Low, Effort: Medium)

### Analysis: Are Current Modules Optimal?

**Current Modules (6)**:
1. `shortcuts` (82.4%)
2. `share` (88.7%)
3. `documents` (91.1%)
4. `markdown-preview` (94.2%)
5. `color-theme` (100%)
6. `editor` (100%)

**Questions**:

### 6.1 Should `shortcuts` Be a Module?

**Current**: Orchestrates other modules (documents, editor)
**Concern**: Heavy cross-module dependencies (lowest independence score)

**Options**:
1. **Keep as module** - If shortcuts will grow significantly
2. **Move to app layer** - If it's primarily UI orchestration
3. **Split** - Command palette + keyboard shortcuts separate?

**Recommendation**: Keep as module IF we add more commands. Otherwise, consider app-level.

### 6.2 Should `share` Be a Module?

**Current**: 88.7% independence, 100% unused exports, depends only on documents
**Concern**: Small surface area (532 LOC, 6 files)

**Options**:
1. **Keep as module** - If sharing will expand (multi-format export, cloud sync, etc.)
2. **Merge into documents** - If it's document-specific functionality
3. **Move to app layer** - If it's UI-only

**Recommendation**: Keep as module if roadmap includes expanded sharing features.

### 6.3 Is Anything Missing?

**Potential Module Candidates**:

1. **Feature Flags Module** - Currently in `~/shared/feature-flags/`
   - Has its own store
   - 89 LOC
   - Could be promoted to `modules/feature-flags`

2. **Settings/Preferences Module** - If editor settings, theme settings, etc. need consolidation
   - Currently scattered across modules
   - Could centralize user preferences

3. **Persistence Module** - If localStorage logic grows
   - Currently in composables
   - Could handle sync, cloud backup, etc.

**Action**: Evaluate during roadmap planning. Don't split prematurely.

---

## Implementation Roadmap

### Sprint 1 (Week 1): Quick Wins
- **Day 1-2**: Phase 1 - API Surface Cleanup
  - Run `pnpm knip:exports`
  - Remove unused exports from all `api.ts` files
  - Update CLAUDE.md with API criteria
- **Day 3-4**: Phase 4 - Event System Elimination
  - Audit event usage
  - Replace state mutation events with facade calls
  - Document remaining UI events
- **Day 5**: Phase 5 - Architecture Fitness Enhancement
  - Add CI checks for unused exports
  - Add shared bloat detection

**Outcome**: 87.5% reduction in API bloat, zero state mutation events, automated checks

### Sprint 2 (Week 2): Contract Architecture
- **Day 1-2**: Phase 2.1 - Extract Contracts
  - Create `~/shared/contracts/`
  - Define DocumentProvider, EditorProvider, ShortcutsProvider
- **Day 3-4**: Phase 2.2 - Implement Contracts
  - Update module facades to implement contracts
  - Update consumers to use contract types
- **Day 5**: Phase 2.3 - Enforce Contracts
  - Add dependency-cruiser rules
  - Verify independence score improvement

**Outcome**: Zero cross-module type coupling, 96%+ independence

### Sprint 3 (Week 3): Shared Surface Reduction
- **Day 1-2**: Phase 3.5 - Shared Audit
  - Generate usage matrix for all shared code
  - Categorize: Keep, Move, Delete
- **Day 3-5**: Phase 3.6 - Refactor Shared
  - Move module-specific code
  - Delete dead code
  - Consolidate remaining shared

**Outcome**: 50% reduction in shared code, ~13% bloat ratio, 98%+ independence

### Sprint 4 (Week 4): Validation & Documentation
- **Day 1-2**: Phase 6 - Module Structure Review
  - Evaluate current module boundaries
  - Consider feature flags promotion
  - Document module decisions
- **Day 3-4**: Comprehensive Testing
  - Run full E2E suite
  - Verify all architecture fitness functions pass
  - Performance benchmarks
- **Day 5**: Documentation Update
  - Update CLAUDE.md with new patterns
  - Create ADRs (Architecture Decision Records)
  - Team training/handoff

**Outcome**: Validated architecture, comprehensive documentation

---

## Success Metrics

### Before → After Targets

| Metric                        | Current | Target | Improvement |
|-------------------------------|---------|--------|-------------|
| Average Independence Score    | 92.7%   | 98%+   | +5.7%       |
| Unused API Exports            | 87.5%   | 0%     | -87.5%      |
| Shared Code Bloat Ratio       | 26.7%   | <15%   | -44%        |
| Cross-Module Type Dependencies| 6       | 0      | -100%       |
| State Mutation Events         | 6       | 0      | -100%       |
| Shared LOC                    | 1202    | <700   | -42%        |

### Architectural Quality Gates (CI)

```yaml
✓ Independence Score ≥ 95% for all modules
✓ No unused exports in api.ts
✓ Shared code ≤ 15% of codebase
✓ Zero cross-module type imports (contracts only)
✓ Zero state mutation events
✓ All dependency rules pass
✓ All E2E tests pass
✓ Type checking clean
✓ Linting clean
```

---

## Long-Term Vision: True Microfrontend Architecture

### Current State: Modular Monolith
- Modules deployed together
- Shared runtime
- Single build process

### Future State: Independently Deployable Microfrontends

**After Phase 1-5 completion**, MarkVim will be ready for:

1. **Module Federation** (Webpack 5 / Vite)
   - Each module builds independently
   - Shared dependencies versioned
   - Runtime composition

2. **Separate Deployment**
   - Update documents module without redeploying editor
   - A/B test new markdown-preview versions
   - Canary releases per module

3. **Team Autonomy**
   - Separate repos per module (if desired)
   - Independent release cycles
   - Isolated testing

4. **Performance Optimization**
   - Lazy load modules on demand
   - Preload critical modules (editor, documents)
   - Defer non-critical modules (share, color-theme)

### Microfrontend Migration Steps (Future)

**Prerequisites** (this improvement plan):
- ✅ 95%+ independence scores
- ✅ Contract-based communication
- ✅ Zero cross-module type imports
- ✅ Minimal shared surface area

**Migration**:
1. **Module → Package** - Convert each module to npm package
2. **Shared → Contracts Package** - `@markvim/contracts` shared package
3. **Module Federation** - Webpack/Vite federation config
4. **Deploy Infrastructure** - CDN per module, version management
5. **Orchestration Layer** - App shell coordinates module loading

**Benefits**:
- **Deploy speed** - Update one module in seconds
- **Team scaling** - Teams own modules end-to-end
- **Innovation** - Experiment with module rewrites (Vue → React, etc.)
- **Resilience** - Module failures don't crash app

---

## Risks & Mitigations

### Risk 1: Over-Engineering
**Concern**: Premature abstraction, complexity overhead
**Mitigation**:
- Follow YAGNI (You Aren't Gonna Need It)
- Only create contracts when 3+ modules need them
- Keep facades simple (don't add features "just in case")

### Risk 2: Breaking Changes
**Concern**: Refactoring breaks existing functionality
**Mitigation**:
- Comprehensive E2E test coverage (currently 39 scenarios)
- Run `pnpm test:e2e` after each phase
- Incremental rollout (one module at a time)
- Feature flag rollbacks if needed

### Risk 3: Team Adoption
**Concern**: New patterns not followed consistently
**Mitigation**:
- Update CLAUDE.md with clear examples
- Architecture Decision Records (ADRs) for major choices
- CI enforcement (fail builds on violations)
- Code review checklist

### Risk 4: Performance Regression
**Concern**: Abstraction layers add overhead
**Mitigation**:
- Benchmark before/after each phase
- Monitor bundle sizes (`pnpm analyze:modules`)
- Profile runtime performance (Chrome DevTools)
- Target: <5% performance variance

---

## Appendix A: Architecture Decision Records (ADRs)

### ADR-001: Facade Pattern for Module Communication
**Status**: Accepted
**Decision**: All modules expose single composable facade in `api.ts`
**Rationale**: Type-safe, traceable, testable, refactorable
**Consequences**: Direct imports prohibited, contracts required for cross-module

### ADR-002: Contract-Based Cross-Module Dependencies
**Status**: Proposed (Phase 2)
**Decision**: Cross-module dependencies typed as `~/shared/contracts` interfaces
**Rationale**: Decouple implementations, enable independent deployment
**Consequences**: Additional abstraction layer, contract versioning needed

### ADR-003: Events Only for UI Coordination
**Status**: Proposed (Phase 4)
**Decision**: State mutations via facades, events only for non-critical UI
**Rationale**: Type safety, traceability, reduced coupling
**Consequences**: Event bus still exists but minimal usage

### ADR-004: Minimal Shared Surface Area
**Status**: Proposed (Phase 3)
**Decision**: Shared code <15% of codebase, used by 3+ modules
**Rationale**: Reduce coupling, improve module independence
**Consequences**: Code duplication acceptable for true module isolation

---

## Appendix B: Reference Architecture

```
MarkVim Architecture (Post-Improvement)

┌─────────────────────────────────────────────────────────┐
│  App Layer (Nuxt App)                                   │
│  - Pages, layouts, app-level orchestration              │
│  - Depends on module facades only                       │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Feature Modules (Independently Deployable)             │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  documents   │  │  editor      │  │ color-theme  │ │
│  │  api.ts ✓    │  │  api.ts ✓    │  │ api.ts ✓     │ │
│  │  98% indep.  │  │  100% indep. │  │ 100% indep.  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ markdown-    │  │  shortcuts   │  │  share       │ │
│  │ preview      │  │  api.ts ✓    │  │  api.ts ✓    │ │
│  │ api.ts ✓     │  │  96% indep.  │  │  96% indep.  │ │
│  │ 100% indep.  │  └──────────────┘  └──────────────┘ │
│  └──────────────┘                                       │
│                                                          │
│  Communication: Facades + Contracts (no direct imports) │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Shared Contracts & Utilities (<15% of codebase)        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ~/shared/contracts/   - Cross-module interfaces   │ │
│  │  ~/shared/utils/       - Pure helper functions     │ │
│  │  ~/shared/components/  - Generic UI (4-5 only)     │ │
│  │  ~/shared/composables/ - Truly reusable logic      │ │
│  │  ~/types/              - App-wide types            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Rules: Used by 3+ modules, zero business logic         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  External Dependencies                                   │
│  Nuxt 3, Pinia, CodeMirror, Mermaid, UnoCSS, etc.       │
└─────────────────────────────────────────────────────────┘

Enforcement:
├─ Dependency Cruiser (module boundaries, no circular deps)
├─ Knip (unused exports, dead code)
├─ Module Analyzer (independence scores, bloat detection)
├─ TypeScript (type safety, contract conformance)
└─ E2E Tests (functional correctness)
```

---

## Conclusion

MarkVim's current **92.7% independence score** demonstrates excellent architectural foundations. However, **87.5% of public API exports are unused**, indicating significant cleanup opportunities.

This phased improvement plan will:

1. **Phase 1** (1-2 days): Clean up 90% of unused exports
2. **Phase 2** (1 week): Eliminate cross-module type coupling via contracts
3. **Phase 3** (1 week): Reduce shared bloat by 50%
4. **Phase 4** (3-4 days): Remove state mutation events
5. **Phase 5** (1 day): Automate architecture enforcement
6. **Phase 6** (1 week): Validate and document

**Expected Outcome** (4 weeks):
- **98%+ module independence** (microfrontend-ready)
- **<15% shared surface area** (minimal coupling)
- **Zero unused exports** (clean APIs)
- **Automated architecture governance** (CI enforcement)

The result will be a **truly modular architecture** ready for independent module deployment, team scaling, and long-term maintainability.

---

**Next Steps:**

1. Review and approve this plan
2. Create GitHub issues for each phase
3. Begin Sprint 1 (Phase 1 + 4 + 5 quick wins)
4. Weekly progress reviews
5. Update CLAUDE.md as patterns emerge

**Questions? Clarifications needed?** Flag sections for deeper analysis.
