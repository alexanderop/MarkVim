#!/usr/bin/env npx tsx
/* eslint-disable no-console, node/prefer-global/process, ts/consistent-type-assertions */
/**
 * Claude Code Stop Hook
 *
 * Runs typecheck and lint before allowing Claude to stop.
 * If any check fails, Claude is instructed to fix the issues.
 *
 * Uses @anthropic-ai/claude-agent-sdk types for type safety.
 */

import type { StopHookInput, SyncHookJSONOutput } from '@anthropic-ai/claude-agent-sdk'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

interface CheckResult {
  name: string
  success: boolean
  output: string
}

function readStdin(): string {
  return readFileSync(0, 'utf-8')
}

function runCheck(name: string, command: string, cwd: string): CheckResult {
  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120_000, // 2 minute timeout per check
    }) as string
    return { name, success: true, output }
  }
  catch (error) {
    const execError = error as Record<string, unknown>
    const output = (execError.stdout as string) || (execError.stderr as string) || (execError.message as string) || 'Unknown error'
    return { name, success: false, output }
  }
}

function main(): void {
  // Read and parse input
  const rawInput = readStdin()

  let parsedInput: unknown
  try {
    parsedInput = JSON.parse(rawInput)
  }
  catch {
    // If we can't parse input, allow stop (fail open)
    console.error('Failed to parse hook input')
    process.exit(0)
  }

  const input = parsedInput as StopHookInput

  // Prevent infinite loops - if stop hook is already active, allow stop
  if (input.stop_hook_active) {
    const output: SyncHookJSONOutput = {
      suppressOutput: true,
    }
    console.log(JSON.stringify(output))
    process.exit(0)
  }

  const cwd = input.cwd

  // Run checks in order (fastest first)
  const checks: Array<{ name: string, command: string }> = [
    { name: 'TypeScript', command: 'pnpm typecheck' },
    { name: 'ESLint', command: 'pnpm lint' },
  ]

  const failures: CheckResult[] = []

  for (const check of checks) {
    const result = runCheck(check.name, check.command, cwd)
    if (!result.success) {
      failures.push(result)
    }
  }

  if (failures.length > 0) {
    // Build failure message for Claude
    const failureMessages = failures.map((f) => {
      // Truncate output to avoid overwhelming Claude
      const truncatedOutput = f.output.length > 2000
        ? `${f.output.slice(0, 2000)}...(truncated)`
        : f.output
      return `### ${f.name} failed:\n\`\`\`\n${truncatedOutput}\n\`\`\``
    }).join('\n\n')

    const output: SyncHookJSONOutput = {
      decision: 'block',
      reason: `CI checks failed. Please fix the following issues before completing:\n\n${failureMessages}`,
    }

    console.log(JSON.stringify(output))
    process.exit(0)
  }

  // All checks passed, allow stop
  const output: SyncHookJSONOutput = {
    systemMessage: 'All CI checks passed (typecheck, lint)',
  }
  console.log(JSON.stringify(output))
  process.exit(0)
}

main()
