---
description: Merge current branch to main via GitHub PR
allowed-tools: Bash(git status), Bash(git branch), Bash(git log), Bash(git push), Bash(gh pr create), Bash(gh pr merge), Bash(gh pr list), Bash(gh pr view), Bash(git checkout), Bash(git pull)
model: haiku
---

# Merge to Main

I have gathered information about your branch. Here are the results:

<current_branch>
!`git branch --show-current`
</current_branch>

<branch_status>
!`git status --short`
</branch_status>

<commits_ahead>
!`git log main..HEAD --oneline`
</commits_ahead>

<existing_pr>
!`gh pr view --json number,title,state,mergeable --jq '"PR #\(.number): \(.title) [\(.state)] mergeable: \(.mergeable)"' 2>/dev/null || echo "No PR exists for this branch"`
</existing_pr>

## Instructions

1. **Check for uncommitted changes** - if there are uncommitted changes, stop and ask the user to commit first.

2. **Verify not on main** - if on main branch, stop and inform the user.

3. **Push the branch** if needed:
   ```bash
   git push -u origin $(git branch --show-current)
   ```

4. **Create or find PR**:
   - If no PR exists, create one with `--fill-verbose` to include commit details:
     ```bash
     gh pr create --base main --fill-verbose
     ```
   - If PR exists, show its current status with `gh pr view`

5. **Merge the PR** (squash merge, delete branch):
   ```bash
   gh pr merge --squash --delete-branch
   ```

6. **Switch to main and pull**:
   ```bash
   git checkout main && git pull
   ```

7. **Show the result** with `git log -1` to confirm the merge completed.
