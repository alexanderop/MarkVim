/**
 * ESLint rule to detect unused events in the event bus
 *
 * Reports:
 * - Events that are emitted but never listened to
 * - Events that are defined but never used anywhere
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Cache to store project-wide event usage (only computed once per lint run)
let eventUsageCache = null
let cacheTimestamp = 0

// Cache expiration time in milliseconds
const CACHE_EXPIRATION_MS = 5000

/**
 * Recursively find all TypeScript/Vue files in a directory
 * @returns {string[]} Array of file paths
 */
// eslint-disable-next-line ts/explicit-function-return-type
function findSourceFiles(dir, files = []) {
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          // Skip node_modules, .git, .nuxt, etc.
          if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
            findSourceFiles(fullPath, files)
          }
          continue
        }
        if (entry.endsWith('.ts') || entry.endsWith('.vue')) {
          files.push(fullPath)
        }
      }
      catch {
        // Skip files we can't access
      }
    }
  }
  catch {
    // Skip directories we can't access
  }
  return files
}

/**
 * Extract event keys from event interface definitions
 * @returns {Array<{ key: string, interface: string, filename: string }>} Array of event key objects with interface name and filename
 */
// eslint-disable-next-line ts/explicit-function-return-type
function extractEventKeys(content, filename) {
  const eventKeys = []

  // Match interface declarations that end with "Events"
  const interfaceRegex = /interface\s+(\w+Events)\s*\{([^}]+)\}/g
  let match = interfaceRegex.exec(content)

  while (match !== null) {
    const interfaceName = match[1]
    const interfaceBody = match[2]

    // Extract event keys (e.g., 'document:create', 'editor:update')
    const keyRegex = /['"]([^'"]+)['"]\s*:/g
    let keyMatch = keyRegex.exec(interfaceBody)

    while (keyMatch !== null) {
      eventKeys.push({
        key: keyMatch[1],
        interface: interfaceName,
        filename,
      })

      keyMatch = keyRegex.exec(interfaceBody)
    }

    match = interfaceRegex.exec(content)
  }

  return eventKeys
}

/**
 * Find all emitAppEvent and onAppEvent calls
 * @returns {{ emitted: string[], listened: string[] }} Object containing arrays of emitted and listened event keys
 */
// eslint-disable-next-line ts/explicit-function-return-type
function findEventUsage(content) {
  const emitted = []
  const listened = []

  // Match emitAppEvent('event:key', ...)
  const emitRegex = /emitAppEvent\s*\(\s*['"]([^'"]+)['"]/g
  let match = emitRegex.exec(content)

  while (match !== null) {
    emitted.push(match[1])
    match = emitRegex.exec(content)
  }

  // Match onAppEvent('event:key', ...) and onceAppEvent('event:key', ...)
  const listenRegex = /(?:on|once)AppEvent\s*\(\s*['"]([^'"]+)['"]/g
  match = listenRegex.exec(content)

  while (match !== null) {
    listened.push(match[1])
    match = listenRegex.exec(content)
  }

  return { emitted, listened }
}

/**
 * Analyze project-wide event usage
 * @returns {{ allEventKeys: Array<{ key: string, interface: string, filename: string }>, allEmitted: Set<string>, allListened: Set<string> }} Object containing all event keys and sets of emitted and listened event keys
 */
// eslint-disable-next-line ts/explicit-function-return-type
function analyzeEventUsage(projectRoot) {
  // Use cache if recent (within same ESLint run)
  const now = Date.now()
  if (eventUsageCache && (now - cacheTimestamp) < CACHE_EXPIRATION_MS) {
    return eventUsageCache
  }

  const allEventKeys = []
  const allEmitted = new Set()
  const allListened = new Set()

  const sourceFiles = findSourceFiles(projectRoot)

  for (const file of sourceFiles) {
    try {
      const content = readFileSync(file, 'utf-8')

      // Extract event definitions from events.ts files
      if (file.endsWith('/events.ts')) {
        const eventKeys = extractEventKeys(content, file)
        allEventKeys.push(...eventKeys)
      }

      // Find usage in all files
      const { emitted, listened } = findEventUsage(content)
      emitted.forEach(key => allEmitted.add(key))
      listened.forEach(key => allListened.add(key))
    }
    catch {
      // Skip files we can't read
    }
  }

  eventUsageCache = {
    allEventKeys,
    allEmitted,
    allListened,
  }
  cacheTimestamp = now

  return eventUsageCache
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect unused events in the event bus system',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      unusedEvent: 'Event "{{eventKey}}" is defined but never emitted or listened to',
      emittedNotListened: 'Event "{{eventKey}}" is emitted but never listened to (potential dead code)',
      listenedNotEmitted: 'Event "{{eventKey}}" is listened to but never emitted',
    },
  },

  create(context) {
    const filename = context.getFilename()

    // Only run on events.ts files
    if (!filename.endsWith('/events.ts')) {
      return {}
    }

    return {
      // Check TypeScript interface declarations
      TSInterfaceDeclaration(node) {
        // Only check interfaces that end with "Events"
        if (!node.id.name.endsWith('Events')) {
          return
        }

        // Get project root (go up from src/modules/*/events.ts to project root)
        const parts = filename.split('/')
        const srcIndex = parts.indexOf('src')

        if (srcIndex === -1) {
          return
        }

        const projectRoot = parts.slice(0, srcIndex).join('/')

        // Analyze event usage across the project
        const { allEmitted, allListened } = analyzeEventUsage(projectRoot)

        // Check each property in the interface
        for (const member of node.body.body) {
          if (member.type !== 'TSPropertySignature') {
            continue
          }

          if (member.key.type !== 'Literal') {
            continue
          }

          const eventKey = member.key.value
          const isEmitted = allEmitted.has(eventKey)
          const isListened = allListened.has(eventKey)

          // Report unused events
          if (!isEmitted && !isListened) {
            context.report({
              node: member,
              messageId: 'unusedEvent',
              data: { eventKey },
            })
            return
          }
          // Report events that are emitted but never listened to
          if (isEmitted && !isListened) {
            context.report({
              node: member,
              messageId: 'emittedNotListened',
              data: { eventKey },
            })
          }
          // Optionally report events that are listened to but never emitted
          // (commented out as this might be intentional for some events)
          // else if (!isEmitted && isListened) {
          //   context.report({
          //     node: member,
          //     messageId: 'listenedNotEmitted',
          //     data: { eventKey },
          //   })
          // }
        }
      },
    }
  },
}
