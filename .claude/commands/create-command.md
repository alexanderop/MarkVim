---
description: Create a new slash command with best practices scaffolding
argument-hint: <command-name> <brief-description>
---

# Create Slash Command

You are creating a new slash command. The user provided:

**Command name:** `$1`
**Description:** $ARGUMENTS

---

## Step 1: Gather Requirements

Ask the user these questions using the AskUserQuestion tool (ask all at once):

### Question 1: Command Category
What category best describes this command?

| Category | Description | Defaults |
|----------|-------------|----------|
| `git-workflow` | Git operations (commit, branch, push, merge) | `model: haiku`, git tools |
| `github` | GitHub operations (PR, issues, CI) | `model: haiku`, gh + git tools |
| `quality` | Linting, testing, type checking | test/lint tools |
| `debugging` | Fix errors, investigate issues | full tools, decision trees |
| `code-transform` | Refactoring, code generation | full tools, file references |
| `utility` | General purpose automation | varies |

### Question 2: Arguments
Does this command need arguments?

| Option | Syntax | Example |
|--------|--------|---------|
| None | (no arguments) | `/lint` |
| Single required | `$1` | `/review-pr 123` |
| Multiple positional | `$1`, `$2`, `$3` | `/deploy staging v1.2.3` |
| Free-form text | `$ARGUMENTS` | `/branch add dark mode toggle` |

### Question 3: File References
Does the command operate on specific files?

- **Yes** - Use `@$1` syntax to reference file contents
- **No** - Command works on general context

### Question 4: Complexity
How complex is the workflow?

| Level | Characteristics | Structure |
|-------|-----------------|-----------|
| `simple` | Run command, report result | Linear steps |
| `linear` | Sequential steps, no branching | Numbered instructions |
| `branching` | Pre-checks, multiple paths | Decision tree |
| `complex` | Multi-phase, verification, fallback | Full protocol with red flags |

---

## Step 2: Generate Command File

Based on the answers, generate the command file at `.claude/commands/$1.md`.

### Frontmatter Rules

```yaml
---
description: <imperative verb phrase, e.g., "Run tests and fix failures">
argument-hint: <show expected args, use [] for optional, <> for required>
allowed-tools: <see category defaults below>
model: <haiku for routine operations, omit for complex reasoning>
---
```

**Category Tool Defaults:**

| Category | `allowed-tools` |
|----------|-----------------|
| `git-workflow` | `Bash(git status), Bash(git diff), Bash(git log), Bash(git add), Bash(git commit), Bash(git push), Bash(git branch), Bash(git checkout)` |
| `github` | `Bash(gh *), Bash(git *)` |
| `quality` | `Bash(pnpm lint*), Bash(pnpm test*), Bash(pnpm typecheck*), Bash(pnpm build*)` |
| `debugging` | `Bash(gh *), Bash(git *), Bash(pnpm *), Read, Glob, Grep, Edit, Write` |
| `code-transform` | `Read, Glob, Grep, Edit, Write` |
| `utility` | (omit for full access, or specify as needed) |

**Model Selection:**
- Use `model: haiku` for: git-workflow, github, quality (simple), utility (simple)
- Omit model for: debugging, code-transform, complex workflows

### Context Block Patterns

Use semantic XML tags with error-tolerant commands:

**Git context:**
```markdown
<current_branch>
!`git branch --show-current`
</current_branch>

<git_status>
!`git status --short`
</git_status>

<staged_diff>
!`git diff --cached`
</staged_diff>

<unstaged_diff>
!`git diff`
</unstaged_diff>

<recent_commits>
!`git log --oneline -10`
</recent_commits>

<commits_ahead_of_main>
!`git log main..HEAD --oneline 2>/dev/null || echo "Cannot compare to main"`
</commits_ahead_of_main>
```

**GitHub context:**
```markdown
<pr_info>
!`gh pr view --json number,title,state,url 2>/dev/null || echo "No PR for this branch"`
</pr_info>

<pipeline_status>
!`gh run list --branch "$(git branch --show-current)" --limit 3 2>&1`
</pipeline_status>

<latest_run>
!`gh run list --branch "$(git branch --show-current)" --limit 1 --json databaseId,status,conclusion 2>&1`
</latest_run>
```

