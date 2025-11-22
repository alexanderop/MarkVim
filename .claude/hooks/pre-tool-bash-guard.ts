#!/usr/bin/env npx tsx
/* eslint-disable no-console, node/prefer-global/process, ts/consistent-type-assertions, regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation, regexp/no-dupe-characters-character-class */
/**
 * Claude Code PreToolUse Hook - Bash Command Guard
 *
 * Blocks dangerous bash commands:
 * - git push --force to main/master
 * - rm -rf on critical directories
 * - Commands that could leak or modify secrets
 */

import type { PreToolUseHookInput, SyncHookJSONOutput } from '@anthropic-ai/claude-agent-sdk'

import { readFileSync } from 'node:fs'

interface DangerousPattern {
  pattern: RegExp
  message: string
}

const DANGEROUS_PATTERNS: DangerousPattern[] = [
  // Force push to main/master
  {
    pattern: /git\s+push\s+.*--force.*\s*(main|master)|git\s+push\s+.*-f.*\s*(main|master)|git\s+push\s+-f\s+(origin\s+)?(main|master)/i,
    message: 'Force pushing to main/master is blocked. Use a feature branch instead.',
  },
  // rm -rf on critical directories
  {
    pattern: /rm\s+(-[rRf]+\s+)+\s*(src|\.claude|\.git|node_modules|\.|\/)\s*$/,
    message: 'Deleting critical directories is blocked. Be more specific about what to delete.',
  },
  {
    pattern: /rm\s+(-[rRf]+\s+)+.*\.\.\//,
    message: 'Using rm -rf with parent directory traversal is blocked.',
  },
  // Editing or viewing secrets
  {
    pattern: /cat\s+.*\.env|less\s+.*\.env|more\s+.*\.env|head\s+.*\.env|tail\s+.*\.env/i,
    message: 'Reading .env files via bash is blocked. Use the Read tool if needed.',
  },
  // Dangerous git operations
  {
    pattern: /git\s+reset\s+--hard\s+(origin\/)?(main|master)/i,
    message: 'Hard resetting to main/master is blocked. This could lose work.',
  },
  {
    pattern: /git\s+clean\s+-[dDfFxX]+/i,
    message: 'git clean with force flags is blocked. Be careful with untracked files.',
  },
  // Prevent accidentally running in production
  {
    pattern: /NODE_ENV\s*=\s*production.*rm|rm.*NODE_ENV\s*=\s*production/i,
    message: 'Running destructive commands with NODE_ENV=production is blocked.',
  },
]

function readStdin(): string {
  return readFileSync(0, 'utf-8')
}

function checkCommand(command: string): DangerousPattern | undefined {
  return DANGEROUS_PATTERNS.find(p => p.pattern.test(command))
}

function main(): void {
  const rawInput = readStdin()

  let parsedInput: unknown
  try {
    parsedInput = JSON.parse(rawInput)
  }
  catch {
    process.exit(0)
  }

  const input = parsedInput as PreToolUseHookInput

  // Only check Bash tool
  if (input.tool_name !== 'Bash') {
    process.exit(0)
  }

  const toolInput = input.tool_input as { command?: string }
  const command = toolInput.command

  if (!command) {
    process.exit(0)
  }

  const dangerousMatch = checkCommand(command)

  if (dangerousMatch) {
    const output: SyncHookJSONOutput = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `🚫 BLOCKED: ${dangerousMatch.message}`,
      },
    }
    console.log(JSON.stringify(output))
    process.exit(0)
  }

  // Command is safe, allow it
  process.exit(0)
}

main()
