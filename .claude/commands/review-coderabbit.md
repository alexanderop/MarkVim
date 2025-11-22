---
description: Fetch CodeRabbit review comments and process them with technical rigor - verify before implementing, push back when wrong
allowed-tools: Bash(gh *), Bash(git *), Bash(pnpm typecheck*), Bash(pnpm lint*), Bash(pnpm test*), Bash(pnpm build*), Read, Glob, Grep, Edit, Write
---

# Review CodeRabbit Feedback

## PR Context

<current_branch>
!`git branch --show-current`
</current_branch>

<pr_info>
!`gh pr view --json number,title,state,url 2>&1`
</pr_info>

<coderabbit_reviews>
!`gh pr view --json reviews --jq '.reviews[] | select(.author.login == "coderabbitai") | {state: .state, body: .body}' 2>&1`
</coderabbit_reviews>

<coderabbit_comments>
!`gh pr view --json comments --jq '.comments[] | select(.author.login == "coderabbitai") | .body' 2>&1`
</coderabbit_comments>

<review_threads>
!`gh api repos/{owner}/{repo}/pulls/$(gh pr view --json number -q .number)/comments --jq '.[] | select(.user.login == "coderabbitai") | {path: .path, line: .line, body: .body}' 2>&1 || echo "Could not fetch review threads"`
</review_threads>

---

## Decision Tree

| Condition | Action |
|-----------|--------|
| No PR found | Branch has no PR. Create one first with `gh pr create` |
| No CodeRabbit comments | No feedback to process. Done. |
| Comments found | Continue to Review Reception Protocol below |

---

## Review Reception Protocol

**CORE PRINCIPLE:** Verify before implementing. Ask before assuming. Technical correctness over social comfort.

### The Response Pattern

```
FOR EACH CodeRabbit suggestion:

1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each
```

### Forbidden Responses

**NEVER say:**
- "You're absolutely right!" (explicit CLAUDE.md violation)
- "Great point!" / "Excellent feedback!" (performative)
- "Let me implement that now" (before verification)
- "Thanks for catching that!" (performative gratitude)

**INSTEAD:**
- Restate the technical requirement
- Ask clarifying questions if needed
- Push back with technical reasoning if wrong
- Just fix it (actions > words)

---

## Verification Checklist

BEFORE implementing any CodeRabbit suggestion:

- [ ] **Technically correct** for THIS codebase?
- [ ] **Breaks existing functionality?** Check tests, grep for usage
- [ ] **Reason for current implementation?** May be intentional
- [ ] **Works on all platforms/versions?** Check compatibility
- [ ] **Does reviewer understand full context?** AI may lack context

### YAGNI Check

```
IF suggestion adds "proper" or "professional" features:
  grep codebase for actual usage

  IF unused: Consider removing (YAGNI) instead of improving
  IF used: Then implement properly
```

---

## When To Push Back

Push back when:
- Suggestion breaks existing functionality
- Reviewer lacks full context (common with AI reviewers)
- Violates YAGNI (unused feature)
- Technically incorrect for this stack
- Legacy/compatibility reasons exist
- Conflicts with architectural decisions

**How to push back:**
```
"Checked [X] - current implementation does [Y] because [reason].
Changing to [suggestion] would [break/conflict with] [Z].
Keep current approach? Or is there context I'm missing?"
```

---

## Processing CodeRabbit Feedback

### Step 1: Categorize Each Item

| Category | Priority | Action |
|----------|----------|--------|
| Security/Breaking | HIGH | Verify immediately, fix if confirmed |
| Type errors/Bugs | HIGH | Verify locally, fix if real |
| Style/Formatting | LOW | Check if matches project conventions |
| "Best practices" | VERIFY | Check if actually applies here |
| Refactoring suggestions | VERIFY | Check if code is actually used |

### Step 2: Verify Before Acting

For each suggestion:
1. **Read the referenced file** - understand current implementation
2. **Check tests** - does current code pass? Would change break them?
3. **Grep for usage** - is this code actually called?
4. **Consider context** - why might it be written this way?

### Step 3: Implementation Order

```
IF multiple items:
  1. Clarify anything unclear FIRST
  2. Then implement in order:
     - Security/Breaking issues
     - Confirmed bugs
     - Simple fixes (imports, typos)
     - Complex changes (refactoring)
  3. Test each fix individually
  4. Verify no regressions
```

---

## Acknowledging Correct Feedback

When feedback IS correct:
```
- "Fixed. [Brief description of what changed]"
- "Good catch - [specific issue]. Fixed in [location]."
- [Just fix it and show in the code]
```

When you pushed back and were wrong:
```
"Verified this and you're correct. [Brief reason]. Fixing."
```

No long apologies. State correction factually and move on.

---

## Common CodeRabbit Patterns

| Pattern | Verify |
|---------|--------|
| "Consider using X instead of Y" | Check if X works in this context |
| "This could be simplified" | Check if simplification handles edge cases |
| "Missing error handling" | Check if errors are handled elsewhere |
| "Unused import/variable" | Verify with grep, may be used dynamically |
| "Type could be more specific" | Check if generic type is intentional |
| "Add documentation" | Check project conventions on docs |

---

## Red Flags - STOP and Verify

If you catch yourself:
- Agreeing without checking the code
- Implementing before understanding why current code exists
- Not testing changes
- Batch implementing without individual verification

**STOP. You are being performative. Return to verification.**

---

## Summary

**External AI feedback = suggestions to evaluate, not orders to follow.**

1. Read all feedback first
2. Verify each item against codebase
3. Push back on incorrect suggestions
4. Implement confirmed issues one at a time
5. Test each change

No performative agreement. Technical rigor always.
