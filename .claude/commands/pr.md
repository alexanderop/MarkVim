---
description: Create a new GitHub PR with a well-formatted description
allowed-tools: Bash(git status), Bash(git branch), Bash(git log), Bash(git diff), Bash(git push), Bash(git rev-parse), Bash(gh pr create), Bash(gh pr view), Bash(gh pr edit)
model: haiku
---

# Create Pull Request

I have gathered information about your branch. Here are the results:

<current_branch>
!`git branch --show-current`
</current_branch>

<branch_status>
!`git status --short`
</branch_status>

<commits_on_branch>
!`git log main..HEAD --oneline`
</commits_on_branch>

<commit_details>
!`git log main..HEAD --pretty=format:"### %s%n%n%b%n---"`
</commit_details>

<full_diff_stat>
!`git diff main..HEAD --stat`
</full_diff_stat>

<files_changed>
!`git diff main..HEAD --name-only`
</files_changed>

<existing_pr>
!`gh pr view --json number,title,state,url --jq '"PR #\(.number): \(.title) [\(.state)]\nURL: \(.url)"' 2>/dev/null || echo "No PR exists for this branch"`
</existing_pr>

## Instructions

### Pre-checks

1. **Check for uncommitted changes** - if there are uncommitted changes, stop and ask the user to commit first.
2. **Verify not on main** - if on main branch, stop and inform the user.
3. **Check if PR already exists** - if a PR exists, show the URL and ask if user wants to update it with `gh pr edit`.

### Step 1: Push the Branch

Push the branch to remote if needed:
```bash
git push -u origin $(git branch --show-current)
```

### Step 2: Create the PR

**Option A: Single commit branch** - use `--fill-first` to auto-fill from commit:
```bash
gh pr create --base main --fill-first
```

**Option B: Multi-commit branch** - craft a custom description using the format below:
```bash
gh pr create --base main --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

**Option C: Draft PR** - add `--draft` flag to create as draft:
```bash
gh pr create --base main --draft --title "<title>" --body "..."
```

**Useful flags:**
- `--fill` - Auto-fill title and body from commit info
- `--fill-first` - Use only the first commit for title/body
- `--fill-verbose` - Include full commit messages in body
- `--draft` - Create as draft PR
- `--dry-run` - Preview without creating

## PR Format

### Title Format

Use conventional commit style:
```text
<type>(<scope>): <description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

**Examples:**
- `feat(editor): add vim macro support`
- `fix(documents): resolve save race condition`
- `refactor(color-theme): simplify OKLCH conversion`

### Body Format

```markdown
## Summary

Brief 1-2 sentence description of what this PR does and why.

## Changes

- Bullet point list of specific changes
- Group related changes together
- Include file/module names when helpful

## Test Plan

- [ ] Manual testing steps or automated tests that verify the change
- [ ] Edge cases considered
```

### Step 3: Show Result

After creating the PR, display the URL with:
```bash
gh pr view --json url --jq '.url'
```
