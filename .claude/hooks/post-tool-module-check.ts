#!/usr/bin/env npx tsx
/* eslint-disable no-console, node/prefer-global/process, ts/consistent-type-assertions */
/**
 * Claude Code PostToolUse Hook - Module Boundary Check
 *
 * After editing files in src/modules/*, runs a quick module independence check
 * to catch boundary violations early.
 */

import type { PostToolUseHookInput, SyncHookJSONOutput } from '@anthropic-ai/claude-agent-sdk'

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

function readStdin(): string {
  return readFileSync(0, 'utf-8')
}

function isModuleFile(filePath: string): boolean {
  return /src\/modules\//.test(filePath)
}

function runModuleCheck(cwd: string): { success: boolean, output: string } {
  try {
    const output = execSync('pnpm analyze:modules:strict 2>&1', {
      cwd,
      encoding: 'utf-8',
      timeout: 30_000, // 30 second timeout
    }) as string
    return { success: true, output }
  }
  catch (error) {
    const execError = error as Record<string, unknown>
    const output = (execError.stdout as string) || (execError.stderr as string) || 'Module check failed'
    return { success: false, output }
  }
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

  const input = parsedInput as PostToolUseHookInput

  // Only check Write and Edit tools
  if (input.tool_name !== 'Write' && input.tool_name !== 'Edit') {
    process.exit(0)
  }

  const toolInput = input.tool_input as { file_path?: string }
  const filePath = toolInput.file_path

  if (!filePath || !isModuleFile(filePath)) {
    process.exit(0)
  }

  // Run module independence check
  const result = runModuleCheck(input.cwd)

  if (!result.success) {
    // Extract just the violation info, not the full output
    const lines = result.output.split('\n')
    const violationLines = lines.filter(line =>
      line.includes('violation')
      || line.includes('import')
      || line.includes('boundary')
      || line.includes('Module')
      || line.includes('Score'),
    ).slice(0, 10) // Limit to 10 lines

    const summary = violationLines.length > 0
      ? violationLines.join('\n')
      : 'Module boundary violation detected'

    const output: SyncHookJSONOutput = {
      decision: 'block',
      reason: `⚠️ Module boundary issue detected after editing ${filePath}:\n\n${summary}\n\nPlease fix the import to use the module's public API (api.ts).`,
    }

    console.log(JSON.stringify(output))
    process.exit(0)
  }

  // Check passed, optionally add context
  const output: SyncHookJSONOutput = {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `✓ Module boundaries intact after editing ${filePath}`,
    },
  }
  console.log(JSON.stringify(output))
  process.exit(0)
}

main()
