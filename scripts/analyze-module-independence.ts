#!/usr/bin/env tsx
/**
 * Module Independence Analyzer — v4 (Functional Core, Imperative Shell)
 *
 * Functional Core:
 *   - Pure types, analyzers, scoring, graph ops, and renderers
 * Imperative Shell:
 *   - CLI, config loading, filesystem walking, reading files, writing files, printing
 *
 * Libraries:
 *   fast-glob, cosmiconfig, @phenomnomnominal/tsquery, typescript, sloc,
 *   @vue/compiler-sfc, commander, picocolors, (optional) dependency-cruiser
 */

/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import process from 'node:process'
import { tsquery } from '@phenomnomnominal/tsquery'
import { parse as parseSFC } from '@vue/compiler-sfc'
import { Command } from 'commander'
import { cosmiconfig } from 'cosmiconfig'
import fg from 'fast-glob'
import pc from 'picocolors'
import sloc from 'sloc'
import * as ts from 'typescript'

// Optional: we only use if installed
let cruise: ((paths: string[], options: any) => Promise<any>) | undefined
try {
  // eslint-disable-next-line ts/no-require-imports
  cruise = require('dependency-cruiser').cruise
}
catch {
  /* noop */
}

/* ======================================================================================
 * Functional Core (pure)
 * ==================================================================================== */

type Category = 'feature' | 'utility' | 'ui-component'

export interface ModuleAnalysis {
  name: string
  path: string
  eventsEmitted: Map<string, number>
  eventsListenedTo: Map<string, number>
  externalImports: Set<string>
  sharedImports: Map<string, number>
  typeImports: Map<string, number>
  linesOfCode: number
  hasApiFile: boolean
  hasEventsFile: boolean
  hasStoreFile: boolean
  independenceScore: number
  category: Category
  // New analysis fields
  apiSurface: ApiSurfaceAnalysis
  storeComplexity: StoreComplexityAnalysis
  componentCoupling: ComponentCouplingAnalysis
  bundleSize: BundleSizeAnalysis
  eventFlow: EventFlowAnalysis
  facadeViolations: FacadeViolation[]
  crossModuleTypes: Set<string>
}

export interface ApiSurfaceAnalysis {
  totalExports: number
  usedExternally: Set<string>
  unusedExports: Set<string>
  usageRate: number
}

export interface StoreComplexityAnalysis {
  hasStore: boolean
  actions: number
  getters: number
  state: number
  mutations: number
}

export interface ComponentCouplingAnalysis {
  componentCount: number
  totalProps: number
  totalEmits: number
  averagePropsPerComponent: number
  averageEmitsPerComponent: number
}

export interface BundleSizeAnalysis {
  estimatedKb: number
  fileCount: number
  largestFiles: Array<{ path: string, loc: number }>
}

export interface EventFlowAnalysis {
  emitters: Map<string, string[]>
  listeners: Map<string, string[]>
  orphanedEmits: Set<string>
  orphanedListeners: Set<string>
}

export interface FacadeViolation {
  file: string
  line: number
  importedStore: string
}

/** Display constants for new features */
const NEW_FEATURE_CONSTANTS = {
  API_USAGE_EXCELLENT: 80,
  API_USAGE_FAIR: 50,
  TOP_FILES_LIMIT: 3,
  TOP_UNUSED_LIMIT: 3,
  TOP_CROSS_TYPES_LIMIT: 3,
  BLOAT_PERCENTAGE: 100,
} as const

export type DependencyGraph = Record<string, string[]>

export interface ConfigShape {
  aliases?: Record<string, string>
  moduleAlias?: string
  sharedAliases?: string[]
  categories?: Record<Category, string[]>
  thresholds?: {
    average?: number
    minScore?: number
    failOnCycle?: boolean
    maxImports?: number
    maxSharedRatio?: number
  }
  ignore?: string[]
}

export interface BaselineData {
  timestamp: string
  analyses: Array<{
    name: string
    score: number
  }>
}

export interface FileRecord {
  /** Absolute path */
  filePath: string
  /** Script content (already extracted for .vue) */
  script: string
  /** Basename of the file (e.g. api.ts) */
  base: string
  /** Module name the file belongs to */
  moduleName: string
  /** Shared import segments discovered within the file */
  sharedImports: Map<string, number>
  /** Type imports from ~/types/ */
  typeImports: Map<string, number>
}

export interface SharedSurfaceStats {
  totalLoc: number
  totalFiles: number
  directories: Array<{ name: string, loc: number, files: number }>
  bloatWarning: boolean
  bloatRatio: number
}

