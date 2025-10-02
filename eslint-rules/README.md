# Custom ESLint Rules

This directory contains custom ESLint rules specific to the MarkVim project.

## Rules

### `local/no-unused-events`

Detects unused events in the event bus system.

**What it reports:**

1. **Unused events**: Events defined in `events.ts` files but never emitted or listened to
2. **Emitted but not listened**: Events that are emitted but have no listeners (potential dead code)

**Example output:**

```
src/modules/editor/events.ts
   9:3  warning  Event "vim-mode:change" is emitted but never listened to        local/no-unused-events
  15:3  warning  Event "editor:insert-text" is defined but never emitted         local/no-unused-events
  20:3  warning  Event "editor:content-update" is emitted but never listened to  local/no-unused-events
```

**How it works:**

1. Scans all `events.ts` files to find event definitions
2. Scans entire codebase for `emitAppEvent()` and `onAppEvent()` calls
3. Reports mismatches between definitions and usage

**Configuration:**

The rule is configured in `eslint.config.mjs` and runs as a warning by default:

```javascript
rules: {
  'local/no-unused-events': 'warn',  // Change to 'error' to make it blocking
}
```

**When to ignore:**

- Events that are emitted but not yet listened to (work in progress)
- Events reserved for future use or third-party integrations
- Events listened to dynamically (not detectable by static analysis)

**To disable for a specific event:**

```typescript
export interface MyEvents {
  // eslint-disable-next-line local/no-unused-events
  'my:event': { data: string }
}
```

## Running the Rules

```bash
# Lint all event files
pnpm lint src/modules/*/events.ts src/shared/events.ts

# Lint entire project
pnpm lint

# Auto-fix other issues (won't fix unused events)
pnpm lint:fix
```

## Performance

The rule caches its analysis for 5 seconds to avoid rescanning the entire codebase for each file. This makes it efficient even in large projects.
