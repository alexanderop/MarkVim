#!/usr/bin/env npx tsx
/* eslint-disable no-console, node/prefer-global/process, ts/consistent-type-assertions */
/**
 * Claude Code SessionStart Hook
 *
 * Provides the current date and time to Claude at session startup.
 */

import type { SessionStartHookInput } from '@anthropic-ai/claude-agent-sdk'
import { readFileSync } from 'node:fs'

function readStdin(): string {
  return readFileSync(0, 'utf-8')
}

function main(): void {
  // Read input (required but we don't need to use it)
  const rawInput = readStdin()

  try {
    JSON.parse(rawInput) as SessionStartHookInput
  }
  catch {
    process.exit(0)
  }

  const now = new Date()

  const dateInfo = {
    date: now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }),
    iso: now.toISOString(),
    timestamp: now.getTime(),
  }

  // For SessionStart hooks, stdout is added as context for Claude
  console.log(`Current date: ${dateInfo.date}`)
  console.log(`Current time: ${dateInfo.time}`)
  console.log(`ISO: ${dateInfo.iso}`)

  process.exit(0)
}

main()
