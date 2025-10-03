/**
 * ESLint rule to detect unused exports in module api.ts files
 *
 * Uses TypeScript's type checker to find all references to exported symbols
 * and reports those that are never imported outside the module.
 *
 * This ensures module API surfaces stay lean and don't export unused internals.
 */

import { dirname } from 'node:path'
import { ESLintUtils } from '@typescript-eslint/utils'

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/alexanderopalic/markvim/blob/main/eslint-rules/${name}.ts`,
)

export default createRule({
  name: 'no-unused-module-exports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect exports in module api.ts files that are not imported anywhere outside the module',
    },
    messages: {
      unusedExport: 'Export "{{exportName}}" from {{moduleName}} module is not imported anywhere outside the module',
      unusedTypeExport: 'Type export "{{exportName}}" from {{moduleName}} module is not imported anywhere outside the module',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const filename = context.filename

    // Only run on module api.ts files
    const match = filename.match(/src\/modules\/([^/]+)\/api\.ts$/)
    if (!match) {
      return {}
    }

    const moduleName = match[1]
    const moduleDir = dirname(filename)

    // Get TypeScript program and type checker
    const services = ESLintUtils.getParserServices(context)
    const program = services.program
    const checker = program.getTypeChecker()
    const sourceFile = program.getSourceFile(filename)

    if (!sourceFile) {
      return {}
    }

    /**
     * @param {string} exportName
     * @param {any} node
     * @param {boolean} isTypeExport
     * @returns {void}
     */
    // eslint-disable-next-line ts/explicit-function-return-type
    function checkExportUsage(
      exportName,
      node,
      isTypeExport,
    ) {
      // Get the TypeScript AST node
      const tsNode = services.esTreeNodeToTSNodeMap.get(node)

      // Get the symbol for this export
      const symbol = checker.getSymbolAtLocation(tsNode)

      if (!symbol) {
        // Can't find symbol - might be a re-export or other edge case
        // Skip to avoid false positives
        return
      }

      // Try to get language service for findReferences
      const languageService = program.getLanguageService?.()

      if (!languageService) {
        // Language service not available - skip this check
        // This can happen in some ESLint configurations
        return
      }

      // Find all references to this symbol
      const referencedSymbols = languageService.findReferences(
        sourceFile.fileName,
        tsNode.getStart(),
      )

      if (!referencedSymbols || referencedSymbols.length === 0) {
        // No references found at all - report as unused
        context.report({
          node,
          messageId: isTypeExport ? 'unusedTypeExport' : 'unusedExport',
          data: {
            exportName,
            moduleName,
          },
        })
        return
      }

      // Check if any references are outside the module directory
      let hasExternalReference = false

      for (const refSymbol of referencedSymbols) {
        for (const ref of refSymbol.references) {
          const refFileName = ref.fileName

          // Skip references within the same module directory
          if (refFileName.startsWith(moduleDir)) {
            continue
          }

          // Found a reference outside the module!
          hasExternalReference = true
          break
        }

        if (hasExternalReference) {
          break
        }
      }

      if (!hasExternalReference) {
        context.report({
          node,
          messageId: isTypeExport ? 'unusedTypeExport' : 'unusedExport',
          data: {
            exportName,
            moduleName,
          },
        })
      }
    }

    /**
     * @param {any} node
     * @returns {void}
     */
    // eslint-disable-next-line ts/explicit-function-return-type
    function handleExportSpecifiers(node) {
      for (const specifier of node.specifiers) {
        const isTypeExport = node.exportKind === 'type' || specifier.exportKind === 'type'
        checkExportUsage(specifier.exported.name, specifier, isTypeExport)
      }
    }

    /**
     * @param {any} declaration
     * @returns {void}
     */
    // eslint-disable-next-line ts/explicit-function-return-type
    function handleExportDeclaration(declaration) {
      if (declaration.type === 'VariableDeclaration') {
        for (const declarator of declaration.declarations) {
          if (declarator.id.type === 'Identifier') {
            checkExportUsage(declarator.id.name, declarator.id, false)
          }
        }
      }
      else if (
        declaration.type === 'FunctionDeclaration'
        || declaration.type === 'ClassDeclaration'
        || declaration.type === 'TSInterfaceDeclaration'
        || declaration.type === 'TSTypeAliasDeclaration'
        || declaration.type === 'TSEnumDeclaration'
      ) {
        if (declaration.id) {
          const isType = declaration.type === 'TSInterfaceDeclaration'
            || declaration.type === 'TSTypeAliasDeclaration'
          checkExportUsage(declaration.id.name, declaration.id, isType)
        }
      }
    }

    return {
      ExportNamedDeclaration(node) {
        // Handle: export { foo, bar } from './somewhere'
        // Handle: export { foo, bar }
        if (node.specifiers && node.specifiers.length > 0) {
          handleExportSpecifiers(node)
        }
        // Handle: export const foo = ...
        // Handle: export function foo() {}
        // Handle: export class Foo {}
        // Handle: export interface Foo {}
        // Handle: export type Foo = ...
        else if (node.declaration) {
          handleExportDeclaration(node.declaration)
        }
      },
    }
  },
})
