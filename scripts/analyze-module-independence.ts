#!/usr/bin/env tsx
/**
 * Module Independence Analyzer
 *
 * Analyzes MarkVim modules and scores their independence based on:
 * - Event emissions
 * - Event listeners
 * - External imports
 * - Lines of code (SLOC)
 *
 * Based on single-spa best practices for microfrontend readiness.
 */

/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */
/* eslint-disable no-restricted-syntax */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { parse as parseSFC } from '@vue/compiler-sfc'
import { Command } from 'commander'
import { Project, SyntaxKind } from 'ts-morph'

interface ModuleAnalysis {
  name: string
  path: string
  eventsEmitted: Map<string, number> // event name -> count
  eventsListenedTo: Map<string, number> // event name -> count
  externalImports: Set<string>
  linesOfCode: number // SLOC (source lines of code)
  hasApiFile: boolean
  hasEventsFile: boolean
  hasStoreFile: boolean
  independenceScore: number
  category: 'feature' | 'utility' | 'ui-component'
}

interface DependencyGraph {
  [moduleName: string]: string[]
}

const MODULES_DIR = join(process.cwd(), 'src/modules')

// Directories to skip during analysis
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.output',
  '.nuxt',
  'coverage',
  '__tests__',
  '__mocks__',
  'stories',
  'storybook',
  'e2e',
  'playwright-report',
  '.playwright',
])

// Color codes for terminal output
const colors = {
  reset: '\x1B[0m',
  bright: '\x1B[1m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  red: '\x1B[31m',
  cyan: '\x1B[36m',
  gray: '\x1B[90m',
}

/**
 * Count Source Lines of Code (SLOC) - excludes comments and blank lines
 */
function sloc(text: string): number {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .split('\n')
    .map(l => l.replace(/\/\/.*$/, '').trim()) // Remove line comments and trim
    .filter(l => l.length > 0)
    .length
}

/**
 * Extract script content from Vue SFC files
 */
function extractScript(filename: string, code: string): string {
  if (!filename.endsWith('.vue'))
    return code

  try {
    const sfc = parseSFC(code)
    return sfc.descriptor.scriptSetup?.content ?? sfc.descriptor.script?.content ?? ''
  }
  catch {
    return code // Fallback to original content if parsing fails
  }
}

function analyzeModule(moduleName: string, modulePath: string, useAST = true): ModuleAnalysis {
  const analysis: ModuleAnalysis = {
    name: moduleName,
    path: modulePath,
    eventsEmitted: new Map(),
    eventsListenedTo: new Map(),
    externalImports: new Set(),
    linesOfCode: 0,
    hasApiFile: false,
    hasEventsFile: false,
    hasStoreFile: false,
    independenceScore: 0,
    category: determineCategory(moduleName),
  }

  // Check for key files
  analysis.hasApiFile = existsSync(join(modulePath, 'api.ts'))
  analysis.hasEventsFile = existsSync(join(modulePath, 'events.ts'))
  analysis.hasStoreFile = existsSync(join(modulePath, 'store.ts'))

  // Collect all files first
  const files: Array<{ path: string, code: string }> = []
  collectFiles(modulePath, files)

  // Use AST-based analysis or fallback to regex
  if (useAST) {
    analyzeWithAST(files, analysis)
  }
  else {
    analyzeWithRegex(files, analysis)
  }

  // Calculate independence score
  analysis.independenceScore = calculateIndependenceScore(analysis)

  return analysis
}

function determineCategory(moduleName: string): 'feature' | 'utility' | 'ui-component' {
  const utilities = ['domain', 'feature-flags']
  const uiComponents = ['layout', 'markdown-preview']

  if (utilities.includes(moduleName))
    return 'utility'
  if (uiComponents.includes(moduleName))
    return 'ui-component'
  return 'feature'
}

/**
 * Recursively collect all TypeScript and Vue files from a directory
 */
function collectFiles(
  dirPath: string,
  files: Array<{ path: string, code: string }>,
): void {
  try {
    const entries = readdirSync(dirPath)

    for (const entry of entries) {
      const fullPath = join(dirPath, entry)
      let stat
      try {
        stat = statSync(fullPath)
      }
      catch {
        continue // Skip files we can't access
      }

      if (stat.isDirectory()) {
        if (SKIP_DIRS.has(entry))
          continue
        collectFiles(fullPath, files)
      }
      else if (entry.endsWith('.ts') || entry.endsWith('.vue')) {
        try {
          const code = readFileSync(fullPath, 'utf-8')
          files.push({ path: fullPath, code })
        }
        catch {
          // Skip files we can't read
        }
      }
    }
  }
  catch {
    // Skip directories we can't read
  }
}

/**
 * Analyze files using AST parsing for accuracy
 */
function analyzeWithAST(
  files: Array<{ path: string, code: string }>,
  analysis: ModuleAnalysis,
  moduleAlias = '~/modules/',
): void {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { allowJs: true, noLib: true },
  })

  // Add all files to the project
  for (const f of files) {
    const scriptContent = extractScript(f.path, f.code)
    analysis.linesOfCode += sloc(scriptContent)
    project.createSourceFile(f.path, scriptContent, { overwrite: true })
  }

  // Analyze each source file
  for (const sf of project.getSourceFiles()) {
    // Find imports from other modules
    sf.getImportDeclarations().forEach((imp) => {
      const spec = imp.getModuleSpecifierValue()
      if (spec.startsWith(moduleAlias)) {
        const imported = spec.slice(moduleAlias.length).split('/')[0]
        if (imported !== analysis.name) {
          analysis.externalImports.add(imported)
        }
      }
    })

    // Find emitAppEvent and onAppEvent calls
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.CallExpression)
        return

      const ce = node.asKind(SyntaxKind.CallExpression)!
      const callee = ce.getExpression().getText()

      // Check for emitAppEvent
      if (callee === 'emitAppEvent' || callee.endsWith('.emitAppEvent')) {
        const args = ce.getArguments()
        if (args.length > 0) {
          const eventName = args[0].getText().replace(/^['"`]|['"`]$/g, '')
          const count = analysis.eventsEmitted.get(eventName) ?? 0
          analysis.eventsEmitted.set(eventName, count + 1)
        }
      }

      // Check for onAppEvent
      if (callee === 'onAppEvent' || callee.endsWith('.onAppEvent')) {
        const args = ce.getArguments()
        if (args.length > 0) {
          const eventName = args[0].getText().replace(/^['"`]|['"`]$/g, '')
          const count = analysis.eventsListenedTo.get(eventName) ?? 0
          analysis.eventsListenedTo.set(eventName, count + 1)
        }
      }
    })
  }
}

