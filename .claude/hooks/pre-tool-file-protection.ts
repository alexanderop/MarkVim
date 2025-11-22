#!/usr/bin/env npx tsx
/* eslint-disable no-console, node/prefer-global/process, ts/consistent-type-assertions */
/**
 * Claude Code PreToolUse Hook - Critical File Protection
 *
 * Requires extra confirmation before editing:
 * - nuxt.config.ts (app configuration)
 * - package.json (dependencies)
 * - pnpm-lock.yaml (lock file)
 * - tsconfig.json (TypeScript config)
 * - .env files (secrets)
 */

import type { PreToolUseHookInput, SyncHookJSONOutput } from '@anthropic-ai/claude-agent-sdk'

import { readFileSync } from 'node:fs'

interface ProtectedFile {
  pattern: RegExp
  reason: string
}

const PROTECTED_FILES: ProtectedFile[] = [
  {
    pattern: /nuxt\.config\.(ts|js)$/,
    reason: 'Nuxt configuration - changes affect the entire application',
  },
  {
    pattern: /package\.json$/,
    reason: 'Package manifest - changes affect dependencies and scripts',
  },
  {
    pattern: /pnpm-lock\.yaml$/,
    reason: 'Lock file - should only change via pnpm install',
  },
  {
    pattern: /tsconfig(\.\w+)?\.json$/,
    reason: 'TypeScript configuration - changes affect type checking',
  },
  {
    pattern: /\.env(\.local|\.production|\.development)?$/,
    reason: 'Environment file - may contain secrets',
  },
  {
    pattern: /eslint\.config\.(js|mjs|cjs)$/,
    reason: 'ESLint configuration - changes affect code quality rules',
  },
  {
    pattern: /\.dependency-cruiser\.(js|cjs)$/,
    reason: 'Dependency cruiser config - changes affect architecture rules',
  },
]

function readStdin(): string {
  return readFileSync(0, 'utf-8')
}

function getProtectedFile(filePath: string): ProtectedFile | undefined {
  return PROTECTED_FILES.find(p => p.pattern.test(filePath))
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

  // Only check Write and Edit tools
  if (input.tool_name !== 'Write' && input.tool_name !== 'Edit') {
    process.exit(0)
  }

  const toolInput = input.tool_input as { file_path?: string }
  const filePath = toolInput.file_path

  if (!filePath) {
    process.exit(0)
  }

  const protectedFile = getProtectedFile(filePath)

  if (protectedFile) {
    const output: SyncHookJSONOutput = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `⚠️ Protected file: ${protectedFile.reason}`,
      },
    }
    console.log(JSON.stringify(output))
    process.exit(0)
  }

  // File is not protected, allow it
  process.exit(0)
}

main()