**Quality context:**
```markdown
<lint_output>
!`pnpm lint 2>&1 || true`
</lint_output>

<test_output>
!`pnpm test --run 2>&1 || true`
</test_output>

<typecheck_output>
!`pnpm typecheck 2>&1 || true`
</typecheck_output>
```

### Structure Templates

**Simple (run and report):**
```markdown
# <Title>

I have run the command. Here are the results:

<output>
!`command 2>&1 || true`
</output>

## Instructions
1. **Analyze the output** above.
   - If successful/no errors, report success and stop.
   - If errors remain, continue to fix them.
2. **Fix issues** by [specific guidance].
3. **Verify** by running the command again.
```

**Linear (sequential steps):**
```markdown
# <Title>

## Context

<relevant_context>
!`command`
</relevant_context>

## Instructions

1. **First step** - description
   ```bash
   command
   ```

2. **Second step** - description
   - Sub-point if needed

3. **Verify** - confirmation step with `command`.
```

**Branching (with decision tree):**
```markdown
# <Title>

## Context

<context_block>
!`command 2>/dev/null || echo "fallback"`
</context_block>

---

## Decision Tree

| Condition | Action |
|-----------|--------|
| condition_1 | Action 1. Stop here. |
| condition_2 | Action 2. Continue below. |
| condition_3 | Action 3. Proceed to Instructions. |

---

## Instructions

1. **Step** - description
2. **Step** - description
3. **Verify** - confirmation
```

**Complex (full protocol):**
```markdown
# <Title>

## Context

<context_blocks>
!`commands`
</context_blocks>

---

## Decision Tree

| Condition | Action |
|-----------|--------|
| ... | ... |

---

## Protocol

### Phase 1: <Name> (REQUIRED)

**1.1 First action:**
```bash
command
```

**1.2 Answer these questions BEFORE proceeding:**
- [ ] Question 1?
- [ ] Question 2?

### Phase 2: <Name> (REQUIRED)

**DO NOT proceed without completing Phase 1.**

1. Step description
2. Next step

### Phase 3: Implementation

Only after completing Phase 2:
1. Make targeted change
2. Verify locally
3. Confirm success

---

## Red Flags - STOP and Return to Phase 1

If you catch yourself:
- Anti-pattern 1
- Anti-pattern 2
- Anti-pattern 3

**STOP. You are [problem]. Return to Phase 1.**

---

## Escape Hatch

If after [N] attempts the issue persists:
- This may be [deeper problem]
- Stop fixing symptoms
- Report findings and ask user for guidance
```

### Bash Command Best Practices

**HEREDOC for multi-line content:**
```bash
git commit -m "$(cat <<'EOF'
type(scope): description

Optional body here.
EOF
)"
```

**Error suppression patterns:**
```bash
command 2>/dev/null || echo "Fallback message"
command 2>&1 || true
command || true
```

**Dynamic interpolation:**
```bash
git push -u origin $(git branch --show-current)
gh run list --branch "$(git branch --show-current)"
```

---

## Step 3: Write the File

After gathering requirements and generating content:

1. Write the file to `.claude/commands/$1.md`
2. Show the user the generated command
3. Explain how to use it: `/$1 [arguments]`

---

## Example Output

For `/create-command deploy "Deploy to staging or production environment"`:

```markdown
---
description: Deploy to staging or production environment
argument-hint: <environment> [version]
allowed-tools: Bash(git *), Bash(gh *), Bash(pnpm build*)
model: haiku
---

# Deploy

## Context

<current_branch>
!`git branch --show-current`
</current_branch>

<git_status>
!`git status --short`
</git_status>

<latest_tag>
!`git describe --tags --abbrev=0 2>/dev/null || echo "No tags found"`
</latest_tag>

---

## Decision Tree

| Condition | Action |
|-----------|--------|
| Uncommitted changes | Stop. Ask user to commit first. |
| Environment not specified | Ask user: staging or production? |
| Production without version | Warn user and confirm intent. |

---

## Instructions

1. **Verify clean state** - no uncommitted changes allowed for deploys.

2. **Build the project:**
   ```bash
   pnpm build
   ```

3. **Deploy to environment** ($1):
   ```bash
   # For staging
   ./scripts/deploy.sh staging $2

   # For production
   ./scripts/deploy.sh production $2
   ```

4. **Verify** deployment succeeded and report the deployed version.
```