/**
 * Fallback regex-based analysis (more lenient but less accurate)
 */
function analyzeWithRegex(
  files: Array<{ path: string, code: string }>,
  analysis: ModuleAnalysis,
  moduleAlias = '~/modules/',
): void {
  // Hardened regex patterns
  const emitRegex = /emitAppEvent\s*\(\s*(['"`])([\s\S]*?)\1/g
  const listenRegex = /onAppEvent\s*\(\s*(['"`])([\s\S]*?)\1/g
  const importRegex = new RegExp(`import[^'"]*from\\s+['"]${moduleAlias.replace(/[/~]/g, '\\$&')}([^/'"]+)`, 'g')

  for (const f of files) {
    const scriptContent = extractScript(f.path, f.code)
    analysis.linesOfCode += sloc(scriptContent)

    // Find event emissions
    let emitMatch = emitRegex.exec(scriptContent)
    while (emitMatch !== null) {
      const eventName = emitMatch[2]
      const count = analysis.eventsEmitted.get(eventName) ?? 0
      analysis.eventsEmitted.set(eventName, count + 1)
      emitMatch = emitRegex.exec(scriptContent)
    }

    // Find event listeners
    let listenMatch = listenRegex.exec(scriptContent)
    while (listenMatch !== null) {
      const eventName = listenMatch[2]
      const count = analysis.eventsListenedTo.get(eventName) ?? 0
      analysis.eventsListenedTo.set(eventName, count + 1)
      listenMatch = listenRegex.exec(scriptContent)
    }

    // Find imports
    let importMatch = importRegex.exec(scriptContent)
    while (importMatch !== null) {
      const imported = importMatch[1]
      if (imported !== analysis.name) {
        analysis.externalImports.add(imported)
      }
      importMatch = importRegex.exec(scriptContent)
    }
  }
}

function calculateIndependenceScore(analysis: ModuleAnalysis): number {
  // Scoring algorithm based on single-spa principles
  let score = 100

  // Penalty for event emissions (creates coupling)
  // Use log-scaled frequency weighting
  const emitCount = Array.from(analysis.eventsEmitted.values()).reduce((sum, count) => sum + count, 0)
  score -= Math.min(20, 2 * analysis.eventsEmitted.size + Math.log1p(emitCount))

  // Penalty for event listeners (depends on other modules)
  const listenCount = Array.from(analysis.eventsListenedTo.values()).reduce((sum, count) => sum + count, 0)
  score -= Math.min(25, 3 * analysis.eventsListenedTo.size + Math.log1p(listenCount))

  // Penalty for external imports (direct coupling)
  score -= Math.min(30, analysis.externalImports.size * 5)

  // Bonus for having api.ts (good public interface)
  if (analysis.hasApiFile)
    score += 5

  // Bonus for having events.ts (clear event contract)
  if (analysis.hasEventsFile)
    score += 5

  // Smooth size penalty (sigmoid-like)
  if (analysis.linesOfCode > 800) {
    const excess = analysis.linesOfCode - 800
    score -= Math.min(20, Math.log1p(excess / 100) * 5)
  }

  // Utility modules should have higher scores
  if (analysis.category === 'utility') {
    score += 10
  }

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score))
}

function getScoreColor(score: number): string {
  if (score >= 90)
    return colors.green
  if (score >= 70)
    return colors.cyan
  if (score >= 50)
    return colors.yellow
  return colors.red
}

function getStars(score: number): string {
  const numStars = Math.ceil(score / 20)
  return '⭐'.repeat(numStars)
}

function buildDependencyGraph(analyses: ModuleAnalysis[]): DependencyGraph {
  const graph: DependencyGraph = {}

  for (const analysis of analyses) {
    graph[analysis.name] = Array.from(analysis.externalImports)
  }

  return graph
}

/**
 * Normalize a cycle to canonical form for deduplication
 */
function canonicalCycle(cycle: string[]): string {
  const core = cycle.slice(0, -1) // Remove duplicate end node
  if (core.length === 0)
    return ''

  // Find the rotation that starts with the lexicographically smallest element
  let minIndex = 0
  for (let i = 1; i < core.length; i++) {
    if (core[i] < core[minIndex]) {
      minIndex = i
    }
  }

  const rotated = core.slice(minIndex).concat(core.slice(0, minIndex))
  return rotated.join('->')
}

function findCircularDependencies(graph: DependencyGraph): string[][] {
  const cycleSet = new Set<string>()
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(node: string, path: string[]): void {
    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    for (const neighbor of graph[node] || []) {
      // Only process neighbors that exist in the graph
      if (!Object.hasOwn(graph, neighbor))
        continue

      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path])
      }
      else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor)
        if (cycleStart !== -1) {
          const cycle = [...path.slice(cycleStart), neighbor]
          const canonical = canonicalCycle(cycle)
          if (canonical) {
            cycleSet.add(canonical)
          }
        }
      }
    }

    recursionStack.delete(node)
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  }

  // Convert back to arrays
  return Array.from(cycleSet).map((s) => {
    const nodes = s.split('->')
    return [...nodes, nodes[0]] // Add first node at end to close cycle
  })
}

