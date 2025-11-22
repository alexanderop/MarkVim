---
description: Create a new branch from main with conventional commit-style naming
argument-hint: <task-description>
allowed-tools: Bash(git status), Bash(git fetch), Bash(git checkout), Bash(git pull), Bash(git branch)
model: haiku
---

# Create Feature Branch

## Context

<git_status>
!`git status`
</git_status>

<current_branch>
!`git branch --show-current`
</current_branch>

<recent_branches>
!`git branch --sort=-committerdate | head -5`
</recent_branches>

## Task Description

$ARGUMENTS

## Instructions

1. **Parse the task description** above to understand what needs to be done.

2. **Generate a branch name** following conventional commit style:
   ```
   <type>/<short-description>
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

   Rules:
   - Lowercase only
   - Replace spaces with hyphens
   - Keep concise (3-5 words max)
   - Examples: `feat/add-dark-mode`, `fix/sidebar-scroll-issue`, `refactor/extract-utils`

3. **Switch to main and pull latest:**
   ```bash
   git checkout main && git pull origin main
   ```

4. **Create and switch to the new branch:**
   ```bash
   git checkout -b <branch-name>
   ```

5. **Confirm** with `git branch --show-current`.

6. **Summarize** the branch name and what task it's for.
