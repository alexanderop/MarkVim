---
description: Create a conventional commit message and commit staged changes
allowed-tools: Bash(git status), Bash(git diff), Bash(git log), Bash(git add), Bash(git commit)
model: haiku
---

# Conventional Commit

I have gathered information about your changes. Here are the results:

<git_status>
!`git status`
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

## Instructions

1. **Analyze the diffs** above to understand what changed.
2. **Stage files** if needed (skip already staged files, skip files that shouldn't be committed like `.env`).
3. **Generate a conventional commit message** following this format:
   ```
   <type>(<scope>): <description>

   [optional body]
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

4. **Create the commit** using a HEREDOC for proper formatting:
   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): description
   EOF
   )"
   ```

5. **Show the result** with `git log -1` to confirm.