function printReport(analyses: ModuleAnalysis[]): void {
  console.log(`\n${colors.bright}${colors.cyan}┌─────────────────────────────────────────────────────┐`)
  console.log(`│  MarkVim Module Independence Analysis              │`)
  console.log(`│  Based on single-spa best practices                │`)
  console.log(`└─────────────────────────────────────────────────────┘${colors.reset}\n`)

  // Sort by score (lowest first to highlight issues)
  const sorted = [...analyses].sort((a, b) => a.independenceScore - b.independenceScore)

  console.log(`${colors.bright}Module Independence Scores:${colors.reset}\n`)

  for (const analysis of sorted) {
    const scoreColor = getScoreColor(analysis.independenceScore)
    const stars = getStars(analysis.independenceScore)

    console.log(`${scoreColor}${stars} ${analysis.name.padEnd(20)} ${analysis.independenceScore}%${colors.reset}`)
    console.log(`${colors.gray}   Category: ${analysis.category}${colors.reset}`)
    console.log(`${colors.gray}   Events emitted: ${analysis.eventsEmitted.size}, listened: ${analysis.eventsListenedTo.size}${colors.reset}`)
    console.log(`${colors.gray}   External imports: ${analysis.externalImports.size}, LOC: ${analysis.linesOfCode}${colors.reset}`)

    if (analysis.externalImports.size > 0) {
      console.log(`${colors.gray}   Depends on: ${Array.from(analysis.externalImports).join(', ')}${colors.reset}`)
    }

    console.log()
  }

  // Overall statistics
  const avgScore = analyses.length > 0 ? analyses.reduce((sum, a) => sum + a.independenceScore, 0) / analyses.length : 0
  const totalEvents = analyses.reduce((sum, a) => sum + a.eventsEmitted.size + a.eventsListenedTo.size, 0)

  console.log(`${colors.bright}Overall Statistics:${colors.reset}`)
  console.log(`  Average Independence Score: ${getScoreColor(avgScore)}${avgScore.toFixed(1)}%${colors.reset}`)
  console.log(`  Total Modules: ${analyses.length}`)
  console.log(`  Total Events: ${totalEvents}`)
  console.log(`  Utility Modules: ${analyses.filter(a => a.category === 'utility').length}`)
  console.log(`  Feature Modules: ${analyses.filter(a => a.category === 'feature').length}`)
  console.log(`  UI Component Modules: ${analyses.filter(a => a.category === 'ui-component').length}`)

  // Recommendations
  console.log(`\n${colors.bright}${colors.yellow}Recommendations:${colors.reset}`)

  const lowScoreModules = analyses.filter(a => a.independenceScore < 70)
  if (lowScoreModules.length > 0) {
    console.log(`\n${colors.yellow}⚠ Low Independence Modules (< 70%):${colors.reset}`)
    for (const module of lowScoreModules) {
      console.log(`  - ${module.name}: Consider reducing external imports or event coupling`)
    }
  }

  const highCoupling = analyses.filter(a => a.externalImports.size > 2)
  if (highCoupling.length > 0) {
    console.log(`\n${colors.yellow}⚠ High Coupling Modules (> 2 external imports):${colors.reset}`)
    for (const module of highCoupling) {
      console.log(`  - ${module.name}: Imports from ${Array.from(module.externalImports).join(', ')}`)
    }
  }

  // Check for circular dependencies
  const graph = buildDependencyGraph(analyses)
  const cycles = findCircularDependencies(graph)

  if (cycles.length > 0) {
    console.log(`\n${colors.red}⚠ Circular Dependencies Detected:${colors.reset}`)
    for (const cycle of cycles) {
      console.log(`  - ${cycle.join(' → ')}`)
    }
  }
  else {
    console.log(`\n${colors.green}✓ No circular dependencies detected${colors.reset}`)
  }

  // Microfrontend readiness
  const readyModules = analyses.filter(a => a.independenceScore >= 80)
  const readinessPercent = (readyModules.length / analyses.length) * 100

  console.log(`\n${colors.bright}${colors.cyan}Microfrontend Readiness:${colors.reset}`)
  console.log(`  ${readyModules.length}/${analyses.length} modules (${readinessPercent.toFixed(0)}%) are 80%+ independent`)

  if (readinessPercent >= 80) {
    console.log(`  ${colors.green}✓ Project is microfrontend-ready!${colors.reset}`)
  }
  else if (readinessPercent >= 60) {
    console.log(`  ${colors.yellow}⚠ Getting close! Focus on reducing coupling.${colors.reset}`)
  }
  else {
    console.log(`  ${colors.red}⚠ Needs work to be microfrontend-ready.${colors.reset}`)
  }

  console.log()
}