/** Core constants (pure defaults) */
const DEFAULTS = {
  moduleAlias: '~/modules/',
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.output/**',
    '**/.nuxt/**',
    '**/coverage/**',
    '**/__tests__/**',
    '**/__mocks__/**',
    '**/stories/**',
    '**/storybook/**',
    '**/e2e/**',
    '**/playwright-report/**',
    '**/.playwright/**',
  ],
}

/** Scoring constants */
const SCORE_CONSTANTS = {
  BASE_SCORE: 100,
  UI_COMPONENT_EMIT_WEIGHT: 0.5,
  NORMAL_EMIT_WEIGHT: 1,
  EMIT_SIZE_MULTIPLIER: 2,
  MAX_EMIT_PENALTY: 20,
  LISTEN_SIZE_MULTIPLIER: 3,
  MAX_LISTEN_PENALTY: 25,
  IMPORT_MULTIPLIER: 5,
  MAX_IMPORT_PENALTY: 30,
  SHARED_UNIQUE_MULTIPLIER: 3,
  SHARED_TOTAL_MULTIPLIER: 1,
  MAX_SHARED_PENALTY: 20,
  API_FILE_BONUS: 5,
  EVENTS_FILE_BONUS: 5,
  BOTH_FILES_BONUS: 5,
  LOC_THRESHOLD: 800,
  LOC_DIVISOR: 100,
  LOC_MULTIPLIER: 5,
  MAX_LOC_PENALTY: 20,
  UTILITY_BONUS: 10,
  SYMMETRIC_PENALTY: 2,
} as const

/** Threshold constants */
const THRESHOLD_CONSTANTS = {
  EXCELLENT: 90,
  GOOD: 70,
  FAIR: 50,
  MICROFRONTEND_READY: 80,
  GETTING_CLOSE: 60,
} as const

/** Display constants */
const DISPLAY_CONSTANTS = {
  STARS_DIVISOR: 20,
  TOP_DEPS_LIMIT: 3,
  NOISIEST_EVENTS_LIMIT: 3,
  HIGH_COUPLING_THRESHOLD: 2,
  SHARED_USAGE_THRESHOLD: 5,
  SHARED_TOP_LIMIT: 5,
} as const

/** Strict mode defaults (for CI/fitness function) */
const STRICT_MODE_DEFAULTS = {
  AVERAGE_THRESHOLD: 80,
  MIN_SCORE_THRESHOLD: 70,
  MAX_IMPORTS_THRESHOLD: 5,
  FAIL_ON_CYCLE: true,
  BASELINE_TOLERANCE: 5,
  MAX_SHARED_RATIO: 0.3,
} as const

const SHARED_IMPORT_PREFIXES = ['~/shared/', '~/shared', '@/shared/', '@/shared'] as const
const TYPE_IMPORT_PREFIXES = ['~/types/', '~/types', '@/types/', '@/types'] as const
const PERCENT_BASE = 100
const SHARED_BLOAT_THRESHOLD = 0.3 // Warn if shared is >30% of total codebase
const KB_PER_LOC = 0.03 // Rough estimate: 30 bytes per LOC

/** Utility pure helpers */
function sanitizeId(name: string): string {
  return name.replace(/\W/g, '_')
}

function countSloc(scriptText: string, ext: string): number {
  const lang
    = ext.endsWith('.ts') || ext.endsWith('.tsx') || ext.endsWith('.vue')
      ? 'ts'
      : ext.endsWith('.js')
        ? 'js'
        : 'ts'
  const res = sloc(scriptText, lang)
  return res.source || 0
}

function extractSharedSegment(importPath: string, aliasPrefixes: readonly string[]): string | null {
  for (const prefix of aliasPrefixes) {
    const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`
    const bare = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
    if (importPath === bare || importPath === normalized.slice(0, -1))
      return 'root'
    if (importPath.startsWith(normalized)) {
      const remainder = importPath.slice(normalized.length)
      const segment = remainder.split('/')[0]
      return segment || 'root'
    }
  }
  return null
}

function collectSharedImports(
  scriptText: string,
  virtualFilename: string,
  aliasPrefixes: readonly string[],
): Map<string, number> {
  const result = new Map<string, number>()
  const add = (specifier?: string): void => {
    if (!specifier)
      return
    const segment = extractSharedSegment(specifier, aliasPrefixes)
    if (!segment)
      return
    result.set(segment, (result.get(segment) ?? 0) + 1)
  }

  const scriptKind
    = virtualFilename.endsWith('.tsx')
      ? ts.ScriptKind.TSX
      : virtualFilename.endsWith('.ts')
        ? ts.ScriptKind.TS
        : ts.ScriptKind.TS

  const src = ts.createSourceFile(virtualFilename, scriptText, ts.ScriptTarget.Latest, true, scriptKind)

  const processCallExpression = (node: ts.CallExpression): void => {
    const expr = node.expression
    if (expr.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(expr) && expr.text === 'import')) {
      const arg = node.arguments[0]
      if (arg && ts.isStringLiteralLike(arg))
        add(arg.text)
    }
    else if (ts.isIdentifier(expr) && expr.text === 'require') {
      const arg = node.arguments[0]
      if (arg && ts.isStringLiteralLike(arg))
        add(arg.text)
    }
  }

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      if (ts.isStringLiteralLike(node.moduleSpecifier))
        add(node.moduleSpecifier.text)
    }
    else if (ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier))
        add(node.moduleSpecifier.text)
    }
    else if (ts.isCallExpression(node)) {
      processCallExpression(node)
    }

    ts.forEachChild(node, visit)
  }

  visit(src)
  return result
}

function collectTypeImports(
  scriptText: string,
  virtualFilename: string,
  aliasPrefixes: readonly string[],
): Map<string, number> {
  const result = new Map<string, number>()
  const add = (specifier?: string): void => {
    if (!specifier)
      return
    const segment = extractSharedSegment(specifier, aliasPrefixes)
    if (!segment)
      return
    result.set(segment, (result.get(segment) ?? 0) + 1)
  }

  const scriptKind
    = virtualFilename.endsWith('.tsx')
      ? ts.ScriptKind.TSX
      : virtualFilename.endsWith('.ts')
        ? ts.ScriptKind.TS
        : ts.ScriptKind.TS

  const src = ts.createSourceFile(virtualFilename, scriptText, ts.ScriptTarget.Latest, true, scriptKind)

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      if (ts.isStringLiteralLike(node.moduleSpecifier))
        add(node.moduleSpecifier.text)
    }
    else if (ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier))
        add(node.moduleSpecifier.text)
    }

    ts.forEachChild(node, visit)
  }

  visit(src)
  return result
}

function _normalizeRatioInput(input?: number): number | undefined {
  if (input == null || Number.isNaN(input))
    return undefined
  const ratio = input > 1 ? input / PERCENT_BASE : input
  if (!Number.isFinite(ratio))
    return undefined
  return Math.min(1, Math.max(0, ratio))
}

function determineCategory(moduleName: string, map?: Record<Category, string[]>): Category {
  if (map) {
    // eslint-disable-next-line ts/consistent-type-assertions
    const categoryEntries: Array<[Category, string[]]> = Object.entries(map) as Array<[Category, string[]]>
    for (const [cat, list] of categoryEntries) {
      if (list?.includes(moduleName))
        return cat
    }
  }
  // fallback heuristics
  const utilities = new Set(['domain', 'feature-flags'])
  const uiComponents = new Set(['layout', 'markdown-preview'])
  if (utilities.has(moduleName))
    return 'utility'
  if (uiComponents.has(moduleName))
    return 'ui-component'
  return 'feature'
}

/** Analyze events using TypeScript AST + tsquery (pure) */
// eslint-disable-next-line complexity
function analyzeEvents(scriptText: string, virtualFilename: string): {
  emitted: Map<string, number>
  listened: Map<string, number>
  emittedLocations: Map<string, number[]>
  listenedLocations: Map<string, number[]>
} {
  const emitted = new Map<string, number>()
  const listened = new Map<string, number>()
  const emittedLocations = new Map<string, number[]>()
  const listenedLocations = new Map<string, number[]>()

  const scriptKind
    = virtualFilename.endsWith('.tsx')
      ? ts.ScriptKind.TSX
      : virtualFilename.endsWith('.ts')
        ? ts.ScriptKind.TS
        : ts.ScriptKind.TS

  const src = ts.createSourceFile(virtualFilename, scriptText, ts.ScriptTarget.Latest, true, scriptKind)

  for (const node of tsquery(src, `CallExpression:has(Identifier[name="emitAppEvent"])`)) {
    if (!ts.isCallExpression(node))
      continue
    const arg = node.arguments?.[0]
    if (arg && ts.isStringLiteralLike(arg)) {
      emitted.set(arg.text, (emitted.get(arg.text) ?? 0) + 1)
      const line = src.getLineAndCharacterOfPosition(node.getStart()).line + 1
      if (!emittedLocations.has(arg.text))
        emittedLocations.set(arg.text, [])
      emittedLocations.get(arg.text)!.push(line)
    }
  }
  for (const node of tsquery(src, `CallExpression:has(Identifier[name="onAppEvent"])`)) {
    if (!ts.isCallExpression(node))
      continue
    const arg = node.arguments?.[0]
    if (arg && ts.isStringLiteralLike(arg)) {
      listened.set(arg.text, (listened.get(arg.text) ?? 0) + 1)
      const line = src.getLineAndCharacterOfPosition(node.getStart()).line + 1
      if (!listenedLocations.has(arg.text))
        listenedLocations.set(arg.text, [])
      listenedLocations.get(arg.text)!.push(line)
    }
  }

  return { emitted, listened, emittedLocations, listenedLocations }
}

/** Analyze API surface from api.ts file (pure) */
function analyzeApiSurface(
  scriptText: string,
  virtualFilename: string,
  moduleFiles: FileRecord[],
  allFiles: FileRecord[],
): ApiSurfaceAnalysis {
  const scriptKind = virtualFilename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const src = ts.createSourceFile(virtualFilename, scriptText, ts.ScriptTarget.Latest, true, scriptKind)

  const exports = new Set<string>()
  const usedExternally = new Set<string>()

  // Collect all exports from api.ts
  const collectExportDeclaration = (node: ts.ExportDeclaration): void => {
    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const element of node.exportClause.elements)
        exports.add(element.name.text)
    }
  }

  const collectFunctionExport = (node: ts.FunctionDeclaration): void => {
    if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) && node.name)
      exports.add(node.name.text)
  }

  const collectVariableExport = (node: ts.VariableStatement): void => {
    if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name))
          exports.add(decl.name.text)
      }
    }
  }

  const collectExports = (node: ts.Node): void => {
    if (ts.isExportDeclaration(node))
      collectExportDeclaration(node)
    else if (ts.isFunctionDeclaration(node))
      collectFunctionExport(node)
    else if (ts.isVariableStatement(node))
      collectVariableExport(node)
    ts.forEachChild(node, collectExports)
  }
  collectExports(src)

  // Check usage in external modules (files not in the same module)
  const moduleName = moduleFiles[0]?.moduleName
  const externalFiles = allFiles.filter(f => f.moduleName !== moduleName)

  // Helper to check imports in a file
  const checkFileImports = (file: FileRecord): void => {
    const fileSrc = ts.createSourceFile(file.filePath, file.script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const visitImports = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
        const importPath = node.moduleSpecifier.text
        if (importPath.includes(`/modules/${moduleName}/`)) {
          if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
            for (const element of node.importClause.namedBindings.elements) {
              if (exports.has(element.name.text))
                usedExternally.add(element.name.text)
            }
          }
        }
      }
      ts.forEachChild(node, visitImports)
    }
    visitImports(fileSrc)
  }

  for (const file of externalFiles)
    checkFileImports(file)

  const unusedExports = new Set([...exports].filter(e => !usedExternally.has(e)))
  const usageRate = exports.size > 0 ? (usedExternally.size / exports.size) * PERCENT_BASE : PERCENT_BASE

  return {
    totalExports: exports.size,
    usedExternally,
    unusedExports,
    usageRate,
  }
}

/** Analyze Pinia store complexity (pure) */
function analyzeStoreComplexity(scriptText: string, virtualFilename: string): StoreComplexityAnalysis {
  if (!scriptText)
    return { hasStore: false, actions: 0, getters: 0, state: 0, mutations: 0 }

  const scriptKind = virtualFilename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const src = ts.createSourceFile(virtualFilename, scriptText, ts.ScriptTarget.Latest, true, scriptKind)

  let actions = 0
  let getters = 0
  let state = 0

  const visit = (node: ts.Node): void => {
    // Count state properties
    if (ts.isCallExpression(node)) {
      const expr = node.expression
      if (ts.isIdentifier(expr) && (expr.text === 'ref' || expr.text === 'reactive' || expr.text === 'computed'))
        state++
      if (ts.isIdentifier(expr) && expr.text === 'computed')
        getters++
    }
    // Count functions (potential actions)
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node))
      actions++

    ts.forEachChild(node, visit)
  }
  visit(src)

  return {
    hasStore: true,
    actions,
    getters,
    state,
    mutations: 0, // Pinia doesn't have mutations, TEA uses dispatch
  }
}

/** Analyze component coupling via props/events (pure) */
// eslint-disable-next-line complexity
function analyzeComponentCoupling(moduleFiles: FileRecord[]): ComponentCouplingAnalysis {
  let componentCount = 0
  let totalProps = 0
  let totalEmits = 0

  for (const file of moduleFiles) {
    if (!file.filePath.endsWith('.vue'))
      continue

    componentCount++

    // Use tsquery to find defineProps and defineEmits
    const scriptKind = ts.ScriptKind.TS
    const src = ts.createSourceFile(file.filePath, file.script, ts.ScriptTarget.Latest, true, scriptKind)

    for (const node of tsquery(src, `CallExpression:has(Identifier[name="defineProps"])`)) {
      if (ts.isCallExpression(node)) {
        const typeArg = node.typeArguments?.[0]
        if (typeArg && ts.isTypeLiteralNode(typeArg))
          totalProps += typeArg.members.length
      }
    }

    for (const node of tsquery(src, `CallExpression:has(Identifier[name="defineEmits"])`)) {
      if (ts.isCallExpression(node)) {
        const typeArg = node.typeArguments?.[0]
        if (typeArg && ts.isTypeLiteralNode(typeArg))
          totalEmits += typeArg.members.length
      }
    }
  }

  return {
    componentCount,
    totalProps,
    totalEmits,
    averagePropsPerComponent: componentCount > 0 ? totalProps / componentCount : 0,
    averageEmitsPerComponent: componentCount > 0 ? totalEmits / componentCount : 0,
  }
}

/** Estimate bundle size (pure) */
function analyzeBundleSize(moduleFiles: FileRecord[]): BundleSizeAnalysis {
  let totalLoc = 0
  const fileMetrics: Array<{ path: string, loc: number }> = []

  for (const file of moduleFiles) {
    const loc = countSloc(file.script, file.filePath)
    totalLoc += loc
    fileMetrics.push({ path: file.filePath, loc })
  }

  const largestFiles = fileMetrics
    .sort((a, b) => b.loc - a.loc)
    .slice(0, DISPLAY_CONSTANTS.SHARED_TOP_LIMIT)

  return {
    estimatedKb: totalLoc * KB_PER_LOC,
    fileCount: moduleFiles.length,
    largestFiles,
  }
}

/** Detect facade pattern violations (pure) */
function detectFacadeViolations(moduleFiles: FileRecord[], allFiles: FileRecord[]): FacadeViolation[] {
  const violations: FacadeViolation[] = []
  const moduleName = moduleFiles[0]?.moduleName
  const externalFiles = allFiles.filter(f => f.moduleName !== moduleName)

  for (const file of externalFiles) {
    const scriptKind = ts.ScriptKind.TS
    const src = ts.createSourceFile(file.filePath, file.script, ts.ScriptTarget.Latest, true, scriptKind)

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
        const importPath = node.moduleSpecifier.text
        // Check if importing directly from store.ts (not via api.ts)
        if (importPath.includes(`/modules/${moduleName}/store`)) {
          const line = src.getLineAndCharacterOfPosition(node.getStart()).line + 1
          violations.push({
            file: file.filePath,
            line,
            importedStore: `${moduleName}/store`,
          })
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(src)
  }

  return violations
}

/** Detect cross-module type dependencies (pure) */
function detectCrossModuleTypes(moduleFiles: FileRecord[], _allFiles: FileRecord[]): Set<string> {
  const crossTypes = new Set<string>()
  const moduleName = moduleFiles[0]?.moduleName

  for (const file of moduleFiles) {
    const scriptKind = ts.ScriptKind.TS
    const src = ts.createSourceFile(file.filePath, file.script, ts.ScriptTarget.Latest, true, scriptKind)

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
        const importPath = node.moduleSpecifier.text
        // Check if importing types from another module
        const moduleMatch = importPath.match(/\/modules\/([^/]+)\//)
        if (moduleMatch && moduleMatch[1] !== moduleName) {
          if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
            for (const element of node.importClause.namedBindings.elements) {
              crossTypes.add(`${moduleMatch[1]}.${element.name.text}`)
            }
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(src)
  }

  return crossTypes
}

/** Aggregate module analysis from file records (pure) */
// eslint-disable-next-line complexity
function buildModuleAnalyses(
  files: FileRecord[],
  categories?: Record<Category, string[]>,
): ModuleAnalysis[] {
  const byModule = new Map<string, FileRecord[]>()
  for (const f of files) {
    if (!byModule.has(f.moduleName))
      byModule.set(f.moduleName, [])
    byModule.get(f.moduleName)!.push(f)
  }

  const analyses: ModuleAnalysis[] = []
  for (const [name, moduleFiles] of byModule.entries()) {
    let loc = 0
    let hasApi = false
    let hasEvents = false
    let hasStore = false
    const emitted = new Map<string, number>()
    const listened = new Map<string, number>()
    const sharedImports = new Map<string, number>()
    const typeImports = new Map<string, number>()
    const emittedLocations = new Map<string, number[]>()
    const listenedLocations = new Map<string, number[]>()
    let apiFileContent = ''

    for (const fr of moduleFiles) {
      loc += countSloc(fr.script, fr.filePath)
      const b = fr.base
      if (b === 'api.ts' || b === 'api.tsx') {
        hasApi = true
        apiFileContent = fr.script
      }
      if (b === 'events.ts' || b === 'events.tsx')
        hasEvents = true
      if (b === 'store.ts' || b === 'store.tsx')
        hasStore = true

      const ev = analyzeEvents(fr.script, fr.filePath)
      for (const [k, v] of ev.emitted) emitted.set(k, (emitted.get(k) ?? 0) + v)
      for (const [k, v] of ev.listened) listened.set(k, (listened.get(k) ?? 0) + v)
      for (const [k, v] of ev.emittedLocations) {
        if (!emittedLocations.has(k))
          emittedLocations.set(k, [])
        emittedLocations.get(k)!.push(...v)
      }
      for (const [k, v] of ev.listenedLocations) {
        if (!listenedLocations.has(k))
          listenedLocations.set(k, [])
        listenedLocations.get(k)!.push(...v)
      }

      // Aggregate shared imports
      for (const [k, v] of fr.sharedImports) sharedImports.set(k, (sharedImports.get(k) ?? 0) + v)
      // Aggregate type imports
      for (const [k, v] of fr.typeImports) typeImports.set(k, (typeImports.get(k) ?? 0) + v)
    }

    // Build event flow analysis
    const eventFlow: EventFlowAnalysis = {
      emitters: new Map(Array.from(emitted.keys()).map(e => [e, emittedLocations.get(e)?.map(String) ?? []])),
      listeners: new Map(Array.from(listened.keys()).map(e => [e, listenedLocations.get(e)?.map(String) ?? []])),
      orphanedEmits: new Set([...emitted.keys()].filter(e => !listened.has(e))),
      orphanedListeners: new Set([...listened.keys()].filter(e => !emitted.has(e))),
    }

    // Analyze API surface if api.ts exists
    const apiSurface = hasApi && apiFileContent
      ? analyzeApiSurface(apiFileContent, 'api.ts', moduleFiles, files)
      : { totalExports: 0, usedExternally: new Set(), unusedExports: new Set(), usageRate: 100 }

    // Analyze store complexity if store exists
    const storeFile = moduleFiles.find(f => f.base === 'store.ts' || f.base === 'store.tsx')
    const storeComplexity = storeFile
      ? analyzeStoreComplexity(storeFile.script, storeFile.filePath)
      : { hasStore: false, actions: 0, getters: 0, state: 0, mutations: 0 }

    // Analyze component coupling
    const componentCoupling = analyzeComponentCoupling(moduleFiles)

    // Analyze bundle size
    const bundleSize = analyzeBundleSize(moduleFiles)

    // Detect facade violations
    const facadeViolations = detectFacadeViolations(moduleFiles, files)

    // Detect cross-module types
    const crossModuleTypes = detectCrossModuleTypes(moduleFiles, files)

    analyses.push({
      name,
      path: '', // shell fills if needed for display
      eventsEmitted: emitted,
      eventsListenedTo: listened,
      externalImports: new Set<string>(), // shell fills from graph
      sharedImports,
      typeImports,
      linesOfCode: loc,
      hasApiFile: hasApi,
      hasEventsFile: hasEvents,
      hasStoreFile: hasStore,
      independenceScore: 0, // core will compute later
      category: determineCategory(name, categories),
      apiSurface,
      storeComplexity,
      componentCoupling,
      bundleSize,
      eventFlow,
      facadeViolations,
      crossModuleTypes,
    })
  }

  return analyses
}

/** Build dependency graph from edges (pure) */
function assembleGraph(moduleNames: string[], edges: Array<{ from: string, to: string }>): DependencyGraph {
  const g: Record<string, Set<string>> = {}
  for (const m of moduleNames) g[m] = new Set()
  for (const { from, to } of edges) {
    if (from !== to && g[from] && g[to])
      g[from].add(to)
  }
  const out: DependencyGraph = {}
  for (const [k, v] of Object.entries(g)) out[k] = Array.from(v)
  return out
}

/** Cycle detection (pure) */
function canonicalCycle(cycle: string[]): string {
  const core = cycle.slice(0, -1)
  if (!core.length)
    return ''
  let min = 0
  for (let i = 1; i < core.length; i++) {
    if (core[i] < core[min])
      min = i
  }
  const rot = core.slice(min).concat(core.slice(0, min))
  return rot.join('->')
}
function findCycles(graph: DependencyGraph): string[][] {
  const cycles = new Set<string>()
  const visited = new Set<string>()
  const stack = new Set<string>()

  function dfs(n: string, path: string[]): void {
    visited.add(n)
    stack.add(n)
    path.push(n)
    for (const m of graph[n] || []) {
      if (!(m in graph))
        continue
      if (!visited.has(m)) {
        dfs(m, [...path])
      }
      else if (stack.has(m)) {
        const start = path.indexOf(m)
        if (start >= 0) {
          const cyc = [...path.slice(start), m]
          const key = canonicalCycle(cyc)
          if (key)
            cycles.add(key)
        }
      }
    }
    stack.delete(n)
  }

  for (const n of Object.keys(graph)) {
    if (!visited.has(n))
      dfs(n, [])
  }
  return Array.from(cycles).map((s) => {
    const nodes = s.split('->')
    return [...nodes, nodes[0]]
  })
}

/** Scoring (pure) */
function scoreModule(a: ModuleAnalysis): number {
  let score = SCORE_CONSTANTS.BASE_SCORE
  const emitCount = Array.from(a.eventsEmitted.values()).reduce((s, v) => s + v, 0)
  const listenCount = Array.from(a.eventsListenedTo.values()).reduce((s, v) => s + v, 0)

  const emitWeight = a.category === 'ui-component'
    ? SCORE_CONSTANTS.UI_COMPONENT_EMIT_WEIGHT
    : SCORE_CONSTANTS.NORMAL_EMIT_WEIGHT
  score -= Math.min(
    SCORE_CONSTANTS.MAX_EMIT_PENALTY,
    emitWeight * (SCORE_CONSTANTS.EMIT_SIZE_MULTIPLIER * a.eventsEmitted.size + Math.log1p(emitCount)),
  )
  score -= Math.min(
    SCORE_CONSTANTS.MAX_LISTEN_PENALTY,
    SCORE_CONSTANTS.LISTEN_SIZE_MULTIPLIER * a.eventsListenedTo.size + Math.log1p(listenCount),
  )
  score -= Math.min(
    SCORE_CONSTANTS.MAX_IMPORT_PENALTY,
    a.externalImports.size * SCORE_CONSTANTS.IMPORT_MULTIPLIER,
  )

  // Penalty for shared imports (diversity and total count)
  const sharedCount = Array.from(a.sharedImports.values()).reduce((s, v) => s + v, 0)
  score -= Math.min(
    SCORE_CONSTANTS.MAX_SHARED_PENALTY,
    SCORE_CONSTANTS.SHARED_UNIQUE_MULTIPLIER * a.sharedImports.size + SCORE_CONSTANTS.SHARED_TOTAL_MULTIPLIER * Math.log1p(sharedCount),
  )

  if (a.hasApiFile)
    score += SCORE_CONSTANTS.API_FILE_BONUS
  if (a.hasEventsFile)
    score += SCORE_CONSTANTS.EVENTS_FILE_BONUS
  if (a.hasApiFile && a.hasEventsFile)
    score += SCORE_CONSTANTS.BOTH_FILES_BONUS

  if (a.linesOfCode > SCORE_CONSTANTS.LOC_THRESHOLD) {
    const excess = a.linesOfCode - SCORE_CONSTANTS.LOC_THRESHOLD
    score -= Math.min(
      SCORE_CONSTANTS.MAX_LOC_PENALTY,
      Math.log1p(excess / SCORE_CONSTANTS.LOC_DIVISOR) * SCORE_CONSTANTS.LOC_MULTIPLIER,
    )
  }
  if (a.category === 'utility')
    score += SCORE_CONSTANTS.UTILITY_BONUS

  return Math.max(0, Math.min(SCORE_CONSTANTS.BASE_SCORE, score))
}

/** Apply scoring + optional symmetric-edge penalty (pure) */
function finalizeScores(analyses: ModuleAnalysis[], graph: DependencyGraph): ModuleAnalysis[] {
  const symmetricPairs = new Set<string>()
  for (const [from, tos] of Object.entries(graph)) {
    for (const to of tos) {
      if ((graph[to] ?? []).includes(from)) {
        const key = [from, to].sort().join('::')
        symmetricPairs.add(key)
      }
    }
  }
  return analyses.map((a) => {
    let s = scoreModule(a)
    // small penalty for bidirectional import relationships
    for (const key of symmetricPairs) {
      const [x, y] = key.split('::')
      if (a.name === x || a.name === y)
        s = Math.max(0, s - SCORE_CONSTANTS.SYMMETRIC_PENALTY)
    }
    return { ...a, independenceScore: s }
  })
}

/** Renderers (pure) */
function renderJSON(analyses: ModuleAnalysis[], sharedStats: SharedSurfaceStats | null): string {
  const out = {
    timestamp: new Date().toISOString(),
    analyses: analyses.map(a => ({
      name: a.name,
      category: a.category,
      score: a.independenceScore,
      eventsEmitted: Array.from(a.eventsEmitted.entries()).sort(([e1], [e2]) => e1.localeCompare(e2)),
      eventsListenedTo: Array.from(a.eventsListenedTo.entries()).sort(([e1], [e2]) => e1.localeCompare(e2)),
      externalImports: Array.from(a.externalImports).sort(),
      sharedImports: Array.from(a.sharedImports.entries()).sort(([e1], [e2]) => e1.localeCompare(e2)),
      typeImports: Array.from(a.typeImports.entries()).sort(([e1], [e2]) => e1.localeCompare(e2)),
      linesOfCode: a.linesOfCode,
      hasApiFile: a.hasApiFile,
      hasEventsFile: a.hasEventsFile,
      hasStoreFile: a.hasStoreFile,
      apiSurface: {
        totalExports: a.apiSurface.totalExports,
        usedExternally: Array.from(a.apiSurface.usedExternally).sort(),
        unusedExports: Array.from(a.apiSurface.unusedExports).sort(),
        usageRate: a.apiSurface.usageRate,
      },
      storeComplexity: a.storeComplexity,
      componentCoupling: a.componentCoupling,
      bundleSize: {
        estimatedKb: a.bundleSize.estimatedKb,
        fileCount: a.bundleSize.fileCount,
        largestFiles: a.bundleSize.largestFiles.slice(0, NEW_FEATURE_CONSTANTS.TOP_FILES_LIMIT),
      },
      eventFlow: {
        orphanedEmits: Array.from(a.eventFlow.orphanedEmits).sort(),
        orphanedListeners: Array.from(a.eventFlow.orphanedListeners).sort(),
      },
      facadeViolations: a.facadeViolations,
      crossModuleTypes: Array.from(a.crossModuleTypes).sort(),
    })),
    sharedSurface: sharedStats || undefined,
  }
  return JSON.stringify(out, null, 2)
}

function renderCSV(analyses: ModuleAnalysis[]): string {
  const rows = [
    'name,category,score,externalImports,eventsEmitted,eventsListened,loc',
    ...analyses.map(a => [
      a.name,
      a.category,
      a.independenceScore.toFixed(1),
      a.externalImports.size,
      a.eventsEmitted.size,
      a.eventsListenedTo.size,
      a.linesOfCode,
    ].join(',')),
  ]
  return rows.join('\n')
}

function renderMermaid(graph: DependencyGraph, analyses: ModuleAnalysis[]): string {
  const id = (n: string): string => sanitizeId(n)
  const lines = ['graph LR']
  for (const a of analyses) {
    const s = Math.round(a.independenceScore)
    let cls = 'red'
    if (s >= THRESHOLD_CONSTANTS.EXCELLENT)
      cls = 'green'
    else if (s >= THRESHOLD_CONSTANTS.GOOD)
      cls = 'cyan'
    else if (s >= THRESHOLD_CONSTANTS.FAIR)
      cls = 'yellow'
    lines.push(`  ${id(a.name)}["${a.name}<br/>${s}%"]`)
    lines.push(`  class ${id(a.name)} ${cls}`)
  }
  for (const [from, tos] of Object.entries(graph)) {
    for (const to of tos) lines.push(`  ${id(from)} --> ${id(to)}`)
  }
  lines.push('')
  lines.push('  classDef green fill:#22c55e,stroke:#16a34a,color:#fff')
  lines.push('  classDef cyan fill:#06b6d4,stroke:#0891b2,color:#fff')
  lines.push('  classDef yellow fill:#eab308,stroke:#ca8a04,color:#000')
  lines.push('  classDef red fill:#ef4444,stroke:#dc2626,color:#fff')
  return ['```mermaid', ...lines, '```'].join('\n')
}

// eslint-disable-next-line complexity
function renderTextReport(
  analyses: ModuleAnalysis[],
  graph: DependencyGraph,
  sharedStats: SharedSurfaceStats | null,
  colors: { bright: (s: string) => string, cyan: (s: string) => string, gray: (s: string) => string, green: (s: string) => string, yellow: (s: string) => string, red: (s: string) => string },
): string {
  const sorted = [...analyses].sort((a, b) => a.independenceScore - b.independenceScore)
  const avg = analyses.length ? analyses.reduce((s, a) => s + a.independenceScore, 0) / analyses.length : 0
  const totalEvents = analyses.reduce((s, a) => s + a.eventsEmitted.size + a.eventsListenedTo.size, 0)

  const scoreColor = (x: number): ((s: string) => string) => (
    x >= THRESHOLD_CONSTANTS.EXCELLENT
      ? colors.green
      : x >= THRESHOLD_CONSTANTS.GOOD
        ? colors.cyan
        : x >= THRESHOLD_CONSTANTS.FAIR
          ? colors.yellow
          : colors.red
  )

  const lines: string[] = []
  lines.push(`\n${colors.bright(colors.cyan('┌─────────────────────────────────────────────────────┐'))}`)
  lines.push(`${colors.cyan('│')}  ${colors.bright(colors.cyan('MarkVim Module Independence Analysis'))}              ${colors.cyan('│')}`)
  lines.push(`${colors.cyan('│')}  ${colors.bright(colors.cyan('Based on single-spa best practices'))}                ${colors.cyan('│')}`)
  lines.push(`${colors.cyan('└─────────────────────────────────────────────────────┘')}\n`)
  lines.push(colors.bright('Module Independence Scores:\n'))

  for (const a of sorted) {
    const stars = '⭐'.repeat(Math.ceil(a.independenceScore / DISPLAY_CONSTANTS.STARS_DIVISOR))
    lines.push(`${scoreColor(a.independenceScore)(stars)} ${a.name.padEnd(DISPLAY_CONSTANTS.STARS_DIVISOR)} ${a.independenceScore.toFixed(1)}%`)
    lines.push(colors.gray(`   Category: ${a.category}`))
    lines.push(colors.gray(`   Events emitted: ${a.eventsEmitted.size}, listened: ${a.eventsListenedTo.size}`))
    lines.push(colors.gray(`   External imports: ${a.externalImports.size}, LOC: ${a.linesOfCode}`))

    // API Surface
    if (a.apiSurface.totalExports > 0) {
      const usageColor = a.apiSurface.usageRate >= NEW_FEATURE_CONSTANTS.API_USAGE_EXCELLENT
        ? colors.green
        : a.apiSurface.usageRate >= NEW_FEATURE_CONSTANTS.API_USAGE_FAIR
          ? colors.yellow
          : colors.red
      lines.push(colors.gray(`   API: ${a.apiSurface.totalExports} exports, ${usageColor(`${a.apiSurface.usageRate.toFixed(0)}% used externally`)}`))
      if (a.apiSurface.unusedExports.size > 0) {
        const unused = Array.from(a.apiSurface.unusedExports).slice(0, NEW_FEATURE_CONSTANTS.TOP_UNUSED_LIMIT).join(', ')
        lines.push(colors.gray(`   Unused exports: ${unused}${a.apiSurface.unusedExports.size > NEW_FEATURE_CONSTANTS.TOP_UNUSED_LIMIT ? '...' : ''}`))
      }
    }

    // Store Complexity
    if (a.storeComplexity.hasStore) {
      lines.push(colors.gray(`   Store: ${a.storeComplexity.actions} actions, ${a.storeComplexity.getters} getters, ${a.storeComplexity.state} state`))
    }

    // Component Coupling
    if (a.componentCoupling.componentCount > 0) {
      lines.push(colors.gray(`   Components: ${a.componentCoupling.componentCount} (avg ${a.componentCoupling.averagePropsPerComponent.toFixed(1)} props, ${a.componentCoupling.averageEmitsPerComponent.toFixed(1)} emits)`))
    }

    // Bundle Size
    lines.push(colors.gray(`   Bundle: ~${a.bundleSize.estimatedKb.toFixed(1)}KB (${a.bundleSize.fileCount} files)`))

    // Type Dependencies
    if (a.typeImports.size > 0) {
      const typeTotal = Array.from(a.typeImports.values()).reduce((s, v) => s + v, 0)
      lines.push(colors.gray(`   Type imports: ${a.typeImports.size} areas, ${typeTotal} total`))
    }

    if (a.sharedImports.size) {
      const sharedTotal = Array.from(a.sharedImports.values()).reduce((s, v) => s + v, 0)
      const sharedList = Array.from(a.sharedImports.entries())
        .sort((x, y) => y[1] - x[1])
        .slice(0, DISPLAY_CONSTANTS.SHARED_TOP_LIMIT)
        .map(([k, v]) => `${k}(${v})`)
        .join(', ')
      lines.push(colors.gray(`   Shared imports: ${a.sharedImports.size} areas, ${sharedTotal} total → ${sharedList}`))
    }
    if (a.externalImports.size)
      lines.push(colors.gray(`   Depends on: ${Array.from(a.externalImports).sort().join(', ')}`))

    // Facade Violations
    if (a.facadeViolations.length > 0) {
      lines.push(colors.red(`   ⚠ Facade violations: ${a.facadeViolations.length}`))
    }

    // Cross-Module Types
    if (a.crossModuleTypes.size > 0) {
      const crossList = Array.from(a.crossModuleTypes).slice(0, NEW_FEATURE_CONSTANTS.TOP_CROSS_TYPES_LIMIT).join(', ')
      lines.push(colors.yellow(`   ⚠ Cross-module types: ${crossList}${a.crossModuleTypes.size > NEW_FEATURE_CONSTANTS.TOP_CROSS_TYPES_LIMIT ? '...' : ''}`))
    }

    lines.push('')
  }

  lines.push(colors.bright('Overall Statistics:'))
  lines.push(`  Average Independence Score: ${scoreColor(avg)(`${avg.toFixed(1)}%`)}`)
  lines.push(`  Total Modules: ${analyses.length}`)
  lines.push(`  Total Events: ${totalEvents}`)
  lines.push(`  Utility Modules: ${analyses.filter(a => a.category === 'utility').length}`)
  lines.push(`  Feature Modules: ${analyses.filter(a => a.category === 'feature').length}`)
  lines.push(`  UI Component Modules: ${analyses.filter(a => a.category === 'ui-component').length}`)

  // Shared surface area analysis
  if (sharedStats && sharedStats.totalFiles > 0) {
    lines.push(`\n${colors.bright(colors.cyan('Shared Surface Area:'))}`)
    lines.push(`  Total Files: ${sharedStats.totalFiles}`)
    lines.push(`  Total LOC: ${sharedStats.totalLoc}`)
    lines.push(`  Bloat Ratio: ${(sharedStats.bloatRatio * NEW_FEATURE_CONSTANTS.BLOAT_PERCENTAGE).toFixed(1)}%`)
    if (sharedStats.bloatWarning) {
      lines.push(colors.red(`  ⚠ Warning: Shared folder exceeds ${(SHARED_BLOAT_THRESHOLD * NEW_FEATURE_CONSTANTS.BLOAT_PERCENTAGE)}% of total codebase`))
    }
    lines.push(`  Directories:`)
    for (const dir of sharedStats.directories) {
      lines.push(colors.gray(`    - ${dir.name}: ${dir.files} files, ${dir.loc} LOC`))
    }
  }

  // Event Flow Analysis
  const orphanedEmitsTotal = analyses.reduce((s, a) => s + a.eventFlow.orphanedEmits.size, 0)
  const orphanedListenersTotal = analyses.reduce((s, a) => s + a.eventFlow.orphanedListeners.size, 0)
  if (orphanedEmitsTotal > 0 || orphanedListenersTotal > 0) {
    lines.push(`\n${colors.bright(colors.cyan('Event Flow Analysis:'))}`)
    if (orphanedEmitsTotal > 0) {
      lines.push(colors.yellow(`  ⚠ Orphaned Emits (no listeners): ${orphanedEmitsTotal}`))
      for (const a of analyses) {
        if (a.eventFlow.orphanedEmits.size > 0) {
          const orphans = Array.from(a.eventFlow.orphanedEmits).join(', ')
          lines.push(colors.gray(`    - ${a.name}: ${orphans}`))
        }
      }
    }
    if (orphanedListenersTotal > 0) {
      lines.push(colors.yellow(`  ⚠ Orphaned Listeners (no emitters): ${orphanedListenersTotal}`))
      for (const a of analyses) {
        if (a.eventFlow.orphanedListeners.size > 0) {
          const orphans = Array.from(a.eventFlow.orphanedListeners).join(', ')
          lines.push(colors.gray(`    - ${a.name}: ${orphans}`))
        }
      }
    }
  }

  // Facade Pattern Compliance
  const totalViolations = analyses.reduce((s, a) => s + a.facadeViolations.length, 0)
  if (totalViolations > 0) {
    lines.push(`\n${colors.bright(colors.red('Facade Pattern Violations:'))}`)
    lines.push(colors.red(`  ⚠ ${totalViolations} direct store imports detected (should use api.ts)`))
    for (const a of analyses) {
      if (a.facadeViolations.length > 0) {
        lines.push(colors.red(`    - ${a.name}: ${a.facadeViolations.length} violations`))
        for (const v of a.facadeViolations.slice(0, NEW_FEATURE_CONSTANTS.TOP_FILES_LIMIT)) {
          const relativePath = v.file.split('/').slice(-NEW_FEATURE_CONSTANTS.TOP_FILES_LIMIT).join('/')
          lines.push(colors.gray(`      ${relativePath}:${v.line} imports ${v.importedStore}`))
        }
      }
    }
  }

  lines.push(`\n${colors.bright(colors.yellow('Recommendations:'))}`)
  const low = analyses.filter(a => a.independenceScore < THRESHOLD_CONSTANTS.GOOD)
  if (low.length) {
    lines.push(`\n${colors.yellow(`⚠ Low Independence Modules (< ${THRESHOLD_CONSTANTS.GOOD}%):`)}`)
    for (const m of low) {
      const topDeps = Array.from(m.externalImports).sort().slice(0, DISPLAY_CONSTANTS.TOP_DEPS_LIMIT).join(', ')
      const noisy = [...m.eventsListenedTo.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, DISPLAY_CONSTANTS.NOISIEST_EVENTS_LIMIT)
        .map(([e, c]) => `${e}(${c})`)
        .join(', ')
      lines.push(`  - ${m.name}: Reduce deps [${topDeps}] | Noisiest events [${noisy}]`)
    }
  }
  const high = analyses.filter(a => a.externalImports.size > DISPLAY_CONSTANTS.HIGH_COUPLING_THRESHOLD)
  if (high.length) {
    lines.push(`\n${colors.yellow(`⚠ High Coupling Modules (> ${DISPLAY_CONSTANTS.HIGH_COUPLING_THRESHOLD} external imports):`)}`)
    for (const m of high) lines.push(`  - ${m.name}: Imports from ${Array.from(m.externalImports).sort().join(', ')}`)
  }
  const heavyShared = analyses.filter(a => a.sharedImports.size > DISPLAY_CONSTANTS.SHARED_USAGE_THRESHOLD)
  if (heavyShared.length) {
    lines.push(`\n${colors.yellow(`⚠ Heavy Shared Usage (> ${DISPLAY_CONSTANTS.SHARED_USAGE_THRESHOLD} areas):`)}`)
    for (const m of heavyShared) {
      const topShared = Array.from(m.sharedImports.entries())
        .sort((x, y) => y[1] - x[1])
        .slice(0, DISPLAY_CONSTANTS.SHARED_TOP_LIMIT)
        .map(([k, v]) => `${k}(${v})`)
        .join(', ')
      lines.push(`  - ${m.name}: ${m.sharedImports.size} areas → ${topShared}`)
    }
  }

  const cycles = findCycles(graph)
  if (cycles.length) {
    lines.push(`\n${colors.red('⚠ Circular Dependencies Detected:')}`)
    for (const cyc of cycles) lines.push(`  - ${cyc.join(' → ')}`)
  }
  else {
    lines.push(`\n${colors.green('✓ No circular dependencies detected')}`)
  }

  const ready = analyses.filter(a => a.independenceScore >= THRESHOLD_CONSTANTS.MICROFRONTEND_READY)
  const readiness = analyses.length ? (ready.length / analyses.length) * SCORE_CONSTANTS.BASE_SCORE : 0
  lines.push(`\n${colors.bright(colors.cyan('Microfrontend Readiness:'))}`)
  lines.push(`  ${ready.length}/${analyses.length} modules (${readiness.toFixed(0)}%) are ${THRESHOLD_CONSTANTS.MICROFRONTEND_READY}%+ independent`)
  if (readiness >= THRESHOLD_CONSTANTS.MICROFRONTEND_READY)
    lines.push(`  ${colors.green('✓ Project is microfrontend-ready!')}`)
  else if (readiness >= THRESHOLD_CONSTANTS.GETTING_CLOSE)
    lines.push(`  ${colors.yellow('⚠ Getting close. Focus on reducing coupling.')}`)
  else lines.push(`  ${colors.red('⚠ Needs work to be microfrontend-ready.')}`)
  lines.push('')
  return lines.join('\n')
}

/** Output switch (pure) */
function renderOutput(
  format: 'text' | 'json' | 'csv' | 'mermaid',
  analyses: ModuleAnalysis[],
  graph: DependencyGraph,
  sharedStats: SharedSurfaceStats | null,
  colors: { bright: (s: string) => string, cyan: (s: string) => string, gray: (s: string) => string, green: (s: string) => string, yellow: (s: string) => string, red: (s: string) => string },
): string {
  if (format === 'json')
    return renderJSON(analyses, sharedStats)
  if (format === 'csv')
    return renderCSV(analyses)
  if (format === 'mermaid')
    return renderMermaid(graph, analyses)
  return renderTextReport(analyses, graph, sharedStats, colors)
}

/** Threshold checks (pure decision; return problems instead of exiting) */
// eslint-disable-next-line complexity
function evaluateThresholds(
  analyses: ModuleAnalysis[],
  graph: DependencyGraph,
  thresholds?: { average?: number, minScore?: number, failOnCycle?: boolean, maxImports?: number },
): { ok: boolean, messages: string[] } {
  const msgs: string[] = []
  let ok = true

  const avg = analyses.length ? analyses.reduce((s, a) => s + a.independenceScore, 0) / analyses.length : 0
  if (thresholds?.average != null && avg < thresholds.average) {
    msgs.push(`Average score ${avg.toFixed(1)}% below threshold ${thresholds.average}%`)
    ok = false
  }

  if (thresholds?.minScore != null) {
    const offenders = analyses.filter(a => a.independenceScore < thresholds.minScore!)
    if (offenders.length) {
      msgs.push(`Modules below ${thresholds.minScore}%: ${offenders.map(o => o.name).join(', ')}`)
      ok = false
    }
  }

  if (thresholds?.maxImports != null) {
    const offenders = analyses.filter(a => a.externalImports.size > thresholds.maxImports!)
    if (offenders.length) {
      msgs.push(`Modules exceed max imports (${thresholds.maxImports}): ${offenders.map(o => `${o.name}(${o.externalImports.size})`).join(', ')}`)
      ok = false
    }
  }

  if (thresholds?.failOnCycle) {
    const cycles = findCycles(graph)
    if (cycles.length) {
      msgs.push(`Circular dependencies detected: ${cycles.map(c => c.join(' → ')).join(', ')}`)
      ok = false
    }
  }

  return { ok, messages: msgs }
}

/** Baseline comparison (pure) */
function compareWithBaseline(
  analyses: ModuleAnalysis[],
  baseline: BaselineData,
  tolerance = 5,
): { ok: boolean, regressions: Array<{ name: string, current: number, baseline: number, delta: number }> } {
  const regressions: Array<{ name: string, current: number, baseline: number, delta: number }> = []

  for (const a of analyses) {
    const baseScore = baseline.analyses.find(b => b.name === a.name)?.score
    if (baseScore != null) {
      const delta = a.independenceScore - baseScore
      if (delta < -tolerance) {
        regressions.push({
          name: a.name,
          current: a.independenceScore,
          baseline: baseScore,
          delta,
        })
      }
    }
  }

  return { ok: regressions.length === 0, regressions }
}

/* ======================================================================================
 * Imperative Shell (I/O, CLI, FS, printing)
 * ==================================================================================== */

function makeColors(enabled: boolean): {
  bright: (s: string) => string
  cyan: (s: string) => string
  gray: (s: string) => string
  green: (s: string) => string
  yellow: (s: string) => string
  red: (s: string) => string
} {
  return {
    bright: (s: string) => (enabled ? pc.bold(s) : s),
    cyan: (s: string) => (enabled ? pc.cyan(s) : s),
    gray: (s: string) => (enabled ? pc.gray(s) : s),
    green: (s: string) => (enabled ? pc.green(s) : s),
    yellow: (s: string) => (enabled ? pc.yellow(s) : s),
    red: (s: string) => (enabled ? pc.red(s) : s),
  }
}

function safeRead(path: string): string {
  try {
    return readFileSync(path, 'utf-8')
  }
  catch {
    return ''
  }
}

function extractScript(filename: string, code: string): string {
  if (!filename.endsWith('.vue'))
    return code
  try {
    const sfc = parseSFC(code)
    return sfc.descriptor.scriptSetup?.content ?? sfc.descriptor.script?.content ?? ''
  }
  catch { return code }
}

/** Analyze shared folder surface area (I/O wrapper) */
async function analyzeSharedFolder(
  sharedDirAbs: string,
  ignoreGlobs: string[],
  totalModuleLoc: number,
): Promise<SharedSurfaceStats> {
  if (!existsSync(sharedDirAbs)) {
    return {
      totalLoc: 0,
      totalFiles: 0,
      directories: [],
      bloatWarning: false,
      bloatRatio: 0,
    }
  }

  const filePaths = await fg([`${sharedDirAbs}/**/*.{ts,tsx,js,vue}`], { ignore: ignoreGlobs })
  const byDir = new Map<string, { loc: number, files: number }>()

  for (const fp of filePaths) {
    const raw = safeRead(fp)
    const script = extractScript(fp, raw)
    const loc = countSloc(script, fp)
    const rel = relative(sharedDirAbs, fp)
    const dirName = rel.split(sep)[0] || 'root'

    if (!byDir.has(dirName))
      byDir.set(dirName, { loc: 0, files: 0 })

    const entry = byDir.get(dirName)!
    entry.loc += loc
    entry.files += 1
  }

  const directories = Array.from(byDir.entries())
    .map(([name, stats]) => ({ name, loc: stats.loc, files: stats.files }))
    .sort((a, b) => b.loc - a.loc)

  const totalLoc = directories.reduce((sum, d) => sum + d.loc, 0)
  const totalFiles = directories.reduce((sum, d) => sum + d.files, 0)
  const totalCodebase = totalLoc + totalModuleLoc
  const bloatRatio = totalCodebase > 0 ? totalLoc / totalCodebase : 0
  const bloatWarning = bloatRatio > SHARED_BLOAT_THRESHOLD

  return { totalLoc, totalFiles, directories, bloatWarning, bloatRatio }
}

/** Build edges via dependency-cruiser or regex fallback (I/O wrapper) */
// eslint-disable-next-line complexity
async function computeEdges(
  modulesDirAbs: string,
  moduleNames: string[],
  ignoreGlobs: string[],
): Promise<Array<{ from: string, to: string }>> {
  const edges: Array<{ from: string, to: string }> = []

  if (cruise) {
    try {
      const res = await cruise(
        [modulesDirAbs],
        {
          tsConfig: { fileName: 'tsconfig.json' },
          doNotFollow: { path: 'node_modules' },
          exclude: ignoreGlobs.join(','),
          combinedDependencies: true,
        },
      )
      const mods = res?.output?.modules ?? []
      const toTop = (abs: string): string | null => {
        const rel = relative(modulesDirAbs, abs)
        if (rel.startsWith('..'))
          return null
        const top = rel.split(sep)[0]
        return moduleNames.includes(top) ? top : null
      }
      for (const m of mods) {
        const fromTop = toTop(m.source)
        if (!fromTop)
          continue
        for (const d of (m.dependencies ?? [])) {
          const toTopName = d.resolved ? toTop(d.resolved) : null
          if (toTopName && toTopName !== fromTop)
            edges.push({ from: fromTop, to: toTopName })
        }
      }
      return edges
    }
    catch {
      // fall through to regex
    }
  }

  // Regex fallback over source text
  const aliasRelRe = /from\s+['"][^'"]*\/modules\/([^/'"]+)/g
  const files = await fg([`${modulesDirAbs}/**/*.{ts,tsx,js,vue}`], { ignore: ignoreGlobs })
  for (const f of files) {
    const raw = safeRead(f)
    const script = extractScript(f, raw)
    const rel = relative(modulesDirAbs, f)
    if (rel.startsWith('..'))
      continue
    const fromTop = rel.split(sep)[0]
    if (!moduleNames.includes(fromTop))
      continue

    let m = aliasRelRe.exec(script)
    while (m) {
      const to = m[1]
      if (to && to !== fromTop && moduleNames.includes(to))
        edges.push({ from: fromTop, to })
      m = aliasRelRe.exec(script)
    }
  }

  return edges
}

/** CLI main */
// eslint-disable-next-line complexity
async function main(): Promise<void> {
  const program = new Command()
  program
    .name('analyze-module-independence')
    .description('Analyze module independence for microfrontend readiness (Functional Core, Imperative Shell)')
    .version('4.1.0')
    .option('--format <type>', 'Output: text | json | csv | mermaid', 'text')
    .option('--output <file>', 'Write output to file instead of stdout')
    .option('--modules-dir <dir>', 'Modules directory', 'src/modules')
    .option('--config <file>', 'Path to config (JSON). If omitted, uses cosmiconfig (independence)')
    .option('--strict', 'CI mode: enforce default thresholds (avg>=80, min>=70, fail on cycles, max 5 imports)')
    .option('--threshold <n>', 'Fail if average score below n', v => Number.parseFloat(v))
    .option('--min-score <n>', 'Fail if any module score below n', v => Number.parseFloat(v))
    .option('--max-imports <n>', 'Fail if any module has more than n imports', v => Number.parseInt(v))
    .option('--fail-on-cycle', 'Fail if cycles detected')
    .option('--baseline <file>', 'Compare against baseline JSON to detect regressions')
    .option('--save-baseline <file>', 'Save current scores as baseline JSON')
    .option('--baseline-tolerance <n>', 'Tolerance (%) for baseline comparison (default: 5)', v => Number.parseFloat(v))
    .option('--graph-json <file>', 'Write dependency graph JSON to file')
    .option('--no-color', 'Disable colored output', false)
    .parse(process.argv)

  const opts = program.opts<{
    format: 'text' | 'json' | 'csv' | 'mermaid'
    output?: string
    modulesDir: string
    config?: string
    strict?: boolean
    threshold?: number
    minScore?: number
    maxImports?: number
    failOnCycle?: boolean
    baseline?: string
    saveBaseline?: string
    baselineTolerance?: number
    graphJson?: string
    color?: boolean
  }>()

  const colors = makeColors(opts.color !== false && process.stdout.isTTY)

  // Load config (imperative)
  let userConfig: ConfigShape = {}
  if (opts.config) {
    if (!existsSync(opts.config)) {
      console.error(colors.red(`Error: Config not found at ${opts.config}`))
      process.exit(1)
    }
    try {
      const parsed: unknown = JSON.parse(readFileSync(opts.config, 'utf-8'))
      // eslint-disable-next-line ts/consistent-type-assertions
      userConfig = parsed as ConfigShape
    }
    catch {
      console.error(colors.red(`Error: Failed to parse config at ${opts.config}`))
      process.exit(1)
    }
  }
  else {
    try {
      const explorer = cosmiconfig('independence')
      const result = await explorer.search()
      if (result?.config) {
        const config: unknown = result.config
        // eslint-disable-next-line ts/consistent-type-assertions
        userConfig = config as ConfigShape
      }
    }
    catch { /* ignore */ }
  }

  const ignore = userConfig.ignore ?? DEFAULTS.ignore
  const modulesDirAbs = join(process.cwd(), opts.modulesDir)
  if (!existsSync(modulesDirAbs)) {
    console.error(colors.red(`Error: Modules directory not found at ${modulesDirAbs}`))
    process.exit(1)
  }

  // Discover modules (imperative)
  const moduleDirs = await fg([`${modulesDirAbs}/*`], { onlyDirectories: true, deep: 1, ignore })
  const moduleNames = moduleDirs.map(p => p.split(sep).pop()!).filter(Boolean)

  // Read files and build FileRecords (imperative)
  const filePaths = await fg([`${modulesDirAbs}/**/*.{ts,tsx,js,vue}`], { ignore })
  const sharedAliases = userConfig.sharedAliases ?? SHARED_IMPORT_PREFIXES
  const typeAliases = TYPE_IMPORT_PREFIXES
  const files: FileRecord[] = filePaths.map((fp) => {
    const raw = safeRead(fp)
    const script = extractScript(fp, raw)
    const rel = relative(modulesDirAbs, fp)
    const moduleName = rel.split(sep)[0]
    const sharedImports = collectSharedImports(script, fp, sharedAliases)
    const typeImports = collectTypeImports(script, fp, typeAliases)
    return {
      filePath: fp,
      script,
      base: fp.split(sep).pop() || '',
      moduleName,
      sharedImports,
      typeImports,
    }
  }).filter(f => moduleNames.includes(f.moduleName))

  // Functional core: build analyses (pure)
  let analyses = buildModuleAnalyses(files, userConfig.categories)

  // Imperative: compute edges then pure assemble graph
  const edges = await computeEdges(modulesDirAbs, moduleNames, ignore)
  const graph = assembleGraph(moduleNames, edges)

  // Backfill externalImports (pure mutation via mapping)
  const importSets: Record<string, Set<string>> = {}
  for (const [from, tos] of Object.entries(graph)) {
    importSets[from] = new Set(tos)
  }
  analyses = analyses.map(a => ({ ...a, externalImports: importSets[a.name] ?? new Set() }))

  // Pure scoring
  analyses = finalizeScores(analyses, graph)

  // Analyze shared folder
  const sharedDirAbs = join(process.cwd(), 'src/shared')
  const totalModuleLoc = analyses.reduce((sum, a) => sum + a.linesOfCode, 0)
  const sharedStats = await analyzeSharedFolder(sharedDirAbs, ignore, totalModuleLoc)

  // Baseline saving (if requested)
  if (opts.saveBaseline) {
    const baselineData: BaselineData = {
      timestamp: new Date().toISOString(),
      analyses: analyses.map(a => ({
        name: a.name,
        score: a.independenceScore,
      })),
    }
    writeFileSync(opts.saveBaseline, JSON.stringify(baselineData, null, 2), 'utf-8')
    console.log(colors.green(`✓ Baseline saved to ${opts.saveBaseline}`))
  }

  // Baseline comparison (if requested)
  if (opts.baseline) {
    if (!existsSync(opts.baseline)) {
      console.error(colors.red(`Error: Baseline file not found at ${opts.baseline}`))
      process.exit(1)
    }
    try {
      const baselineData: unknown = JSON.parse(readFileSync(opts.baseline, 'utf-8'))
      // eslint-disable-next-line ts/consistent-type-assertions
      const baseline = baselineData as BaselineData
      const tolerance = opts.baselineTolerance ?? STRICT_MODE_DEFAULTS.BASELINE_TOLERANCE
      const comparison = compareWithBaseline(analyses, baseline, tolerance)

      if (!comparison.ok) {
        console.log(`\n${colors.red('⚠ Baseline Regressions Detected:')}\n`)
        for (const r of comparison.regressions) {
          console.error(colors.red(
            `  ${r.name}: ${r.current.toFixed(1)}% (was ${r.baseline.toFixed(1)}%, delta: ${r.delta.toFixed(1)}%)`,
          ))
        }
        process.exit(1)
      }
      console.log(colors.green(`✓ No regressions detected (tolerance: ${tolerance}%)`))
    }
    catch (err) {
      console.error(colors.red(`Error: Failed to parse baseline file: ${err}`))
      process.exit(1)
    }
  }

  // Outputs
  const output = renderOutput(opts.format, analyses, graph, sharedStats, colors)

  if (opts.graphJson) {
    writeFileSync(opts.graphJson, JSON.stringify(graph, null, 2), 'utf-8')
    console.log(colors.green(`✓ Graph JSON saved to ${opts.graphJson}`))
  }

  if (opts.output) {
    writeFileSync(opts.output, output, 'utf-8')
    console.log(colors.green(`✓ Output saved to ${opts.output}`))
  }
  else {
    console.log(output)
  }

  // Threshold evaluation (pure decision + imperative exit)
  // Strict mode enforces defaults if individual thresholds not set
  const thresholds = opts.strict
    ? {
        average: opts.threshold ?? userConfig.thresholds?.average ?? STRICT_MODE_DEFAULTS.AVERAGE_THRESHOLD,
        minScore: opts.minScore ?? userConfig.thresholds?.minScore ?? STRICT_MODE_DEFAULTS.MIN_SCORE_THRESHOLD,
        maxImports: opts.maxImports ?? userConfig.thresholds?.maxImports ?? STRICT_MODE_DEFAULTS.MAX_IMPORTS_THRESHOLD,
        failOnCycle: opts.failOnCycle ?? userConfig.thresholds?.failOnCycle ?? STRICT_MODE_DEFAULTS.FAIL_ON_CYCLE,
      }
    : {
        average: opts.threshold ?? userConfig.thresholds?.average,
        minScore: opts.minScore ?? userConfig.thresholds?.minScore,
        maxImports: opts.maxImports ?? userConfig.thresholds?.maxImports,
        failOnCycle: opts.failOnCycle ?? userConfig.thresholds?.failOnCycle,
      }

  const verdict = evaluateThresholds(analyses, graph, thresholds)
  if (!verdict.ok) {
    for (const m of verdict.messages) console.error(colors.red(`✗ ${m}`))
    process.exit(1)
  }

  if (opts.strict) {
    console.log(colors.green('✓ All strict mode checks passed'))
  }
}

void main()
