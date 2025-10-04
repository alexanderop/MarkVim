# Event-Driven Migration: Quick Checklist

> **Detailed plan:** See `docs/EVENT_DRIVEN_IMPLEMENTATION_PLAN.md`

## Phase 1: Event Definitions (2-4h) ⬜

- [ ] 1.1 Add missing document events to `src/modules/documents/events.ts`
- [ ] 1.2 Implement editor events in `src/modules/editor/events.ts`
- [ ] 1.3 Create `src/modules/color-theme/events.ts`
- [ ] 1.4 Update event bus in `src/shared/utils/eventBus.ts`
- [ ] Test: `pnpm typecheck && pnpm lint`
- [ ] Commit: `feat: complete event definitions for all modules`

## Phase 2: Store Listeners (4-6h) ⬜

- [ ] 2.1 Add event listeners to `src/modules/documents/store.ts`
- [ ] 2.2 Add event listeners to `src/modules/color-theme/store.ts`
- [ ] Test: `pnpm test:e2e --grep "Create new document"`
- [ ] Test: `pnpm typecheck && pnpm lint`
- [ ] Commit: `feat: add event listeners to stores`

## Phase 3: Migrate Callers (6-8h) ⬜

- [ ] 3.1 Migrate `src/modules/shortcuts/components/ShortcutsManager.vue`
- [ ] 3.2 Migrate `src/modules/share/components/ShareManager.vue`
- [ ] 3.3 Migrate `src/modules/documents/composables/useDocumentDeletion.ts`
- [ ] Test: `pnpm test:e2e:with-server`
- [ ] Fix any failing tests
- [ ] Commit: `refactor: migrate external modules to use events`

## Phase 4: Enforce (2-3h) ⬜

- [ ] 4.1 Create `eslint-rules/no-cross-module-stores.js`
- [ ] 4.2 Register rule in `eslint.config.mjs`
- [ ] 4.3 Update `CLAUDE.md` with communication rules
- [ ] 4.4 Update `docs/EVENT_COMMUNICATION.md`
- [ ] 4.5 Create `docs/EVENT_MIGRATION_SUMMARY.md`
- [ ] Test: `pnpm lint`
- [ ] Commit: `docs: update architecture guidelines and add ESLint enforcement`

## Final Verification ⬜

- [ ] All tests pass: `pnpm test:e2e:with-server`
- [ ] Type check: `pnpm typecheck`
- [ ] Lint check: `pnpm lint`
- [ ] Manual test: Create document (Cmd+N)
- [ ] Manual test: Import shared document
- [ ] Manual test: Delete document
- [ ] Manual test: Change color theme
- [ ] Code review: No cross-module store imports

## Success Criteria ✅

- ✅ 0 direct store imports from external modules
- ✅ All events defined in `events.ts` files
- ✅ Stores listen to events with `onAppEvent()`
- ✅ ESLint blocks violations
- ✅ All tests passing
- ✅ Documentation updated

---

**Start:** Phase 1, Task 1.1
**Next:** See detailed plan in `docs/EVENT_DRIVEN_IMPLEMENTATION_PLAN.md`