/**
 * Generate Mermaid graph visualization
 */
function toMermaid(graph: DependencyGraph, analyses: ModuleAnalysis[]): string {
  const lines = ['graph LR']

  // Add nodes with styling based on independence score
  for (const analysis of analyses) {
    const score = Math.round(analysis.independenceScore)
    let style = 'default'
    if (score >= 90)
      style = 'green'
    else if (score >= 70)
      style = 'cyan'
    else if (score >= 50)
      style = 'yellow'
    else style = 'red'

    lines.push(`  ${analysis.name}["${analysis.name}<br/>${score}%"]`)
    lines.push(`  class ${analysis.name} ${style}`)
  }

  // Add edges
  for (const [from, targets] of Object.entries(graph)) {
    for (const to of targets) {
      lines.push(`  ${from} --> ${to}`)
    }
  }

  // Define styles
  lines.push('')
  lines.push('  classDef green fill:#22c55e,stroke:#16a34a,color:#fff')
  lines.push('  classDef cyan fill:#06b6d4,stroke:#0891b2,color:#fff')
  lines.push('  classDef yellow fill:#eab308,stroke:#ca8a04,color:#000')
  lines.push('  classDef red fill:#ef4444,stroke:#dc2626,color:#fff')

  return lines.join('\n')
}

