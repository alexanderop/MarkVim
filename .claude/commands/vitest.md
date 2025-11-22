---
description: Run Vitest tests and fix any failing tests
allowed-tools: Bash(pnpm run test:vitest), Bash(pnpm test:vitest), Bash(vitest)
---

# Vitest Test Runner

I have run the Vitest test suite. Here are the results:

<test_results>
!`pnpm run test:vitest --run 2>&1 || true`
</test_results>

## Instructions
1. **Analyze the `<test_results>`** above.
   - If all tests pass, no action is needed.
   - If tests are failing, identify the root cause from the error messages.
2. **Fix failing tests** by either:
   - Fixing bugs in the source code that caused the test to fail
   - Updating tests if they are outdated or incorrect
3. **Verify** by running the test command again to confirm all tests pass.
