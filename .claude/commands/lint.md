---
description: Auto-fix linting issues and resolve remaining errors
allowed-tools: Bash(pnpm run lint), Bash(eslint)
---

# Lint and Fix

I have already run the linter with the fix flag. Here are the results:

<lint_results>
!`pnpm run lint -- --fix || true`
</lint_results>

## Instructions
1. **Analyze the `<lint_results>`** above.
   - If the output shows "No errors" or is empty, the auto-fix handled everything.
   - If errors remain, they require manual intervention.
2. **Fix remaining errors** by editing the referenced files.
3. **Verify** by running the lint command one last time.