/**
 * Export analysis to JSON
 */
function toJSON(analyses: ModuleAnalysis[]): string {
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    analyses: analyses.map(a => ({
      name: a.name,
      category: a.category,
      score: a.independenceScore,
      eventsEmitted: Array.from(a.eventsEmitted.entries()),
      eventsListenedTo: Array.from(a.eventsListenedTo.entries()),
      externalImports: Array.from(a.externalImports),
      linesOfCode: a.linesOfCode,
      hasApiFile: a.hasApiFile,
      hasEventsFile: a.hasEventsFile,
      hasStoreFile: a.hasStoreFile,
    })),
  }
  return JSON.stringify(jsonOutput, null, 2)
}

/**
 * Generate output based on format
 */
function generateOutput(
  format: string,
  analyses: ModuleAnalysis[],
  graph: DependencyGraph,
  shouldCapture: boolean,
): string {
  switch (format) {
    case 'json':
      return toJSON(analyses)

    case 'mermaid':
      return `\`\`\`mermaid\n${toMermaid(graph, analyses)}\n\`\`\``

    case 'text':
    default:
      if (shouldCapture) {
        const originalLog = console.log
        const logs: string[] = []
        console.log = (...args) => logs.push(args.join(' '))
        printReport(analyses)
        console.log = originalLog
        return logs.join('\n')
      }
      printReport(analyses)
      return ''
  }
}

/**
 * Check thresholds and exit if needed
 */
function checkThresholds(
  analyses: ModuleAnalysis[],
  cycles: string[][],
  threshold?: number,
  failOnCycle?: boolean,
): void {
  const avgScore = analyses.length > 0
    ? analyses.reduce((sum, a) => sum + a.independenceScore, 0) / analyses.length
    : 0

  if (threshold && avgScore < threshold) {
    console.error(`${colors.red}✗ Average score ${avgScore.toFixed(1)}% below threshold ${threshold}%${colors.reset}`)
    process.exit(1)
  }

  if (failOnCycle && cycles.length > 0) {
    console.error(`${colors.red}✗ Circular dependencies detected${colors.reset}`)
    process.exit(1)
  }
}

// Main execution
function main(): void {
  const program = new Command()

  program
    .name('analyze-module-independence')
    .description('Analyze module independence for microfrontend readiness')
    .version('2.0.0')
    .option('--format <type>', 'Output format: text, json, or mermaid', 'text')
    .option('--output <file>', 'Save output to file instead of stdout')
    .option('--threshold <score>', 'Exit with error if avg score below threshold', Number.parseFloat)
    .option('--fail-on-cycle', 'Exit with error if circular dependencies found', false)
    .option('--no-ast', 'Disable AST parsing, use regex fallback', false)
    .option('--alias <path>', 'Module import alias', '~/modules/')
    .parse(process.argv)

  const options = program.opts()

  if (!existsSync(MODULES_DIR)) {
    console.error(`${colors.red}Error: Modules directory not found at ${MODULES_DIR}${colors.reset}`)
    process.exit(1)
  }

  const moduleDirs = readdirSync(MODULES_DIR).filter((entry) => {
    const fullPath = join(MODULES_DIR, entry)
    return statSync(fullPath).isDirectory()
  })

  const analyses = moduleDirs.map(moduleName =>
    analyzeModule(moduleName, join(MODULES_DIR, moduleName), options.ast),
  )

  const graph = buildDependencyGraph(analyses)
  const cycles = findCircularDependencies(graph)

  const output = generateOutput(options.format, analyses, graph, Boolean(options.output))

  // Write to file if specified
  if (options.output && output) {
    writeFileSync(options.output, output, 'utf-8')
    console.log(`${colors.green}✓ Output saved to ${options.output}${colors.reset}`)
  }
  else if (options.format !== 'text' && output) {
    console.log(output)
  }

  checkThresholds(analyses, cycles, options.threshold, options.failOnCycle)
}

main()
