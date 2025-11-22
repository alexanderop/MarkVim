---
description: Run TypeScript type checking and fix any type errors
allowed-tools: Bash(pnpm run typecheck), Bash(pnpm typecheck), Read, Edit
model: haiku
---

# TypeScript Type Check

I have already run the TypeScript type checker. Here are the results:

<typecheck_results>
!`pnpm typecheck 2>&1 || true`
</typecheck_results>

## Instructions
1. **Analyze the `<typecheck_results>`** above.
   - If the output shows no errors, respond with "No type errors found." and stop - no further action needed.
   - If errors remain, they require manual intervention.
2. **Fix remaining errors** by editing the referenced files.
3. **Verify** by running the typecheck command one last time.
