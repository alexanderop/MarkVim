---
description: Check CI pipeline status for current branch and fix failures using systematic debugging
allowed-tools: Bash(gh *), Bash(git *), Bash(pnpm typecheck*), Bash(pnpm lint*), Bash(pnpm test*), Bash(pnpm build*), Read, Glob, Grep, Edit, Write
---

# Fix Pipeline

## Pipeline Context

<current_branch>
!`git branch --show-current`
</current_branch>

<push_status>
!`git status -sb | head -1`
</push_status>

<pipeline_runs>
!`gh run list --branch "$(git branch --show-current)" --limit 3 2>&1`
</pipeline_runs>

<latest_run>
!`gh run list --branch "$(git branch --show-current)" --limit 1 --json databaseId,status,conclusion,workflowName,headSha 2>&1`
</latest_run>

<recent_commits>
!`git log --oneline -5`
</recent_commits>

<changes_vs_main>
!`git diff main...HEAD --stat 2>/dev/null || echo "Cannot diff against main"`
</changes_vs_main>

---

## Decision Tree

Evaluate `latest_run` above:

| Condition | Action |
|-----------|--------|
| No runs / "not found" | Branch not pushed? Offer to push with `git push -u origin HEAD` |
| `status: "in_progress"` | Pipeline running. Wait or re-check later. |
| `conclusion: "success"` | **Pipeline passed.** Report success and stop. |
| `conclusion: "failure"` | **Pipeline failed.** Continue to Debugging Protocol below. |

---

## Debugging Protocol

**THE IRON LAW: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

Skipping phases guarantees wasted time and broken fixes.

### Phase 1: Gather Failure Evidence (REQUIRED)

**1.1 Get the failed logs:**
```bash
gh run view <RUN_ID> --log-failed
```

**1.2 Answer these questions BEFORE proceeding:**
- [ ] Which job failed? (typecheck / lint / test / build)
- [ ] What is the exact error message?
- [ ] Which file(s) and line(s) are referenced?
- [ ] Is this a new failure or pre-existing?

**1.3 Reproduce locally:**
| CI Job | Local Command |
|--------|---------------|
| typecheck | `pnpm typecheck` |
| lint | `pnpm lint` |
| test | `pnpm test:e2e:with-server` or specific feature |
| build | `pnpm build` |

If it passes locally but fails in CI, investigate environment differences (node version, dependencies, etc.)

### Phase 2: Root Cause Analysis (REQUIRED)

**DO NOT propose fixes yet.**

1. **Read the full error** - not just the first line
2. **Trace to source** - what code/change caused this?
3. **Understand WHY** - not just WHERE

Form a hypothesis: "The error occurs because [specific reason], caused by [specific change]."

### Phase 3: Minimal Fix

Only after completing Phase 2:

1. **Make ONE targeted change** addressing root cause
2. **Verify locally** using same command from Phase 1.3
3. **Confirm error is gone**

### Phase 4: Commit and Re-run

```bash
# Stage and commit the fix
git add -A
git commit -m "fix: [description of what was fixed]"

# Push to trigger new CI run
git push

# Watch the new run
gh run watch
```

---

## Red Flags — STOP and Return to Phase 1

If you catch yourself:
- Proposing fixes without reading full error logs
- Saying "let me try X" without explaining WHY
- Changing multiple unrelated things
- Skipping local reproduction
- Not understanding the error message

**STOP. You are guessing. Return to Phase 1.**

## Escape Hatch

If after 3 fix attempts the issue persists:
- This may be an architectural or environmental problem
- Stop fixing symptoms
- Report findings and ask user for guidance
